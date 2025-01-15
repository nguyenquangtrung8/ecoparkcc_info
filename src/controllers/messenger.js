const { MessengerService } = require('../services/messenger');
const { ApartmentService } = require('../services/apartment');
const { isOperatingHours } = require('../utils/time');

class MessengerController {
  static async handleMessage(sender_psid, message) {
    try {
      console.log('Handling message:', message); // Debug log

      // Kiểm tra giờ hoạt động
      if (!isOperatingHours()) {
        console.log('Outside operating hours'); // Debug log
        await MessengerService.sendMessage(sender_psid, {
          text: "⏰ Xin lỗi, hệ thống chỉ hoạt động từ 6h-22h. Vui lòng quay lại sau!"
        });
        return;
      }

      // Xử lý tin nhắn
      if (message.text) {
        const userMessage = message.text.trim().toUpperCase();
        console.log('Processing message:', userMessage); // Debug log
        
        // Check apartment code pattern
        if (/^[A-Z]+\d+.*$/.test(userMessage)) {
          console.log('Valid apartment code format, searching...'); // Debug log
          const apartmentInfo = await ApartmentService.findByCode(userMessage);
          
          if (apartmentInfo) {
            console.log('Apartment found:', apartmentInfo); // Debug log
            const response = MessengerService.formatApartmentResponse(apartmentInfo);
            await MessengerService.sendMessage(sender_psid, response);
          } else {
            console.log('Apartment not found'); // Debug log
            await MessengerService.sendMessage(sender_psid, {
              text: "❌ Không tìm thấy thông tin căn hộ. Vui lòng kiểm tra lại mã căn hộ (VD: SP2803)"
            });
          }
        } else {
          console.log('Invalid format, sending help message'); // Debug log
          await MessengerService.sendMessage(sender_psid, {
            text: "👋 Xin chào! Vui lòng nhập mã căn hộ để xem thông tin chi tiết (VD: SP2803)"
          });
        }
      }
    } catch (error) {
      console.error('Error in handleMessage:', error); // Error log
      await MessengerService.sendMessage(sender_psid, {
        text: "🔧 Đã có lỗi xảy ra. Vui lòng thử lại sau."
      });
    }
  }

  static async handlePostback(sender_psid, postback) {
    try {
      console.log('Handling postback:', postback); // Debug log
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
      
      console.log('Sending postback response:', response); // Debug log
      await MessengerService.sendMessage(sender_psid, response);
    } catch (error) {
      console.error('Error in handlePostback:', error); // Error log
      await MessengerService.sendMessage(sender_psid, {
        text: "🔧 Đã có lỗi xảy ra. Vui lòng thử lại sau."
      });
    }
  }
}

module.exports = { MessengerController };
