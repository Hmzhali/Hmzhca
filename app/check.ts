import fs from 'fs';
import ts from 'typescript';

const filePath = 'src/components/FuturesTrading.tsx';
const content = fs.readFileSync(filePath, 'utf8');
const sourceFile = ts.createSourceFile(
  filePath,
  content,
  ts.ScriptTarget.Latest,
  true
);

function visit(node: ts.Node) {
    if (ts.isJsxAttribute(node) && node.initializer && ts.isJsxExpression(node.initializer) && node.initializer.expression) {
       const expr = node.initializer.expression;
       if (ts.isCallExpression(expr)) {
           const callName = expr.expression.getText(sourceFile);
           if (callName.startsWith('set') || callName.startsWith('on')) {
               const { line } = sourceFile.getLineAndCharacterOfPosition(expr.getStart());
               console.log(`POTENTIAL DIRECT SETSTATE in JSX PROP at line ${line + 1}: ${callName}`);
           }
       }
    }
  ts.forEachChild(node, visit);
}

visit(sourceFile);
