import fs from 'fs';
import path from 'path';

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let inEffect = false;
  let effectStart = 0;
  let effectBody = [];
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('useEffect(() => {') || lines[i].includes('useEffect(')) {
        inEffect = true;
        effectStart = i + 1;
        effectBody = [];
    }
    
    if (inEffect) {
        effectBody.push(lines[i]);
        if (lines[i].match(/^\s*\}\);/)) {
            console.log(`\n--- File: ${filePath} Lines: ${effectStart}-${i + 1} (NO DEPS) ---`);
            const bodyStr = effectBody.join("\n");
            if (bodyStr.includes('set')) {
                console.log(bodyStr);
            }
            inEffect = false;
        } else if (lines[i].match(/^\s*\}, \[.*\]\);.*/)) {
            inEffect = false;
        }
    }
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
      scanFile(fullPath);
    }
  }
}

walk('src');
