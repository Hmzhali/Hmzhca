const fs = require('fs');
let content = fs.readFileSync('src/components/Header.tsx', 'utf8');

// Add import
if (!content.includes('import WakeLockToggle')) {
  content = content.replace(
    "import { ToastNotification } from '../types';",
    "import { ToastNotification } from '../types';\nimport WakeLockToggle from './WakeLockToggle';"
  );
}

// Add inside header layout next to the theme/lang toggle or notification bell
const target = `          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded border border-slate-700 transition font-bold"
          >
            <Languages className="w-3.5 h-3.5" />
            <span className="hidden sm:block">{lang === 'ar' ? 'EN' : 'AR'}</span>
          </button>`;

if (content.includes(target) && !content.includes('<WakeLockToggle')) {
  content = content.replace(
    target,
    `${target}\n          <WakeLockToggle lang={lang} />`
  );
  fs.writeFileSync('src/components/Header.tsx', content);
  console.log('WakeLockToggle added to Header.tsx');
} else {
  console.log('Target not found or already added');
}
