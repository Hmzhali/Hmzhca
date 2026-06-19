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
            if (node.arguments.length > 1) {
                const deps = node.arguments[1];
                if (ts.isArrayLiteralExpression(deps)) {
                    deps.elements.forEach(dep => {
                        const depName = dep.getText();
                        // check if it's an object literal, array literal, or arrow function
                        if (ts.isObjectLiteralExpression(dep) || ts.isArrayLiteralExpression(dep) || ts.isArrowFunction(dep)) {
                            const { line } = sourceFile.getLineAndCharacterOfPosition(dep.getStart());
                            console.log(`LITERAL DEP: ${filePath}:${line + 1}: ${depName}`);
                        }
                        // we can't easily check if it's a variable pointing to an object created in render, but we can list all deps
                        // console.log(`DEP: ${filePath} -> ${depName}`);
                    });
                }
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
