const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  `          aiExplanationEn = \`⚠️ [LIVE NET TIMEOUT] \${binErr.message || binErr}. \${aiExplanationEn}\`;
          aiExplanationAr = \`⚠️ [خطأ اتصال بالشبكة لمراكز بينانس] \${binErr.message || binErr}. \${aiExplanationAr}\`;
        }
      }

      handleTriggerToast({`,
  `          aiExplanationEn = \`⚠️ [LIVE NET TIMEOUT] \${binErr.message || binErr}. \${aiExplanationEn}\`;
          aiExplanationAr = \`⚠️ [خطأ اتصال بالشبكة لمراكز بينانس] \${binErr.message || binErr}. \${aiExplanationAr}\`;
          failedBotsCooldownRef.current[bot.id] = Date.now();
        }
      }

      handleTriggerToast({`
);

fs.writeFileSync('src/App.tsx', content);
