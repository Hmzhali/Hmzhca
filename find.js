import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /useEffect\s*\([\s\S]*?\)\s*;/g;
let match;
while ((match = regex.exec(content)) !== null) {
  // basic check if it ends with }, []) or similar
  const str = match[0];
  const end = str.substring(str.length - 20);
  if (!end.includes('[')) {
    console.log("MIGHT BE MISSING DEPS:", str.substring(0, 50), "...", end);
  }
}
