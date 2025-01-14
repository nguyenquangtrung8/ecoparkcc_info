const { MessengerService } = require('../services/messenger');
const { ApartmentService } = require('../services/apartment');
const { isOperatingHours } = require('../utils/time');

class MessengerController {
  static async handleMessage(sender_psid, message) {
    try {
      // Kiểm tra giờ hoạt động
      if (!isOperatingHours()) {
        await MessengerService.sendMessage(sender_psid, {
          text: "⏰ Xin lỗi, hệ thống chỉ hoạt động từ 6h-22h. Vui lòng quay lại sau!"
        });
        return;
      }

      // Xử lý tin nhắn
      if (message.text) {
        const userMessage = message.text.trim().toUpperCase();
        
        // Kiểm tra xem có phải mã căn hộ không
        if (/^[A-Z]+\d+.*$/.test(userMessage)) {
          const apartmentInfo = await ApartmentService.findByCode(userMessage);
          if (apartmentInfo) {
            const response = MessengerService.formatApartmentResponse(apartmentInfo);
            await MessengerService.sendMessage(sender_psid, response);
          } else {
            await MessengerService.sendMessage(sender_psid, {
              text: "❌ Không tìm thấy thông tin căn hộ. Vui lòng kiểm tra lại mã căn hộ (VD: SP2803)"
            });
          }
        } else {
          await MessengerService.sendMessage(sender_psid, {
            text: "👋 Xin chào! Vui lòng nhập mã căn hộ để xem thông tin chi tiết (VD: SP2803)"
          });
        }
      }
    } catch (error) {
      console.error('Error handling message:', error);
      await MessengerService.sendMessage(sender_psid, {
        text: "🔧 Đã có lỗi xảy ra. Vui lòng thử lại sau."
      });
    }
  }

  static async handlePostback(sender_psid, postback) {
    try {
      let response;
      
      switch (postback.payload) {
        case 'GET_STARTED':
          response = {
            text: "👋 Chào mừng bạn đến với Ecopark Apartment Finder!\n\n" +
                  "🔍 Để tìm thông tin căn hộ, hãy nhập mã căn hộ (VD: SP2803)\n" +
                  "⏰ Thời gian hoạt động: 6h-22h hàng ngày"
          };
          break;
          
        case 'TUTORIAL':
          response = {
            text: "🔍 Hướng dẫn tra cứu:\n\n" +
                  "1. Nhập mã căn hộ (VD: SP2803)\n" +
                  "2. Hệ thống sẽ trả về thông tin chi tiết về căn hộ\n" +
                  "3. Bạn có thể tra cứu nhiều căn hộ khác nhau\n\n" +
                  "⏰ Thời gian hoạt động: 6h-22h hàng ngày"
          };
          break;
          
        case 'HOURS':
          response = {
            text: "⏰ Thời gian hoạt động:\n" +
                  "- Từ 6h sáng đến 22h tối hàng ngày\n" +
                  "- Ngoài giờ trên hệ thống sẽ tạm nghỉ"
          };
          break;
          
        default:
          response = {
            text: "Xin lỗi, tôi không hiểu yêu cầu này."
          };
      }
      
      await MessengerService.sendMessage(sender_psid, response);
    } catch (error) {
      console.error('Error handling postback:', error);
      await MessengerService.sendMessage(sender_psid, {
        text: "🔧 Đã có lỗi xảy ra. Vui lòng thử lại sau."
      });
    }
  }
}

module.exports = { MessengerController };
