const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace whale catch
content = content.replace(
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
    }`,
  `} catch (err: any) {
      console.warn("Failed to dispatch automated whale-triggered futures trade:", err.message || err);
      failedCoinsCooldownRef.current[signal.symbol] = Date.now() + 300000; // 5 min cooldown for this coin
      const msg = err.message || err.toString();
      if (Date.now() - (window.lastApiErrorToastTime || 0) > 60000) { // Global 60s cooldown for API errors
        window.lastApiErrorToastTime = Date.now();
        handleTriggerToast({
          id: \`whale-err-\${Date.now()}\`,
          symbol: signal.symbol,
          timestamp: Date.now(),
          isError: true,
          aiExplanationAr: \`❌ فشل تنفيذ صفقة الحيتان التلقائية!\\nالسبب: \${msg}\\nيرجى التحقق من توفر رصيد كاف ومفاتيح API صالحة.\`,
          aiExplanationEn: \`❌ Failed to execute automated whale trade!\\nReason: \${msg}\\nPlease verify API keys and balance.\`,
        });
      }
    }`
);

// Replace scanner catch
content = content.replace(
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
        }`,
  `} catch (err: any) {
          console.warn("Watchlist scanner auto order failed:", err.message || err);
          failedCoinsCooldownRef.current[coin.symbol] = Date.now() + 300000; // 5 min cooldown for this coin
          const msg = err.message || err.toString();
          if (Date.now() - (window.lastApiErrorToastTime || 0) > 60000) {
            window.lastApiErrorToastTime = Date.now();
            handleTriggerToast({
              id: \`scan-err-\${Date.now()}\`,
              symbol: coin.symbol,
              timestamp: Date.now(),
              isError: true,
              aiExplanationAr: \`❌ فشل إطلاق صفقة ارتداد تلقائية!\\nالسبب: \${msg}\\nيرجى التأكد من ربط حساب بينانس وتوفر رصيد كاف.\`,
              aiExplanationEn: \`❌ Failed to execute auto-rebound trade!\\nReason: \${msg}\\nPlease verify your Binance API connection and balance.\`,
            });
          }
        }`
);

// Replace AI engine catch
content = content.replace(
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
        }`,
  `} catch (er: any) {
          console.warn("AI Engine order fail:", er.message);
          failedCoinsCooldownRef.current[coin.symbol] = Date.now() + 300000; // 5 min cooldown for this coin
          const msg = er.message || er.toString();
          if (Date.now() - (window.lastApiErrorToastTime || 0) > 60000) {
            window.lastApiErrorToastTime = Date.now();
            handleTriggerToast({
              id: \`ai-err-\${Date.now()}\`,
              symbol: coin.symbol,
              timestamp: Date.now(),
              isError: true,
              aiExplanationAr: \`❌ فشل تنفيذ صفقة الذكاء الاصطناعي!\\nالسبب: \${msg}\\nقم بمراجعة الرصيد والمفاتيح.\`,
              aiExplanationEn: \`❌ Failed to execute AI engine trade!\\nReason: \${msg}\\nCheck balance and API keys.\`,
            });
          }
        }`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched catch blocks");
