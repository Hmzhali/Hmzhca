const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

let lines = content.split('\n');
let newLines = [];
let skip = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('id: `scan-autotrade-fail-')) {
     skip = true;
     // Go back and remove handleTriggerToast
     while(newLines.length > 0 && !newLines[newLines.length-1].includes('handleTriggerToast({')) {
        newLines.pop();
     }
     if (newLines.length > 0) newLines.pop(); // remove the handleTriggerToast line itself
  } else if (skip && lines[i].includes('});')) {
     skip = false;
  } else if (!skip) {
     newLines.push(lines[i]);
  }
}

fs.writeFileSync('src/App.tsx', newLines.join('\n'));
