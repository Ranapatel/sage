const axios = require('axios');

async function runTest() {
  const checkin = '2026-07-15';
  const checkout = '2026-07-18';
  
  console.log(`Running hotels recommend API test for dates: ${checkin} to ${checkout}...`);
  try {
    const res = await axios.post('http://127.0.0.1:5000/api/hotels/recommend', {
      destination: 'Goa',
      checkin,
      checkout,
      budget: 80000,
      members: 2
    });
    
    console.log('API Response Status:', res.status);
    console.log('Success:', res.data.success);
    console.log('Meta source:', res.data.meta?.source);
    
    const hotels = res.data.data || [];
    console.log(`Received ${hotels.length} hotels.`);
    
    // Check for duplicates
    const hotelIds = hotels.map(h => h._meta.id);
    const uniqueIds = new Set(hotelIds);
    console.log(`Unique IDs count: ${uniqueIds.size} / Total: ${hotels.length}`);
    
    if (uniqueIds.size !== hotels.length) {
      console.error('❌ DUPLICATES DETECTED!');
    } else {
      console.log('✅ No duplicates found!');
    }
    
    hotels.slice(0, 3).forEach((h, idx) => {
      console.log(`\n[Hotel #${idx + 1}] Name: ${h.hotel_name}`);
      console.log(`- Image URL: ${h.image_url}`);
      console.log(`- Image Path: ${h.image_path}`);
      console.log(`- Image Source: ${h.image_source}`);
      console.log(`- Price per night: ${h.price_per_night}`);
      console.log(`- First 3 rooms:`, h.rooms?.slice(0, 3).map(r => `${r.roomName} (${r.boardName}) - ₹${r.price}`));
    });
    
  } catch (err) {
    console.error('API Error details:', err.response?.data || err.message);
  }
}

runTest();
