const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// replace the insufficient balance toast inside watchlist scanner
content = content.replace(
  `                aiExplanationEn: \`⚠️ Scanner: Premium signal on \${coin.symbol} but balance (\${currentPortfolio.futuresUsdt} USDT) is insufficient. Minimum required is \${minimumTradeSize} USDT.Direction: \${tradeDirectionEn}Technical Reason: \${reasonEn} (RSI: \${bestCandidate.rsi} / Volatility: \${bestCandidate.volatility}%)📊 **Confidence Level:** Ultra high \${bestCandidate.confidenceScore}%\`,
              });
            }
            return;
          }`,
  `                aiExplanationEn: \`⚠️ Scanner: Premium signal on \${coin.symbol} but balance (\${currentPortfolio.futuresUsdt} USDT) is insufficient. Minimum required is \${minimumTradeSize} USDT.Direction: \${tradeDirectionEn}Technical Reason: \${reasonEn} (RSI: \${bestCandidate.rsi} / Volatility: \${bestCandidate.volatility}%)📊 **Confidence Level:** Ultra high \${bestCandidate.confidenceScore}%\`,
              });
            }
            failedCoinsCooldownRef.current[coin.symbol] = Date.now();
            return;
          }`
);

fs.writeFileSync('src/App.tsx', content);
