const fs = require('fs');
const glob = require('fs').readdirSync;
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walkDir(file));
        } else if (file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walkDir('src');
for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  const lines = c.split('\n');
  let braceDepth = 0;
  let inFunction = false;
  for(let i=0; i<lines.length; i++){
     let line = lines[i];
     // A super primitive check just to see what state setters are called on lines containing return/useEffect etc
     if(line.includes('set') && line.match(/set[A-Z][A-Za-z0-9]+\(/)){
         if (!line.includes('=>') && 
             !line.includes('function') && 
             !line.includes('useEffect') &&
             !line.includes('onClick=') &&
             !line.includes('onChange=') &&
             !line.includes('then(') &&
             !line.includes('catch(') &&
             !line.includes('setTimeout') &&
             !line.includes('if ')
            ) {
             console.log(f + ':' + (i+1) + ': ' + line.trim());
         }
     }
  }
}
