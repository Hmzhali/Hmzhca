const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  `      // Check Quick Scalp Trailing Protection Mode (Dynamic Exit Protection Shield)
      if (quickScalpProtectorEnabled && order.isQuickBuy) {
        const savedPeak = peakPricesRef.current[order.id];
        const peakPrice = savedPeak !== undefined ? savedPeak : (order.peakPrice !== undefined ? order.peakPrice : order.price);

        // Dynamic shield: wait for a 0.75% drop instead of exactly 1 cent to avoid exiting too fast due to normal volatility
        const shieldDrop = Math.max(0.01, peakPrice * 0.0075);
        if (currentPrice <= peakPrice - shieldDrop || currentPrice <= order.price - shieldDrop) {
          triggered = "QUICK_SCALP";
        }
      }`,
  `      // Check Quick Scalp Trailing Protection Mode (Dynamic Exit Protection Shield)
      if (quickScalpProtectorEnabled && order.isQuickBuy) {
        const savedPeak = peakPricesRef.current[order.id];
        const peakPrice = savedPeak !== undefined ? savedPeak : (order.peakPrice !== undefined ? order.peakPrice : order.price);

        // Smart dynamic shield: only secure exits in PROFIT, and enforce a tighter stop loss
        const isLong = order.side === "BUY";
        const entryPrice = order.price;
        
        // Ensure minimum sensible profit (0.3%) before trailing kicks in
        const minProfitMet = isLong 
          ? (currentPrice > entryPrice * 1.003) 
          : (currentPrice < entryPrice * 0.997);
          
        if (isLong) {
          const trailDistance = Math.max(0.01, peakPrice * 0.0035); // 0.35% trailing stop for tighter profits
          if (currentPrice <= peakPrice - trailDistance && minProfitMet) {
            triggered = "QUICK_SCALP";
          } else if (currentPrice <= entryPrice * 0.985) { // Strict Stop Loss at 1.5% loss
            triggered = "QUICK_SCALP";
          }
        } else {
          const trailDistance = Math.max(0.01, peakPrice * 0.0035);
          if (currentPrice >= peakPrice + trailDistance && minProfitMet) {
            triggered = "QUICK_SCALP";
          } else if (currentPrice >= entryPrice * 1.015) { // Strict Stop Loss at 1.5% loss
            triggered = "QUICK_SCALP";
          }
        }
      }`
);

fs.writeFileSync('src/App.tsx', content);
