const fs = require('fs');
let content = fs.readFileSync('src/components/FuturesTrading.tsx', 'utf8');

const calcBlock = `  const calculateSmartSL = React.useCallback(async () => {
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
  }, [useAiStopLoss, calculateSmartSL]);`;

content = content.replace(calcBlock, '');

content = content.replace(
  `  const [limitPrice, setLimitPrice] = useState<string>(
    activePair.currentPrice.toString(),
  );`,
  `  const [limitPrice, setLimitPrice] = useState<string>(
    activePair.currentPrice.toString(),
  );

${calcBlock}`
);

fs.writeFileSync('src/components/FuturesTrading.tsx', content);
console.log("Patched FuturesTrading.tsx");
