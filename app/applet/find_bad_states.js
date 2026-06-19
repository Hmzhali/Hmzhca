const fs = require('fs');

function checkFile(file) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    let insideUseEffect = false;
    let brackets = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.match(/^[ ]*set[A-Z][a-zA-Z0-9_]*\(/)) {
            console.log(file, i + 1, line.trim());
        }
    }
}

const files = fs.readdirSync('src/components').map(f => 'src/components/' + f).concat(['src/App.tsx']);
files.forEach(f => {
    if (f.endsWith('.tsx')) {
        checkFile(f);
    }
});
