const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  `        if (isLiveTrading) {
          handleTriggerToast({
            id: \`whale-autotrade-fail-\${Date.now()}\`,
            symbol: matchedPair.symbol,
            timestamp: Date.now(),
            isError: true,
            aiExplanationAr: \`⚠️ رادار الحيتان: تم رصد فرصة ولكن رصيدك في محفظة العقود الآجلة (\${portfolio.futuresUsdt} USDT) غير كافٍ. الحد الأدنى المطلوب هو \${minimumTradeSize} USDT.\`,
            aiExplanationEn: \`⚠️ Whale Radar: Opportunity found but your Futures balance (\${portfolio.futuresUsdt} USDT) is insufficient. Minimum required is \${minimumTradeSize} USDT.\`,
          });
        }
        return; // not enough simulated funds
      }
    }`,
  `        if (isLiveTrading) {
          handleTriggerToast({
            id: \`whale-autotrade-fail-\${Date.now()}\`,
            symbol: matchedPair.symbol,
            timestamp: Date.now(),
            isError: true,
            aiExplanationAr: \`⚠️ رادار الحيتان: تم رصد فرصة ولكن رصيدك في محفظة العقود الآجلة (\${portfolio.futuresUsdt} USDT) غير كافٍ. الحد الأدنى المطلوب هو \${minimumTradeSize} USDT.\`,
            aiExplanationEn: \`⚠️ Whale Radar: Opportunity found but your Futures balance (\${portfolio.futuresUsdt} USDT) is insufficient. Minimum required is \${minimumTradeSize} USDT.\`,
          });
        }
        failedCoinsCooldownRef.current[matchedPair.symbol] = Date.now();
        return; // not enough simulated funds
      }
    }`
);

fs.writeFileSync('src/App.tsx', content);
