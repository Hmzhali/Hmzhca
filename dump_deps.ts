import fs from 'fs';
import path from 'path';
import ts from 'typescript';

function checkEffectDeps(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  function visit(node: ts.Node) {
    if (ts.isCallExpression(node)) {
        const exprName = node.expression.getText();
        if (exprName === 'useEffect' || exprName === 'React.useEffect') {
            const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
            if (node.arguments.length > 1) {
                const deps = node.arguments[1];
                if (ts.isArrayLiteralExpression(deps)) {
                    const depsList = deps.elements.map(dep => dep.getText());
                    console.log(`${filePath}:${line + 1}: [${depsList.join(', ')}]`);
                } else {
                    console.log(`${filePath}:${line + 1}: NON_ARRAY_DEPS: ${deps.getText()}`);
                }
            } else {
                console.log(`NO DEPS ARRAY: ${filePath}:${line + 1}`);
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
      checkEffectDeps(fullPath);
    }
  }
}

walk('src');
