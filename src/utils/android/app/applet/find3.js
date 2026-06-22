import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /useEffect\s*\([\s\S]*?\)\s*;/g;
let match;
while ((match = regex.exec(content)) !== null) {
  const str = match[0];
  const lines = str.split('\n');
  const startLine = content.substring(0, match.index).split('\n').length;
  // Get last 3 lines
  const end = lines.slice(-3).join('\n');
  if (!end.includes('[')) {
    console.log("MIGHT BE MISSING DEPS at line " + startLine + ":\n" + end);
  }
}
