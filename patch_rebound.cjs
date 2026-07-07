const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  `      // Check if 1-minute Trend Rebound cycle is completed/overheated ("وعندما يكتمل ينسحب مباشرة")
      if (!triggered && order.isQuickBuy) {
        const hist1m = priceHistoryRef.current[order.symbol] || [];
        if (hist1m.length >= 3) {
          const prices = hist1m.map((h) => h.price);
          const lastPrice = prices[prices.length - 1];
          const prevPrice = prices[prices.length - 2];
          
          let change1m = 0;
          if (hist1m.length > 1) {
            const pOld = hist1m[0].price;
            change1m = ((currentPrice - pOld) / pOld) * 100;
          }
          const rsi1m = 50 + change1m * 12;

          // If RSI has reached overbought levels and starts ticking down, the quick rebound wave has fully finished
          if (rsi1m > 68 && lastPrice < prevPrice) {
            triggered = "REBOUND_COMPLETED";
          }
        }
      }`,
  `      // Check if 1-minute Trend Rebound cycle is completed/overheated ("وعندما يكتمل ينسحب مباشرة")
      if (!triggered && order.isQuickBuy) {
        const hist1m = priceHistoryRef.current[order.symbol] || [];
        if (hist1m.length >= 3) {
          const prices = hist1m.map((h) => h.price);
          const lastPrice = prices[prices.length - 1];
          const prevPrice = prices[prices.length - 2];
          
          let change1m = 0;
          if (hist1m.length > 1) {
            const pOld = hist1m[0].price;
            change1m = ((currentPrice - pOld) / pOld) * 100;
          }
          const rsi1m = 50 + change1m * 12;

          const isLong = order.side === "BUY";
          const isProfitable = isLong 
             ? (currentPrice > order.price * 1.002) 
             : (currentPrice < order.price * 0.998);

          // If RSI has reached extremes and starts reversing, the quick wave has fully finished
          if (isLong && rsi1m > 68 && lastPrice < prevPrice && isProfitable) {
            triggered = "REBOUND_COMPLETED";
          } else if (!isLong && rsi1m < 32 && lastPrice > prevPrice && isProfitable) {
            triggered = "REBOUND_COMPLETED";
          }
        }
      }`
);

fs.writeFileSync('src/App.tsx', content);
