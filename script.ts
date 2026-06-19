import fs from 'fs';
const lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

for (let i=0; i<lines.length; i++) {
   if (lines[i].includes('useEffect(() => {')) {
       let braces = 0;
       let start = i;
       let j = i;
       for (; j<lines.length; j++) {
           for (let char of lines[j]) {
               if (char === '{') braces++;
               if (char === '}') braces--;
           }
           if (braces === 0) {
               break;
           }
       }
       // See if the next char on line `j` or line `j+1` is `)` and no deps.
       console.log('Effect from ' + (start+1) + ' to ' + (j+1) + ': ' + lines[j].trim());
       i = j;
   }
}
