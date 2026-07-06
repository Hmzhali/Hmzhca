const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Insert failedBotsCooldownRef
content = content.replace(
  '  const lastScannedTradeTimeRef = useRef<number>(0);\n  const failedCoinsCooldownRef = useRef<Record<string, number>>({});',
  '  const lastScannedTradeTimeRef = useRef<number>(0);\n  const failedCoinsCooldownRef = useRef<Record<string, number>>({});\n  const failedBotsCooldownRef = useRef<Record<string, number>>({});'
);

content = content.replace(
  `      // If the unified engine rejects it or score is too low, bots can't force trades
      if (decision.action === 'HOLD' || decision.score < 70) return; 
      
      let chosenSide: "BUY" | "SELL" = decision.action;
      let aiExplanationEn = \`🤖 [DECISION ENGINE] Score: \${decision.score}%. \${decision.aiCommentaryEn}\`;
      let aiExplanationAr = \`🤖 [محرك القرار] التقييم: \${decision.score}%. \${decision.aiCommentaryAr}\`;`,
  `      // If the unified engine rejects it or score is too low, bots can't force trades
      if (decision.action === 'HOLD' || decision.score < 70) return; 
      
      // Prevent spamming
      const now = Date.now();
      const lastBotFail = failedBotsCooldownRef.current[bot.id] || 0;
      if (now - lastBotFail < 120000) return; // 2 minutes cooldown if bot failed previously
      
      let chosenSide: "BUY" | "SELL" = decision.action;
      const directionAr = chosenSide === "BUY" ? "شراء (ارتفاع 📈)" : "بيع (نزول 📉)";
      let aiExplanationEn = \`🤖 [DECISION ENGINE]\\nDirection: \${chosenSide}\\nReasons: \${decision.reasons.join(', ')}\\nScore: \${decision.score}%. \${decision.aiCommentaryEn}\`;
      let aiExplanationAr = \`🤖 [محرك القرار]\\nاتجاه الصفقة: \${directionAr}\\nالمؤشرات: \${decision.reasons.join(', ')}\\nالتقييم: \${decision.score}%. \${decision.aiCommentaryAr}\`;`
);

content = content.replace(
  `            console.warn(
              \`[Binance Smart AI Outflows] Order failed on Binance network: \${binData.error}\`,
            );
            aiExplanationEn = \`❌ [LIVE REJECTED/NSF] Binance response: \${binData.error || "Check asset liquidity"}. \${aiExplanationEn}\`;
            aiExplanationAr = \`❌ [فشل تداول مباشر / رصيد غير كافٍ] رد منصة بينانس: \${binData.error || "يرجى التحقق من توفر الأرصدة"}. \${aiExplanationAr}\`;
          }
        } catch (binErr: any) {`,
  `            console.warn(
              \`[Binance Smart AI Outflows] Order failed on Binance network: \${binData.error}\`,
            );
            aiExplanationEn = \`❌ [LIVE REJECTED/NSF] Binance response: \${binData.error || "Check asset liquidity"}. \${aiExplanationEn}\`;
            aiExplanationAr = \`❌ [فشل تداول مباشر] رد بينانس: \${binData.error || "مجهول"}. \${aiExplanationAr}\`;
            failedBotsCooldownRef.current[bot.id] = Date.now();
          }
        } catch (binErr: any) {`
);

fs.writeFileSync('src/App.tsx', content);
