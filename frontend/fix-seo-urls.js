const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('app/seo', function(filePath) {
  if (filePath.endsWith('page.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Replace hardcoded https://tripsage.in/something that are not /seo/
    if (content.match(/canonical:\s*'https:\/\/tripsage\.in\/(?!seo\/)/)) {
      content = content.replace(/canonical:\s*'https:\/\/tripsage\.in\/(?!seo\/)/g, "canonical: 'https://tripsage.in/seo/");
      changed = true;
    }

    // Replace slug: '/something' that are not /seo/ in dynamic pages
    if (content.match(/slug:\s*`\/\$/)) {
      content = content.replace(/slug:\s*`\/\$/g, "slug: `/seo/$");
      changed = true;
    }
    
    // also budget and category
    if (content.match(/slug:\s*`\/budget-/)) {
      content = content.replace(/slug:\s*`\/budget-/g, "slug: `/seo/budget-");
      changed = true;
    }

    if (content.match(/slug:\s*`\/\$\{category\}/)) {
      content = content.replace(/slug:\s*`\/\$\{category\}/g, "slug: `/seo/${category}");
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed:', filePath);
    }
  }
});
