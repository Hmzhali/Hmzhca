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

function visit(node: ts.Node, inFuncDef = false) {
  if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
    // If it's a component, we don't set inFuncDef to true for the body
    if (ts.isFunctionDeclaration(node) && node.name?.text === 'FuturesTrading') {
        ts.forEachChild(node, child => visit(child, false));
    } else {
        ts.forEachChild(node, child => visit(child, true));
    }
    return;
  }
  
  if (ts.isCallExpression(node)) {
    const exprText = node.expression.getText(sourceFile);
    if (!inFuncDef && (exprText === 'onUpdatePortfolio' || exprText === 'onTriggerToast' || exprText === 'setFuturesApiError' || exprText.startsWith('set'))) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        console.log(`POTENTIAL DIRECT CALL at line ${line + 1}: ${exprText}`);
    }
  }

  ts.forEachChild(node, child => visit(child, inFuncDef));
}

visit(sourceFile);
