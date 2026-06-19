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

  function visit(node: ts.Node, inComponentScope = false, inFunctionScope = 0) {
    // Detect component functions (React components)
    if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node)) {
        if (node.parent && ts.isVariableDeclaration(node.parent)) {
            const name = node.parent.name.getText();
            if (name[0] === name[0].toUpperCase()) {
                inComponentScope = true;
                inFunctionScope = 0;
            } else {
                inFunctionScope++;
            }
        } else if (ts.isFunctionDeclaration(node) && node.name) {
            const name = node.name.getText();
            if (name[0] === name[0].toUpperCase()) {
                inComponentScope = true;
                inFunctionScope = 0;
            } else {
                inFunctionScope++;
            }
        } else {
            inFunctionScope++;
        }
    }

    if (inComponentScope && inFunctionScope === 0 && ts.isCallExpression(node)) {
      const expr = node.expression.getText();
      if (expr.startsWith('set') && expr.length > 3 && expr[3] === expr[3].toUpperCase()) {
          // Verify it matches useState setter
          const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
          console.log(`POTENTIAL DIRECT SETSTATE: ${filePath}:${line + 1}: ${expr}`);
      }
    }

    ts.forEachChild(node, child => visit(child, inComponentScope, inFunctionScope));
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
