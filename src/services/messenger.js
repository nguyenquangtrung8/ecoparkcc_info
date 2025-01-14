const axios = require('axios');

class MessengerService {
  static async sendMessage(sender_psid, response) {
    try {
      await axios.post(
        'https://graph.facebook.com/v19.0/me/messages',
        {
          recipient: { id: sender_psid },
          message: response
        },
        {
          params: { access_token: process.env.PAGE_ACCESS_TOKEN }
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  static formatApartmentResponse(apartment) {
    return {
      text: `🏢 Thông tin căn hộ ${apartment.code}:\n\n` +
            `📍 Thông tin cơ bản:\n` +
            `- Loại căn hộ: ${apartment.info.type}\n` +
            `- Diện tích: ${apartment.info.area} m²\n` +
            `- Số phòng ngủ: ${apartment.info.bedrooms}\n` +
            `- Số phòng vệ sinh: ${apartment.info.bathrooms}\n\n` +
            `🎯 Vị trí và hướng:\n` +
            `- Vị trí: ${apartment.location.position}\n` +
            `- Hướng chính: ${apartment.location.direction}\n` +
            `- View: ${apartment.location.view}\n` +
            `- Số mặt thoáng: ${apartment.location.openSides}\n\n` +
            `✨ Đánh giá:\n` +
            `- Điểm: ${apartment.evaluation.score}/100\n` +
            `- Ưu điểm: ${apartment.evaluation.pros}\n` +
            `${apartment.evaluation.cons ? `- Nhược điểm: ${apartment.evaluation.cons}\n` : ''}` +
            `\n💡 Khuyến nghị: ${apartment.evaluation.recommendation}`
    };
  }

  static async setupMessengerProfile() {
    try {
      await axios.post(
        `https://graph.facebook.com/v19.0/me/messenger_profile`,
        {
          get_started: {
            payload: "GET_STARTED"
          },
          greeting: [{
            locale: "default",
            text: "👋 Chào mừng bạn đến với Ecopark Apartment Finder!\n⏰ Giờ hoạt động: 6h-22h hàng ngày"
          }],
          persistent_menu: [{
            locale: "default",
            composer_input_disabled: false,
            call_to_action: [
              {
                type: "postback",
                title: "🔍 Tìm căn hộ",
                payload: "SEARCH"
              },
              {
                type: "postback",
                title: "ℹ️ Hướng dẫn",
                payload: "TUTORIAL"
              },
              {
                type: "postback",
                title: "⏰ Giờ hoạt động",
                payload: "HOURS"
              }
            ]
          }]
        },
        {
          params: { access_token: process.env.PAGE_ACCESS_TOKEN }
        }
      );
      console.log('Messenger Profile setup success');
    } catch (error) {
      console.error('Messenger Profile setup failed:', error);
      throw error;
    }
  }
}

module.exports = { MessengerService };
