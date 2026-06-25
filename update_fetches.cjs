const fs = require('fs');
const path = require('path');

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

const files = walk('src');

files.forEach(f => {
  if (f.endsWith('.ts') || f.endsWith('.tsx')) {
    if (f === 'src/config.ts') return;
    
    let c = fs.readFileSync(f, 'utf8');
    let changed = false;

    // Check if we need to add import
    const needsImport = c.includes('fetch(') || c.includes('fetch (');
    
    if (needsImport && c.includes('/api/')) {
        if (!c.includes('API_BASE_URL')) {
            c = `import { API_BASE_URL } from "${path.relative(path.dirname(f), 'src/config').replace(/\\/g, '/').replace(/^([^\.])/, './$1')}";\n` + c;
            changed = true;
        }

        // Replace fetch('/api/... with fetch(`${API_BASE_URL}/api/...
        c = c.replace(/fetch\s*\(\s*['"](\/api\/[^'"]+)['"]/g, 'fetch(`${API_BASE_URL}$1`');
        
        // Replace fetch(`/api/... with fetch(`${API_BASE_URL}/api/...
        c = c.replace(/fetch\s*\(\s*`(\/api\/[^`]+)`/g, 'fetch(`${API_BASE_URL}$1`');

        // Replace fetch(`${window.location.origin}/api/...
        c = c.replace(/fetch\s*\(\s*`\$\{window\.location\.origin\}(\/api\/[^`]+)`/g, 'fetch(`${API_BASE_URL}$1`');
        
        if (changed || c !== fs.readFileSync(f, 'utf8')) {
            fs.writeFileSync(f, c);
            console.log('Updated ' + f);
        }
    }
  }
});
