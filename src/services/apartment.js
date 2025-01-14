const mongoose = require('mongoose');

// Define Apartment Schema
const apartmentSchema = new mongoose.Schema({
  code: String,
  info: {
    type: String,      // Loại căn hộ
    area: Number,      // Diện tích
    bedrooms: Number,  // Số phòng ngủ
    bathrooms: Number  // Số phòng vệ sinh
  },
  location: {
    building: String,  // Tòa nhà
    floor: String,     // Tầng
    position: String,  // Vị trí căn
    direction: String, // Hướng
    view: String,      // View
    openSides: Number  // Số mặt thoáng
  },
  evaluation: {
    score: Number,     // Điểm đánh giá
    pros: String,      // Ưu điểm
    cons: String,      // Nhược điểm
    recommendation: String // Khuyến nghị
  }
});

const Apartment = mongoose.model('Apartment', apartmentSchema);

class ApartmentService {
  static parseApartmentCode(code) {
    const building = code.match(/^[A-Z]+/)?.[0] || '';
    const floor = code.match(/\d{2}/)?.[0] || '';
    const unit = code.substring(building.length + 2);
    return { building, floor, unit };
  }

  static async findByCode(code) {
    try {
      const { building, floor, unit } = this.parseApartmentCode(code);
      
      const apartment = await Apartment.findOne({
        'location.building': building,
        'location.floor': floor,
        code: new RegExp(unit + '$')
      });

      return apartment;
    } catch (error) {
      console.error('Error finding apartment:', error);
      throw error;
    }
  }

  static async createApartment(apartmentData) {
    try {
      const apartment = new Apartment(apartmentData);
      await apartment.save();
      return apartment;
    } catch (error) {
      console.error('Error creating apartment:', error);
      throw error;
    }
  }

  // Phương thức để import dữ liệu từ CSV
  static async importFromCSV(data) {
    try {
      const apartments = data.map(row => ({
        code: row['Mã căn hộ'],
        info: {
          type: row['Loại căn hộ'],
          area: parseFloat(row['Diện tích thông thủy (m²)']),
          bedrooms: parseInt(row['Số phòng ngủ']),
          bathrooms: parseInt(row['Số phòng vệ sinh'])
        },
        location: {
          building: row['Tòa'],
          floor: row['Tầng'],
          position: row['Vị trí căn'],
          direction: row['Hướng chính'],
          view: row['View'],
          openSides: parseInt(row['Số mặt thoáng'])
        },
        evaluation: {
          score: parseInt(row['Tổng điểm']),
          pros: row['Ưu điểm'],
          cons: row['Nhược điểm'],
          recommendation: row['Nhận định/Khuyến nghị']
        }
      }));

      await Apartment.insertMany(apartments);
      console.log(`Imported ${apartments.length} apartments successfully`);
    } catch (error) {
      console.error('Error importing apartments:', error);
      throw error;
    }
  }
}

module.exports = { ApartmentService, Apartment };
