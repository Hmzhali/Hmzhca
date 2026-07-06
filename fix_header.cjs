const fs = require('fs');
let content = fs.readFileSync('src/components/Header.tsx', 'utf8');

// Find the section that says Admin Panel and fix it
let lines = content.split('\n');
let newLines = [];
let skip = false;
let foundAdminPanel = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Admin Panel')) {
     foundAdminPanel = true;
     // Go back and find the start of the button
     let j = newLines.length - 1;
     while (j >= 0 && !newLines[j].includes('<button')) {
        j--;
     }
     
     // Remove everything from j to the end of newLines
     newLines.splice(j);
     
     // Skip lines until the end of button
     while (i < lines.length && !lines[i].includes('</button>')) {
        i++;
     }
     // Skip extra garbage if present
     while (i + 1 < lines.length && (lines[i+1].includes(')}') || lines[i+1].includes('</button>'))) {
        i++;
     }
     
     // Insert correct conditional button
     newLines.push('                {isOwner && (');
     newLines.push('                  <button');
     newLines.push('                    onClick={() => { setShowProfileModal(false); setActiveTab(\'owner\'); }}');
     newLines.push('                    className="w-full flex items-center justify-between px-4 py-2.5 bg-indigo-950/30 hover:bg-indigo-950/50 border border-indigo-900/50 rounded-lg text-indigo-400 text-sm font-bold transition"');
     newLines.push('                  >');
     newLines.push('                    <span>{lang === \'ar\' ? \'لوحة تحكم المالك\' : \'Admin Panel\'}</span>');
     newLines.push('                    <Shield className="w-4 h-4" />');
     newLines.push('                  </button>');
     newLines.push('                )}');
     
  } else {
     newLines.push(lines[i]);
  }
}

fs.writeFileSync('src/components/Header.tsx', newLines.join('\n'));
