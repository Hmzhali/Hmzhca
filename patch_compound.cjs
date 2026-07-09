const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Whale Radar Compounding
content = content.replace(
  `    let sizeInUsdt = quickBuyAmountUsdt;
    const minimumTradeSize = isLiveTrading ? 1.0 : 0.5;`,
  `    // Smart Compounding: Use 15% to 30% of portfolio for whales, or the set quick buy amount, whichever is larger
    let sizeInUsdt = Math.max(quickBuyAmountUsdt, portfolio.futuresUsdt * 0.20);
    const minimumTradeSize = isLiveTrading ? 1.0 : 0.5;`
);

// Manual Watchlist Scanner Compounding
content = content.replace(
  `        // Trade sizing & Leverage dynamically scaled based on signal strength/confidence score! ("وكلما كانت الفرصة قوية، زيد بالرافعة والجاهزية بالرصيد")
        let baseSizing = quickBuyAmountUsdt;
        let scalingMultiplier = 1;
        let dynamicLeverage = 1;
        if (bestCandidate.confidenceScore >= 60) {
          scalingMultiplier = 1 + ((bestCandidate.confidenceScore - 60) / 40) * 1.5; // up to 2.5x standard size
          dynamicLeverage = Math.round(5 + ((bestCandidate.confidenceScore - 60) / 40) * 45); // up to 50x leverage!
        }
        let sizeInUsdt = baseSizing * scalingMultiplier;`,
  `        // Smart Compounding: Dynamically calculate optimal capital allocation based on portfolio size and confidence
        let baseSizing = Math.max(quickBuyAmountUsdt, portfolioRef.current.futuresUsdt * 0.15);
        let scalingMultiplier = 1;
        let dynamicLeverage = 10;
        if (bestCandidate.confidenceScore >= 60) {
          scalingMultiplier = 1 + ((bestCandidate.confidenceScore - 60) / 40) * 1.5; // up to 2.5x standard size
          dynamicLeverage = Math.round(15 + ((bestCandidate.confidenceScore - 60) / 40) * 45); // up to 60x leverage for extreme confidence
        }
        let sizeInUsdt = baseSizing * scalingMultiplier;
        // Cap size so we don't exceed what we actually have
        if (sizeInUsdt > portfolioRef.current.futuresUsdt * 0.95) {
          sizeInUsdt = portfolioRef.current.futuresUsdt * 0.95;
        }`
);

fs.writeFileSync('src/App.tsx', content);
