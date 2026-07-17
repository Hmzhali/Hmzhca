import { EngineInputs } from './types';

export function calculateScore(inputs: EngineInputs): { score: number, reasons: string[], direction: 'BUY' | 'SELL' | 'NEUTRAL', factors: Record<string, number> } {
  let score = 0; // Starts at 0, max 100
  let reasons: string[] = [];
  let factors: Record<string, number> = {};

  const pCurrent = inputs.currentPrice;
  const p15m = (inputs.hist15m || []).map(h => h.price);

  // 1. Trend Analysis (EMA 50 vs EMA 200 or 24h Change fallback) - max 15 points
  let currentTrend: 'UP' | 'DOWN' | 'SIDEWAYS' = 'SIDEWAYS';
  
  if (p15m.length > 50) {
    const ema50 = p15m.slice(-50).reduce((a, b) => a + b, 0) / 50;
    const ema200 = p15m.length > 200 ? p15m.slice(-200).reduce((a, b) => a + b, 0) / 200 : pCurrent;
    
    if (ema50 > ema200 * 1.001) {
      currentTrend = 'UP';
      score += 15;
      factors['trend'] = 15;
      reasons.push("Bullish Trend Confirmed (EMA50 > EMA200)");
    } else if (ema50 < ema200 * 0.999) {
      currentTrend = 'DOWN';
      score -= 15;
      factors['trend'] = -15;
      reasons.push("Bearish Trend Confirmed (EMA50 < EMA200)");
    }
  } else {
    // Fallback to 24h change if not enough history
    if (inputs.change24h > 2) {
      currentTrend = 'UP';
      score += 15;
      factors['trend'] = 15;
      reasons.push("Bullish Trend (24h Change > 2%)");
    } else if (inputs.change24h < -2) {
      currentTrend = 'DOWN';
      score -= 15;
      factors['trend'] = -15;
      reasons.push("Bearish Trend (24h Change < -2%)");
    } else if (inputs.change24h > 0.5) {
      currentTrend = 'UP';
      score += 10;
      factors['trend'] = 10;
      reasons.push("Mild Bullish Trend (24h Change > 0.5%)");
    } else if (inputs.change24h < -0.5) {
      currentTrend = 'DOWN';
      score -= 10;
      factors['trend'] = -10;
      reasons.push("Mild Bearish Trend (24h Change < -0.5%)");
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
  if (inputs.volume24h > 5000000) { // Lowered to 5M
    const volScore = 15;
    score += currentTrend === 'UP' ? volScore : (currentTrend === 'DOWN' ? -volScore : 0);
    factors['volume'] = volScore;
    reasons.push("High Volume supporting trend");
  } else if (inputs.volume24h > 1000000) { // 1M
    const volScore = 10;
    score += currentTrend === 'UP' ? volScore : (currentTrend === 'DOWN' ? -volScore : 0);
    factors['volume'] = volScore;
    reasons.push("Moderate Volume supporting trend");
  }

  // 4. Whale Activity - max 20 points
  const whaleAct = inputs.whaleActivity ?? 50;
  if (whaleAct > 65) {
    score += 20;
    factors['whale'] = 20;
    reasons.push("Whale Accumulation Detected");
  } else if (whaleAct < 35) {
    score -= 20;
    factors['whale'] = -20;
    reasons.push("Whale Distribution Detected");
  }

  // 5. AI Sentiment - max 10 points
  const sentiment = inputs.sentimentScore ?? 50;
  if (sentiment > 60) {
    score += 10;
    factors['sentiment'] = 10;
    reasons.push("Positive AI Sentiment & News");
  } else if (sentiment < 40) {
    score -= 10;
    factors['sentiment'] = -10;
    reasons.push("Negative AI Sentiment & News");
  }

  // 6. Retrace/Rebound Detection ("الارتداد")
  // If price is significantly down (Retrace) but RSI is oversold, it's a "Bullish Rebound" opportunity
  if (inputs.change24h < -1 && rsi < 45) {
    const reboundBonus = 20;
    score += reboundBonus;
    factors['rebound'] = reboundBonus;
    reasons.push(`Bullish Rebound Detected (Drop: ${inputs.change24h}%, RSI: ${rsi})`);
  }
  // If price is significantly up but RSI is overbought, it's a "Bearish Retrace" opportunity (Short)
  else if (inputs.change24h > 1 && rsi > 55) {
    const retraceBonus = 20;
    score -= retraceBonus;
    factors['retrace'] = -retraceBonus;
    reasons.push(`Bearish Retrace Detected (Pump: ${inputs.change24h}%, RSI: ${rsi})`);
  }

  // Add extra weight for momentum to favor quick scalps safely
  if (rsi < 45 && currentTrend !== 'DOWN') score += 15;
  if (rsi > 55 && currentTrend !== 'UP') score -= 15;

  // Direction resolution
  const direction = score > 0 ? 'BUY' : (score < 0 ? 'SELL' : 'NEUTRAL');
  let absoluteScore = Math.min(Math.abs(score), 100);
  
  // Guarantee super high confidence if we have extreme oversold/overbought and whale alignment
  if (direction === 'BUY' && rsi < 45 && whaleAct > 55) absoluteScore = Math.max(absoluteScore, 85);
  if (direction === 'SELL' && rsi > 55 && whaleAct < 45) absoluteScore = Math.max(absoluteScore, 85);

  // Boost absolute score inherently to ensure the bot opens more trades when active
  absoluteScore += 20;

  // Normalize absoluteScore up to 100 based on max possible (lowered divisor to boost scores)
  const normalizedScore = Math.min(Math.round((absoluteScore / 50) * 100), 100);

  return {
    score: normalizedScore,
    direction,
    reasons,
    factors
  };
}
