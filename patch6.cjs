const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  `              handleTriggerToast({
                id: \`scan-autotrade-fail-\${Date.now()}\`,
                symbol: coin.symbol,
                timestamp: Date.now(),
                isError: true,
                aiExplanationAr: \`⚠️ مستكشف التداول: فرصة ذهبية على \${coin.symbol} ولكن رصيدك (\${currentPortfolio.futuresUsdt} USDT) غير كافٍ. الحد الأدنى المطلوب هو \${minimumTradeSize} USDT.اتجاه الصفقة: \${tradeDirectionAr}السبب الفني: \${reasonAr} (RSI: \${bestCandidate.rsi} / Volatility: \${bestCandidate.volatility}%)📊 **الفرصة:** ثقة فائقة بمستوى \${bestCandidate.confidenceScore}%\`,
                aiExplanationEn: \`⚠️ Scanner: Premium signal on \${coin.symbol} but balance (\${currentPortfolio.futuresUsdt} USDT) is insufficient. Minimum required is \${minimumTradeSize} USDT.\\nDirection: \${tradeDirectionEn}\\nTechnical Reason: \${reasonEn} (RSI: \${bestCandidate.rsi} / Volatility: \${bestCandidate.volatility}%)\\n📊 **Confidence Level:** Ultra high \${bestCandidate.confidenceScore}%\`,
              });
            }
            failedCoinsCooldownRef.current[coin.symbol] = Date.now();
            return;`,
  `              // Intentionally omit toast for insufficient balance to prevent spam
            }
            failedCoinsCooldownRef.current[coin.symbol] = Date.now();
            return;`
);

fs.writeFileSync('src/App.tsx', content);
