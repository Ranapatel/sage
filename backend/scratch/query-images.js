const mongoose = require('mongoose');
require('dotenv').config();
const { HotelContent } = require('../src/models/HotelContent');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tripsage');
    console.log('Connected to MongoDB');
    
    // Find any cached documents
    const count = await HotelContent.countDocuments();
    console.log(`Total HotelContent documents cached: ${count}`);
    
    const docs = await HotelContent.find({}).limit(5);
    if (docs.length > 0) {
      console.log('Sample documents data:');
      docs.forEach(doc => {
        const hotel = doc.data;
        console.log(`Hotel code ${doc.code} (${hotel.name}):`);
        if (hotel.images) {
          console.log(hotel.images.slice(0, 5).map(img => img.path));
        } else {
          console.log('No images array in this hotel data');
        }
      });
    } else {
      console.log('No HotelContent documents in the database.');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
