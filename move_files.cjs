const fs = require('fs');
const path = require('path');

const srcDir = './Hmzhca-main1';
const destDir = '.';

const files = fs.readdirSync(srcDir);

for (const file of files) {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(destDir, file);
  console.log(`Moving ${srcPath} to ${destPath}`);
  fs.renameSync(srcPath, destPath);
}

console.log('Done moving files.');
