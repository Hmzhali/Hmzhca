import fs from 'fs';

function findNoDeps(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  let index = 0;
  while ((index = code.indexOf('useEffect(() => {', index)) !== -1) {
    let braceCount = 0;
    let i = index + 'useEffect(() => {'.length;
    let foundStart = true;
    braceCount++; // For the opening brace `{` in `() => {`
    
    // We also need to count parentheses to make sure we find the end of `useEffect(`
    let parenCount = 1; // for `useEffect(`

    // wait, we can just walk the string and count `{` and `}` and `(` and `)`
    // Actually, counting braces of the arrow function:
    let inString = false;
    let stringChar = '';
    
    for (; i < code.length; i++) {
        const char = code[i];
        const prev = i > 0 ? code[i-1] : '';

        if (inString) {
            if (char === stringChar && prev !== '\\') {
                inString = false;
            }
            continue;
        }

        if (char === '"' || char === "'" || char === "`") {
            inString = true;
            stringChar = char;
            continue;
        }

        if (char === '{') braceCount++;
        else if (char === '}') braceCount--;
        else if (char === '(') parenCount++;
        else if (char === ')') parenCount--;

        if (braceCount === 0) {
            // we reached the end of the arrow function body `... }`
            // Now the rest is the arguments to useEffect: ` , [deps] )` or just `)`
            // We read until `parenCount` is 0
            let rest = '';
            for (let j = i + 1; j < code.length; j++) {
                rest += code[j];
                if (code[j] === '(') parenCount++;
                else if (code[j] === ')') parenCount--;
                
                if (parenCount === 0) {
                    // end of useEffect
                    if (!rest.includes('[')) {
                        const lineNum = code.substring(0, index).split('\n').length;
                        console.log(`\n--- NO DEP ARRAY AT LINE ${lineNum} in ${filePath} ---`);
                        console.log(code.substring(index, index + 50) + ' ... ' + rest.substring(0, 50).trim());
                    }
                    else if (rest.includes('[]')) {
                       // empty deps ok
                    }
                    break;
                }
            }
            break;
        }
    }
    index++;
  }
}

findNoDeps('src/App.tsx');
