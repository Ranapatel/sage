require('dotenv').config();
const dns = require('dns');

// Force Google DNS (8.8.8.8) + IPv4-first to resolve MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  if (dns.setDefaultResultOrder) dns.setDefaultResultOrder('ipv4first');
} catch { /* Node <16 — safe to ignore */ }

const mongoose = require('mongoose');
const { Activity } = require('../src/models/Activity');
const { ActivityBooking } = require('../src/models/ActivityBooking');
const { AuditLog } = require('../src/models/AuditLog');
const { HotelContent } = require('../src/models/HotelContent');
const { Payment } = require('../src/models/Payment');
const { StaticCatalog } = require('../src/models/StaticCatalog');
const { User } = require('../src/models/User');

const models = {
  Activity,
  ActivityBooking,
  AuditLog,
  HotelContent,
  Payment,
  StaticCatalog,
  User
};

async function syncAll() {
  const uri = process.env.DB_URL;
  if (!uri) {
    console.error('Error: DB_URL environment variable is not defined in .env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
  });
  console.log('✅ Connected to MongoDB.');

  console.log('\n--- Syncing Indexes ---');
  for (const [name, model] of Object.entries(models)) {
    try {
      console.log(`Syncing indexes for ${name}...`);
      // syncIndexes compares MongoDB indexes with current schema, dropping old ones and creating new ones.
      const result = await model.syncIndexes();
      console.log(`  Result: Created: [${result.join(', ')}]`);
    } catch (err) {
      console.error(`  ❌ Error syncing ${name}:`, err.message);
    }
  }

  console.log('\nIndex synchronization complete.');
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

syncAll().catch(err => {
  console.error('Fatal error during sync:', err);
  process.exit(1);
});
