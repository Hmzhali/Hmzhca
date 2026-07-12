const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  `            if (newOrder.originType === "BOT") {
              throw new Error(\`Binance order rejected: \${resData.error || "Unknown error"}\`);
            } else {
              alert(
                lang === "ar"
                  ? \`❌ رفضت بينانس تنفيذ الصفقة.\\n\\nالسبب: \${resData.error || "عطل مجهول"}.\\n\\nملاحظة هامة: لتنفيذ الصفقات حقيقياً يجب التأكد من توفر رصيد كافٍ لتغطية قيمة الصفقة المحددة حسب شروط المنصة، ويجب إدخال مفتاح API صحيح تماماً.\\n\\nتم حفظ الصفقة الآن كمحاكاة تجريبية.\`
                  : \`❌ Binance order rejected: \${resData.error || "Unknown error"}.\\nNote: Spot orders must meet the exchange's minimum notional value and API keys must have Spot Trading Enabled.\\nLogged as paper-demo instead.\`
              );
            }`,
  `            if (newOrder.originType !== "BOT") {
              alert(
                lang === "ar"
                  ? \`❌ رفضت بينانس تنفيذ الصفقة.\\n\\nالسبب: \${resData.error || "عطل مجهول"}.\\n\\nملاحظة هامة: لتنفيذ الصفقات حقيقياً يجب التأكد من توفر رصيد كافٍ لتغطية قيمة الصفقة المحددة حسب شروط المنصة، ويجب إدخال مفتاح API صحيح تماماً.\\n\\nتم حفظ الصفقة الآن كمحاكاة تجريبية.\`
                  : \`❌ Binance order rejected: \${resData.error || "Unknown error"}.\\nNote: Spot orders must meet the exchange's minimum notional value and API keys must have Spot Trading Enabled.\\nLogged as paper-demo instead.\`
              );
            }
            throw new Error(\`Binance order rejected: \${resData.error || "Unknown error"}\`);`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched throw");
