const fs = require('fs');
let content = fs.readFileSync('src/components/FuturesTrading.tsx', 'utf8');

// 1. Add state for useAiStopLoss
content = content.replace(
  'const [stopLoss, setStopLoss] = useState<string>("");',
  `const [stopLoss, setStopLoss] = useState<string>("");
  const [useAiStopLoss, setUseAiStopLoss] = useState<boolean>(false);
  
  const priceRef = React.useRef(activePair.currentPrice);
  React.useEffect(() => { priceRef.current = activePair.currentPrice; }, [activePair.currentPrice]);

  const calculateSmartSL = React.useCallback(async () => {
    try {
      const klineResp = await fetch(\`/api/gateway/klines?symbol=\${encodeURIComponent(activePair.symbol)}&interval=1h&limit=20\`);
      const klines = await klineResp.json();
      
      const response = await fetch('/api/ai/calculate-smart-sl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: activePair.symbol,
          side: positionSide === 'LONG' ? 'BUY' : 'SELL',
          entryPrice: parseFloat(limitPrice) || priceRef.current,
          currentPrice: priceRef.current,
          klines: klines
        })
      });
      const data = await response.json();
      if (data.slPrice) {
        setStopLoss(data.slPrice.toFixed(2));
      }
    } catch (error) {
      console.error("Smart SL calculation failed", error);
    }
  }, [activePair.symbol, positionSide, limitPrice]);

  React.useEffect(() => {
    if (useAiStopLoss) {
      calculateSmartSL();
    }
  }, [useAiStopLoss, calculateSmartSL]);`
);

// 2. Add the checkbox UI above SL input
const slLabel = '{lang === "ar" ? "وقف الخسارة (SL)" : "Stop Loss"}';
content = content.replace(
  '{lang === "ar" ? "وقف الخسارة (SL)" : "Stop Loss"}\\n                      </label>',
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
                      </label>`
);

fs.writeFileSync('src/components/FuturesTrading.tsx', content);
console.log("Patched FuturesTrading.tsx");
