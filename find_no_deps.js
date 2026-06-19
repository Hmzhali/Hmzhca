const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');
const lines = content.split('\n');

let effectStarts = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('useEffect(() => {')) {
    effectStarts.push(i);
  }
}

for (let start of effectStarts) {
  let openBraces = 0;
  for (let i = start; i < lines.length; i++) {
    openBraces += (lines[i].match(/\{/g) || []).length;
    openBraces -= (lines[i].match(/\}/g) || []).length;
    if (openBraces === 0) {
      if (!lines[i].includes(']')) {
         console.log('NO DEPENDENCY ARRAY at line', start + 1, 'ends at', i + 1, lines[i]);
      }
      break;
    }
  }
}
