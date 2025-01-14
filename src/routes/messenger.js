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
  if (req.body.object === 'page') {
    for (const entry of req.body.entry) {
      for (const webhookEvent of entry.messaging) {
        console.log('Webhook event:', webhookEvent);
        
        const sender_psid = webhookEvent.sender.id;
        
        try {
          if (webhookEvent.message) {
            await MessengerController.handleMessage(sender_psid, webhookEvent.message);
          } else if (webhookEvent.postback) {
            await MessengerController.handlePostback(sender_psid, webhookEvent.postback);
          }
        } catch (error) {
          console.error('Error handling webhook event:', error);
        }
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

module.exports = router;
