const fs = require('fs')
const content = fs.readFileSync('c:\\TripSage-AI-Travel-OS\\tripsage\\frontend\\components\\booking\\BookingConfirmationPanel.tsx', 'utf8')
const lines = content.split('\n')
for (let i = 58; i <= 66; i++) {
  console.log(`Line ${i + 1}: ${JSON.stringify(lines[i])}`)
}
