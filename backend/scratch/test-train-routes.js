const axios = require('axios');

async function runTests() {
  console.log('=== STARTING TRAIN FEATURE INTEGRATION TESTS ===');
  
  // Test 1: Domestic route with station substitution (Delhi -> Goa)
  try {
    console.log('\n[Test 1] Testing domestic route with station substitution (Delhi -> Goa)...');
    const res = await axios.post('http://localhost:5000/api/search', {
      from: 'Delhi',
      to: 'Goa',
      startDate: '2026-06-29',
      endDate: '2026-07-05',
      budget: 100000,
      travelers: 2,
      style: 'adventure'
    });
    
    const data = res.data.data;
    console.log('Success:', res.data.success);
    console.log('Trains found:', data.trains?.length);
    console.log('isTrainDomestic:', data.isTrainDomestic);
    console.log('trainStationInfo:', JSON.stringify(data.trainStationInfo, null, 2));
    
    if (data.isTrainDomestic === true && data.trains?.length > 0 && data.trainStationInfo?.destination?.isSubstitute === true) {
      console.log('✅ Test 1 PASSED');
    } else {
      console.log('❌ Test 1 FAILED');
    }
  } catch (err) {
    console.error('❌ Test 1 ERROR:', err.response?.data || err.message);
  }

  // Test 2: Domestic route without substitution (Delhi -> Mumbai)
  try {
    console.log('\n[Test 2] Testing domestic route without station substitution (Delhi -> Mumbai)...');
    const res = await axios.post('http://localhost:5000/api/search', {
      from: 'Delhi',
      to: 'Mumbai',
      startDate: '2026-06-29',
      endDate: '2026-07-05',
      budget: 100000,
      travelers: 2,
      style: 'adventure'
    });
    
    const data = res.data.data;
    console.log('Success:', res.data.success);
    console.log('Trains found:', data.trains?.length);
    console.log('isTrainDomestic:', data.isTrainDomestic);
    console.log('trainStationInfo:', JSON.stringify(data.trainStationInfo, null, 2));
    
    if (data.isTrainDomestic === true && data.trains?.length > 0 && data.trainStationInfo?.destination?.isSubstitute === false) {
      console.log('✅ Test 2 PASSED');
    } else {
      console.log('❌ Test 2 FAILED');
    }
  } catch (err) {
    console.error('❌ Test 2 ERROR:', err.response?.data || err.message);
  }

  // Test 3: International route (Delhi -> Paris)
  try {
    console.log('\n[Test 3] Testing international route (Delhi -> Paris)...');
    const res = await axios.post('http://localhost:5000/api/search', {
      from: 'Delhi',
      to: 'Paris',
      startDate: '2026-06-29',
      endDate: '2026-07-05',
      budget: 100000,
      travelers: 2,
      style: 'adventure'
    });
    
    const data = res.data.data;
    console.log('Success:', res.data.success);
    console.log('Trains found:', data.trains?.length);
    console.log('isTrainDomestic:', data.isTrainDomestic);
    console.log('trainStationInfo:', JSON.stringify(data.trainStationInfo, null, 2));
    
    if (data.isTrainDomestic === false && data.trains?.length === 0 && data.trainStationInfo === null) {
      console.log('✅ Test 3 PASSED');
    } else {
      console.log('❌ Test 3 FAILED');
    }
  } catch (err) {
    console.error('❌ Test 3 ERROR:', err.response?.data || err.message);
  }

  console.log('\n=== INTEGRATION TESTS COMPLETE ===');
}

// Delay startup slightly to allow servers to establish connection
setTimeout(runTests, 2000);
