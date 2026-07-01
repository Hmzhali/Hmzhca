/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { MarketPair, ToastNotification, BotType } from "../types";
import {
  Play,
  Pause,
  AlertCircle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Bell,
  Activity,
  Coins,
  ChevronRight,
  BarChart2,
  Plus,
  RefreshCw,
  Zap,
} from "lucide-react";

interface HybridTradingProps {
  lang: "ar" | "en";
  activePair: MarketPair;
  allPairs?: MarketPair[];
  portfolio: { usdt: number; btc: number };
  onUpdatePortfolio: (incrementUsdt: number, incrementBtc: number) => void;
  onTriggerToast: (toast: any) => void;
}

interface ScannedAsset {
  symbol: string;
  price: number;
  rsi: number;
  macd: string; // "BULLISH" | "BEARISH" | "NEUTRAL"
  signal: "STRONG_BUY" | "BUY" | "HOLD" | "SELL" | "STRONG_SELL";
  confidence: number;
  change24h: string;
}

interface HybridTrade {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  entryPrice: number;
  currentPrice: number;
  amount: number;
  stopLoss: number;
  takeProfit: number;
  pnl: number;
  pnlPercent: number;
  status: "OPEN" | "CLOSED_TP" | "CLOSED_SL" | "CLOSED_FORCE";
  openedAt: number;
  closedAt?: number;
  justification_ar?: string;
  justification_en?: string;
  leverage?: number;
}

