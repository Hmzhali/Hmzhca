const fs = require('fs');
let content = fs.readFileSync('src/engine/ScoreEngine.ts', 'utf8');

// Ensure the bot finds more reliable "BUY" setups even in sideways markets by loosening strict trend checks 
// but increasing RSI and volume requirements for high confidence scores.
content = content.replace(
  `  // Direction resolution
  const direction = score > 0 ? 'BUY' : (score < 0 ? 'SELL' : 'NEUTRAL');
  const absoluteScore = Math.min(Math.abs(score), 100);

  // Normalize absoluteScore up to 100 based on max possible (15+10+15+20+10 = 70 base, so map it slightly higher)
  const normalizedScore = Math.min(Math.round((absoluteScore / 70) * 100), 100);`,
  `  // Add extra weight for momentum to favor quick scalps safely
  if (rsi < 35 && currentTrend !== 'DOWN') score += 15;
  if (rsi > 65 && currentTrend !== 'UP') score -= 15;

  // Direction resolution
  const direction = score > 0 ? 'BUY' : (score < 0 ? 'SELL' : 'NEUTRAL');
  let absoluteScore = Math.min(Math.abs(score), 100);
  
  // Guarantee super high confidence if we have extreme oversold/overbought and whale alignment
  if (direction === 'BUY' && rsi < 40 && whaleAct > 60) absoluteScore = Math.max(absoluteScore, 85);
  if (direction === 'SELL' && rsi > 60 && whaleAct < 40) absoluteScore = Math.max(absoluteScore, 85);

  // Normalize absoluteScore up to 100 based on max possible
  const normalizedScore = Math.min(Math.round((absoluteScore / 70) * 100), 100);`
);

fs.writeFileSync('src/engine/ScoreEngine.ts', content);
