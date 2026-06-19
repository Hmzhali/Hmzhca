import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf8');

// A simple regex to find `useEffect(() => { ... })` where the second argument is missing
// It's tricky to balance braces with regex. 
// Let's run a simple acorn script!

import * as acorn from 'acorn';

try {
  const ast = acorn.parse(content, { ecmaVersion: 2020, sourceType: 'module' });
} catch(e) {
  // Acorn doesn't support JSX natively.
}
