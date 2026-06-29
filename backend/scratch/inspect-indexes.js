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

console.log('--- Schema Indexes Before Fixes ---');
for (const [name, model] of Object.entries(models)) {
  console.log(`\nModel: ${name}`);
  const indexes = model.schema.indexes();
  console.log(JSON.stringify(indexes, null, 2));
}

process.exit(0);
