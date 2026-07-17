import { EngineInputs, DecisionResult } from './types';
import { calculateScore } from './ScoreEngine';
import { evaluateRisk } from './RiskManager';
import { validateSignal } from './SignalValidator';

export function evaluateTradeDecision(inputs: EngineInputs): DecisionResult {
  const { score, reasons, direction, factors } = calculateScore(inputs);
  
  // 1. Initial Validation
  const validation = validateSignal(inputs, score);
  if (!validation.passed) {
    reasons.push(validation.reason || "Validation Failed");
    return generateRejectResponse(inputs, reasons, score, direction);
  }

  if (direction === 'NEUTRAL') {
    reasons.push("Market conditions are neutral.");
    return generateRejectResponse(inputs, reasons, score, direction);
  }

  // 2. Risk Management
  // Assume a default volatility estimate based on 24h change, capped between 1% and 5%
  const estimatedVolatility = Math.max(1, Math.min(Math.abs(inputs.change24h) / 4 || 2, 5));
  const risk = evaluateRisk(inputs.currentPrice, direction, estimatedVolatility);

  if (!risk.passed) {
    reasons.push(`Risk/Reward ratio too low (${risk.rr.toFixed(2)}). Rejected by Risk Manager.`);
    return generateRejectResponse(inputs, reasons, score, direction);
  }

  // 3. Score Thresholds
  let aiAr = "";
  let aiEn = "";

  if (score >= 95) {
    aiAr = `🚀 شراء قوي جدًا (Score: ${score}). التوافق الفني والسيولة ممتازة.`;
    aiEn = `🚀 STRONG BUY (Score: ${score}). Perfect alignment of Technicals and Liquidity.`;
  } else if (score >= 85) {
    aiAr = `📈 إشارة شراء (Score: ${score}). السوق يظهر زخمًا إيجابيًا.`;
    aiEn = `📈 BUY SIGNAL (Score: ${score}). Market showing positive momentum.`;
  } else if (score >= 70) {
    aiAr = `👀 مراقبة (Score: ${score}). إشارات إيجابية لكن تحتاج لتأكيد.`;
    aiEn = `👀 WATCH (Score: ${score}). Positive signs but needs confirmation.`;
  } else {
    aiAr = `⚡ إشارة سريعة (Score: ${score}). فرصة دخول مبنية على تذبذب السوق الحالي.`;
    aiEn = `⚡ SCALP SIGNAL (Score: ${score}). Quick entry based on current market volatility.`;
  }

  if (direction === 'SELL') {
    aiAr = aiAr.replace('شراء', 'بيع').replace('BUY', 'SELL');
    aiEn = aiEn.replace('BUY', 'SELL');
  }

  return {
    score,
    action: direction,
    confidence: score,
    reasons,
    takeProfitRef: risk.tp,
    stopLossRef: risk.sl,
    riskRewardRatio: risk.rr,
    aiCommentaryAr: aiAr,
    aiCommentaryEn: aiEn,
    filtersPassed: {
      trend: factors['trend'] !== undefined,
      volume: factors['volume'] !== undefined,
      momentum: factors['rsi'] !== undefined,
      whale: factors['whale'] !== undefined,
      ai: factors['sentiment'] !== undefined,
      risk: true
    }
  };
}

function generateRejectResponse(inputs: EngineInputs, reasons: string[], score: number, direction: string): DecisionResult {
  return {
    score,
    action: 'HOLD',
    confidence: score,
    reasons,
    takeProfitRef: inputs.currentPrice,
    stopLossRef: inputs.currentPrice,
    riskRewardRatio: 0,
    aiCommentaryAr: "مرفوضة من محرك القرار الذكي. الشروط لم تتحقق.",
    aiCommentaryEn: "Rejected by Smart Decision Engine. Conditions not met.",
    filtersPassed: {
      trend: false,
      volume: false,
      momentum: false,
      whale: false,
      ai: false,
      risk: false
    }
  };
}
