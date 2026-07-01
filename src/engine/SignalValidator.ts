import { EngineInputs } from './types';

export function validateSignal(inputs: EngineInputs, score: number): { passed: boolean, reason: string | null } {
  // Hard filters that reject a trade immediately

  if (inputs.volume24h < 1000000) {
    return { passed: false, reason: "Insufficient Liquidity/Volume" };
  }

  // E.g., No trades if change is absurd (flash crash)
  if (Math.abs(inputs.change24h) > 50) {
    return { passed: false, reason: "Extreme Volatility (Flash move detected)" };
  }

  // Must have a minimum score threshold to even consider
  if (score < 70) {
    return { passed: false, reason: `Score too low (${score}/100)` };
  }

  return { passed: true, reason: null };
}
