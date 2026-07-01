export interface EngineInputs {
  symbol: string;
  currentPrice: number;
  hist5m: { price: number }[];
  hist15m: { price: number }[];
  volume24h: number;
  change24h: number;
  rsi?: number;
  sentimentScore?: number;
  whaleActivity?: number; // 0 to 100
  btcCorrelation?: number; // -1 to 1
  btcTrend?: 'UP' | 'DOWN' | 'SIDEWAYS';
}

export interface DecisionResult {
  score: number; // 0 to 100
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasons: string[];
  takeProfitRef: number;
  stopLossRef: number;
  riskRewardRatio: number;
  aiCommentaryAr: string;
  aiCommentaryEn: string;
  filtersPassed: {
    trend: boolean;
    volume: boolean;
    momentum: boolean;
    whale: boolean;
    ai: boolean;
    risk: boolean;
  };
}
