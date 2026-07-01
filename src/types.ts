/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MarketPair {
  symbol: string;
  name: string;
  currentPrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  baseAsset: string;
  quoteAsset: string;
  rsi?: number;
  sentimentScore?: number;
}

export interface Candlestick {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type OrderType = 'LIMIT' | 'MARKET' | 'STOP_LIMIT';
export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'PENDING' | 'FILLED' | 'CANCELLED';

export interface TradeOrder {
  id: string;
  symbol: string;
  type: OrderType;
  side: OrderSide;
  price: number;
  amount: number;
  total: number;
  leverage: number;
  timestamp: number;
  status: OrderStatus;
  isLive?: boolean;
  takeProfit?: number;
  stopLoss?: number;
  originType?: 'BOT' | 'MANUAL';
  isQuickBuy?: boolean;
  peakPrice?: number;
  isClosedScalped?: boolean;
  isFutures?: boolean;
}

export type BotType = 'GRID' | 'DCA' | 'RSI';
export type BotStatus = 'RUNNING' | 'PAUSED' | 'COMPLETED';

export interface GridBotConfig {
  lowerPrice: number;
  upperPrice: number;
  gridLines: number;
  investmentAmount: number;
  stopLoss?: number;
  takeProfit?: number;
  trailingStopLoss?: boolean;
  trailingTakeProfit?: boolean;
  sensitivity?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface DcaBotConfig {
  baseOrderSize: number;
  safetyOrderSize: number;
  priceDeviation: number; // e.g. 1.5%
  maxSafetyOrders: number;
  investmentInterval: '1H' | '4H' | '12H' | '1D' | '1W';
  totalInvestment: number;
  trailingStopLoss?: boolean;
  trailingTakeProfit?: boolean;
  sensitivity?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface RsiBotConfig {
  oversoldThreshold: number; // default 30
  overboughtThreshold: number; // default 70
  rsiPeriod: number; // default 14
  tradeAmount: number; // investment per trade
  stopLoss?: number;
  takeProfit?: number;
  trailingStopLoss?: boolean;
  trailingTakeProfit?: boolean;
  sensitivity?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface TradingBot {
  id: string;
  symbol: string;
  type: BotType;
  config: GridBotConfig | DcaBotConfig | RsiBotConfig;
  status: BotStatus;
  createdTime: number;
  accumulatedProfit: number;
  profitPercentage: number;
  arbitrageCount: number; // grids hit
  maxDrawdown?: number; // max drawdown percentage
  isSmartMode?: boolean; // toggle smart AI trading (Gemini)
  reboundFocusEnabled?: boolean; // focus on capturing reversals
  reboundTimeframes?: string[]; // ["15m", "35m", "1h"]
  minTradeAmount?: number; // minimum execution budget per trade (e.g. 0.5 USDT)
  autoRebalance?: boolean; // periodically shift capital allocation to top assets
}

export interface BacktestResult {
  symbol: string;
  botType: BotType;
  startDate: string;
  endDate: string;
  initialInvestment: number;
  finalPortfolioValue: number;
  netProfitPercent: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  buyAndHoldProfitPercent: number; // dynamic buy & hold comparison
  chartData: {
    time: string;
    botValue: number;
    hodlValue: number;
    price: number;
  }[];
}

export interface ApiConnection {
  exchange: 'Binance' | 'Bybit' | 'OKX';
  apiKey: string;
  apiSecret: string;
  ipWhitelisting: boolean;
  withdrawalDisabled: boolean;
  readOnly: boolean;
  tradingEnabled: boolean;
  isConnected: boolean;
  lastTested: number;
  useTestnet?: boolean;
  telegramBotToken?: string;
  telegramChatId?: string;
}

export interface MarketBookEntry {
  price: number;
  amount: number;
  total: number;
  depthPercent: number;
}

export interface OrderBook {
  asks: MarketBookEntry[];
  bids: MarketBookEntry[];
}

export interface ToastNotification {
  id: string;
  botId?: string;
  botType?: BotType; // Make optional to support general market alert types
  symbol: string;
  profit?: number; // Make optional as well
  timestamp: number;
  isMilestone?: boolean;
  milestonePercentage?: number;
  isVolatilityWarning?: boolean;
  volatilityChange?: number;
  volatilityPriceStart?: number;
  volatilityPriceEnd?: number;
  aiExplanationAr?: string;
  aiExplanationEn?: string;
}

export interface SentimentData {
  score: number;
  classification: string;
  classification_ar: string;
  rationale_en: string;
  rationale_ar: string;
  simulated?: boolean;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  type: 'PRICE' | 'RSI';
  value: number;
  condition: 'ABOVE' | 'BELOW';
  isTriggered: boolean;
  createdAt: number;
}

export interface FuturesPosition {
  id: string;
  symbol: string;
  side: "LONG" | "SHORT";
  leverage: number;
  marginType: "ISOLATED" | "CROSS";
  entryPrice: number;
  currentPrice: number;
  amount: number; // Position contracts/size in crypto coin
  margin: number; // Collateral USDT
  liquidationPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  stopLoss?: number;
  takeProfit?: number;
  // Trailing Stop Fields
  trailingStopEnabled?: boolean;
  trailingStopOffset?: number; // e.g. 0.05 for $0.05 retrace
  // Trailing Take-Profit Fields
  trailingTakeProfitEnabled?: boolean;
  trailingTakeProfitOffset?: number; // e.g. 0.02 for 2%
  peakPrice?: number; // Highest price for Long or Lowest price for Short since entry
}
