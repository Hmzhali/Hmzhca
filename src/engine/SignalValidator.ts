import { EngineInputs } from './types';

export function validateSignal(inputs: EngineInputs, score: number, direction: string): { passed: boolean, reason: string | null } {
  // Hard filters that reject a trade immediately
  const pCurrent = inputs.currentPrice;
  const p15m = (inputs.hist15m || []).map(h => h.price);

  // 1. Trend Filter (EMA 200) - Removed hard block to increase trade frequency
  /*
  if (p15m.length >= 20) {
    ...
  }
  */

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

  // Must have a minimum score threshold
  if (score < 20) { 
    return { passed: false, reason: `Score too low (${score}/100)` };
  }

  return { passed: true, reason: null };
}
