const express = require('express');
const router = express.Router();
const { MessengerController } = require('../controllers/messenger');

// Webhook verification
router.get('/', (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Handle incoming messages
router.post('/', async (req, res) => {
  try {
    console.log('Received webhook:', JSON.stringify(req.body, null, 2));

    if (req.body.object === 'page') {
      for (const entry of req.body.entry) {
        // Check if entry.messaging exists and is an array
        if (Array.isArray(entry.messaging)) {
          for (const webhookEvent of entry.messaging) {
            console.log('Processing event:', webhookEvent);
            
            const sender_psid = webhookEvent.sender.id;
            
            if (webhookEvent.message) {
              console.log('Message data:', webhookEvent.message);
              await MessengerController.handleMessage(sender_psid, webhookEvent.message);
            } else if (webhookEvent.postback) {
              console.log('Postback data:', webhookEvent.postback);
              await MessengerController.handlePostback(sender_psid, webhookEvent.postback);
            }
          }
        } else {
          console.log('No messaging array in entry:', entry);
        }
      }
      res.status(200).send('EVENT_RECEIVED');
    } else {
      console.log('Not a page object:', req.body.object);
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.sendStatus(500);
  }
});

module.exports = router;
