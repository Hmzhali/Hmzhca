const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('declare global')) {
  content = content.replace(
    'import React',
    `declare global {
  interface Window {
    lastApiErrorToastTime?: number;
  }
}
import React`
  );
  fs.writeFileSync('src/App.tsx', content);
  console.log("Patched global");
}
