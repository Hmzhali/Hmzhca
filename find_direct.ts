import fs from 'fs';
import path from 'path';
import ts from 'typescript';

function checkDirectSetState(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  function visit(node: ts.Node, inFunctionDef = false) {
    if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
        ts.forEachChild(node, child => visit(child, true));
        return;
    }
    
    if (ts.isCallExpression(node)) {
      const callName = node.expression.getText(sourceFile);
      if (callName.startsWith('set') && callName[3] === callName[3]?.toUpperCase()) {
         if (!inFunctionDef) {
            const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
            console.log(`POTENTIAL DIRECT SETSTATE: ${filePath}:${line + 1}: ${callName}`);
         }
      }
    }

    ts.forEachChild(node, child => visit(child, inFunctionDef));
  }
  
  // This simplistic approach just checks if set* is called inside the component body,
  // outside of any nested functions.
  function visitComponent(node: ts.Node) {
    if (ts.isFunctionDeclaration(node) && node.name && node.name.text[0] === node.name.text[0].toUpperCase()) {
         // Component scope
         node.body?.statements.forEach(stmt => {
             // Let's traverse the statement, but do not enter function declarations/expressions/arrows
             function checkStmt(n: ts.Node) {
                 if (ts.isFunctionDeclaration(n) || ts.isArrowFunction(n) || ts.isFunctionExpression(n)) return;
                 if (ts.isCallExpression(n) && (n.expression.getText(sourceFile) !== 'useEffect' && n.expression.getText(sourceFile) !== 'useCallback' && n.expression.getText(sourceFile) !== 'useMemo')) {
                     const callName = n.expression.getText(sourceFile);
                     if (callName.startsWith('set') || callName.startsWith('on')) {
                         const { line } = sourceFile.getLineAndCharacterOfPosition(n.getStart());
                         console.log(`POSSIBLE DIRECT RENDER CALL: ${filePath}:${line + 1}: ${callName}`);
                     }
                 }
                 ts.forEachChild(n, checkStmt);
             }
             checkStmt(stmt);
         });
    }
    ts.forEachChild(node, visitComponent);
  }

  visitComponent(sourceFile);
}

function walk(dir: string) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      checkDirectSetState(fullPath);
    }
  }
}

walk('src');
