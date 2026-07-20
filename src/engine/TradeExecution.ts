import { EngineInputs } from './types';

/**
 * Validates a trade entry based on the 200 EMA Trend Filter.
 * - Prevents BUY/LONG positions when price is below the 200 EMA.
 * - Prevents SELL/SHORT positions when price is above the 200 EMA.
 */
export function checkTradeEntry(
  inputs: EngineInputs, 
  direction: 'BUY' | 'SELL' | 'NEUTRAL'
): { passed: boolean; reason: string | null; ema200: number } {
  const pCurrent = inputs.currentPrice;
  const p15m = (inputs.hist15m || []).map(h => h.price);

  // Calculate EMA 200 (or SMA fallback if length < 200)
  const ema200 = p15m.length >= 200 
    ? p15m.slice(-200).reduce((a, b) => a + b, 0) / 200 
    : (p15m.length > 0 ? p15m.reduce((a, b) => a + b, 0) / p15m.length : pCurrent);

  if (direction === 'BUY' && pCurrent < ema200) {
    return { 
      passed: false, 
      reason: `Trend Filter: Cannot BUY/LONG under EMA 200 (Current Price: $${pCurrent.toFixed(4)} < EMA 200: $${ema200.toFixed(4)})`,
      ema200
    };
  }

  if (direction === 'SELL' && pCurrent > ema200) {
    return { 
      passed: false, 
      reason: `Trend Filter: Cannot SELL/SHORT above EMA 200 (Current Price: $${pCurrent.toFixed(4)} > EMA 200: $${ema200.toFixed(4)})`,
      ema200
    };
  }

  return { passed: true, reason: null, ema200 };
}
