
import fs from 'fs';
import path from 'path';
import parser from '@babel/parser';
import traverseModule from '@babel/traverse';
const traverse = traverseModule.default;

function isStateSetter(name) {
  return /^set[A-Z]/.test(name);
}

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
               results.push(file);
            }
        }
    });
    return results;
}

const files = walk('src');
for (const file of files) {
   const code = fs.readFileSync(file, 'utf8');
   let ast;
   try {
     ast = parser.parse(code, {
       sourceType: 'module',
       plugins: ['jsx', 'typescript']
     });
   } catch(e) { continue; }

   traverse(ast, {
     CallExpression(path) {
       const callee = path.node.callee;
       if (callee.type === 'Identifier' && isStateSetter(callee.name)) {
         // Check if this call is inside an arrow function or function declaration that is NOT the component body itself
         // A component is usually a function that returns JSX.
         // If the closest function parent is the component itself, it's a direct setState.
         
         let current = path.parentPath;
         let isInsideCallback = false;
         while (current && current.type !== 'Program') {
            if (current.type === 'ArrowFunctionExpression' || current.type === 'FunctionExpression' || current.type === 'FunctionDeclaration') {
               // Is it a component?
               // Usually components return JSX or are passed to React.memo, etc.
               // It's a callback if it is an argument to a function call (like useEffect, useCallback, setTimeout) or an event handler (onClick)
               const grandParent = current.parentPath;
               if (grandParent && (grandParent.type === 'CallExpression' || grandParent.type === 'JSXExpressionContainer')) {
                   isInsideCallback = true;
                   break;
               }
            }
            current = current.parentPath;
         }
         
         if (!isInsideCallback) {
            console.log('DIRECT SETSTATE in', file, 'line', path.node.loc.start.line, ':', callee.name);
         }
       }
     }
   })
}
