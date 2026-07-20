import { EngineInputs } from './types';
import { checkTradeEntry } from './TradeExecution';

export function validateSignal(inputs: EngineInputs, score: number, direction: string): { passed: boolean, reason: string | null } {
  // Hard filters that reject a trade immediately
  const pCurrent = inputs.currentPrice;
  const p15m = (inputs.hist15m || []).map(h => h.price);

  // 1. Trend Filter (EMA 200) - Enforced via checkTradeEntry to prevent trading against the trend
  if (direction === 'BUY' || direction === 'SELL') {
    const trendCheck = checkTradeEntry(inputs, direction as 'BUY' | 'SELL');
    if (!trendCheck.passed) {
      return { passed: false, reason: trendCheck.reason };
    }
  }

  // 1.5 Volatility Filter
  if (p15m.length >= 20) {
    const last20 = p15m.slice(-20);
    const mean = last20.reduce((a, b) => a + b, 0) / 20;
    const stdDev = Math.sqrt(last20.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / 20);
    const upperBand = mean + (2 * stdDev);
    const lowerBand = mean - (2 * stdDev);
    const bandwidth = ((upperBand - lowerBand) / mean) * 100;

    if (bandwidth < 0.05) { // Even lower threshold
      return { passed: false, reason: `Volatility Filter: Market too sideways` };
    }
  }

  if (inputs.volume24h < 10) { 
    return { passed: false, reason: "Insufficient Liquidity/Volume" };
  }

  // 2. Strict Score Threshold for very strong signals (تطاريد الصفقات لا تفتح إلا بإشارة قوية جداً)
  // Raise threshold from 20 to 85 to ensure we only execute the absolute best trades
  if (score < 85) { 
    return { passed: false, reason: `Score too low (${score}/100). Requires a very strong signal (>= 85)` };
  }

  // 3. Strong Momentum & Overbought/Oversold Filter (زخم قوي وتشبع بيعي أو شرائي قوية)
  const rsi = inputs.rsi ?? 50;
  if (direction === 'BUY') {
    const isOversold = rsi <= 38;
    const isStrongMomentum = rsi >= 55;
    if (!isOversold && !isStrongMomentum) {
      return { 
        passed: false, 
        reason: `Momentum Filter: No extreme oversold (RSI: ${rsi.toFixed(1)} > 38) and no strong upward momentum (RSI < 55)` 
      };
    }
  } else if (direction === 'SELL') {
    const isOverbought = rsi >= 62;
    const isStrongMomentum = rsi <= 45;
    if (!isOverbought && !isStrongMomentum) {
      return { 
        passed: false, 
        reason: `Momentum Filter: No extreme overbought (RSI: ${rsi.toFixed(1)} < 62) and no strong downward momentum (RSI > 45)` 
      };
    }
  }

  // 4. Candlestick Reversal Confirmation (بداية ارتداد والشموع تمام)
  if (p15m.length >= 2) {
    const lastClosedPrice = p15m[p15m.length - 1];
    if (direction === 'BUY' && pCurrent <= lastClosedPrice) {
      return { 
        passed: false, 
        reason: `Candle Filter: Waiting for price to show upward rebound/reversal (Current Price $${pCurrent.toFixed(4)} <= Last 15m Price $${lastClosedPrice.toFixed(4)})` 
      };
    }
    if (direction === 'SELL' && pCurrent >= lastClosedPrice) {
      return { 
        passed: false, 
        reason: `Candle Filter: Waiting for price to show downward retrace/reversal (Current Price $${pCurrent.toFixed(4)} >= Last 15m Price $${lastClosedPrice.toFixed(4)})` 
      };
    }
  }

  // 5. Whale Radar Filter (رادار الحيتان)
  const whaleAct = inputs.whaleActivity ?? 50;
  if (direction === 'BUY' && whaleAct < 55) {
    return { 
      passed: false, 
      reason: `Whale Radar: Weak accumulation activity (${whaleAct}% < 55%)` 
    };
  }
  if (direction === 'SELL' && whaleAct > 45) {
    return { 
      passed: false, 
      reason: `Whale Radar: Weak distribution activity (${whaleAct}% > 45%)` 
    };
  }

  return { passed: true, reason: null };
}
