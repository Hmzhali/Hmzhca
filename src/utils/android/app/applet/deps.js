const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('useEffect(() => {')) {
        let deps = "";
        for (let j = i; j < i + 150 && j < lines.length; j++) {
            if (lines[j].match(/^\s*\}, \[.*\]\);/)) {
                deps = lines[j].trim();
                break;
            }
            if (lines[j].match(/^\s*\}\);/)) {
                deps = "NONE";
                break;
            }
        }
        console.log(`Line ${i + 1}: ${deps}`);
    }
}
