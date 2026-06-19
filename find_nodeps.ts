import fs from 'fs';
import path from 'path';

function findNoDeps(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  let currentPos = 0;
  
  while ((currentPos = content.indexOf('useEffect(', currentPos)) !== -1) {
      let bracesMatch = 0;
      let startIdx = currentPos;
      // find the opening brace of effect
      let openBraceIdx = content.indexOf('{', startIdx);
      if (openBraceIdx === -1) {
          currentPos += 10;
          continue;
      }
      
      let endIdx = openBraceIdx + 1;
      bracesMatch = 1;
      
      while (bracesMatch > 0 && endIdx < content.length) {
          if (content[endIdx] === '{') bracesMatch++;
          if (content[endIdx] === '}') bracesMatch--;
          endIdx++;
      }
      
      if (bracesMatch === 0) {
          // Now check the substring after the closing brace until the next semicolon
          const nextSemi = content.indexOf(';', endIdx);
          const afterClosing = content.substring(endIdx, nextSemi + 1);
          
          if (!afterClosing.includes('[')) {
              const lines = content.substring(0, startIdx).split('\n').length;
              console.log(`\nFound potential NO_DEPS in ${filePath} at line ${lines}`);
              console.log(content.substring(startIdx, endIdx + afterClosing.length).substring(0, 150) + "...");
          }
      }
      
      currentPos = endIdx;
  }
}

function walk(dir: string) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      findNoDeps(fullPath);
    }
  }
}

walk('src');
