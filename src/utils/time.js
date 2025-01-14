// Kiểm tra xem hiện tại có trong giờ hoạt động không (6h-22h)
const isOperatingHours = () => {
  // Lấy giờ hiện tại theo múi giờ Việt Nam
  const now = new Date();
  const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const hour = vietnamTime.getHours();

  // Kiểm tra giờ hoạt động (6h-22h)
  return hour >= 6 && hour < 22;
};

// Format timestamp sang giờ Việt Nam
const formatVietnameseTime = (date) => {
  return date.toLocaleString('vi-VN', { 
    timeZone: 'Asia/Ho_Chi_Minh',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Lấy thời gian mở cửa tiếp theo
const getNextOpeningTime = () => {
  const now = new Date();
  const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const hour = vietnamTime.getHours();

  if (hour < 6) {
    // Nếu hiện tại < 6h, mở cửa vào 6h cùng ngày
    return "6:00 sáng hôm nay";
  } else if (hour >= 22) {
    // Nếu hiện tại >= 22h, mở cửa vào 6h ngày mai
    return "6:00 sáng ngày mai";
  }
  return null; // Đang trong giờ hoạt động
};

module.exports = {
  isOperatingHours,
  formatVietnameseTime,
  getNextOpeningTime
};
