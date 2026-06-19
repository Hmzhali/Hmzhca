import fs from 'fs';
import path from 'path';
import ts from 'typescript';

function checkRenderVars(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

  function visit(node: ts.Node) {
    if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node)) {
        // find variable declarations inside
        const renderVars = new Set<string>();
        function findVars(n: ts.Node) {
            if (ts.isVariableDeclaration(n) && n.name && ts.isIdentifier(n.name)) {
                if (n.initializer) {
                   if (ts.isObjectLiteralExpression(n.initializer) || ts.isArrayLiteralExpression(n.initializer) || ts.isArrowFunction(n.initializer)) {
                       renderVars.add(n.name.text);
                   }
                }
            }
            if (!ts.isFunctionDeclaration(n) && !ts.isArrowFunction(n) && !ts.isFunctionExpression(n)) {
                ts.forEachChild(n, findVars);
            }
            // we don't go deep into nested functions except we need to check effects
        }
        
        // Let's just collect all literal variables in this component scope
        ts.forEachChild(node, findVars);
        
        // Now find useEffects in this component
        function findEffects(n: ts.Node) {
            if (ts.isCallExpression(n) && (n.expression.getText(sourceFile) === 'useEffect' || n.expression.getText(sourceFile) === 'React.useEffect')) {
                if (n.arguments.length > 1) {
                    const deps = n.arguments[1];
                    if (ts.isArrayLiteralExpression(deps)) {
                        deps.elements.forEach(dep => {
                            if (ts.isIdentifier(dep) && renderVars.has(dep.text)) {
                                const { line } = sourceFile.getLineAndCharacterOfPosition(n.getStart());
                                console.log(`STATIC DEP TRIGGER: ${filePath}:${line + 1}: ${dep.text}`);
                            }
                        });
                    }
                }
            }
            if (!ts.isFunctionDeclaration(n) && !ts.isArrowFunction(n) && !ts.isFunctionExpression(n)) {
                ts.forEachChild(n, findEffects);
            }
        }
        ts.forEachChild(node, findEffects);
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
      checkRenderVars(fullPath);
    }
  }
}

walk('src');
