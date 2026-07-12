const fs = require('fs');
let content = fs.readFileSync('src/components/FuturesTrading.tsx', 'utf8');

content = content.replace(
  '{lang === "ar" ? "وقف الخسارة (SL)" : "Stop Loss"}\\n                      </label>\\n                      <input',
  `{lang === "ar" ? "وقف الخسارة (SL)" : "Stop Loss"}
                      </label>
                      <label className="text-[10px] text-rose-400 font-bold flex items-center gap-1 mb-1 mt-1">
                        <input 
                          type="checkbox"
                          checked={useAiStopLoss}
                          onChange={(e) => setUseAiStopLoss(e.target.checked)}
                          className="accent-rose-500"
                        />
                        {lang === "ar" ? "وقف خسارة ذكي (AI)" : "Smart SL (AI)"}
                      </label>
                      <input`
);

fs.writeFileSync('src/components/FuturesTrading.tsx', content);
console.log("Patched SL UI");
