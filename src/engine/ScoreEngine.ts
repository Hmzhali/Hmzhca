import { EngineInputs } from './types';

export function calculateScore(inputs: EngineInputs): { score: number, reasons: string[], direction: 'BUY' | 'SELL' | 'NEUTRAL', factors: Record<string, number> } {
  let score = 0; // Starts at 0, max 100
  let reasons: string[] = [];
  let factors: Record<string, number> = {};

  const pCurrent = inputs.currentPrice;
  const p15m = (inputs.hist15m || []).map(h => h.price);

  // 1. Trend Analysis (EMA 50 vs EMA 200) - max 15 points
  let currentTrend: 'UP' | 'DOWN' | 'SIDEWAYS' = 'SIDEWAYS';
  if (p15m.length > 50) {
    const ema50 = p15m.slice(-50).reduce((a, b) => a + b, 0) / 50;
    const ema200 = p15m.length > 200 ? p15m.slice(-200).reduce((a, b) => a + b, 0) / 200 : pCurrent;
    
    if (ema50 > ema200 * 1.002) {
      currentTrend = 'UP';
      score += 15;
      factors['trend'] = 15;
      reasons.push("Bullish Trend Confirmed (EMA50 > EMA200)");
    } else if (ema50 < ema200 * 0.998) {
      currentTrend = 'DOWN';
      score -= 15;
      factors['trend'] = -15;
      reasons.push("Bearish Trend Confirmed (EMA50 < EMA200)");
    }
  }

  // 2. Momentum (RSI) - max 10 points
  const rsi = inputs.rsi ?? 50;
  if (rsi < 30) {
    score += 10;
    factors['rsi'] = 10;
    reasons.push(`Oversold (RSI: ${rsi})`);
  } else if (rsi > 70) {
    score -= 10;
    factors['rsi'] = -10;
    reasons.push(`Overbought (RSI: ${rsi})`);
  } else if (rsi > 50 && currentTrend === 'UP') {
    score += 5;
    factors['rsi'] = 5;
    reasons.push(`Healthy Bullish Momentum`);
  } else if (rsi < 50 && currentTrend === 'DOWN') {
    score -= 5;
    factors['rsi'] = -5;
    reasons.push(`Healthy Bearish Momentum`);
  }

  // 3. Volume Analysis - max 15 points
  if (inputs.volume24h > 50000000) {
    const volScore = 15;
    score += currentTrend === 'UP' ? volScore : (currentTrend === 'DOWN' ? -volScore : 0);
    factors['volume'] = volScore;
    reasons.push("High Volume supporting trend");
  }

  // 4. Whale Activity - max 20 points
  const whaleAct = inputs.whaleActivity ?? 50;
  if (whaleAct > 75) {
    score += 20;
    factors['whale'] = 20;
    reasons.push("Heavy Whale Accumulation Detected");
  } else if (whaleAct < 25) {
    score -= 20;
    factors['whale'] = -20;
    reasons.push("Heavy Whale Distribution Detected");
  }

  // 5. AI Sentiment - max 10 points
  const sentiment = inputs.sentimentScore ?? 50;
  if (sentiment > 70) {
    score += 10;
    factors['sentiment'] = 10;
    reasons.push("Positive AI Sentiment & News");
  } else if (sentiment < 30) {
    score -= 10;
    factors['sentiment'] = -10;
    reasons.push("Negative AI Sentiment & News");
  }

  // Direction resolution
  const direction = score > 0 ? 'BUY' : (score < 0 ? 'SELL' : 'NEUTRAL');
  const absoluteScore = Math.min(Math.abs(score), 100);

  // Normalize absoluteScore up to 100 based on max possible (15+10+15+20+10 = 70 base, so map it slightly higher)
  const normalizedScore = Math.min(Math.round((absoluteScore / 70) * 100), 100);

  return {
    score: normalizedScore,
    direction,
    reasons,
    factors
  };
}
