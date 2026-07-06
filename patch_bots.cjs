const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Stop handleAddNewOrder from spamming failure toasts for BOTs
content = content.replace(
  `            const directionEn = newOrder.side === "BUY" ? "BUY (Long)" : "SELL (Short)";
            handleTriggerToast({
              id: Date.now().toString(),
              symbol: newOrder.symbol,
              timestamp: Date.now(),
              isError: true,
              aiExplanationAr: \`❌ فشل تنفيذ الصفقة على منصة بينانس!\\nاتجاه الصفقة: \${directionAr}\\nالسعر: $\${newOrder.price}\\nالسبب الفني والمؤشرات: \${newOrder.aiReasonAr || "غير متوفر"}\\nسبب الرفض من بينانس: \${resData.error || "مجهول"}\`,
              aiExplanationEn: \`❌ Binance live trade failed!\\nDirection: \${directionEn}\\nPrice: $\${newOrder.price}\\nTechnical Reason & Indicators: \${newOrder.aiReasonEn || "N/A"}\\nBinance Rejection Reason: \${resData.error || "Unknown error"}\`,
            });
            
            if (newOrder.originType === "BOT") {
              throw new Error(\`Binance order rejected: \${resData.error || "Unknown error"}\`);`,
  `            const directionEn = newOrder.side === "BUY" ? "BUY (Long)" : "SELL (Short)";
            
            if (newOrder.originType !== "BOT") {
              handleTriggerToast({
                id: Date.now().toString(),
                symbol: newOrder.symbol,
                timestamp: Date.now(),
                isError: true,
                aiExplanationAr: \`❌ فشل تنفيذ الصفقة على منصة بينانس!\\nاتجاه الصفقة: \${directionAr}\\nالسعر: $\${newOrder.price}\\nالسبب الفني والمؤشرات: \${newOrder.aiReasonAr || "غير متوفر"}\\nسبب الرفض من بينانس: \${resData.error || "مجهول"}\`,
                aiExplanationEn: \`❌ Binance live trade failed!\\nDirection: \${directionEn}\\nPrice: $\${newOrder.price}\\nTechnical Reason & Indicators: \${newOrder.aiReasonEn || "N/A"}\\nBinance Rejection Reason: \${resData.error || "Unknown error"}\`,
              });
            }
            
            if (newOrder.originType === "BOT") {
              throw new Error(\`Binance order rejected: \${resData.error || "Unknown error"}\`);`
);

fs.writeFileSync('src/App.tsx', content);
