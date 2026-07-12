const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  `} else {
           throw new Error("Live Trading is enabled but API keys are missing.");
        }`,
  `} else {
          if (Date.now() - (window.lastApiErrorToastTime || 0) > 300000) {
            window.lastApiErrorToastTime = Date.now();
            handleTriggerToast({
              id: Date.now().toString(),
              symbol: newOrder.symbol,
              timestamp: Date.now(),
              isError: true,
              aiExplanationAr: \`⚠️ التداول حقيقي ولكن مفاتيح API مفقودة!\\nتم تحويل صفقات البوت التلقائية مؤقتاً إلى المحاكاة التجريبية (Demo) حتى تقوم بربط حساب بينانس من قسم (أمان الـ API).\`,
              aiExplanationEn: \`⚠️ Live Trading enabled but API keys missing!\\nAutomated bot trades have temporarily fallen back to paper-demo until you link your Binance API.\`,
            });
          }
          // Proceed as paper trade silently
        }`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched fallback");