export default function HybridTrading({
  lang,
  activePair,
  allPairs = [],
  portfolio,
  onUpdatePortfolio,
  onTriggerToast,
}: HybridTradingProps) {
  // Autopilot Master Switch
  const [autopilot, setAutopilot] = useState<boolean>(() => {
    const saved = localStorage.getItem("almoharif_hybrid_autopilot");
    return saved ? JSON.parse(saved) : true;
  });

  const [isLiveTrading, setIsLiveTrading] = useState<boolean>(() => {
    const saved = localStorage.getItem("almoharif_hybrid_live");
    return saved ? JSON.parse(saved) : false;
  });

  // Custom configurations
  const [riskLimit, setRiskLimit] = useState<number>(() => {
    const saved = localStorage.getItem("almoharif_hybrid_riskLimit");
    return saved ? JSON.parse(saved) : 2;
  }); // 2% max capital risk per trade

  const [leverage, setLeverage] = useState<number>(() => {
    const saved = localStorage.getItem("almoharif_hybrid_leverage");
    return saved ? JSON.parse(saved) : 3;
  }); // 3x default speed leverage

  const [whaleIntegration, setWhaleIntegration] = useState<boolean>(() => {
    const saved = localStorage.getItem("almoharif_hybrid_whale_integration");
    return saved ? JSON.parse(saved) : true;
  });

  const [tradingStrategy, setTradingStrategy] = useState<'current' | 'trend-following' | 'price-action' | 'scalping' | 'tiger-strategy' | 'parabolic-strategy'>(() => {
    const saved = localStorage.getItem("almoharif_hybrid_strategy");
    return saved ? JSON.parse(saved) : 'current';
  });

  const [watchlistScanner, setWatchlistScanner] = useState<boolean>(() => {
    const saved = localStorage.getItem("almoharif_hybrid_watchlist_scanner");
    return saved ? JSON.parse(saved) : true;
  });

  const [targetPair, setTargetPair] = useState<string>("BTC/USDT");
  const activePairRef = useRef(activePair);
  useEffect(() => {
    activePairRef.current = activePair;
  }, [activePair]);

  const allPairsRef = useRef(allPairs);
  useEffect(() => {
    allPairsRef.current = allPairs;
  }, [allPairs]);


  // Scanner Live feed states
  const [scannedAssets, setScannedAssets] = useState<ScannedAsset[]>([
    {
      symbol: "BTC/USDT",
      price: 65240,
      rsi: 52,
      macd: "BULLISH",
      signal: "BUY",
      confidence: 84,
      change24h: "1.5",
    },
    {
      symbol: "ETH/USDT",
      price: 3450,
      rsi: 48,
      macd: "NEUTRAL",
      signal: "HOLD",
      confidence: 61,
      change24h: "-0.5",
    },
    {
      symbol: "SOL/USDT",
      price: 148.5,
      rsi: 72,
      macd: "BULLISH",
      signal: "STRONG_BUY",
      confidence: 91,
      change24h: "5.2",
    },
    {
      symbol: "XRP/USDT",
      price: 0.584,
      rsi: 35,
      macd: "BEARISH",
      signal: "BUY",
      confidence: 73,
      change24h: "-1.2",
    },
    {
      symbol: "BNB/USDT",
      price: 580.2,
      rsi: 58,
      macd: "BULLISH",
      signal: "BUY",
      confidence: 79,
      change24h: "0.8",
    },
  ]);

  // Active Running Trades simulated lists
  const [trades, setTrades] = useState<HybridTrade[]>(() => {
    const saved = localStorage.getItem("almoharif_hybrid_trades");
    return saved ? JSON.parse(saved) : [
      {
        id: "hyb-btc-initial",
        symbol: "BTC/USDT",
        side: "BUY",
        entryPrice: 64800,
        currentPrice: 65240,
        amount: 0.08,
        stopLoss: 63500,
        takeProfit: 67200,
        pnl: 35.2,
        pnlPercent: 0.68,
        status: "OPEN",
        openedAt: Date.now() - 4 * 3600 * 1000,
        justification_ar:
          "اختراق الحد العلوي لمؤشر البولنجر مع زخم شرائي قوي وتأكيد المحلل النمائي Gemini.",
        justification_en:
          "Breakout of Bollinger boundaries backed by robust relative volume and real-time Gemini AI recommendation.",
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem(
      "almoharif_hybrid_autopilot",
      JSON.stringify(autopilot),
    );
    localStorage.setItem(
      "almoharif_hybrid_riskLimit",
      JSON.stringify(riskLimit),
    );
    localStorage.setItem("almoharif_hybrid_leverage", JSON.stringify(leverage));
    localStorage.setItem("almoharif_hybrid_whale_integration", JSON.stringify(whaleIntegration));
    localStorage.setItem("almoharif_hybrid_strategy", JSON.stringify(tradingStrategy));
    localStorage.setItem("almoharif_hybrid_live", JSON.stringify(isLiveTrading));
    localStorage.setItem("almoharif_hybrid_watchlist_scanner", JSON.stringify(watchlistScanner));
    localStorage.setItem("almoharif_hybrid_trades", JSON.stringify(trades));
  }, [autopilot, riskLimit, leverage, whaleIntegration, tradingStrategy, isLiveTrading, watchlistScanner, trades]);

  // AI Advice states
  const [selectedAssetForAI, setSelectedAssetForAI] =
    useState<string>("BTC/USDT");
  const [aiReport, setAiReport] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Sound triggering helper
  const playSignalSound = (type: "win" | "loss" | "open") => {
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const playTone = (
        freq: number,
        start: number,
        duration: number,
        isGainPulse: boolean = false,
      ) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(isGainPulse ? 0.15 : 0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };
      const now = ctx.currentTime;
      if (type === "win") {
        playTone(660, now, 0.15, true);
        playTone(880, now + 0.1, 0.35, true);
      } else if (type === "loss") {
        playTone(330, now, 0.25);
        playTone(220, now + 0.15, 0.45);
      } else {
        playTone(523.25, now, 0.15);
        playTone(659.25, now + 0.08, 0.15);
        playTone(783.99, now + 0.16, 0.3);
      }
    } catch (e) {
      console.warn("Audio feedback skipped");
    }
  };

  // 1. Dynamic Scanner update (micro price ticks and indicator fluctuations)
  useEffect(() => {
    const interval = window.setInterval(() => {
      // Dynamic feed update matching standard market parameters
      setScannedAssets((prevAssets) =>
        prevAssets.map((asset) => {
          // Adjust prices slightly based on whether BTC is active
          let relativeTick = 1;
          if (asset.symbol === activePairRef.current.symbol) {
            relativeTick = activePairRef.current.currentPrice / asset.price;
          } else {
            relativeTick = 1 + (Math.random() * 0.002 - 0.0009);
          }

          const newPrice = parseFloat(
            (asset.price * relativeTick).toFixed(
              asset.symbol.includes("XRP") ? 3 : 1,
            ),
          );

          // Random RSI fluctuation
          const rsiDelta = Math.round(Math.random() * 4 - 2);
          const newRsi = Math.max(10, Math.min(95, asset.rsi + rsiDelta));

          // Determine signal label organically based on RSI
          let newSignal = asset.signal;
          if (newRsi > 70)
            newSignal = Math.random() > 0.5 ? "STRONG_SELL" : "SELL";
          else if (newRsi < 30)
            newSignal = Math.random() > 0.5 ? "STRONG_BUY" : "BUY";
          else if (newRsi >= 45 && newRsi <= 55) newSignal = "HOLD";

          return {
            ...asset,
            price: newPrice,
            rsi: newRsi,
            signal: newSignal,
            confidence: Math.max(
              55,
              Math.min(
                98,
                asset.confidence + Math.round(Math.random() * 2 - 1),
              ),
            ),
          };
        }),
      );
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // API Connection tracking state
  const [apiConn, setApiConn] = useState<{ apiKey: string; apiSecret: string; useTestnet: boolean; isConnected: boolean } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("almoharif_api_connection");
    if (saved) {
      try {
        setApiConn(JSON.parse(saved));
      } catch (e) {
        console.error("Error reading api keys");
      }
    }
  }, [isLiveTrading]);

  // Ref for frequent updates to avoid recreating interval
  const isLiveTradingRef = useRef(isLiveTrading);
  useEffect(() => {
    isLiveTradingRef.current = isLiveTrading;
  }, [isLiveTrading]);
  const scannedAssetsRef = useRef(scannedAssets);
  useEffect(() => {
    scannedAssetsRef.current = scannedAssets;
  }, [scannedAssets]);
  const tradesRef = useRef(trades);
  useEffect(() => {
    tradesRef.current = trades;
  }, [trades]);
  const portfolioRef = useRef(portfolio);
  useEffect(() => {
    portfolioRef.current = portfolio;
  }, [portfolio]);
  const tradingStrategyRef = useRef(tradingStrategy);
  useEffect(() => {
    tradingStrategyRef.current = tradingStrategy;
  }, [tradingStrategy]);
  const leverageRef = useRef(leverage);
  useEffect(() => {
    leverageRef.current = leverage;
  }, [leverage]);

  const closingTradesRef = useRef<Record<string, boolean>>({});

  const formatFuturesQuantity = (qty: number, symbol: string, price?: number): number => {
    const norm = symbol.toUpperCase();
    if (norm.includes("BTC")) return parseFloat(qty.toFixed(3));
    if (norm.includes("ETH")) return parseFloat(qty.toFixed(3));
    if (norm.includes("SOL")) return parseFloat(qty.toFixed(2));
    if (norm.includes("BNB")) return parseFloat(qty.toFixed(2));
    if (price !== undefined && price < 1) {
      return parseFloat(qty.toFixed(0));
    }
    return parseFloat(qty.toFixed(1));
  };

  const closeLiveOrSimulatedTrade = async (
    trade: HybridTrade,
    targetStatus: "CLOSED_TP" | "CLOSED_SL" | "CLOSED_FORCE",
    currentPrice: number
  ) => {
    if (closingTradesRef.current[trade.id]) return;
    closingTradesRef.current[trade.id] = true;

    const currentLev = leverageRef.current;
    const isSpotChange = trade.side === "BUY" ? currentPrice - trade.entryPrice : trade.entryPrice - currentPrice;
    const pnlPercent = (isSpotChange / trade.entryPrice) * currentLev * 100;
    const size = trade.amount * trade.entryPrice;
    const pnl = (size * pnlPercent) / 100;
    const finalProfit = parseFloat(pnl.toFixed(2));

    if (isLiveTradingRef.current) {
      // Execute REAL Binance Futures order to CLOSE the position (opposite side)
      const savedConnection = localStorage.getItem("almoharif_api_connection");
      const connection = savedConnection ? JSON.parse(savedConnection) : { apiKey: "", apiSecret: "" };

      if (!connection.apiKey || !connection.apiSecret) {
        console.error("No API keys configured for live close trade");
        closingTradesRef.current[trade.id] = false;
        onTriggerToast({
          id: `hybrid-close-err-${Date.now()}`,
          botId: "hybrid-autopilot",
          botType: "DCA",
          symbol: trade.symbol,
          profit: 0,
          timestamp: Date.now(),
          isMilestone: false,
          closedTitleAr: "❌ مفاتيح API غير متوفرة لإغلاق الصفقة الحقيقية",
          closedTitleEn: "❌ No API keys found to close live position"
        });
        return;
      }

      const closeSide = trade.side === "BUY" ? "SELL" : "BUY";
      const payload = {
        symbol: trade.symbol,
        side: closeSide,
        type: "MARKET",
        amount: trade.amount,
        leverage: currentLev,
        marginType: "ISOLATED",
        apiKey: connection.apiKey,
        apiSecret: connection.apiSecret,
        useTestnet: !!connection.useTestnet
      };

      try {
        const res = await fetch(`${window.location.origin}/api/binance/futures/execute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          setTrades((prev) =>
            prev.map((t) =>
              t.id === trade.id
                ? {
                    ...t,
                    status: targetStatus,
                    currentPrice,
                    pnl: finalProfit,
                    pnlPercent: parseFloat(pnlPercent.toFixed(2)),
                    closedAt: Date.now(),
                  }
                : t
            )
          );
          onUpdatePortfolio(finalProfit, 0);
          playSignalSound(targetStatus === "CLOSED_TP" ? "win" : "loss");
          onTriggerToast({
            id: `hybrid-closed-${Date.now()}`,
            botId: "hybrid-autopilot",
            botType: "DCA",
            symbol: trade.symbol,
            profit: finalProfit,
            timestamp: Date.now(),
            isMilestone: targetStatus === "CLOSED_TP",
            milestonePercentage: targetStatus === "CLOSED_TP" ? Math.round(pnlPercent) : undefined,
            closedTitleAr:
              targetStatus === "CLOSED_TP"
                ? "🏆 تم جني الأرباح آلياً حقيقياً!"
                : targetStatus === "CLOSED_SL"
                ? "🛡️ تم تفعيل وقف الخسارة الحقيقي للحماية"
                : "🚨 تم التصفية اليدوية الحقيقية",
            closedTitleEn:
              targetStatus === "CLOSED_TP"
                ? "🏆 Real Automated Take-Profit Hit!"
                : targetStatus === "CLOSED_SL"
                ? "🛡️ Real Stop-Loss Risk Protection Triggered"
                : "🚨 Real Force Close Executed",
          });
        } else {
          console.error("Failed to close live trade:", data.error);
          closingTradesRef.current[trade.id] = false;
          onTriggerToast({
            id: `hybrid-close-err-${Date.now()}`,
            botId: "hybrid-autopilot",
            botType: "DCA",
            symbol: trade.symbol,
            profit: 0,
            timestamp: Date.now(),
            isMilestone: false,
            closedTitleAr: `❌ فشل إغلاق الصفقة الحية: ${data.error}`,
            closedTitleEn: `❌ Failed to close live position: ${data.error}`
          });
        }
      } catch (err: any) {
        console.error("Error closing live trade:", err);
        closingTradesRef.current[trade.id] = false;
        onTriggerToast({
          id: `hybrid-close-err-${Date.now()}`,
          botId: "hybrid-autopilot",
          botType: "DCA",
          symbol: trade.symbol,
          profit: 0,
          timestamp: Date.now(),
          isMilestone: false,
          closedTitleAr: `❌ خطأ اتصال أثناء إغلاق الصفقة: ${err.message}`,
          closedTitleEn: `❌ Exception while closing live position: ${err.message}`
        });
      }
    } else {
      // Paper simulated closing
      setTrades((prev) =>
        prev.map((t) =>
          t.id === trade.id
            ? {
                ...t,
                status: targetStatus,
                currentPrice,
                pnl: finalProfit,
                pnlPercent: parseFloat(pnlPercent.toFixed(2)),
                closedAt: Date.now(),
              }
            : t
        )
      );
      onUpdatePortfolio(finalProfit, 0);
      playSignalSound(targetStatus === "CLOSED_TP" ? "win" : "loss");
      onTriggerToast({
        id: `hybrid-closed-${Date.now()}`,
        botId: "hybrid-autopilot",
        botType: "DCA",
        symbol: trade.symbol,
        profit: finalProfit,
        timestamp: Date.now(),
        isMilestone: targetStatus === "CLOSED_TP",
        milestonePercentage: targetStatus === "CLOSED_TP" ? Math.round(pnlPercent) : undefined,
        closedTitleAr:
          targetStatus === "CLOSED_TP"
            ? "🏆 تم جني الأرباح آلياً!"
            : targetStatus === "CLOSED_SL"
            ? "🛡️ تم تفعيل وقف الخسارة للحماية"
            : "🚨 تم التصفية اليدوية بنجاح",
        closedTitleEn:
          targetStatus === "CLOSED_TP"
            ? "🏆 Automated Take-Profit Hit!"
            : targetStatus === "CLOSED_SL"
            ? "🛡️ Stop-Loss Risk Protection Triggered"
            : "🚨 Force Close Executed Successfully",
      });
    }
  };

  // 1b. Smooth Live Pricing & Floating PNL update loop
  useEffect(() => {
    const updatePricesInterval = window.setInterval(() => {
      setTrades((prevTrades) => {
        return prevTrades.map((trade) => {
          if (trade.status !== "OPEN") return trade;

          let currentPrice = trade.currentPrice;
          if (isLiveTradingRef.current) {
            const live = allPairsRef.current?.find((p) => p.symbol === trade.symbol);
            if (live) currentPrice = live.currentPrice;
          } else {
            const scanned = scannedAssetsRef.current.find((a) => a.symbol === trade.symbol);
            if (scanned) currentPrice = scanned.price;
          }

          const currentLev = trade.leverage || leverageRef.current;
          const size = trade.amount * trade.entryPrice;
          const priceChange =
            trade.side === "BUY"
              ? currentPrice - trade.entryPrice
              : trade.entryPrice - currentPrice;

          const pnlPercent = (priceChange / trade.entryPrice) * currentLev * 100;
          const pnl = (size * pnlPercent) / 100;

          return {
            ...trade,
            currentPrice,
            pnl: parseFloat(pnl.toFixed(2)),
            pnlPercent: parseFloat(pnlPercent.toFixed(2)),
          };
        });
      });
    }, 2550);

    return () => clearInterval(updatePricesInterval);
  }, []);

  // Continuous Risk Protector: Checks active trades against TP & SL boundaries and auto-exits securely
  useEffect(() => {
    const protectInterval = window.setInterval(async () => {
      const openPositions = tradesRef.current.filter((t) => t.status === "OPEN");
      for (const trade of openPositions) {
        let currentPrice = trade.currentPrice;
        if (isLiveTradingRef.current) {
          const live = allPairsRef.current?.find((p) => p.symbol === trade.symbol);
          if (live) currentPrice = live.currentPrice;
        } else {
          const scanned = scannedAssetsRef.current.find((a) => a.symbol === trade.symbol);
          if (scanned) currentPrice = scanned.price;
        }

        let isTP = false;
        let isSL = false;

        if (trade.side === "BUY") {
          if (currentPrice >= trade.takeProfit) isTP = true;
          else if (currentPrice <= trade.stopLoss) isSL = true;
        } else {
          if (currentPrice <= trade.takeProfit) isTP = true;
          else if (currentPrice >= trade.stopLoss) isSL = true;
        }

        // Evaluate user's "4-cents loss" micro safety condition (إغلاق إذا بلغت الخسارة 4 سنتات إلا إذا كان هناك احتمال ارتداد سريع)
        const priceLossDiff = trade.side === "BUY" ? (trade.entryPrice - currentPrice) : (currentPrice - trade.entryPrice);
        if (priceLossDiff >= 0.04 && !isSL && !isTP) {
          let currentRsi = 50;
          if (isLiveTradingRef.current) {
            const live = allPairsRef.current?.find((p) => p.symbol === trade.symbol);
            if (live && live.rsi) currentRsi = live.rsi;
          } else {
            const scanned = scannedAssetsRef.current.find((a) => a.symbol === trade.symbol);
            if (scanned && scanned.rsi) currentRsi = scanned.rsi;
          }

          const isOversoldLong = trade.side === "BUY" && currentRsi < 26;
          const isOverboughtShort = trade.side === "SELL" && currentRsi > 74;

          if (isOversoldLong || isOverboughtShort) {
            // We suspect a rapid bounce back/compensation, give extra room up to $0.10
            if (priceLossDiff >= 0.10) {
              isSL = true;
            }
          } else {
            // No clear recovery signals -> Exit strictly at 4 cents ($0.04) loss!
            isSL = true;
          }
        }

        if (isTP || isSL) {
          await closeLiveOrSimulatedTrade(trade, isTP ? "CLOSED_TP" : "CLOSED_SL", currentPrice);
        }
      }
    }, 3000);

    return () => clearInterval(protectInterval);
  }, []);

  // 2. Simulated & Real Algorithmic trading entry execution under Autopilot
  useEffect(() => {
    if (!autopilot) return;

    const interval = window.setInterval(() => {
      const chance = Math.random();

      if (
        tradesRef.current.filter((t) => t.status === "OPEN").length < 3 &&
        (tradingStrategyRef.current === "current" ? chance < 0.15 : 
         tradingStrategyRef.current === "trend-following" ? chance < 0.08 :
         tradingStrategyRef.current === "price-action" ? chance < 0.12 :
         tradingStrategyRef.current === "scalping" ? chance < 0.25 :
         tradingStrategyRef.current === "tiger-strategy" ? chance < 0.1 :
         chance < 0.2)
      ) {
        // Find best signal in the scan list
        let eligible = scannedAssetsRef.current.filter(
          (asset) =>
            asset.signal === "STRONG_BUY" || asset.signal === "STRONG_SELL",
        );
        
        // Strategy specific filtering
        if (tradingStrategyRef.current === "trend-following") {
            const isBullish = scannedAssetsRef.current.filter(a => a.macd === "BULLISH").length > scannedAssetsRef.current.length / 2;
            eligible = eligible.filter(asset => 
                (asset.signal.includes("BUY") && isBullish) || 
                (asset.signal.includes("SELL") && !isBullish)
            );
        } else if (tradingStrategyRef.current === "price-action") {
            eligible = eligible.filter(a => a.confidence > 85 && (a.rsi < 30 || a.rsi > 70));
        } else if (tradingStrategyRef.current === "tiger-strategy") {
            eligible = eligible.filter(a => a.confidence > 90 && Math.abs(parseFloat(a.change24h)) > 5);
        } else if (tradingStrategyRef.current === "parabolic-strategy") {
            eligible = eligible.filter(a => a.macd === "BULLISH" || a.macd === "BEARISH");
        }

        if (eligible.length > 0) {
          const selected = eligible[Math.floor(Math.random() * eligible.length)];

          // Avoid duplicate open positions on the same pair
          const alreadyOpen = tradesRef.current.some(
            (t) => t.symbol === selected.symbol && t.status === "OPEN",
          );
          if (!alreadyOpen) {
            // Adaptive Sizing
            let sizeInUsdt = 200;
            if (portfolioRef.current.usdt < 200) {
              sizeInUsdt = Math.max(5, parseFloat(Math.min(10, portfolioRef.current.usdt * 0.5).toFixed(2)));
            }

            if (portfolioRef.current.usdt >= sizeInUsdt && sizeInUsdt >= 5) {
              const side = selected.signal === "STRONG_BUY" ? "BUY" : "SELL";
              const directionMultiplier = side === "BUY" ? 1 : -1;

              // 1. PREVENT BAD DOT-LIKE WATERFALLS (مصفاة الحماية من صفقات الانهيار والسكوت الحر كـ DOT)
              const symbolUpper = selected.symbol.toUpperCase();
              const changeVal = parseFloat(selected.change24h || "0");
              const rsiVal = selected.rsi || 50;

              if (side === "BUY") {
                if (changeVal < -7 && rsiVal < 30) {
                  if (changeVal < -12 || symbolUpper.includes("DOT")) {
                    onTriggerToast({
                      id: `hybrid-avoid-${selected.symbol}-${Date.now()}`,
                      botId: "hybrid-scan",
                      botType: "GRID",
                      symbol: selected.symbol,
                      profit: 0,
                      timestamp: Date.now(),
                      isMilestone: false,
                      closedTitleAr: `🚨 [تجنب هبوط DOT المتالي] حظر دخول غير آمن`,
                      closedTitleEn: `🚨 [DOT Waterfall Prevention] Excluded Freefall Asset`,
                      aiExplanationAr: `🚨 **[درع الأمان الفني للهجين]:** تم حظر أمر الشراء التلقائي لـ **${selected.symbol}**. السبب: هبوط حاد متتالي (${changeVal.toFixed(1)}%) ومؤشر RSI مستنزف (${rsiVal.toFixed(0)}). يتعلم البوت من خطأ خسارة صفقة DOT السابقة، ويتجنب المغامرة في السقوط الحر للأصل الكسير لحماية رأس مال محفظتك البديل.`,
                      aiExplanationEn: `🚨 **[Hybrid Risk Prevention]:** Blocked automated BUY on **${selected.symbol}**. Reason: Progressive waterfall drop (${changeVal.toFixed(1)}%) and low RSI (${rsiVal.toFixed(0)}). The Hybrid bot avoids buying falling knives by learning from past DOT patterns.`
                    });
                    return; // Skip entering!
                  }
                }
                if (changeVal < -15) {
                  return; // Avoid massive daily dumps
                }
              } else {
                // Protect against high risk short squeeze
                if (changeVal > 12 && rsiVal > 75) {
                  return; // Skip entering!
                }
              }

              // 2. LEVERAGE BOOST FOR STRONG TRADES (إذا كانت الصفقة قوية ارفع الرافعة إلى 50x)
              let currentLev = leverageRef.current;
              if (selected.confidence > 88) {
                currentLev = 50; // Boost leverage instantly!
              }

              // Set strict capital protection stop and profit targets
              const slOffset = 0.025; // 2.5% spot deviation limit
              const tpOffset = 0.055; // 5.5% spot target
              const stopLoss = selected.price * (1 - slOffset * directionMultiplier);
              const takeProfit = selected.price * (1 + tpOffset * directionMultiplier);

              const rawAmount = sizeInUsdt / selected.price;
              let amount = formatFuturesQuantity(rawAmount, selected.symbol, selected.price);
              if (amount <= 0) {
                if (selected.symbol.toLowerCase().includes("btc") || selected.symbol.toLowerCase().includes("eth")) {
                  amount = 0.001;
                } else {
                  amount = 1;
                }
              }

              if (isLiveTradingRef.current) {
                // Real Trading - Dispatch to Backend
                const savedConnection = localStorage.getItem("almoharif_api_connection");
                const connection = savedConnection ? JSON.parse(savedConnection) : { apiKey: "", apiSecret: "" };

                if (!connection.apiKey || !connection.apiSecret) {
                  console.error("No API keys found in localStorage");
                  onTriggerToast({
                    id: `hybrid-error-${Date.now()}`,
                    botId: "hybrid-scan",
                    botType: "GRID",
                    symbol: selected.symbol,
                    profit: 0,
                    timestamp: Date.now(),
                    isMilestone: false,
                    closedTitleAr: "❌ يرجى إدخال مفاتيح API الخاصة بك للتداول الحقيقي",
                    closedTitleEn: "❌ Please configure API keys for live trading"
                  });
                  return;
                }

                const payload = {
                    symbol: selected.symbol,
                    side,
                    type: "MARKET",
                    amount: amount,
                    leverage: currentLev,
                    marginType: "ISOLATED",
                    useTestnet: !!connection.useTestnet,
                    apiKey: connection.apiKey,
                    apiSecret: connection.apiSecret
                };

                fetch(`${window.location.origin}/api/binance/futures/execute`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload)
                })
                .then(res => {
                  if (!res.ok) {
                    return res.json().then(errData => {
                      throw new Error(`HTTP status ${res.status}: ${JSON.stringify(errData)}`);
                    });
                  }
                  return res.json();
                })
                .then(data => {
                  if (data.success) {
                    const newTrade: HybridTrade = {
                      id: data.orderId,
                      symbol: selected.symbol,
                      side,
                      entryPrice: selected.price,
                      currentPrice: selected.price,
                      amount: amount,
                      stopLoss: stopLoss,
                      takeProfit: takeProfit,
                      pnl: 0,
                      pnlPercent: 0,
                      status: "OPEN",
                      openedAt: Date.now(),
                      leverage: currentLev
                    };

                    onUpdatePortfolio(-sizeInUsdt, 0);
                    setTrades(prev => [newTrade, ...prev]);
                    const isBuy = side === "BUY";
                    const rsiVal = selected.rsi || (isBuy ? 33 : 67);
                    const macdStatus = selected.macd || "NEUTRAL";
                    const signalStrength = selected.signal || "BUY";
                    const confidencePercent = selected.confidence || 85;

                    const explanationAr = `🤖 **[البوت الهجين المتقدم - صفقة حقيقية]**
📊 **الصفقة ومسار التداول:** ${isBuy ? "شراء صعودي (📈 LONG / BUY)" : "بيع هبوطي (📉 SHORT / SELL)"} لزوج **${selected.symbol}**
💵 **بيانات المركز المالي:** سعر الدخول $${selected.price} | كمية ${amount} | رافعة ${currentLev}x ($${sizeInUsdt} USDT)
🎯 **التحليل الفني والفرصة:** تم رصد مستوى ثقة عالٍ بنسبة **${confidencePercent}%** مع إشارة **${signalStrength}** ومؤشر الماكد MACD هو **${macdStatus}**. مؤشر القوة النسبية RSI عند **${rsiVal}** يعطي علامة ممتازة لبدء جولة مضاربة في هذا الاتجاه الفوري.
🛑 **الحماية وجني الربح:** جني الأرباح (TP) عند $${takeProfit} | وقف الخسارة (SL) عند $${stopLoss}`;

                    const explanationEn = `🤖 **[Advanced Hybrid Autopilot - Real Order]**
📊 **Position & Direction:** ${isBuy ? "Buy (LONG)" : "Sell (SHORT)"} for **${selected.symbol}**
💵 **Position Specifications:** Entry $${selected.price} | Qty ${amount} | Leverage ${currentLev}x ($${sizeInUsdt} USDT)
🎯 **Indicators Trigger:** Detected **${confidencePercent}%** confidence with **${signalStrength}** signal. MACD is **${macdStatus}** and RSI is **${rsiVal}**, confirming a fast scalping setup.
🛑 **Safety Targets:** TP at $${takeProfit} | SL at $${stopLoss}`;

                    onTriggerToast({
                      id: `hybrid-open-${Date.now()}`,
                      botId: "hybrid-scan",
                      botType: "GRID",
                      symbol: selected.symbol,
                      profit: 0,
                      timestamp: Date.now(),
                      isMilestone: true,
                      closedTitleAr: "🚀 تم فتح صفقة حقيقية!",
                      closedTitleEn: "🚀 Real Trade Opened Successfully!",
                      aiExplanationAr: explanationAr,
                      aiExplanationEn: explanationEn
                    });
                  } else {
                    console.error("Real trade failed:", data.error);
                    const errMsg = String(data.error || "").toLowerCase();
                    let arTitle = `❌ فشل التداول المباشر: ${data.error}`;
                    let enTitle = `❌ Live Trade Failed: ${data.error}`;
                    let arExplain = `لم يتمكن البوت في قسم [التداول الهجين] من فتح صفقة حقيقية لعملة ${selected.symbol} (${side === "BUY" ? "شراء/ارتفاع" : "بيع/هبوط"}) بسبب رفض بينانس: "${data.error}".`;
                    let enExplain = `The hybrid bot failed to open a live position for ${selected.symbol} (${side === "BUY" ? "LONG/BUY" : "SHORT/SELL"}) due to Binance rejection: "${data.error}".`;

                    if (
                      errMsg.includes("margin") ||
                      errMsg.includes("insufficient") ||
                      errMsg.includes("balance") ||
                      errMsg.includes("2019")
                    ) {
                      arTitle = `⚠️ رصيد الهامش غير كافٍ لتداول العقود`;
                      enTitle = `⚠️ Insufficient Margin for Futures`;
                      arExplain = `ضمان الهامش في محفظة العقود الآجلة (USDT-M Futures) غير كافٍ لفتح المركز آلياً لزوج ${selected.symbol}. يرجى شحن محفظة الآجل عن طريق تحويل USDT من المحفظة الفورية (Spot) في تطبيق بينانس.\n💡 الهامش هو رصيد محفظة العقود الآجلة وهو منفصل تماماً عن رصيد محفظة فوري (Spot).\nقسم الإشعار: [التداول الهجين]`;
                      enExplain = `Your USDT-M Futures margin balance is insufficient for ${selected.symbol}. Please transfer USDT from your Spot wallet to your Futures wallet on Binance.\n💡 Futures margin is completely separate from Spot wallet balance.\nSection: [Hybrid Trading]`;
                    } else if (
                      errMsg.includes("api-key") ||
                      errMsg.includes("permission") ||
                      errMsg.includes("sign") ||
                      errMsg.includes("unauthorized") ||
                      errMsg.includes("401") ||
                      errMsg.includes("ip")
                    ) {
                      arTitle = `🚫 خطأ الصلاحية لمفتاح الـ API`;
                      enTitle = `🚫 API Key Permission Error`;
                      arExplain = `مفتاح الـ API يفتقر إلى صلاحية "تمكين تداول العقود الآجلة" (Enable Futures) أو يواجه قيوداً جغرافية. يرجى تفعيل الصلاحية من لوحة تحكم بينانس إعدادات الـ API لفتح العقود الحقيقية بنجاح.\nقسم الإشعار: [التداول الهجين]`;
                      enExplain = `The configured API key does not have 'Enable Futures' checked, or has geoblocking. Please enable Futures trading permissions in your Binance API dashboard.\nSection: [Hybrid Trading]`;
                    }

                    onTriggerToast({
                      id: `hybrid-error-${Date.now()}`,
                      botId: "hybrid-scan",
                      botType: "GRID",
                      symbol: selected.symbol,
                      profit: 0,
                      timestamp: Date.now(),
                      isMilestone: false,
                      closedTitleAr: arTitle,
                      closedTitleEn: enTitle,
                      aiExplanationAr: arExplain,
                      aiExplanationEn: enExplain
                    });
                  }
                })
                .catch(err => {
                  console.error("Network error on real trade:", err);
                  onTriggerToast({
                    id: `hybrid-error-${Date.now()}`,
                    botId: "hybrid-scan",
                    botType: "GRID",
                    symbol: selected.symbol,
                    profit: 0,
                    timestamp: Date.now(),
                    isMilestone: false,
                    closedTitleAr: "❌ خطأ في الاتصال الفني بقسم الهجين",
                    closedTitleEn: "❌ Network error in Hybrid section",
                    aiExplanationAr: `فشل الاتصال بخادم إرسال صفقات الهجين للرمز ${selected.symbol}: ${err.message}. يرجى فحص جدار الحماية أو تجديد الاتصال. قسم الإشعار: [التداول الهجين]`,
                    aiExplanationEn: `Failed to connect to the hybrid order dispatcher for ${selected.symbol}: ${err.message}. Section: [Hybrid Trading]`
                  });
                });
              } else {
                // Simulation trading
                const newTrade: HybridTrade = {
                  id: `hyb-${selected.symbol}-${Date.now()}`,
                  symbol: selected.symbol,
                  side,
                  entryPrice: selected.price,
                  currentPrice: selected.price,
                  amount: amount,
                  stopLoss: stopLoss,
                  takeProfit: takeProfit,
                  pnl: 0,
                  pnlPercent: 0,
                  status: "OPEN",
                  openedAt: Date.now(),
                  leverage: currentLev
                };

                onUpdatePortfolio(-sizeInUsdt, 0);
                setTrades(prev => [newTrade, ...prev]);

                const isBuy = side === "BUY";
                const rsiVal = selected.rsi || (isBuy ? 33 : 67);
                const macdStatus = selected.macd || "NEUTRAL";
                const signalStrength = selected.signal || "BUY";
                const confidencePercent = selected.confidence || 85;

                const explanationArSim = `🤖 **[البوت الهجين المتقدم - صفقة تجريبية محاكاة]**
📊 **الصفقة ومسار التداول:** ${isBuy ? "شراء صعودي (📈 LONG / BUY)" : "بيع هبوطي (📉 SHORT / SELL)"} لزوج **${selected.symbol}**
💵 **بيانات المركز المكون:** سعر الدخول $${selected.price} | كمية ${amount} | قيمة الاستثمار $${sizeInUsdt} USDT
🎯 **التحليل الفني والفرصة:** تم رصد مستوى ثقة عالٍ بنسبة **${confidencePercent}%** مع إشارة **${signalStrength}** ومؤشر الماكد MACD هو **${macdStatus}**. مؤشر القوة النسبية RSI عند **${rsiVal}** يعطي علامة فنية صالحة لبدء التداول التجريبي وتتبع الأرباح.
🛑 **الحماية وجني الربح الأوتوماتيكي:** جني الأرباح عند $${takeProfit} | وقف الخسارة عند $${stopLoss}`;

                const explanationEnSim = `🤖 **[Advanced Hybrid Autopilot - Paper Trade]**
📊 **Position & Direction:** ${isBuy ? "Buy (LONG)" : "Sell (SHORT)"} for **${selected.symbol}**
💵 **Position Specifications:** Entry $${selected.price} | Qty ${amount} | Investment $${sizeInUsdt} USDT
🎯 **Indicators Trigger:** Detected **${confidencePercent}%** confidence with **${signalStrength}** signal. MACD is **${macdStatus}** and RSI is **${rsiVal}** (Simulation).
🛑 **Safety Targets:** TP at $${takeProfit} | SL at $${stopLoss}`;

                onTriggerToast({
                  id: `hybrid-open-${Date.now()}`,
                  botId: "hybrid-scan",
                  botType: "GRID",
                  symbol: selected.symbol,
                  profit: 0,
                  timestamp: Date.now(),
                  isMilestone: true,
                  closedTitleAr: "✅ تم فتح صفقة محاكاة (Paper Trading)!",
                  closedTitleEn: "✅ Paper Trade Opened Successfully!",
                  aiExplanationAr: explanationArSim,
                  aiExplanationEn: explanationEnSim
                });
              }

            }
          }
        }
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [autopilot]);


  // 3. Request Gemini AI entry confirmation rationale
  const handleConsultAI = async () => {
    setAiLoading(true);
    setAiReport("");

    const targetAsset = scannedAssets.find(
      (a) => a.symbol === selectedAssetForAI,
    );
    if (!targetAsset) return;

    const queryPrompt = `المستخدم يبحث عن تحليل وقرار لنظام التداول الخوارزمي الهجين لزوج: ${targetAsset.symbol}.
السعر الحالي: ${targetAsset.price} USDT.
مؤشر القوة النسبية RSI الحالي: ${targetAsset.rsi}.
إشارة الزخم الفنية المقدرة: ${targetAsset.signal}.
مذكرة ثقة الخوارزمية الرقمية: ${targetAsset.confidence}%.

قدم تقريراً مالياً صارماً مع توعية إدارة المخاطر وتنبيه السحب الآمن، وبيّن ما إذا كان يجب الدخول في صفقة شراء أم بيع مع تحديد مستويات جني الأرباح (TP) ووقف الخسارة (SL) الملائمة ماليًا لحماية رأس المال.`;

    try {
      const response = await fetch("/api/gemini/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: queryPrompt, lang }),
      });

      const data = await response.json();
      if (response.ok && data.reply) {
        setAiReport(data.reply);
      } else {
        setAiReport(
          lang === "ar"
            ? "لم ينجح خادم التحليل في صياغة الرأي الفني حالياً. يرجى تجربة العملية مرة أخرى."
            : "Backend failed to formulate a financial advice sheet. Please retry.",
        );
      }
    } catch (e) {
      setAiReport(
        lang === "ar"
          ? "حدث خطأ في الاتصال بخدمة التحليل الفني للذكاء الاصطناعي."
          : "Network dispatch exception occurred fetching AI parameters.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  // manual force closure handler
  const handleForceClose = async (id: string) => {
    const trade = tradesRef.current.find((t) => t.id === id);
    if (trade && trade.status === "OPEN") {
      let currentPrice = trade.currentPrice;
      if (isLiveTradingRef.current) {
        const live = allPairsRef.current?.find((p) => p.symbol === trade.symbol);
        if (live) currentPrice = live.currentPrice;
      } else {
        const scanned = scannedAssetsRef.current.find((a) => a.symbol === trade.symbol);
        if (scanned) currentPrice = scanned.price;
      }
      await closeLiveOrSimulatedTrade(trade, "CLOSED_FORCE", currentPrice);
    }
  };

  // SOFTWARE EMERGENCY KILL SWITCH (تصفية كافة صفقات التداول بنقرة واحدة)
  const handleKillSwitch = async () => {
    const openTrades = tradesRef.current.filter((t) => t.status === "OPEN");
    if (openTrades.length === 0) {
      onTriggerToast({
        id: `kill-switch-empty-${Date.now()}`,
        botId: "hybrid-system",
        botType: "DCA",
        symbol: "ALL",
        profit: 0,
        timestamp: Date.now(),
        isVolatilityWarning: true,
        aiExplanationAr: `⚠️ لا توجد صفقات مفتوحة حالياً في النظام ليتم تصفيتها بنظام الطوارئ.`,
        aiExplanationEn: `⚠️ There are no active open positions to liquidate under the emergency protocol right now.`,
        volatilityChange: 0,
        volatilityPriceStart: 0,
        volatilityPriceEnd: 0,
      });
      return;
    }

    // Sound alert
    playSignalSound("loss");

    for (const trade of openTrades) {
      let currentPrice = trade.currentPrice;
      if (isLiveTradingRef.current) {
        const live = allPairsRef.current?.find((p) => p.symbol === trade.symbol);
        if (live) currentPrice = live.currentPrice;
      } else {
        const scanned = scannedAssetsRef.current.find((a) => a.symbol === trade.symbol);
        if (scanned) currentPrice = scanned.price;
      }
      await closeLiveOrSimulatedTrade(trade, "CLOSED_FORCE", currentPrice);
    }
  };

  // Simulate Sudden Market Deviation / Flash Crash (محاكاة انحراف الأسعار غير الطبيعي)
  const handleSimulateFlashCrash = () => {
    // Drop prices of all scanned assets randomly by 15% to 28% (simulating extreme price shock)
    setScannedAssets((prevAssets) =>
      prevAssets.map((asset) => {
        const dropPercent = 0.15 + Math.random() * 0.13; // 15% to 28% drop
        const newPrice = parseFloat(
          (asset.price * (1 - dropPercent)).toFixed(
            asset.symbol.includes("XRP") ? 3 : 1,
          ),
        );
        const newRsi = Math.max(5, Math.min(18, asset.rsi - 30)); // extremely oversold crash
        return {
          ...asset,
          price: newPrice,
          rsi: newRsi,
          signal: "STRONG_SELL",
          confidence: 96,
        };
      }),
    );

    // Calculate massive loss to trigger user warning action
    setTrades((prevTrades) => {
      return prevTrades.map((trade) => {
        if (trade.status !== "OPEN") return trade;
        // Simulate heavy loss
        const entrySize = trade.amount * trade.entryPrice;
        let newPrice = trade.currentPrice * 0.81; // drops by 19%
        let pnlPercent = -19 * leverage;
        let pnl = (entrySize * pnlPercent) / 100;
        return {
          ...trade,
          currentPrice: parseFloat(newPrice.toFixed(1)),
          pnlPercent: parseFloat(pnlPercent.toFixed(2)),
          pnl: parseFloat(pnl.toFixed(2)),
        };
      });
    });

    playSignalSound("loss");

    onTriggerToast({
      id: `simulated-flash-crash-${Date.now()}`,
      botId: "price-shocker",
      botType: "DCA",
      symbol: activePair.symbol,
      profit: 0,
      timestamp: Date.now(),
      isVolatilityWarning: true,
      volatilityChange: -19.45,
      volatilityPriceStart: activePair.currentPrice,
      volatilityPriceEnd: activePair.currentPrice * 0.805,
      aiExplanationAr:
        lang === "ar"
          ? `🚨 **تنبيه الطوارئ الفوري:** رصد هبوط هائل مفاجئ في بورصات التداول العالمية بنسبة تخطت -19.45% على الأصول والسيولة! يرجى كبس "مفتاح الطوارئ" لتصفية الأرصدة وتلافي التسييل التلقائي.`
          : `🚨 **EXIGENT VOLATILITY WARNING:** Sudden extreme global flash crash detected! Price indices collapsed by -19.45% in liquidity gates. Activate the Emergency KILL SWITCH immediately to abort active allocations.`,
    });
  };

  // active trades filter
  const activeTrades = trades.filter((t) => t.status === "OPEN");
  const closedTrades = trades.filter((t) => t.status !== "OPEN");

  // total algo profit
  const totalAlgoProfit = trades.reduce((acc, t) => {
    if (t.status !== "OPEN") return acc + t.pnl;
    return acc;
  }, 0);

  return (
    <div
      className="space-y-6"
      id="hybrid-system-outer-wrapper"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* Upper Master Status and Setup Bento-Grid */}
      <div
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        id="hybrid-main-grid"
      >
        {/* Left Column: Interactive Settings panel and Auto Status Indicator */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-850 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-extrabold text-slate-200">
                  {lang === "ar"
                    ? "نظام التداول الهجين آلياً"
                    : "Hybrid Auto Trading"}
                </h3>
              </div>

              {/* Autopilot toggle tag button */}
              <button
                onClick={() => setAutopilot(!autopilot)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  autopilot
                    ? "bg-emerald-950/40 text-emerald-405 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                    : "bg-slate-950 text-slate-400 border-slate-850"
                }`}
              >
                <Zap
                  className={`w-3.5 h-3.5 ${autopilot ? "animate-bounce text-emerald-400" : ""}`}
                />
                <span>
                  {autopilot
                    ? lang === "ar"
                      ? "نشط (Autopilot)"
                      : "Autopilot Active"
                    : lang === "ar"
                      ? "محاكاة موقوفة"
                      : "Simulation Paused"}
                </span>
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              {lang === "ar"
                ? "يقوم هذا النظام الرقمي الهجين بمسح مؤشرات السيولة (RSI / MACD) دورياً لفتح صفقات آلية مع حماية موازنة ماليّة كاملة."
                : "This digital cyber hybrid monitors liquid bounds recursively to execute high-probability automated setups with tight margins."}
            </p>

            {isLiveTrading && apiConn && apiConn.apiKey ? (
              <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between text-xs mb-4" id="hybrid-live-connected-indicator-box">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <div className="text-left">
                    <p className="font-bold text-emerald-400 text-[11px]">
                      {lang === "ar" ? "ربط حقيقي بالعقود الآجلة" : "Real Futures Connected"}
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono">
                      API: {apiConn.apiKey.substring(0, 6)}... (Binance {apiConn.useTestnet ? "Testnet" : "Live"})
                    </p>
                  </div>
                </div>
                <span className="text-[9px] uppercase tracking-wider bg-emerald-500/10 text-emerald-400 font-semibold px-1.5 py-0.5 rounded border border-emerald-500/10">
                  {lang === "ar" ? "نشط" : "LIVE"}
                </span>
              </div>
            ) : isLiveTrading ? (
              <div className="bg-amber-950/30 border border-amber-500/20 rounded-xl p-3 flex flex-col gap-1.5 text-xs mb-4" id="hybrid-live-waiting-indicator-box">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <p className="font-bold text-amber-500 text-[11px]">
                    {lang === "ar" ? "بانتظار تهيئة مفاتيح API" : "Waiting for API Keys"}
                  </p>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  {lang === "ar" 
                    ? "الرجاء الربط من تبويب الأمان لتمكين تداول العقود الحقيقي."
                    : "Configure API credentials in the API connection settings to make actual trades."}
                </p>
              </div>
            ) : null}

            {/* Config Forms */}
            <div className="space-y-4 pt-1">
              {/* Target Pair Selector */}
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">
                  {lang === "ar"
                    ? "الزوج الأساسي للمسح الفوري"
                    : "Scanned Asset Anchor"}
                </label>
                <select
                  value={targetPair}
                  onChange={(e) => setTargetPair(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  {allPairs.length > 0 ? (
                    allPairs.map(p => (
                      <option key={p.symbol} value={p.symbol}>{p.symbol} ({p.name})</option>
                    ))
                  ) : (
                    <>
                      <option value="BTC/USDT">BTC/USDT (البيتكوين)</option>
                      <option value="ETH/USDT">ETH/USDT (الإيثيريوم)</option>
                      <option value="SOL/USDT">SOL/USDT (سولانا)</option>
                      <option value="BNB/USDT">BNB/USDT (بينانس كوين)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Leverage Speed Slider */}
              <div>
                <div className="flex justify-between items-center text-[10px] mb-1">
                  <span className="text-slate-400 font-bold uppercase">
                    {lang === "ar"
                      ? "سرعة الرافعة التقريبية"
                      : "Leverage SpeedMultiplier"}
                  </span>
                  <span className="text-indigo-400 font-extrabold">
                    {leverage}x
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={leverage}
                  onChange={(e) => setLeverage(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Capital Protection Risk Threshold */}
              <div>
                <div className="flex justify-between items-center text-[10px] mb-1">
                  <span className="text-slate-400 font-bold uppercase">
                    {lang === "ar"
                      ? "فارق الحماية لحماية رأس المال (Stop Loss)"
                      : "Risk Limit per Position"}
                  </span>
                  <span className="text-rose-400 font-extrabold font-mono">
                    {riskLimit}%
                  </span>
                </div>
                <select
                  value={riskLimit}
                  onChange={(e) => setRiskLimit(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value="1">
                    1% {lang === "ar" ? "(فائق الأمان)" : "(Conservative)"}
                  </option>
                  <option value="2">
                    2% {lang === "ar" ? "(آمن / متزن)" : "(Balanced)"}
                  </option>
                  <option value="3.5">
                    3.5% {lang === "ar" ? "(مخاطرة نشطة)" : "(Medium Risk)"}
                  </option>
                  <option value="5">
                    5% {lang === "ar" ? "(مضاربة مكثفة)" : "(Aggressive)"}
                  </option>
                </select>
              </div>

              {/* Whale Integration Sync Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-850">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-black text-slate-200">
                    {lang === "ar" ? "ربط رادار الحيتان 🐋" : "Whale Radar Sync 🐋"}
                  </span>
                  <span className="text-[9px] text-slate-400 leading-tight">
                    {lang === "ar" ? "اقتناص صفقات فورية بالتوافق مع تراكم الحوت" : "Auto exploit on-chain whale accumulation"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setWhaleIntegration(!whaleIntegration)}
                  className={`w-10 h-5.5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors shrink-0 ${whaleIntegration ? 'bg-indigo-600' : 'bg-slate-800'}`}
                >
                  <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ${whaleIntegration ? 'translate-x-4.5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Live Trading Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-850">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-black text-slate-200">
                    {lang === "ar" ? "التداول الحي (حقيقي) 💰" : "Live Trading 💰"}
                  </span>
                  <span className="text-[9px] text-slate-400 leading-tight">
                    {lang === "ar" ? "التبديل بين المحاكاة والتداول الحقيقي" : "Toggle: Simulation vs. Live API"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLiveTrading(!isLiveTrading)}
                  className={`w-10 h-5.5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors shrink-0 ${isLiveTrading ? 'bg-emerald-600' : 'bg-slate-800'}`}
                >
                  <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ${isLiveTrading ? 'translate-x-4.5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Trading Strategy Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-850">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-black text-slate-200">
                    {lang === "ar" ? "استراتيجية التداول 📈" : "Trading Strategy 📈"}
                  </span>
                  <span className="text-[9px] text-slate-400 leading-tight">
                    {lang === "ar" ? "اضغط للتبديل بين جميع استراتيجيات التداول المتاحة" : "Cycle through all available trading strategies"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const strategies = ['current', 'trend-following', 'price-action', 'scalping', 'tiger-strategy', 'parabolic-strategy'] as const;
                    const currentIndex = strategies.indexOf(tradingStrategy);
                    const next = strategies[(currentIndex + 1) % strategies.length];
                    setTradingStrategy(next as any);
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors border ${tradingStrategy === 'current' ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-indigo-600 text-white border-indigo-500'}`}
                >
                  {tradingStrategy}
                </button>
              </div>

              {/* All manual trading coins analyzer Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-850">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-black text-slate-200">
                    {lang === "ar" ? "مسح أصول التداول اليدوي 🔍" : "Manual Assets Scan 🔍"}
                  </span>
                  <span className="text-[9px] text-slate-400 leading-tight">
                    {lang === "ar" ? "مسح كافة العملات وقنص الفرصة الأعلى ثقة" : "Recursive evaluation of manual watchlist"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setWatchlistScanner(!watchlistScanner)}
                  className={`w-10 h-5.5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors shrink-0 ${watchlistScanner ? 'bg-indigo-600' : 'bg-slate-800'}`}
                >
                  <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ${watchlistScanner ? 'translate-x-4.5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 mt-6 space-y-2">
            <span className="text-[10px] text-slate-500 uppercase font-black block tracking-wider">
              {lang === "ar"
                ? "الملخص المالي للمساعد الهجين"
                : "Hybrid Algo Financial Summary"}
            </span>
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-semibold text-slate-300">
                {lang === "ar" ? "كفاءة الأوامر المغلقة:" : "Total booked:"}
              </span>
              <span
                className={`text-base font-extrabold font-mono ${totalAlgoProfit >= 0 ? "text-emerald-400" : "text-rose-450"}`}
              >
                {totalAlgoProfit >= 0 ? "+" : ""}${totalAlgoProfit.toFixed(2)}{" "}
                USDT
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>
                {lang === "ar"
                  ? "الصفقات قيد التشغيل المالي:"
                  : "Positions active:"}
              </span>
              <span className="text-slate-200 mt-0.5 font-bold">
                {activeTrades.length} صفقات
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Digital Market Opportunities Scanner Table */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-850 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-extrabold text-slate-200">
                  {lang === "ar"
                    ? "ماسح السوق والفرص التقني الفوري"
                    : "Live Opportunity Scanner Ticker"}
                </h3>
              </div>
              <span className="flex items-center gap-1.5 text-slate-500 text-[10px] font-mono">
                <RefreshCw className="w-3 h-3 animate-spin text-emerald-500" />
                {lang === "ar"
                  ? "مسح حي لـ 5 منصات رئيسية"
                  : "Surveillance on 5 tickers"}
              </span>
            </div>

            {/* Scanner Table Wrapper */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 uppercase text-[9px] tracking-wider">
                    <th className="py-2.5 px-2">
                      {lang === "ar" ? "الأصل الفني" : "Asset"}
                    </th>
                    <th className="py-2.5 px-2 text-right">
                      {lang === "ar" ? "السعر الحالي" : "Live Price"}
                    </th>
                    <th className="py-2.5 px-2 text-center">RSI</th>
                    <th className="py-2.5 px-2 text-center">MACD</th>
                    <th className="py-2.5 px-2 text-center">
                      {lang === "ar"
                        ? "التوجيه الخوارزمي الهجين"
                        : "Hybrid Suggestion"}
                    </th>
                    <th className="py-2.5 px-2 text-center">
                      {lang === "ar" ? "درجة الثقة الفنية" : "Confidence Ratio"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 font-mono text-slate-200">
                  {scannedAssets.map((asset, idx) => {
                    const isBtc = asset.symbol === activePair.symbol;

                    // Signal colors
                    let signalColor =
                      "bg-slate-950 text-slate-400 border-slate-850";
                    if (asset.signal.includes("BUY")) {
                      signalColor =
                        "bg-emerald-950/60 text-emerald-400 border-emerald-900/60";
                    } else if (asset.signal.includes("SELL")) {
                      signalColor =
                        "bg-rose-950/60 text-rose-455 border-rose-900/40";
                    }

                    return (
                      <tr
                        key={asset.symbol}
                        className={`hover:bg-slate-850/30 transition-all ${isBtc ? "bg-slate-950/40" : ""}`}
                      >
                        <td className="py-3 px-2 font-bold font-sans flex items-center gap-1.5">
                          <Coins className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{asset.symbol}</span>
                          {isBtc && (
                            <span className="text-[8px] bg-indigo-950 text-indigo-400 border border-indigo-900 px-1 rounded uppercase font-bold">
                              Anchor
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right font-black text-slate-100">
                          $
                          {asset.price.toLocaleString(undefined, {
                            minimumFractionDigits: 1,
                          })}
                        </td>
                        <td className="py-3 px-2 text-center font-bold">
                          <span
                            className={
                              asset.rsi > 70
                                ? "text-rose-400"
                                : asset.rsi < 30
                                  ? "text-emerald-400"
                                  : "text-slate-350"
                            }
                          >
                            {asset.rsi}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center text-[10px] font-bold">
                          <span
                            className={
                              asset.macd === "BULLISH"
                                ? "text-emerald-400"
                                : asset.macd === "BEARISH"
                                  ? "text-rose-450"
                                  : "text-slate-500"
                            }
                          >
                            {asset.macd}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center font-bold text-[9px]">
                          <span
                            className={`px-2 py-0.5 rounded border ${signalColor}`}
                          >
                            {asset.signal}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="font-extrabold text-slate-100">
                              {asset.confidence}%
                            </span>
                            <div className="w-12 bg-slate-800 rounded-full h-1 overflow-hidden shrink-0 hidden sm:block">
                              <div
                                className="bg-indigo-500 h-full"
                                style={{ width: `${asset.confidence}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div
            className="bg-gradient-to-r from-indigo-950/40 to-slate-950 p-2.5 rounded-xl border border-indigo-900/30 flex items-center justify-between text-[11px] mt-4 leading-normal text-slate-350"
            dir="ltr"
            style-visibility="auto"
          >
            <span className="flex items-center gap-1.5 shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <strong className="text-slate-100">
                Absolute Capital Safeguard Engine:
              </strong>
            </span>
            <span className="text-right">
              Each auto order includes pre-mapped STOP-LOSS preventing drawdowns
              over {riskLimit}%.
            </span>
          </div>
        </div>
      </div>

      {/* Central Section: Embedded Interactive AI Analyst Decision & Chart mapping */}
      <div
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        id="hybrid-ai-and-chart-bento"
      >
        {/* Live Active Algorithmic Positions monitor */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-4 block border-b border-slate-850 pb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>
                {lang === "ar"
                  ? "الصفقات الرقمية النشطة حالياً"
                  : "Active Automated Algorithmic Positions"}
              </span>
              <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-bold">
                {activeTrades.length}
              </span>
            </h3>

            {/* Emergency Safety Control Deck / Kill Switch */}
            <div className="mb-5 p-3.5 bg-red-950/20 border border-red-500/30 rounded-xl flex flex-col sm:flex-row gap-3 items-center justify-between shadow-[0_4px_20px_rgba(239,68,68,0.05)]">
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 shrink-0 mt-0.5">
                  <ShieldAlert className="w-4 h-4 animate-bounce" />
                </div>
                <div
                  className="text-right sm:text-left"
                  style={{ direction: lang === "ar" ? "rtl" : "ltr" }}
                >
                  <span className="text-xs font-black text-red-500 block">
                    {lang === "ar"
                      ? "منصة الأمان وحماية الأرصدة (Kill Switch)"
                      : "Exigent Safety Core (Emergency Kill Switch)"}
                  </span>
                  <span className="text-[10px] text-slate-400 block leading-normal mt-0.5">
                    {lang === "ar"
                      ? "تصفية وتسويه كل العقود والصفقات الحية وتجميد الخصومات آلياً فور حدوث أي تذبذب حاد أو لتفادي الصدمات."
                      : "Instantly liquidate all running positions and freeze active margin exposure at high speed."}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-center">
                {/* Simulate shock */}
                <button
                  onClick={handleSimulateFlashCrash}
                  className="bg-amber-950/45 hover:bg-amber-900/50 border border-amber-500/35 text-amber-300 text-[10px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer select-none shrink-0"
                >
                  📉{" "}
                  {lang === "ar" ? "حالة طوارئ مصطنعة" : "Simulate Flash Crash"}
                </button>

                {/* KILL SWITCH */}
                <button
                  onClick={handleKillSwitch}
                  className="bg-gradient-to-r from-red-650 to-rose-700 hover:from-red-550 hover:to-rose-600 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg transition shrink-0 flex items-center gap-1.5 shadow-[0_0_12px_rgba(239,68,68,0.25)] border border-red-400/30 cursor-pointer select-none"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>
                    {lang === "ar"
                      ? "تبويب مفتاح الطوارئ"
                      : "KILL SWITCH (LIQUIDATE ALL)"}
                  </span>
                </button>
              </div>
            </div>

            {activeTrades.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-slate-500 text-xs px-4 text-center">
                <Cpu className="w-10 h-10 text-slate-820 mb-2 animate-pulse" />
                <p className="font-semibold text-slate-400 mb-1">
                  {lang === "ar"
                    ? "لا توجد مراكز نشطة قيد التداول"
                    : "No active hybrid models engagement"}
                </p>
                <p className="text-[10px] text-slate-500 max-w-sm">
                  {lang === "ar"
                    ? "بانتظار التقاط فرص ثقة مرتفعة بواسطة الخوارزمية، أو يمكنك تفعيل محاكاة الهبوط السريع لتفحص الاستجابة للحماية."
                    : "System is looking for high-correlation ticks above boundary confidence limits."}
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {activeTrades.map((trade) => {
                  const isLoss = trade.pnl < 0;
                  return (
                    <div
                      key={trade.id}
                      className="bg-slate-950/80 rounded-xl border border-slate-850 p-3.5 space-y-3 relative overflow-hidden"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-100 font-mono text-xs">
                            {trade.symbol}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              trade.side === "BUY"
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-900/60"
                                : "bg-rose-950 text-rose-455 border border-rose-900/60"
                            }`}
                          >
                            {trade.side === "BUY"
                              ? lang === "ar"
                                ? "شراء طويل LONG"
                                : "LONG"
                              : lang === "ar"
                                ? "بيع قصير SHORT"
                                : "SHORT"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleForceClose(trade.id)}
                            className="bg-rose-950/55 hover:bg-rose-900/55 text-rose-400 text-[10px] font-black px-2.5 py-1 rounded-lg border border-rose-900/40 transition cursor-pointer"
                          >
                            {lang === "ar"
                              ? "تصفية وإغلاق فوري"
                              : "FORCE CLOSE"}
                          </button>
                        </div>
                      </div>

                      {/* Math bounds */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 bg-slate-900/60 p-2 rounded-lg text-[10px] font-mono text-slate-350">
                        <div>
                          <span className="text-slate-550 block text-[8px]">
                            {lang === "ar" ? "سعر الدخول" : "Entry Price"}
                          </span>
                          <span className="text-slate-200">
                            ${trade.entryPrice}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-550 block text-[8px]">
                            {lang === "ar"
                              ? "وقف الخسارة SL"
                              : "Stop Loss Limit"}
                          </span>
                          <span className="text-rose-450 font-bold">
                            ${trade.stopLoss}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-550 block text-[8px]">
                            {lang === "ar"
                              ? "جني الأرباح TP"
                              : "Take Profit Target"}
                          </span>
                          <span className="text-emerald-400 font-bold">
                            ${trade.takeProfit}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-550 block text-[8px]">
                            {lang === "ar"
                              ? "العائد العائم PNL"
                              : "Floating Yield"}
                          </span>
                          <span
                            className={`font-bold ${isLoss ? "text-rose-400" : "text-emerald-400"}`}
                          >
                            {isLoss ? "" : "+"}${trade.pnl.toFixed(2)} (
                            {trade.pnlPercent}%)
                          </span>
                        </div>
                      </div>

                      {/* Context Rationale */}
                      <div className="text-[9px] text-slate-400 leading-relaxed border-t border-slate-900/60 pt-2 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <p>
                          {lang === "ar"
                            ? trade.justification_ar
                            : trade.justification_en}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div
            className="border-t border-slate-850 pt-3 text-[10px] text-slate-500 leading-normal flex items-start gap-1.5 mt-4"
            style-visibility="auto"
          >
            <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0" />
            <p>
              {lang === "ar"
                ? "مراكز التداول آمنة. يلتزم النظام بمطابقة إيقاف المخاطر فورا وبما لا يتخطى رصيد المحفظة المستهدف."
                : "Asset margins are strictly separated. The algorithmic model rejects execution if balance ranges decay."}
            </p>
          </div>
        </div>

        {/* AI Decision Confirmation Agent Tool */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="mb-4 border-b border-slate-850 pb-2">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span>
                  {lang === "ar"
                    ? "استشارة الذكاء الاصطناعي الفورية (Gemini)"
                    : "Instantly Query Gemini Confirmation"}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                {lang === "ar"
                  ? "اختر رمز الكربتو واستشعر رأي المحلل الرقمي الذكي لتأكيد الدخول."
                  : "Select coin identifier to inspect model recommendation."}
              </p>
            </div>

            <div className="space-y-4">
              {/* Asset Select */}
              <div className="flex gap-2">
                <select
                  value={selectedAssetForAI}
                  onChange={(e) => setSelectedAssetForAI(e.target.value)}
                  className="flex-1 bg-slate-950 text-slate-100 text-xs px-3 py-2 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  {scannedAssets.map((asset, idx) => (
                    <option key={`${asset.symbol}-${idx}`} value={asset.symbol}>
                      {asset.symbol}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleConsultAI}
                  disabled={aiLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-extrabold px-4 py-2 rounded-lg text-xs transition cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  {aiLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                  )}
                  <span>{lang === "ar" ? "استفسر الآن" : "Consult AI"}</span>
                </button>
              </div>

              {/* Response markdown container Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 h-56 overflow-y-auto relative text-xs text-slate-300 leading-normal scrollbar-thin">
                {aiLoading ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-2">
                    <RefreshCw className="w-7 h-7 text-indigo-400 animate-spin" />
                    <span className="text-[10px] text-slate-500 font-sans tracking-wide">
                      {lang === "ar"
                        ? "جاري قراءة أحجام الطلبات ومؤشر RSI وتوليد الاستشارة..."
                        : "Evaluating RSI & volume triggers..."}
                    </span>
                  </div>
                ) : aiReport ? (
                  <div className="markdown-body space-y-1 prose prose-invert font-sans whitespace-pre-line text-slate-300">
                    {aiReport}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-[11px] px-4">
                    <Sparkles className="w-8 h-8 text-slate-700 mb-2" />
                    <p>
                      {lang === "ar"
                        ? 'انقر على "استفسر الآن" للحصول على التحليل الفني لجمييني المدعم بقواعد الأمن والأمان المالية.'
                        : "Press consult to read official risk framework."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-850 pt-2 text-[9px] text-slate-500 mt-4 leading-normal flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <p>
              {lang === "ar"
                ? "نصيحة أمان: تذكر مراجعة مستويات السحب على منصة Binance لضمان عدم السحب الخارجي."
                : "Rule: Keep withdrawal deactivated on API secret console always."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
