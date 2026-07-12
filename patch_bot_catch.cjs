const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Patch 1: Whale
content = content.replace(
  `} catch (err: any) {
      console.warn("Failed to dispatch automated whale-triggered futures trade:", err.message || err);
      failedCoinsCooldownRef.current[signal.symbol] = Date.now();
    }`,
  `} catch (err: any) {
      console.warn("Failed to dispatch automated whale-triggered futures trade:", err.message || err);
      failedCoinsCooldownRef.current[signal.symbol] = Date.now();
      handleTriggerToast({
        id: \`whale-err-\${Date.now()}\`,
        symbol: signal.symbol,
        timestamp: Date.now(),
        isError: true,
        aiExplanationAr: \`❌ فشل تنفيذ صفقة الحيتان التلقائية!\\nالسبب: \${err.message || err}\\nيرجى التحقق من توفر رصيد ومفاتيح API صالحة.\`,
        aiExplanationEn: \`❌ Failed to execute automated whale trade!\\nReason: \${err.message || err}\\nPlease verify API keys and balance.\`,
      });
    }`
);

// Patch 2: Scanner
content = content.replace(
  `} catch (err: any) {
          console.warn("Watchlist scanner auto order failed:", err.message || err);
          failedCoinsCooldownRef.current[coin.symbol] = Date.now();
        }`,
  `} catch (err: any) {
          console.warn("Watchlist scanner auto order failed:", err.message || err);
          failedCoinsCooldownRef.current[coin.symbol] = Date.now();
          handleTriggerToast({
            id: \`scan-err-\${Date.now()}\`,
            symbol: coin.symbol,
            timestamp: Date.now(),
            isError: true,
            aiExplanationAr: \`❌ فشل إطلاق صفقة ارتداد تلقائية!\\nالسبب: \${err.message || err}\\nيرجى التأكد من ربط حساب بينانس وتوفر رصيد كاف.\`,
            aiExplanationEn: \`❌ Failed to execute auto-rebound trade!\\nReason: \${err.message || err}\\nPlease verify your Binance API connection and balance.\`,
          });
        }`
);

// Patch 3: AI Engine
content = content.replace(
  `} catch (er: any) {
          console.warn("AI Engine order fail:", er.message);
          failedCoinsCooldownRef.current[coin.symbol] = Date.now();
        }`,
  `} catch (er: any) {
          console.warn("AI Engine order fail:", er.message);
          failedCoinsCooldownRef.current[coin.symbol] = Date.now();
          handleTriggerToast({
            id: \`ai-err-\${Date.now()}\`,
            symbol: coin.symbol,
            timestamp: Date.now(),
            isError: true,
            aiExplanationAr: \`❌ فشل تنفيذ صفقة الذكاء الاصطناعي!\\nالسبب: \${er.message || er}\\nقم بمراجعة الرصيد والمفاتيح.\`,
            aiExplanationEn: \`❌ Failed to execute AI engine trade!\\nReason: \${er.message || er}\\nCheck balance and API keys.\`,
          });
        }`
);

// Patch 4: Remove the `if (newOrder.originType !== "BOT")` wrapper for error toast in handleAddNewOrder
content = content.replace(
  `            if (newOrder.originType !== "BOT") {
              handleTriggerToast({
                id: Date.now().toString(),
                symbol: newOrder.symbol,
                timestamp: Date.now(),
                isError: true,
                aiExplanationAr: \`❌ فشل تنفيذ الصفقة على منصة بينانس!\\nاتجاه الصفقة: \${directionAr}\\nالسعر: \${newOrder.price}\\nالسبب الفني والمؤشرات: \${newOrder.aiReasonAr || "غير متوفر"}\\nسبب الرفض من بينانس: \${resData.error || "مجهول"}\`,
                aiExplanationEn: \`❌ Binance live trade failed!\\nDirection: \${directionEn}\\nPrice: \${newOrder.price}\\nTechnical Reason & Indicators: \${newOrder.aiReasonEn || "N/A"}\\nBinance Rejection Reason: \${resData.error || "Unknown error"}\`,
              });
            }`,
  `            handleTriggerToast({
              id: Date.now().toString(),
              symbol: newOrder.symbol,
              timestamp: Date.now(),
              isError: true,
              aiExplanationAr: \`❌ فشل تنفيذ الصفقة على منصة بينانس!\\nاتجاه الصفقة: \${directionAr}\\nالسعر: \${newOrder.price}\\nالسبب الفني والمؤشرات: \${newOrder.aiReasonAr || "غير متوفر"}\\nسبب الرفض من بينانس: \${resData.error || "مجهول"}\`,
              aiExplanationEn: \`❌ Binance live trade failed!\\nDirection: \${directionEn}\\nPrice: \${newOrder.price}\\nTechnical Reason & Indicators: \${newOrder.aiReasonEn || "N/A"}\\nBinance Rejection Reason: \${resData.error || "Unknown error"}\`,
            });`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx");
