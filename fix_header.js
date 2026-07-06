const fs = require('fs');
let content = fs.readFileSync('src/components/Header.tsx', 'utf8');
content = content.replace(/\{isOwner \&\& \(\<button/g, '<button');
content = content.replace(/              <\/button>\n              \)\}\n                <\/button>/g, '                </button>');
fs.writeFileSync('src/components/Header.tsx', content);
