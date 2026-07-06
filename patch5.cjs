const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// For AI Engine:
content = content.replace(
  `            handleTriggerToast({
              id: \`ai-engine-warn-\${now}\`,
              botId: "decision-engine",
              botType: "RSI",
              symbol: coin.symbol,
              profit: 0,
              timestamp: now,
              isError: true,
              aiExplanationAr: warnMsgAr,
              aiExplanationEn: warnMsgEn,
            });
            failedCoinsCooldownRef.current[coin.symbol] = Date.now();
            continue;`,
  `            // Intentionally omit toast for insufficient balance to prevent spam
            failedCoinsCooldownRef.current[coin.symbol] = Date.now();
            continue;`
);

fs.writeFileSync('src/App.tsx', content);
