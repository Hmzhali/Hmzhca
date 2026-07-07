const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  `          const currentPeak = savedPeak !== undefined ? savedPeak : (o.peakPrice !== undefined ? o.peakPrice : o.price);
          if (currentPrice > currentPeak) {
            peakPricesRef.current[o.id] = currentPrice;
          }`,
  `          const currentPeak = savedPeak !== undefined ? savedPeak : (o.peakPrice !== undefined ? o.peakPrice : o.price);
          
          if (o.side === "BUY") {
            if (currentPrice > currentPeak) {
              peakPricesRef.current[o.id] = currentPrice;
            }
          } else {
            // For SHORT (SELL), the "peak" is the lowest price it reaches (maximum profit point)
            if (currentPrice < currentPeak) {
              peakPricesRef.current[o.id] = currentPrice;
            }
          }`
);

fs.writeFileSync('src/App.tsx', content);
