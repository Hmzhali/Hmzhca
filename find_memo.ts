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

  function visit(node: ts.Node, inMemo = false, memoName = "") {
    if (ts.isCallExpression(node)) {
      const callName = node.expression.getText();
      if (callName === 'useMemo') {
         inMemo = true;
         memoName = 'useMemo';
      } else if (callName === 'useCallback') {
         // skip useCallback because it is NOT executed during render
      } else if (callName.startsWith('set') && callName[3] === callName[3]?.toUpperCase()) {
         if (inMemo) {
            const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
            console.log(`POTENTIAL DIRECT SETSTATE in ${memoName}: ${filePath}:${line + 1}: ${callName}`);
         }
      }
    }

    ts.forEachChild(node, child => visit(child, inMemo, memoName));
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
      checkDirectSetState(fullPath);
    }
  }
}

walk('src');
