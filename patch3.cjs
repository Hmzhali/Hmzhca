const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  `    // Cooldown check (prevent placing 20 trades in 2 seconds)
    const nowLocal = Date.now();
    if (nowLocal - lastWhaleTradeTimeRef.current < 8000) return;`,
  `    // Cooldown check (prevent placing 20 trades in 2 seconds)
    const nowLocal = Date.now();
    if (nowLocal - lastWhaleTradeTimeRef.current < 8000) return;
    
    const lastFail = failedCoinsCooldownRef.current[signal.symbol] || 0;
    if (nowLocal - lastFail < 60000) return; // 60s cooldown for a failed coin`
);

fs.writeFileSync('src/App.tsx', content);
