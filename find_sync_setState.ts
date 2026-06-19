import fs from 'fs';
import path from 'path';
import ts from 'typescript';

function isSyncSetState(node: ts.Node, sourceFile: ts.SourceFile): boolean {
  let isSync = true;
  let current: ts.Node | undefined = node;
  while (current) {
    if (ts.isCallExpression(current)) {
      const exprText = current.expression.getText(sourceFile);
      if (exprText === 'setTimeout' || exprText === 'setInterval' || exprText.endsWith('.then') || exprText.endsWith('.catch')) {
        return false;
      }
    }
    if (ts.isFunctionDeclaration(current) || ts.isArrowFunction(current) || ts.isFunctionExpression(current)) {
        // If it's an async function, we assume wait/async could be there, but let's just check if it's the effect callback itself.
        if (current.parent && ts.isCallExpression(current.parent) && (current.parent.expression.getText(sourceFile).includes('useEffect'))) {
            // we reached the effect callback
            break;
        } else {
            // inside some other function inside effect
            // We should treat it as async if it's passed to an event listener, but usually if it's not setTimeout/setInterval, it is sync.
        }
    }
    current = current.parent;
  }
  return true;
}

function check(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

  function visit(node: ts.Node) {
    if (ts.isCallExpression(node) && (node.expression.getText(sourceFile) === 'useEffect' || node.expression.getText(sourceFile) === 'React.useEffect')) {
      const effectArgs = node.arguments;
      if (effectArgs.length > 1) {
          const deps = effectArgs[1];
          let depsText = deps.getText(sourceFile);
          
          let hasSyncSetState = false;
          let syncSetStates: string[] = [];

          function findSetState(n: ts.Node) {
            if (ts.isCallExpression(n)) {
               const fnName = n.expression.getText(sourceFile);
               if (fnName.startsWith('set') && fnName[3] === fnName[3]?.toUpperCase()) {
                  if (isSyncSetState(n, sourceFile)) {
                     hasSyncSetState = true;
                     syncSetStates.push(fnName);
                  }
               }
            }
            ts.forEachChild(n, findSetState);
          }
          findSetState(effectArgs[0]);
          
          if (hasSyncSetState) {
              const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
              console.log(`${filePath}:${line + 1}: Sync SetStates: ${syncSetStates.join(', ')} | Deps: ${depsText}`);
          }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

function walk(dir: string) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      check(fullPath);
    }
  }
}

walk('src');
