export function evaluateRisk(
  price: number,
  direction: 'BUY' | 'SELL',
  volatility: number = 2 // standard 2%
): { passed: boolean, tp: number, sl: number, rr: number } {
  
  // Widen stop loss significantly to prevent early exit due to normal market fluctuations
  const slRisk = Math.max(volatility * 2.5, 3.0); // Minimum 3.0% SL
  const tpTarget = slRisk * 2; // Target 2x SL risk for Take Profit
  
  let stopLossRef = price;
  let takeProfitRef = price;
  let rr = 0;

  if (direction === 'BUY') {
    stopLossRef = price * (1 - (slRisk / 100)); 
    takeProfitRef = price * (1 + (tpTarget / 100)); // TP = 2 * SL risk
    rr = ((takeProfitRef - price) / price) / ((price - stopLossRef) / price);
  } else {
    stopLossRef = price * (1 + (slRisk / 100));
    takeProfitRef = price * (1 - (tpTarget / 100));
    rr = ((price - takeProfitRef) / price) / ((stopLossRef - price) / price);
  }

  // Target RR is 2.0 minimum
  const passed = rr >= 1.5;

  return {
    passed,
    tp: takeProfitRef,
    sl: stopLossRef,
    rr
  };
}
