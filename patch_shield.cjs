const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\/\/ Check Quick Scalp Trailing Protection Mode.*?triggered = "QUICK_SCALP";\s*\}\s*\}/s;

const replacement = `// Check Quick Scalp Trailing Protection Mode (Dynamic Exit Protection Shield)
      if (quickScalpProtectorEnabled && order.isQuickBuy) {
        const savedPeak = peakPricesRef.current[order.id];
        const peakPrice = savedPeak !== undefined ? savedPeak : (order.peakPrice !== undefined ? order.peakPrice : order.price);

        const isLong = order.side === "BUY";
        const entryPrice = order.price;
        
        // Ensure minimum sensible profit (0.3%) before trailing kicks in
        const minProfitMet = isLong 
          ? (currentPrice > entryPrice * 1.003) 
          : (currentPrice < entryPrice * 0.997);
          
        if (isLong) {
          const trailDistance = Math.max(0.01, peakPrice * 0.004); // 0.4% trailing stop for tighter profits
          if (currentPrice <= peakPrice - trailDistance && minProfitMet) {
            triggered = "QUICK_SCALP";
          } else if (currentPrice <= entryPrice * 0.93) { // Relaxed Stop Loss at 7% to give room for recovery
            triggered = "QUICK_SCALP";
          }
        } else {
          const trailDistance = Math.max(0.01, peakPrice * 0.004);
          if (currentPrice >= peakPrice + trailDistance && minProfitMet) {
            triggered = "QUICK_SCALP";
          } else if (currentPrice >= entryPrice * 1.07) { // Relaxed Stop Loss at 7% to give room for recovery
            triggered = "QUICK_SCALP";
          }
        }
      }`;

if (regex.test(content)) {
  console.log("Found target using regex, replacing...");
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/App.tsx', content);
} else {
  console.log("Regex Target not found!");
}
