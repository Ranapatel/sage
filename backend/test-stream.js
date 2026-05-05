const io = require('socket.io-client');

const socket = io('http://localhost:4000', {
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log('Connected to server');
  
  // Trigger progressive trip generation
  socket.emit('GENERATE_TRIP_STREAM', {
    destination: 'Goa',
    from: 'Mumbai',
    startDate: '2026-06-15',
    endDate: '2026-06-18',
    budget: 30000,
    travelers: 2,
    style: 'romantic'
  });
});

socket.on('TRIP_STAGE', (payload) => {
  console.log(`\n--- STAGE: ${payload.stage} ---`);
  if (payload.stage === 'itinerary') {
    console.log(`Received itinerary with ${payload.data?.length} days`);
  } else if (payload.stage === 'hotels' || payload.stage === 'activities') {
    console.log(`Received ${payload.data?.length || 0} items`);
  } else {
    console.log(JSON.stringify(payload.data || payload, null, 2));
  }
  
  if (payload.stage === 'complete' || payload.stage === 'error') {
    socket.disconnect();
    process.exit(0);
  }
});
