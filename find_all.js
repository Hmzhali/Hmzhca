import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

const files = walk('src').filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

for (let f of files) {
  const content = fs.readFileSync(f, 'utf8');
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
        // check if `]` is present from line `start` to `i`!
        // The dependency array is anywhere before the matching closing brace? No, it's immediately after the closing brace!
        // `useEffect(() => { ... }, [...]);`
        const prevContent = lines.slice(start, i + 1).join('\n');
        // wait, the `]` could be on line i, i-1, etc. But if the brace closes the inner arrow function `() => { ... }`, the dependency array comes AFTER it!
        // Example: `useEffect(() => { ... }, []);`
        // the `}` we matched is the inner function's brace!
        // So line `i` contains `}`. Does it contain `]`?
        if (!lines[i].includes(']')) {
           // what if the array spans multiple lines? We just saw `}, [`
           if (!lines[i].includes('[')) {
             console.log('NO DEPENDENCY ARRAY at file', f, 'line', start + 1, 'ends at', i + 1, lines[i].trim());
           }
        }
        break;
      }
    }
  }
}
