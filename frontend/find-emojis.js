const fs = require('fs');
const path = require('path');

const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F0F5}]|[\u{1F004}]|[\u{1F170}-\u{1F251}]|[\u{1F900}-\u{1F9FF}]|[\u{1F300}-\u{1F5FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{1F191}-\u{1F251}]/gu;

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file === 'node_modules' || file === '.next' || file === '.git' || file === 'dist') continue;
      scanDir(fullPath);
    } else {
      const ext = path.extname(file);
      if (['.ts', '.tsx', '.js', '.json', '.html', '.css', '.csv'].includes(ext)) {
        if (file === 'find-emojis.js' || file.endsWith('.bak')) continue;
        const content = fs.readFileSync(fullPath, 'utf8');
        const matches = content.match(emojiRegex);
        if (matches) {
          const lines = content.split('\n');
          lines.forEach((line, i) => {
            if (emojiRegex.test(line)) {
              emojiRegex.lastIndex = 0;
              const lineMatches = line.match(emojiRegex);
              console.log(`${fullPath}:${i + 1} - matches: [${lineMatches.join(', ')}] - line: "${line.trim()}"`);
            }
          });
        }
      }
    }
  }
}

console.log("Scanning directory for emojis...");
scanDir(path.resolve(__dirname, '.'));
