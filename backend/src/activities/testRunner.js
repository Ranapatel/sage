const { spawnSync } = require('child_process');
const path = require('path');

const tests = [
  'bookingStateMachine.test.js',
  'activitiesValidator.test.js',
  'activityCacheSearch.test.js',
  'activityCacheSync.test.js',
  'activityContentSync.test.js',
  'activitiesReconciliation.test.js',
  'activityFeatureFlags.test.js'
];

console.log('--- TripSage Hotelbeds Activities Test Runner ---');
let failed = 0;

tests.forEach(testFile => {
  const filePath = path.join(__dirname, testFile);
  console.log(`Running: ${testFile}...`);
  
  const result = spawnSync('node', [filePath], { stdio: 'inherit' });
  if (result.status !== 0) {
    console.error(`FAILED: ${testFile} exited with status ${result.status}`);
    failed++;
  }
});

console.log('\n------------------------------------------------');
if (failed > 0) {
  console.error(`Test suite completed: ${failed} failed test(s).`);
  process.exit(1);
} else {
  console.log('All tests passed successfully!');
  process.exit(0);
}
