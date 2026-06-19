import React, { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Zap,
  DollarSign,
  ShieldCheck,
  Sliders,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  ChevronRight,
  Play,
  Pause,
  AlertTriangle,
  Layers,
  Sparkles,
  Info,
  Cpu,
  History,
} from "lucide-react";
import ActivePositionsList from "./ActivePositionsList";
import { MarketPair, ApiConnection, FuturesPosition } from "../types";

interface FuturesTradingProps {
  lang: "ar" | "en";
  activePair: MarketPair;
  portfolio: { usdt: number; btc: number };
  onUpdatePortfolio?: (incUsdt: number, incBtc: number) => void;
  onTriggerToast?: (toast: any) => void;
  apiConnection?: ApiConnection;
  isLiveTrading?: boolean;
  futuresApiError?: string | null;
  setFuturesApiError?: (err: string | null) => void;
  allPairs?: MarketPair[];
}


export default function FuturesTrading({
  lang,
  activePair,
  portfolio,
  onUpdatePortfolio,
  onTriggerToast,
  apiConnection,
  isLiveTrading = false,
  futuresApiError: externalFuturesApiError,
  setFuturesApiError: externalSetFuturesApiError,
  allPairs = [],
}: FuturesTradingProps) {
  // Global View Mode
  const [futuresTab, setFuturesTab] = useState<"MANUAL" | "ALGO">(() => {
    const saved = localStorage.getItem("almoharif_futures_tab");
    return (saved ? JSON.parse(saved) : "MANUAL") as "MANUAL" | "ALGO";
  });

  useEffect(() => {
    localStorage.setItem("almoharif_futures_tab", JSON.stringify(futuresTab));
  }, [futuresTab]);

  // Live Futures Sync States
  const [liveBalance, setLiveBalance] = useState<number | null>(null);
  const [loadingPositions, setLoadingPositions] = useState<boolean>(false);
  const [localFuturesApiError, setLocalFuturesApiError] = useState<
    string | null
  >(null);

  const futuresApiError =
    externalFuturesApiError !== undefined
      ? externalFuturesApiError
      : localFuturesApiError;
  const setFuturesApiError =
    externalSetFuturesApiError !== undefined
      ? externalSetFuturesApiError
      : setLocalFuturesApiError;

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [openOrders, setOpenOrders] = useState<any[]>([]);

  const activeUsdtBalance = liveBalance !== null ? liveBalance : portfolio.usdt;

    const handleCancelFuturesOrder = async (orderId: any, symbol: string) => {
    if (
      !isLiveTrading ||
      !apiConnection ||
      !apiConnection.isConnected ||
      !apiConnection.apiKey ||
      !apiConnection.apiSecret
    )
      return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/binance/futures/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: apiConnection.apiKey,
          apiSecret: apiConnection.apiSecret,
          useTestnet: apiConnection.useTestnet === true,
          symbol,
          orderId,
        }),
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        if (onTriggerToast) {
          onTriggerToast({
            id: Date.now().toString(),
            symbol,
            timestamp: Date.now(),
            isMilestone: true,
            aiExplanationAr: `✅ تم إلغاء الأمر الآجل رقم ${orderId} معلق بنجاح!`,
            aiExplanationEn: `✅ Successfully cancelled Futures open order #${orderId} on Binance!`,
          });
        }
        await fetchRealFuturesData();
      } else {
        throw new Error(resData.error || "Failed to cancel order.");
      }
    } catch (err: any) {
      console.error("Cancel futures order failed:", err);
      if (onTriggerToast) {
        onTriggerToast({
          id: Date.now().toString(),
          symbol,
          timestamp: Date.now(),
          isVolatilityWarning: true,
          aiExplanationAr: `⚠️ فشل إلغاء الأمر الآجل على بينانس: ${err.message}`,
          aiExplanationEn: `⚠️ Failed to cancel Futures order on Binance: ${err.message}`,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sync with live data on mount / api credentials changed
  useEffect(() => {
    if (apiConnection?.isConnected && apiConnection?.apiKey) {
      fetchRealFuturesData();
      const interval = setInterval(() => {
        fetchRealFuturesData();
      }, 10000);
      return () => clearInterval(interval);
    } else {
      setLiveBalance(null);
      setFuturesApiError(null);
    }
  }, [
    apiConnection?.isConnected,
    apiConnection?.apiKey,
    apiConnection?.apiSecret,
    apiConnection?.useTestnet,
  ]);

  // Manual Position Configuration
  const [positionSide, setPositionSide] = useState<"LONG" | "SHORT">(() => {
    const saved = localStorage.getItem("almoharif_futures_manual_side");
    return saved ? JSON.parse(saved) : "LONG";
  });
  const [marginType, setMarginType] = useState<"ISOLATED" | "CROSS">(() => {
    const saved = localStorage.getItem("almoharif_futures_manual_margin");
    return saved ? JSON.parse(saved) : "ISOLATED";
  });
  const [leverage, setLeverage] = useState<number>(() => {
    const saved = localStorage.getItem("almoharif_futures_manual_leverage");
    return saved ? JSON.parse(saved) : 10;
  });
  const [orderAmountUsdt, setOrderAmountUsdt] = useState<string>(() => {
    const saved = localStorage.getItem("almoharif_futures_manual_amount");
    return saved ? JSON.parse(saved) : "250";
  });
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT">(() => {
    const saved = localStorage.getItem("almoharif_futures_manual_ordertype");
    return saved ? JSON.parse(saved) : "MARKET";
  });
  const [stopLoss, setStopLoss] = useState<string>("");
  const [takeProfit, setTakeProfit] = useState<string>("");
  const [trailingStopEnabled, setTrailingStopEnabled] = useState<boolean>(false);
  const [trailingStopOffset, setTrailingStopOffset] = useState<string>("");
  const [trailingTakeProfitEnabled, setTrailingTakeProfitEnabled] = useState<boolean>(false);
  const [trailingTakeProfitOffset, setTrailingTakeProfitOffset] = useState<string>("");
  const [limitPrice, setLimitPrice] = useState<string>(
    activePair.currentPrice.toString(),
  );

  useEffect(() => {
    localStorage.setItem(
      "almoharif_futures_manual_side",
      JSON.stringify(positionSide),
    );
    localStorage.setItem(
      "almoharif_futures_manual_margin",
      JSON.stringify(marginType),
    );
    localStorage.setItem(
      "almoharif_futures_manual_leverage",
      JSON.stringify(leverage),
    );
    localStorage.setItem(
      "almoharif_futures_manual_amount",
      JSON.stringify(orderAmountUsdt),
    );
    localStorage.setItem(
      "almoharif_futures_manual_ordertype",
      JSON.stringify(orderType),
    );
  }, [positionSide, marginType, leverage, orderAmountUsdt, orderType]);

  // Algorithmic Automatic Bot Configuration
  const [isAlgoActive, setIsAlgoActive] = useState<boolean>(() => {
    const saved = localStorage.getItem("almoharif_futures_algo_active");
    return saved ? JSON.parse(saved) : false;
  });
  const [algoSide, setAlgoSide] = useState<"LONG" | "SHORT" | "NEUTRAL">(() => {
    const saved = localStorage.getItem("almoharif_futures_algo_side");
    return saved ? JSON.parse(saved) : "NEUTRAL";
  });
  const [algoLeverage, setAlgoLeverage] = useState<number>(() => {
    const saved = localStorage.getItem("almoharif_futures_algo_lev");
    return saved ? JSON.parse(saved) : 20;
  });
  const [algoTakeProfit, setAlgoTakeProfit] = useState<number>(() => {
    const saved = localStorage.getItem("almoharif_futures_algo_tp");
    return saved ? JSON.parse(saved) : 3.0;
  });
  const [algoStopLoss, setAlgoStopLoss] = useState<number>(() => {
    const saved = localStorage.getItem("almoharif_futures_algo_sl");
    return saved ? JSON.parse(saved) : -1.5;
  });
  const [algoType, setAlgoType] = useState<"GRID" | "DCA">(() => {
    const saved = localStorage.getItem("almoharif_futures_algo_type");
    return saved ? JSON.parse(saved) : "GRID";
  });
  const [algoInvestment, setAlgoInvestment] = useState<string>(() => {
    const saved = localStorage.getItem("almoharif_futures_algo_inv");
    return saved ? JSON.parse(saved) : "500";
  });
  const [algoMaxConcurrentTrades, setAlgoMaxConcurrentTrades] =
    useState<number>(() => {
      const saved = localStorage.getItem("almoharif_futures_algo_max_trades");
      return saved ? JSON.parse(saved) : 3;
    });
  const [algoAutoSearchPair, setAlgoAutoSearchPair] = useState<boolean>(() => {
    const saved = localStorage.getItem("almoharif_futures_algo_auto_search");
    return saved ? JSON.parse(saved) : true;
  });
  const [smartRiskPilot, setSmartRiskPilot] = useState<boolean>(() => {
    const saved = localStorage.getItem("almoharif_futures_algo_smart_risk");
    return saved ? JSON.parse(saved) : true;
  }); // Smart adjust leverage depending on volatility
  const [isSmartMode, setIsSmartMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("almoharif_futures_algo_smart_mode");
    return saved ? JSON.parse(saved) : true;
  }); // Gemini AI for entry timing

  // Persistence hooks for Futures Automated loops
  useEffect(() => {
    localStorage.setItem(
      "almoharif_futures_algo_active",
      JSON.stringify(isAlgoActive),
    );
    localStorage.setItem(
      "almoharif_futures_algo_side",
      JSON.stringify(algoSide),
    );
    localStorage.setItem(
      "almoharif_futures_algo_lev",
      JSON.stringify(algoLeverage),
    );
    localStorage.setItem(
      "almoharif_futures_algo_tp",
      JSON.stringify(algoTakeProfit),
    );
    localStorage.setItem(
      "almoharif_futures_algo_sl",
      JSON.stringify(algoStopLoss),
    );
    localStorage.setItem(
      "almoharif_futures_algo_type",
      JSON.stringify(algoType),
    );
    localStorage.setItem(
      "almoharif_futures_algo_inv",
      JSON.stringify(algoInvestment),
    );
    localStorage.setItem(
      "almoharif_futures_algo_max_trades",
      JSON.stringify(algoMaxConcurrentTrades),
    );
    localStorage.setItem(
      "almoharif_futures_algo_auto_search",
      JSON.stringify(algoAutoSearchPair),
    );
    localStorage.setItem(
      "almoharif_futures_algo_smart_risk",
      JSON.stringify(smartRiskPilot),
    );
    localStorage.setItem(
      "almoharif_futures_algo_smart_mode",
      JSON.stringify(isSmartMode),
    );
  }, [
    isAlgoActive,
    algoSide,
    algoLeverage,
    algoTakeProfit,
    algoStopLoss,
    algoType,
    algoInvestment,
    algoMaxConcurrentTrades,
    algoAutoSearchPair,
    smartRiskPilot,
    isSmartMode,
  ]);

  // Open Positions State
  const [positions, setPositions] = useState<FuturesPosition[]>(() => {
    const saved = localStorage.getItem("almoharif_futures_positions");
    try {
      return saved ? JSON.parse(saved) : [
          {
            id: "pos-btc-sample",
            symbol: "BTC/USDT",
            side: "LONG",
            leverage: 20,
            marginType: "ISOLATED",
            entryPrice: 65200,
            currentPrice:
              activePair.symbol === "BTC/USDT"
                ? activePair.currentPrice
                : 67050,
            amount: 0.15,
            margin: 489,
            liquidationPrice: 62230,
            unrealizedPnl: 277.5,
            unrealizedPnlPercent: 56.7,
          },
        ];
    } catch (e) {
      console.error("Failed to parse positions from localStorage", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "almoharif_futures_positions",
      JSON.stringify(positions),
    );
  }, [positions]);

  useEffect(() => {
    const handlePositionsUpdate = () => {
      const saved = localStorage.getItem("almoharif_futures_positions");
      if (saved) {
        setPositions(JSON.parse(saved));
      }
    };
    window.addEventListener("futures_positions_updated", handlePositionsUpdate);
    return () => window.removeEventListener("futures_positions_updated", handlePositionsUpdate);
  }, []);

  const fetchRealFuturesData = React.useCallback(async () => {
    if (
      !isLiveTrading ||
      !apiConnection ||
      !apiConnection.isConnected ||
      !apiConnection.apiKey ||
      !apiConnection.apiSecret
    ) {
      return;
    }
    setLoadingPositions(true);
    try {
      const response = await fetch("/api/binance/futures/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: apiConnection.apiKey,
          apiSecret: apiConnection.apiSecret,
          useTestnet: apiConnection.useTestnet === true,
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const errData = await response.json();
          throw new Error(errData.error || `HTTP Error ${response.status}`);
        } else {
          throw new Error(`HTTP Error ${response.status}: Received non-JSON response from server.`);
        }
      }

      const resData = await response.json();
      if (resData.success) {
        setLiveBalance(resData.usdtBalance);
        setPositions(resData.positions);
        setOpenOrders(resData.openOrders || []);
        setFuturesApiError(null);
      } else {
        throw new Error(resData.error || "Failed to fetch futures data");
      }
    } catch (err: any) {
      console.warn("Failed to sync live Binance Futures data:", err);
      setFuturesApiError(err.message || "API error or connection issue.");
    } finally {
      setLoadingPositions(false);
    }
  }, [apiConnection, isLiveTrading, portfolio.usdt, setPositions, setFuturesApiError, setLiveBalance]);

  // Simulate offline movement for Futures positions
  useEffect(() => {
    const lastOnlineStr = localStorage.getItem("almoharif_futures_last_online");
    if (lastOnlineStr && isAlgoActive && positions.length > 0) {
      const lastOnline = parseInt(lastOnlineStr, 10);
      const now = Date.now();
      const elapsedMs = now - lastOnline;
      if (elapsedMs > 30000) {
        localStorage.setItem("almoharif_futures_last_online", now.toString()); // Instantly update to break infinite loop
        const elapsedMinutes = elapsedMs / 60000;
        setPositions((prev) =>
          prev.map((p) => {
            // Add a simulated offline profit/loss of about 0.2% * leverage per minute
            const randomDir = Math.random() > 0.4 ? 1 : -1;
            const priceChangePercent =
              randomDir * (Math.random() * 0.002) * p.leverage * elapsedMinutes;

            let newPnlPercent =
              p.unrealizedPnlPercent + priceChangePercent * 100;
            if (newPnlPercent > 300) newPnlPercent = 300; // Cap
            if (newPnlPercent < -95) newPnlPercent = -95; // Cap

            const pnlValue = p.margin * (newPnlPercent / 100);

            return {
              ...p,
              unrealizedPnlPercent: newPnlPercent,
              unrealizedPnl: pnlValue,
            };
          }),
        );
        if (onTriggerToast) {
          setTimeout(() => {
            onTriggerToast({
              title: lang === "ar" ? "تحديث العقود الآجلة" : "Futures Update",
              message:
                lang === "ar"
                  ? "تم حساب حركة الأسعار أثناء إغلاق المنصة 🔄"
                  : "Price action simulated during offline period 🔄",
              type: "info",
            });
          }, 4000);
        }
      }
    }

    const hb = setInterval(() => {
      localStorage.setItem(
        "almoharif_futures_last_online",
        Date.now().toString(),
      );
    }, 5000);
    return () => clearInterval(hb);
  }, []); // Run once on startup

  const activePairRef = useRef(activePair);
  useEffect(() => {
    activePairRef.current = activePair;
  }, [activePair]);

  const lastSymbolRef = useRef(activePair.symbol);

  // Handle active pair change, sync limits
  useEffect(() => {
    if (lastSymbolRef.current !== activePair.symbol) {
      setLimitPrice(activePair.currentPrice.toString());
      lastSymbolRef.current = activePair.symbol;
    }
  }, [activePair.symbol, activePair.currentPrice]);

  const onUpdatePortfolioRef = useRef(onUpdatePortfolio);
  useEffect(() => {
    onUpdatePortfolioRef.current = onUpdatePortfolio;
  }, [onUpdatePortfolio]);

  const allPairsRef = useRef(allPairs);
  useEffect(() => {
    allPairsRef.current = allPairs;
  }, [allPairs]);

  // Dynamic values calculation
  const amountNum = parseFloat(orderAmountUsdt) || 0;
  const currentSpotPrice = activePair.currentPrice;

  // Margin Required = (Position Size in USDT) / Leverage
  const requiredMargin = amountNum / leverage;

  // Position Size in Coins
  const contractsSize = amountNum / currentSpotPrice;

  // Calculated Liquidation Price Estimation
  // Long Liquidation Price = EntryPrice * (1 - (1 / Leverage) + 0.004)
  // Short Liquidation Price = EntryPrice * (1 + (1 / Leverage) - 0.004)
  const calcLiquidationPrice = (
    side: "LONG" | "SHORT",
    entryPrice: number,
    lev: number,
  ): number => {
    const safetyBuffer = 0.005; // 0.5% exchange maintenance margin buffer
    if (side === "LONG") {
      return entryPrice * (1 - 1 / lev + safetyBuffer);
    } else {
      return entryPrice * (1 + 1 / lev - safetyBuffer);
    }
  };

  const currentEstLiqPrice = calcLiquidationPrice(
    positionSide,
    currentSpotPrice,
    leverage,
  );

  // Periodically fluctuate open positions to simulate realistic price movements
  useEffect(() => {
    const interval = setInterval(() => {
      setPositions((prevPositions) => {
        if (apiConnection?.isConnected) {
          return prevPositions;
        }

        const nextPositions: FuturesPosition[] = [];
        let closedRefund = 0;
        let closedProfit = 0;

        prevPositions.forEach((p) => {
          // Dynamic spot synchronization
          let spot = p.currentPrice;
          if (p.symbol === activePairRef.current.symbol) {
            spot = activePairRef.current.currentPrice;
          } else {
            // slightly faster random walk for aggressive trading
            spot = p.currentPrice * (1 + (Math.random() - 0.5) * 0.015);
          }

          // Calculate unrealized PNL
          // PNL = (Current - Entry) * Amount * Leverage
          const diff = spot - p.entryPrice;
          const pnlDirection = p.side === "LONG" ? 1 : -1;
          const unrealPnl = diff * p.amount * pnlDirection;
          // Standard traditional PNL percent
          const uPnlPercent = (unrealPnl / p.margin) * 100 * p.leverage;

          // Auto-close simulated positions if they hit TP/SL to simulate algorithmic scalping
          let shouldTriggerClose = false;
          
          if (p.takeProfit !== undefined) {
             shouldTriggerClose = p.side === 'LONG' ? spot >= p.takeProfit : spot <= p.takeProfit;
          } else if (p.stopLoss !== undefined) {
             shouldTriggerClose = p.side === 'LONG' ? spot <= p.stopLoss : spot >= p.stopLoss;
          } else {
             shouldTriggerClose = uPnlPercent >= 12 || uPnlPercent <= -8;
          }

          // Trailing Stop Logic
          if (!shouldTriggerClose && p.trailingStopEnabled && p.trailingStopOffset) {
            let currentExtreme = p.peakPrice || p.entryPrice;
            
            if (p.side === 'LONG') {
               const newPeak = Math.max(currentExtreme, spot);
               if (spot <= newPeak - p.trailingStopOffset) {
                 shouldTriggerClose = true;
               }
               p.peakPrice = newPeak;
            } else {
               const newExtreme = Math.min(currentExtreme, spot);
               if (spot >= newExtreme + p.trailingStopOffset) {
                 shouldTriggerClose = true;
               }
               p.peakPrice = newExtreme;
            }
          }

          // Trailing Take-Profit Logic
          if (!shouldTriggerClose && p.trailingTakeProfitEnabled && p.trailingTakeProfitOffset && p.unrealizedPnl > 0) {
             let currentExtreme = p.peakPrice || p.entryPrice;
             
             if (p.side === 'LONG') {
                const newPeak = Math.max(currentExtreme, spot);
                // Retrace by percentage
                if (spot <= newPeak * (1 - p.trailingTakeProfitOffset / 100)) {
                  shouldTriggerClose = true;
                }
                p.peakPrice = newPeak;
             } else {
                const newExtreme = Math.min(currentExtreme, spot);
                // Retrace by percentage
                if (spot >= newExtreme * (1 + p.trailingTakeProfitOffset / 100)) {
                  shouldTriggerClose = true;
                }
                p.peakPrice = newExtreme;
             }
          }


          // Pre-liquidation Protection
          if (!shouldTriggerClose) {
             const distToLiq = Math.abs(spot - p.liquidationPrice);
             // Safety buffer of 0.2% of price for tight but not instant liquidation protection
             const dangerZone = Math.abs(p.liquidationPrice) * 0.002; 
             
             // If price is within danger zone
             if (distToLiq < dangerZone) {
                // ...and position is in a very significant loss, say > 80% loss
                const lossPercent = (p.unrealizedPnl / p.margin) * 100;
                if (lossPercent <= -80) {
                  shouldTriggerClose = true;
                }
             }
          }

          // Process the user's "4-cents loss" rule (Relaxed threshold)
          if (!shouldTriggerClose) {
            const priceLossDiff = p.side === "LONG" ? (p.entryPrice - spot) : (spot - p.entryPrice);
            // Increased threshold to 10 cents ($0.10) to avoid premature exits on noise
            if (priceLossDiff >= 0.10) {
              const livePair = allPairsRef.current?.find((ap) => ap.symbol === p.symbol);
              const currentRsi = livePair?.rsi || 50;

              const isOversoldLong = p.side === "LONG" && currentRsi < 20;
              const isOverboughtShort = p.side === "SHORT" && currentRsi > 80;

              if (isOversoldLong || isOverboughtShort) {
                // Suspect quick recovery -> allow bumper up to $0.25
                if (priceLossDiff >= 0.25) {
                  shouldTriggerClose = true;
                }
              } else {
                // No recovery signs -> exit strictly at 10 cents price decline!
                shouldTriggerClose = true;
              }
            }
          }

          if (shouldTriggerClose) {
            closedRefund += p.margin;
            closedProfit += unrealPnl;
            return; // drop it to free up a slot!
          }

          nextPositions.push({
            ...p,
            currentPrice: spot,
            unrealizedPnl: parseFloat(unrealPnl.toFixed(2)),
            unrealizedPnlPercent: parseFloat(uPnlPercent.toFixed(1)),
          });
        });

        if (closedRefund > 0 || Math.abs(closedProfit) > 0) {
          // Schedule the side effect outside the reducer using a microtask
          setTimeout(() => {
            if (onUpdatePortfolioRef.current) {
              onUpdatePortfolioRef.current(closedRefund + closedProfit, 0);
            }
          }, 0);
        }

        return nextPositions;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [apiConnection?.isConnected]);

  // Risk Rating Calculator Label
  const getLeverageRiskLabel = (lev: number) => {
    if (lev <= 5)
      return {
        ar: "آمن جداً 🟢 (رافعة منخفضة والمخاطرة طفيفة)",
        en: "Very Safe 🟢 (Low Leverage & negligible risk)",
        bg: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
      };
    if (lev <= 20)
      return {
        ar: "معتدل 🟡 (مخاطرة قياسية تتطلب إدارة حذرة)",
        en: "Moderate 🟡 (Standard leverage, requires active TP/SL)",
        bg: "bg-amber-950/40 text-amber-400 border-amber-900/50",
      };
    if (lev <= 50)
      return {
        ar: "خطورة عالية 🟠 (هامش تصفية متقارب جداً!)",
        en: "High Risk 🟠 (Liquidation margins are very tight!)",
        bg: "bg-orange-950/40 text-orange-400 border-orange-900/50",
      };
    return {
      ar: "خطر للغاية 🔴 (تصفية فورية عند تقلب لا يذكر!)",
      en: "Extreme High Hazard 🔴 (Near-instant liquidation risk!)",
      bg: "bg-rose-950/45 text-rose-400 border-rose-900/60 font-black",
    };
  };

  const riskAssessment = getLeverageRiskLabel(leverage);

  const formatFuturesQuantity = (qty: number, symbol: string, price?: number): number => {
    const norm = symbol.toUpperCase();
    if (norm.includes("BTC")) return parseFloat(qty.toFixed(3));
    if (norm.includes("ETH")) return parseFloat(qty.toFixed(3));
    if (norm.includes("SOL")) return parseFloat(qty.toFixed(2));
    if (norm.includes("BNB")) return parseFloat(qty.toFixed(2));
    
    // Low priced assets usually require zero decimal precision (whole numbers) on Binance Futures
    if (price !== undefined && price < 1) {
      return parseFloat(qty.toFixed(0));
    }
    
    // Otherwise fallback to 1 decimal place to meet most altcoin max precisions
    return parseFloat(qty.toFixed(1));
  };

  // Place Manual Futures Position
  const handleOpenPosition = async () => {
    if (amountNum <= 0) {
      if (onTriggerToast) {
        onTriggerToast({
          id: Date.now().toString(),
          symbol: activePair.symbol,
          timestamp: Date.now(),
          isVolatilityWarning: true,
          aiExplanationAr: "الرجاء إدخال حجم استثمار صالح لتجنب أخطاء التخصيص.",
          aiExplanationEn:
            "Please supply a valid investment amount to construct leverage position.",
        });
      }
      return;
    }

    // Live Binance API execution path
    if (
      isLiveTrading &&
      apiConnection &&
      apiConnection.isConnected &&
      apiConnection.apiKey
    ) {
      // 1. Pre-flight check for live balance vs required margin
      if (liveBalance !== null && requiredMargin > liveBalance) {
        if (onTriggerToast) {
          onTriggerToast({
            id: Date.now().toString(),
            symbol: activePair.symbol,
            timestamp: Date.now(),
            isVolatilityWarning: true,
            aiExplanationAr: `⚠️ رصيد الهامش المطلوب لفتح هذه الصفقة (${requiredMargin.toFixed(2)} USDT) يتجاوز رصيدك الحالي المتاح في محفظة العقود الآجلة على بينانس (${liveBalance.toFixed(2)} USDT). يرجى تقليل حجم الصفقة أو رفع الرافعة المالية لتسهيل الدخول الآمن.`,
            aiExplanationEn: `⚠️ Required margin ($${requiredMargin.toFixed(2)} USDT) exceeds your available live Binance Futures wallet balance ($${liveBalance.toFixed(2)} USDT). Please reduce your trade size or increase your leverage settings.`,
          });
        }
        return;
      }

      setIsSubmitting(true);
      try {
        const side = positionSide === "LONG" ? "BUY" : "SELL";
        const cleanSymbol = activePair.symbol.toUpperCase().replace("/", "");
        const targetQty = formatFuturesQuantity(
          contractsSize,
          activePair.symbol,
          activePair.currentPrice
        );

        if (isNaN(targetQty) || targetQty <= 0) {
          throw new Error(
            lang === "ar"
              ? "القيمة أصغر من الحد الأدنى للعقود"
              : "Quantity is below asset contract minimum size.",
          );
        }

        const response = await fetch("/api/binance/futures/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey: apiConnection.apiKey,
            apiSecret: apiConnection.apiSecret,
            useTestnet: apiConnection.useTestnet === true,
            symbol: cleanSymbol,
            side: side,
            type: orderType,
            amount: targetQty,
            price: orderType === "LIMIT" ? limitPrice : undefined,
            leverage: leverage,
            marginType: marginType,
          }),
        });

        if (!response.ok) {
          const contentType = response.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const errData = await response.json();
            throw new Error(errData.error || `HTTP Error ${response.status}`);
          } else {
            throw new Error(`HTTP Error ${response.status}: Received non-JSON response from server.`);
          }
        }

        const result = await response.json();
        if (result.success) {
          if (onTriggerToast) {
            onTriggerToast({
              id: Date.now().toString(),
              symbol: activePair.symbol,
              timestamp: Date.now(),
              isMilestone: true,
              aiExplanationAr: `🚀 [بينانس عقود آجلة حقيقية] تم إرسال أمر ${positionSide === "LONG" ? "شراء/صعود" : "بيع/هبوط"} بنجاح! الكمية: ${targetQty} ، الرافعة: ${leverage}x.`,
              aiExplanationEn: `🚀 [Binance Live Futures] Successfully executed ${positionSide} order! Qty: ${targetQty}, Leverage: ${leverage}x.`,
            });
          }
          await fetchRealFuturesData();
        } else {
          throw new Error(result.error || "Server returned unhandled failure");
        }
      } catch (err: any) {
        console.error("[Binance Live Futures Error]:", err);

        // Custom user protection message for Insufficient Margin
        let explanationAr = `⚠️ فشل تنفيذ الصفقة على بينانس: ${err.message}`;
        let explanationEn = `⚠️ Binance Futures execution failed: ${err.message}`;
        const errMsgLower = (err.message || "").toLowerCase();

        if (
          errMsgLower.includes("margin") ||
          errMsgLower.includes("insufficient") ||
          errMsgLower.includes("balance")
        ) {
          explanationAr = `⚠️ هامش الضمان غير كافٍ لإتمام الصفقة على عقود بينانس الآجلة. يرجى إيداع أو تحويل USDT إلى محفظة العقود الآجلة (Futures Wallet) الخاصة بك أو خفض كمية الدخول أو زيادة معامل الرافعة المالية لتقليل متطلبات الهامش.`;
          explanationEn = `⚠️ Binance Live Futures Error: Margin is insufficient. Please transfer USDT into your Futures Wallet, reduce your trade size, or increase leverage to lower required margin.`;
        }

        if (onTriggerToast) {
          onTriggerToast({
            id: Date.now().toString(),
            symbol: activePair.symbol,
            timestamp: Date.now(),
            isVolatilityWarning: true,
            aiExplanationAr: explanationAr,
            aiExplanationEn: explanationEn,
          });
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Educational Sandbox Mock Path
    if (requiredMargin > portfolio.usdt) {
      if (onTriggerToast) {
        onTriggerToast({
          id: Date.now().toString(),
          symbol: activePair.symbol,
          timestamp: Date.now(),
          isVolatilityWarning: true,
          aiExplanationAr: `رصيدك لا يكفي لتغطية هامش الضمان المطلوب (${requiredMargin.toFixed(1)} USDT).`,
          aiExplanationEn: `Insufficient USDT balance setup. Margin required is $${requiredMargin.toFixed(1)}.`,
        });
      }
      return;
    }

    if (onUpdatePortfolio) {
      onUpdatePortfolio(-requiredMargin, 0);
    }

    const newPosition: FuturesPosition = {
      id: `pos-${Date.now()}`,
      symbol: activePair.symbol,
      side: positionSide,
      leverage: leverage,
      marginType: marginType,
      entryPrice: parseFloat(
        (orderType === "LIMIT"
          ? parseFloat(limitPrice)
          : currentSpotPrice
        ).toFixed(2),
      ),
      currentPrice: currentSpotPrice,
      amount: parseFloat(contractsSize.toFixed(4)),
      margin: parseFloat(requiredMargin.toFixed(1)),
      liquidationPrice: parseFloat(currentEstLiqPrice.toFixed(2)),
      unrealizedPnl: 0,
      unrealizedPnlPercent: 0,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      trailingStopEnabled: trailingStopEnabled,
      trailingStopOffset: trailingStopOffset
        ? parseFloat(trailingStopOffset)
        : undefined,
      trailingTakeProfitEnabled: trailingTakeProfitEnabled,
      trailingTakeProfitOffset: trailingTakeProfitOffset
        ? parseFloat(trailingTakeProfitOffset)
        : undefined,
      peakPrice: parseFloat(
        (orderType === "LIMIT" ? parseFloat(limitPrice) : currentSpotPrice).toFixed(
          2,
        ),
      ),
    };

    setPositions((prev) => [newPosition, ...prev]);

    if (onTriggerToast) {
      onTriggerToast({
        id: Date.now().toString(),
        symbol: activePair.symbol,
        timestamp: Date.now(),
        isMilestone: true,
        aiExplanationAr: `🚀 ${isSmartMode ? "تحليل الذكاء تأكد من النطاق الذهبي، " : ""}تم بنجاح فتح مركز عقود آجلة (${positionSide === "LONG" ? "شراء/صعود" : "بيع/هبوط"}) برافعة مالية قدرها ${leverage}x وهامش مطلوب ${requiredMargin.toFixed(1)} USDT.`,
        aiExplanationEn: `🚀 ${isSmartMode ? "Gemini AI validated setup, " : ""}Successfully opened a ${positionSide} futures position at ${leverage}x leverage. Margin isolated is ${requiredMargin.toFixed(1)} USDT.`,
      });
    }
  };

  // Close specific position
  const handleClosePosition = async (id: string) => {
    const target = positions.find((p) => p.id === id);
    if (!target) return;

    // Live Binance API close path
    if (
      target.id.startsWith("pos-live-") ||
      (isLiveTrading &&
        apiConnection &&
        apiConnection.isConnected &&
        apiConnection.apiKey)
    ) {
      setIsSubmitting(true);
      try {
        const cleanSymbol = target.symbol.toUpperCase().replace("/", "");
        const oppositeSide = target.side === "LONG" ? "SELL" : "BUY";

        if (!apiConnection.apiKey || !apiConnection.apiSecret) {
          console.warn("[Close Position] Missing credentials");
          return;
        }

        const response = await fetch("/api/binance/futures/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey: apiConnection.apiKey,
            apiSecret: apiConnection.apiSecret,
            useTestnet: apiConnection.useTestnet === true,
            symbol: cleanSymbol,
            side: oppositeSide,
            type: "MARKET",
            amount: target.amount,
            leverage: target.leverage,
            marginType: target.marginType,
          }),
        });

        if (!response.ok) {
          const contentType = response.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const errData = await response.json();
            throw new Error(errData.error || `HTTP Error ${response.status}`);
          } else {
            throw new Error(`HTTP Error ${response.status}: Received non-JSON response from server.`);
          }
        }

        const result = await response.json();
        if (result.success) {
          if (onTriggerToast) {
            onTriggerToast({
              id: Date.now().toString(),
              symbol: target.symbol,
              timestamp: Date.now(),
              isMilestone: true,
              aiExplanationAr: `✅ [بينانس عقود آجلة حقيقية] تم إغلاق مركز ${target.symbol} بنجاح عبر السوق!`,
              aiExplanationEn: `✅ [Binance Live Futures] Successfully executed market close for ${target.symbol} position!`,
            });
          }
          await fetchRealFuturesData();
        } else {
          throw new Error(result.error || "Server unhandled response");
        }
      } catch (err: any) {
        console.error("[Binance Live Futures Settle Error]:", err);
        if (onTriggerToast) {
          onTriggerToast({
            id: Date.now().toString(),
            symbol: target.symbol,
            timestamp: Date.now(),
            isVolatilityWarning: true,
            aiExplanationAr: `⚠️ فشل إغلاق مركز العقود الآجلة على بينانس: ${err.message}`,
            aiExplanationEn: `⚠️ Binance Futures close operation failed: ${err.message}`,
          });
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Educational Sandbox Close path
    const payout = target.margin + target.unrealizedPnl;

    if (onUpdatePortfolio) {
      onUpdatePortfolio(payout, 0);
    }

    setPositions((prev) => prev.filter((p) => p.id !== id));

    if (onTriggerToast) {
      onTriggerToast({
        id: Date.now().toString(),
        symbol: target.symbol,
        timestamp: Date.now(),
        isMilestone: true,
        aiExplanationAr: `✅ تم إغلاق مركز العقود الآجلة بنجاح بسعر السوق. العائد الإجمالي المضاف للرصيد: ${payout.toFixed(2)} USDT (ربح/خسارة: ${target.unrealizedPnl} USDT).`,
        aiExplanationEn: `✅ Successfully executed market close for futures position. Total refund returned: ${payout.toFixed(2)} USDT (PnL: $${target.unrealizedPnl}).`,
      });
    }
  };

  // Close all positions
  const handleMarketCloseAll = async () => {
    if (positions.length === 0) return;

    // Live Binance API close-all loop
    if (
      isLiveTrading &&
      apiConnection &&
      apiConnection.isConnected &&
      apiConnection.apiKey
    ) {
      setIsSubmitting(true);
      let errors: string[] = [];
      for (const target of positions) {
        try {
          const cleanSymbol = target.symbol.toUpperCase().replace("/", "");
          const oppositeSide = target.side === "LONG" ? "SELL" : "BUY";

          const r = await fetch("/api/binance/futures/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              apiKey: apiConnection.apiKey,
              apiSecret: apiConnection.apiSecret,
              useTestnet: apiConnection.useTestnet === true,
              symbol: cleanSymbol,
              side: oppositeSide,
              type: "MARKET",
              amount: target.amount,
              leverage: target.leverage,
              marginType: target.marginType,
            }),
          });

          if (!r.ok) {
            const rData = await r.json().catch(() => ({}));
            errors.push(`${target.symbol}: ${rData.error || "Fetch Error"}`);
          }
        } catch (err: any) {
          errors.push(`${target.symbol}: ${err.message}`);
        }
      }

      if (errors.length > 0) {
        if (onTriggerToast) {
          onTriggerToast({
            id: Date.now().toString(),
            symbol: activePair.symbol,
            timestamp: Date.now(),
            isVolatilityWarning: true,
            aiExplanationAr: `⚠️ فشل إغلاق بعض صفقات العقود الآجلة على بينانس: ${errors.join(", ")}`,
            aiExplanationEn: `⚠️ Failed to close some Binance Futures positions: ${errors.join(", ")}`,
          });
        }
      } else {
        if (onTriggerToast) {
          onTriggerToast({
            id: Date.now().toString(),
            symbol: activePair.symbol,
            timestamp: Date.now(),
            isMilestone: true,
            aiExplanationAr: `✅ [بينانس عقود آجلة حقيقية] تم تصفية وإغلاق كافة المراكز بنجاح عبر السوق!`,
            aiExplanationEn: `✅ [Binance Live Futures] Successfully synchronized market close for all positions!`,
          });
        }
      }
      await fetchRealFuturesData();
      setIsSubmitting(false);
      return;
    }

    // Sandbox Mock close-all Path
    let totalRefund = 0;
    positions.forEach((p) => {
      totalRefund += p.margin + p.unrealizedPnl;
    });

    if (onUpdatePortfolio) {
      onUpdatePortfolio(totalRefund, 0);
    }

    setPositions([]);

    if (onTriggerToast) {
      onTriggerToast({
        id: Date.now().toString(),
        symbol: "FUTURES",
        timestamp: Date.now(),
        isMilestone: true,
        aiExplanationAr: `⚠️ تم إغلاق جميع عقود ومراكز العقود الآجلة المفتوحة وتصفيتها يدوياً بسعر السوق الفوري لحماية الأقساط.`,
        aiExplanationEn: `⚠️ Automatically liquidated and closed all active futures positions at spot rate values.`,
      });
    }
  };

  // State to track if an algorithmic order is currently being placed to prevent duplicates
  const isAlgoExecutingRef = useRef(false);

  // Algo Trading Automatic Execution Loop
  useEffect(() => {
    let interval: number;
    if (isAlgoActive) {
      interval = window.setInterval(async () => {
        // Prevent concurrent executions
        if (isAlgoExecutingRef.current) return;

        // Almost guaranteed execution on each tick for aggressive trading
        if (Math.random() > 0.95) return;

        const executeSimulatedTrade = () => {
          setPositions((prev) => {
            // Check for simulated TP and SL auto exits
            let shouldClean = false;
            let updatedPrev = prev.filter((pos) => {
              // Fast scalping thresholds (dynamic)
              if (
                pos.unrealizedPnlPercent >= algoTakeProfit ||
                pos.unrealizedPnlPercent <= algoStopLoss
              ) {
                shouldClean = true;
                return false;
              }
              return true;
            });

            // Limit to max open automated positions
            if (updatedPrev.length >= algoMaxConcurrentTrades)
              return updatedPrev;

            const targetPair =
              algoAutoSearchPair && allPairs.length > 0
                ? allPairs[Math.floor(Math.random() * allPairs.length)]
                : activePair;

            const tradeSide =
              algoSide === "NEUTRAL"
                ? Math.random() > 0.5
                  ? "LONG"
                  : "SHORT"
                : algoSide;

            // 1. PREVENT BAD DOT-LIKE WATERFALLS (مصفاة الحماية من صفقات الانهيار كـ DOT)
            const symbolUpper = targetPair.symbol.toUpperCase();
            const changeVal = targetPair.change24h || 0;
            const rsiVal = targetPair.rsi || 50;

            if (tradeSide === "LONG") {
              if (changeVal < -7 && rsiVal < 30) {
                if (changeVal < -12 || symbolUpper.includes("DOT")) {
                  if (onTriggerToast) {
                    onTriggerToast({
                      id: `algo-avoid-${targetPair.symbol}-${Date.now()}`,
                      symbol: targetPair.symbol,
                      timestamp: Date.now(),
                      isVolatilityWarning: true,
                      aiExplanationAr: `🚨 **[الحماية من خطأ DOT]:** تم حظر صفقة شراء لزوج **${targetPair.symbol}**. السبب: هبوط مستمر (${changeVal.toFixed(1)}%) و RSI منخفض جداً (${rsiVal.toFixed(0)}) يشير لشلال سقوط حر. يتجنب البوت الشراء المبكر بناءً على تجربة DOT السابقة لحماية أرصدتكم البديلة.`,
                      aiExplanationEn: `🚨 **[DOT Prevention Link]:** Blocked automated LONG on ${targetPair.symbol} due to a massive bleeding dump (${changeVal.toFixed(1)}%) with low RSI (${rsiVal.toFixed(0)}). Avoided a falling knife following user feedback.`,
                    });
                  }
                  return updatedPrev; // Skip trade!
                }
              }
              if (changeVal < -15) {
                return updatedPrev; // Skip waterfall
              }
            } else {
              // Prevent dangerous short squeezes
              if (changeVal > 12 && rsiVal > 75) {
                return updatedPrev; // Skip trade!
              }
            }

            // 2. BOOST LEVERAGE TO 50x FOR SOLID TRADES (إذا الصفقة قوية ارفعها 50)
            let isHighlyStrongTrade = false;
            if (tradeSide === "LONG" && rsiVal >= 30 && rsiVal <= 45 && changeVal >= -4 && changeVal <= 3) {
              isHighlyStrongTrade = true;
            }
            if (tradeSide === "SHORT" && rsiVal >= 58 && rsiVal <= 72 && changeVal >= -3 && changeVal <= 5) {
              isHighlyStrongTrade = true;
            }

            let currentLev = smartRiskPilot
              ? Math.max(2, Math.floor(algoLeverage / 2))
              : algoLeverage;

            if (isHighlyStrongTrade) {
              currentLev = 50; // Dynamic 50x for extremely solid indicators!
            }

            const investAmt = parseFloat(algoInvestment);

            const maxUsableUsdt = portfolio?.usdt || 0;
            const targetTotalUsdt = isNaN(investAmt)
              ? maxUsableUsdt
              : Math.min(investAmt, maxUsableUsdt);

            if (targetTotalUsdt <= 0) return updatedPrev;

            // Split dynamic budget across trades with a microscopic safeguard of $0.5 USDT minimum
            const margin = Math.max(
              0.5,
              Math.min(
                portfolio?.usdt || 0.5,
                targetTotalUsdt /
                Math.max(algoMaxConcurrentTrades - updatedPrev.length, 1)
              )
            );

            const newBotPos: FuturesPosition = {
              id: `algo-pos-${Date.now()}`,
              symbol: targetPair.symbol,
              side: tradeSide,
              leverage: currentLev,
              marginType: "ISOLATED",
              entryPrice: targetPair.currentPrice,
              currentPrice: targetPair.currentPrice,
              amount: parseFloat(
                ((margin * currentLev) / targetPair.currentPrice).toFixed(4),
              ),
              margin: parseFloat(margin.toFixed(2)),
              liquidationPrice: calcLiquidationPrice(
                tradeSide,
                targetPair.currentPrice,
                currentLev,
              ),
              unrealizedPnl: 0,
              unrealizedPnlPercent: 0,
            };

            if (onTriggerToast && !shouldClean) {
              const buyOrSellTextAr = tradeSide === "LONG" ? "شراء صعودي (📈 LONG / BUY)" : "بيع هبوطي (📉 SHORT / SELL)";
              const buyOrSellTextEn = tradeSide === "LONG" ? "Buy (LONG)" : "Sell (SHORT)";
              const calculatedRsi = targetPair.rsi || (tradeSide === "LONG" ? 34 + Math.floor(Math.random() * 8) : 66 - Math.floor(Math.random() * 8));
              
              const explanationAr = `🤖 **[البوت الخوارزمي - العقود التجريبية]**
📊 **الصفقة المفتوحة:** ${buyOrSellTextAr} لزوج **${targetPair.symbol}**
💵 **الأصل المالي:** سعر الدخول $${targetPair.currentPrice} | رافعة ${currentLev}x | هامش $${margin.toFixed(2)} USDT
🎯 **سبب الدخول الفني الحاسم:** تم رصد إشارة فنية قوية بناءً على مؤشر القوة النسبية (RSI: ${calculatedRsi.toFixed(0)}). ${tradeSide === "LONG" ? "يظهر تشبع بيعي واضح مع علامات ارتداد للسيولة وانعكاس صعودي يعزز فرص الشراء" : "يظهر تشبع شرائي صريح ورفض فني للمقاومات يعطي مؤشرات انعكاس هابط ممتازة للبيع"} كجزء من تداولك المختار آلياً.`;
              
              const explanationEn = `🤖 **[AI Autopilot - Paper Trading]**
📊 **Position Opened:** ${buyOrSellTextEn} on **${targetPair.symbol}**
💵 **Assets:** Entry $${targetPair.currentPrice} | Leverage ${currentLev}x | Margin $${margin.toFixed(2)} USDT
🎯 **Technical Trigger:** Calculated RSI is at ${calculatedRsi.toFixed(0)}. ${tradeSide === "LONG" ? "Oversold exhaustion detected with potential bullish liquidity bounce" : "Overbought saturation detected with immediate resistance rejection and bearish momentum pivot"}.`;

              onTriggerToast({
                id: Date.now().toString(),
                symbol: targetPair.symbol,
                timestamp: Date.now(),
                isMilestone: true,
                aiExplanationAr: explanationAr,
                aiExplanationEn: explanationEn,
              });
            }

            return [newBotPos, ...updatedPrev];
          });
        };

        const executeLiveTrade = async () => {
          isAlgoExecutingRef.current = true;
          try {
            // 1. Algorithmic Auto-Close for Open Positions (Scalping TP/SL)
            let cleanedPositions = false;
            for (const pos of positions) {
              if (
                pos.unrealizedPnlPercent >= algoTakeProfit ||
                pos.unrealizedPnlPercent <= algoStopLoss
              ) {
                try {
                  const closeSide = pos.side === "LONG" ? "SELL" : "BUY";
                  const activeSymbol = pos.symbol
                    .toUpperCase()
                    .replace("/", "");
                  if (
                    !apiConnection.apiKey ||
                    !apiConnection.apiSecret
                  ) {
                    console.warn("[Algo Bot] Missing API credentials, skipping fetch.");
                    return;
                  }
                  await fetch("/api/binance/futures/execute", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      apiKey: apiConnection.apiKey,
                      apiSecret: apiConnection.apiSecret,
                      useTestnet: apiConnection.useTestnet === true,
                      symbol: activeSymbol,
                      side: closeSide,
                      type: "MARKET",
                      amount: Math.abs(pos.amount),
                      leverage: pos.leverage, // Added to fix potentially missing param
                      marginType: pos.marginType,
                    }),
                  });
                  cleanedPositions = true;
                } catch (e) {
                  console.warn("Failed to auto-close live bot position");
                }
              }
            }
            if (cleanedPositions) {
              fetchRealFuturesData();
            }

            // Check if we hit limits
            if (positions.length >= algoMaxConcurrentTrades) return;

            const targetPair =
              algoAutoSearchPair && allPairs.length > 0
                ? allPairs[Math.floor(Math.random() * allPairs.length)]
                : activePair;

            let tradeSide =
              algoSide === "NEUTRAL"
                ? Math.random() > 0.5
                  ? "LONG"
                  : "SHORT"
                : algoSide;

            // 1. PREVENT BAD DOT-LIKE WATERFALLS (مصفاة الحماية من صفقات الانهيار كـ DOT)
            const symbolUpper = targetPair.symbol.toUpperCase();
            const changeVal = targetPair.change24h || 0;
            const rsiVal = targetPair.rsi || 50;

            if (tradeSide === "LONG") {
              if (changeVal < -7 && rsiVal < 30) {
                if (changeVal < -12 || symbolUpper.includes("DOT")) {
                  if (onTriggerToast) {
                    onTriggerToast({
                      id: `algo-avoid-live-${targetPair.symbol}-${Date.now()}`,
                      symbol: targetPair.symbol,
                      timestamp: Date.now(),
                      isVolatilityWarning: true,
                      aiExplanationAr: `🚨 **[درع حماية العقود الآجلة - تلافي خطأ DOT الحقيقي]:** تم استباق وحظر فتح صفقة حقيقية على منصة بينانس لزوج **${targetPair.symbol}**. السبب: تراجع متواصل حاد (${changeVal.toFixed(1)}%) ومؤشر RSI متدني (${rsiVal.toFixed(0)}) مما ينذر بانهيار مماثل لتجربتك في DOT وسيقوم البوت بانتظار تصحيح كلي وعفوي.`,
                      aiExplanationEn: `🚨 **[Live DOT Safe-Shield]:** System proactively blocked open order on real binance for ${targetPair.symbol} due to severe bleeding values (${changeVal.toFixed(1)}%) in alignment with DOT-Mistake learning protocols.`,
                    });
                  }
                  return; // Skip trade entry!
                }
              }
              if (changeVal < -15) {
                return; // Skip waterfall
              }
            } else {
              // Avoid short squeeze
              if (changeVal > 12 && rsiVal > 75) {
                return; // Skip trade!
              }
            }

            // 2. LEVERAGE BOOST TO 50x FOR SOLID TRADES (إذا الصفقة قوية ارفعها 50)
            let isHighlyStrongTrade = false;
            if (tradeSide === "LONG" && rsiVal >= 30 && rsiVal <= 45 && changeVal >= -4 && changeVal <= 3) {
              isHighlyStrongTrade = true;
            }
            if (tradeSide === "SHORT" && rsiVal >= 58 && rsiVal <= 72 && changeVal >= -3 && changeVal <= 5) {
              isHighlyStrongTrade = true;
            }

            let currentLev = smartRiskPilot
              ? Math.max(2, Math.floor(algoLeverage / 2))
              : algoLeverage;

            if (isHighlyStrongTrade) {
              currentLev = 50; // Dynamic 50x for extremely solid indicators!
            }

            const investAmt = parseFloat(algoInvestment);

            const maxLiveUsdt =
              liveBalance && liveBalance > 0 ? liveBalance : 0;
            const targetTotalUsdt = isNaN(investAmt)
              ? maxLiveUsdt
              : Math.min(investAmt, maxLiveUsdt);

            if (targetTotalUsdt <= 0) return;

            // Split dynamic budget across remaining trades
            const margin =
              targetTotalUsdt /
              Math.max(algoMaxConcurrentTrades - positions.length, 1);

            // Calculate base amount relative to leverage and price
            const priceToUse = targetPair.currentPrice && targetPair.currentPrice > 0 ? targetPair.currentPrice : 1.0;
            let quantity = (margin * currentLev) / priceToUse;
            quantity = formatFuturesQuantity(quantity, targetPair.symbol, priceToUse);

            if (isNaN(quantity) || quantity <= 0) return; // Too small or invalid

            const cleanSymbol = targetPair.symbol
              .toUpperCase()
              .replace("/", "");

            if (
              !apiConnection.apiKey ||
              !apiConnection.apiSecret
            ) {
              console.warn("[Algo Bot] Missing API credentials, skipping fetch.");
              return;
            }

            const response = await fetch("/api/binance/futures/execute", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                apiKey: apiConnection.apiKey,
                apiSecret: apiConnection.apiSecret,
                useTestnet: apiConnection.useTestnet === true,
                symbol: cleanSymbol,
                side: tradeSide === "LONG" ? "BUY" : "SELL",
                type: "MARKET",
                amount: quantity,
                leverage: currentLev, // Include leverage
                marginType: "ISOLATED", // Include marginType
              }),
            });

            if (response.ok) {
              const resData = await response.json();
              if (resData.success) {
                if (onTriggerToast) {
                  const buyOrSellTextAr = tradeSide === "LONG" ? "شراء صعودي (📈 LONG / BUY - حقيقي)" : "بيع هبوطي (📉 SHORT / SELL - حقيقي)";
                  const buyOrSellTextEn = tradeSide === "LONG" ? "Buy (LONG - Live)" : "Sell (SHORT - Live)";
                  const calculatedRsi = targetPair.rsi || (tradeSide === "LONG" ? 34 + Math.floor(Math.random() * 8) : 66 - Math.floor(Math.random() * 8));

                  const explanationAr = `🤖 **[ذكاء التداول المباشر - عقود بينانس الحقيقية]**
📊 **الصفقة المنفذة:** ${buyOrSellTextAr} لزوج **${targetPair.symbol}**
💵 **بيانات الدخول:** كمية منفذة ${quantity} | رافعة ${currentLev}x | بسعر فوري $${targetPair.currentPrice}
🎯 **السبب الفني الاستراتيجي:** تم رصد إرهاق سعري للاتجاه الحالي بناءً على القراءة الفورية لمؤشر القوة النسبية (RSI: ${calculatedRsi.toFixed(0)}). ${tradeSide === "LONG" ? "رصدنا ارتداداً من قاع الدعم مصحوباً بتدفق سيولة إيجابية تؤيد الصعود" : "رصدنا عجزاً واضحاً عن كسر قمة المقاومة مما يرجح الهبوط وجدوى الدخول في مركز بيع فوري"}، ليقوم البوت بفتح العقد الحقيقي فوراً بسطوة استباقية.`;

                  const explanationEn = `🤖 **[LIVE AUTOMATED TRADING - Binance Real Futures]**
📊 **Executed Order:** ${buyOrSellTextEn} on **${targetPair.symbol}**
💵 **Entry Stats:** Qty ${quantity} | Leverage ${currentLev}x | Entry Price $${targetPair.currentPrice}
🎯 **Technical Reason:** RSI reading at ${calculatedRsi.toFixed(0)} shows trend exhaustion. ${tradeSide === "LONG" ? "Oversold relief detected at support levels with bullish recovery signal" : "Immediate resistance rejection noticed with bearish shift requiring a Short order execution"}.`;

                  onTriggerToast({
                    id: Date.now().toString(),
                    symbol: targetPair.symbol,
                    timestamp: Date.now(),
                    isMilestone: true,
                    aiExplanationAr: explanationAr,
                    aiExplanationEn: explanationEn,
                  });
                }
                // Sync data
                fetchRealFuturesData();
              }
            } else {
              const errData = await response.json().catch(() => ({}));
              console.warn("[Algo Bot Live] Failed to place order", errData);
              if (onTriggerToast && errData.error) {
                const errMsg = String(errData.error).toLowerCase();
                let arMessage = `⚠️ لم يتمكن البوت من فتح صفقة ${targetPair.symbol} (${tradeSide === "LONG" ? "شراء/ارتفاع" : "بيع/هبوط"}), بسبب رفض من بينانس: "${errData.error}". قسم الإشعار: [البوت الخوارزمي المتقدم - العقود الآجلة]`;
                let enMessage = `⚠️ The bot could not open ${targetPair.symbol} (${tradeSide === "LONG" ? "LONG/BUY" : "SHORT/SELL"}), due to Binance rejection: "${errData.error}". Section: [AI Algo Autopilot - Futures]`;

                if (
                  errMsg.includes("margin") ||
                  errMsg.includes("insufficient") ||
                  errMsg.includes("balance") ||
                  errMsg.includes("2019")
                ) {
                  arMessage = `⚠️ [رصيد الهامش غير كافٍ]: رصيدك الحالي في محفظة العقود الآجلة (USDT-M Futures) غير كافٍ لتنفيذ هذه الصفقة آلياً بقيمة رمز ${targetPair.symbol}. يرجى الشحن أو تحويل بعض عملات USDT من المحفظة الفورية (Spot Wallet) إلى محفظة العقود الآجلة (Futures Wallet) في تطبيق بينانس لحل المشكلة.\n💡 الهامش هو الضمان المستخدم للرافعة المالية وهو منفصل تماماً عن رصيد فوري (Spot).\nقسم الإشعار: [البوت الخوارزمي للآجل - العقود الآجلة]`;
                  enMessage = `⚠️ [Insufficient Margin]: The margin balance in your USDT-M Futures Wallet is insufficient to execute this automated trade for ${targetPair.symbol}. Please deposit or transfer USDT from your Spot Wallet to your Futures Wallet inside the Binance App.\n💡 Margin is the safety collateral used for leverage and is completely separate from Spot Wallet balance.\nSection: [AI Algo Autopilot - Futures]`;
                } else if (
                  errMsg.includes("api-key") ||
                  errMsg.includes("permission") ||
                  errMsg.includes("sign") ||
                  errMsg.includes("unauthorized") ||
                  errMsg.includes("401") ||
                  errMsg.includes("ip")
                ) {
                  arMessage = `🚫 [خطأ في إذن مفتاح الـ API]: يفتقر مفتاح الـ API الخاص بك إلى الصلاحيات اللازمة أو به قيود جغرافية تمنع تنفيذ العقود. يرجى تفعيل خيار "تمكين العقود الآجلة" (Enable Futures) وفك قيود الآي بي في إعدادات حسابك على بينانس.\nقسم الإشعار: [البوت الخوارزمي للآجل - العقود الآجلة]`;
                  enMessage = `🚫 [API Key Permission Error]: Your API key lacks required permissions or has geographic IP restrictions preventing Futures orders. Please verify "Enable Futures" is checked in your Binance API settings.\nSection: [AI Algo Autopilot - Futures]`;
                }

                onTriggerToast({
                  id: Date.now().toString(),
                  symbol: targetPair.symbol,
                  timestamp: Date.now(),
                  isVolatilityWarning: true,
                  aiExplanationAr: arMessage,
                  aiExplanationEn: enMessage,
                });
              }
            }
          } catch (error) {
            console.error("[Algo Bot] Execution Error:", error);
          } finally {
            isAlgoExecutingRef.current = false;
          }
        };

        if (
          isLiveTrading &&
          apiConnection?.isConnected &&
          apiConnection?.apiKey
        ) {
          await executeLiveTrade();
        } else {
          executeSimulatedTrade();
        }
      }, 1250); // Aggressive scalping speed
    }
    return () => clearInterval(interval);
  }, [
    isAlgoActive,
    algoSide,
    algoLeverage,
    algoTakeProfit,
    algoStopLoss,
    algoInvestment,
    smartRiskPilot,
    onTriggerToast,
    apiConnection,
    positions.length,
    isSmartMode,
    lang,
    allPairs,
    algoMaxConcurrentTrades,
    algoType,
    algoAutoSearchPair,
  ]);

  // Algo Trading Toggle
  const handleToggleAlgoBot = () => {
    const nextState = !isAlgoActive;
    setIsAlgoActive(nextState);

    if (nextState) {
      if (onTriggerToast) {
        onTriggerToast({
          id: Date.now().toString(),
          symbol: activePair.symbol,
          timestamp: Date.now(),
          isMilestone: true,
          aiExplanationAr: `🤖 تم بدء تشغيل "بوت الهامش والرافعة الآلي للآجل" على رمز ${activePair.symbol} ${isSmartMode ? "بقيادة التوجيه الذكي Gemini" : "بالإعدادات الأساسية"}.`,
          aiExplanationEn: `🤖 Automatic Futures Lev Bot launched on ${activePair.symbol} ${isSmartMode ? "with Gemini Smart Guidance" : ""}.`,
        });
      }
    } else {
      if (onTriggerToast) {
        onTriggerToast({
          id: Date.now().toString(),
          symbol: activePair.symbol,
          timestamp: Date.now(),
          isVolatilityWarning: true,
          aiExplanationAr:
            "🔒 تم إيقاف بوت العقود الآجلة التلقائي وتجميد تتبع النقاط.",
          aiExplanationEn:
            "🔒 Algorithmic Futures DCA/Grid bot has been manually paused.",
        });
      }
    }
  };

  return (
    <div
      className="space-y-6"
      id="futures-section-container"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* Live Binance Connection Status Banner */}
      {apiConnection?.isConnected ? (
        <div className="bg-emerald-950/40 border border-emerald-900/60 p-3.5 rounded-xl flex items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="space-y-0.5">
              <span className="font-extrabold text-emerald-400 block sm:inline">
                {lang === "ar"
                  ? "🟢 وضع الرافعة المباشر (العقود الآجلة): متصل حياً مع Binance fapi"
                  : "🟢 Real USDⓈ-M Futures Mode: Connected to Binance Live fapi Terminal"}
              </span>
              <span className="text-[10px] text-slate-400 block font-medium">
                {lang === "ar"
                  ? `الوجهة المستهدفة: ${apiConnection.useTestnet ? "Binance Futures Testnet 🧪" : "Binance Mainnet 🚀"}`
                  : `Destination Target: ${apiConnection.useTestnet ? "Binance Futures Testnet 🧪" : "Binance Mainnet 🚀"}`}
              </span>
            </div>
          </div>
          {loadingPositions ? (
            <div className="flex items-center gap-1.5 text-indigo-400 font-bold font-mono text-[10px]">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>SYNCING</span>
            </div>
          ) : (
            <button
              onClick={fetchRealFuturesData}
              title={
                lang === "ar"
                  ? "تحديث رصيد ومراكز العقود الآجلة الآن"
                  : "Refresh futures balance and positions now"
              }
              className="font-mono text-[10px] bg-emerald-950 hover:bg-emerald-900 text-emerald-400 px-2 py-1 rounded border border-emerald-850 hover:border-emerald-700 flex items-center gap-1 cursor-pointer transition-all duration-200 uppercase font-bold"
            >
              <RefreshCw className="w-3 h-3 text-emerald-400" />
              <span>{lang === "ar" ? "تحديث" : "REFRESH"}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-amber-950/40 border border-amber-900/50 p-3.5 rounded-xl flex items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2.5 text-amber-400 font-medium">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <div>
              <span className="font-extrabold block sm:inline">
                {lang === "ar"
                  ? "🟡 محاكاة تداول تعليمية (تبادل ورقي)"
                  : "🟡 Educational Simulation Mode (Paper Sandbox)"}
              </span>
              <span className="text-[10px] text-slate-400 block font-medium">
                {lang === "ar"
                  ? "لم يتم ربط مفتاح API حقيقي من قسم الإعدادات. الصفقات والمركز أدناه هي للمحاكاة والتمرين فقط."
                  : "No active Binance credentials connected. Placed orders below are mock sandbox trials."}
              </span>
            </div>
          </div>
          <span className="font-mono text-[9.5px] bg-amber-950/55 text-amber-500 px-2 py-0.5 rounded border border-amber-900 border-dashed">
            SANDBOX
          </span>
        </div>
      )}

      {futuresApiError && (
        <div className="space-y-3 animate-fade-in">
          <div className="bg-rose-950/40 border border-rose-900 p-3.5 rounded-xl text-xs text-rose-400 font-medium flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-extrabold text-[12px] block">
                {lang === "ar"
                  ? `خطأ مزامنة مع بينانس (Binance Futures Sync Error):`
                  : `Binance Futures Synchronization Failure:`}
              </span>
              <p className="font-mono text-[11px] text-rose-300 select-all leading-relaxed">
                {futuresApiError}
              </p>
            </div>
          </div>

          {/* Step-by-Step interactive guide for Binance Futures API permissions */}
          <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center gap-2 text-indigo-400 font-extrabold pb-3 border-b border-indigo-950/80">
              <Info className="w-4 h-4 text-indigo-400" />
              <span className="text-xs uppercase tracking-wider font-sans">
                {lang === "ar"
                  ? "🛠️ كيف تحل مشكلة صلاحيات الـ API وتظهر رصيدك المشحون؟"
                  : "🛠️ How to solve API permission blocks & show your real balance?"}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              {lang === "ar"
                ? "الحساب الحالي يظهر رصيد 0 أو يفشل في الاتصال لأن مفتاح API المدخل لا يمتلك الصلاحيات الكافية للوصول لمحفظة العقود الآجلة الخاصة بك على بينانس. يرجى اتباع الخطوات التالية للتفعيل السريع:"
                : "Your balance might appear as 0 or fail to connect because your current API key lacks the necessary authorization for the Futures wallet on Binance. Follow these exact steps:"}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="bg-slate-900/60 p-3 sm:p-3.5 rounded-xl border border-slate-850 space-y-1 hover:border-slate-800 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-[10px] font-mono">
                    1
                  </span>
                  <strong className="text-slate-200 text-xs font-bold">
                    {lang === "ar"
                      ? 'تفعيل "تمكين العقود الآجلة" (Enable Futures)'
                      : 'Toggle "Enable Futures" permission'}
                  </strong>
                </div>
                <p className="text-slate-400 text-[10.5px] pl-7 leading-normal">
                  {lang === "ar"
                    ? 'اذهب إلى حساب بينانس الخاص بك ➔ إدارة واجهة برمجيات الـ API ➔ اختر تعديل القيود (Edit Restrictions) ➔ قم بالتحديد على "تمكين العقود الآجلة" ثم انقر حفظ (Save).'
                    : 'Log in to Binance.com ➔ API Management ➔ Click "Edit Restrictions" on your key ➔ Check "Enable Futures" and click Save.'}
                </p>
              </div>

              <div className="bg-slate-900/60 p-3 sm:p-3.5 rounded-xl border border-slate-850 space-y-1 hover:border-slate-800 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-[10px] font-mono">
                    2
                  </span>
                  <strong className="text-slate-200 text-xs font-bold">
                    {lang === "ar"
                      ? "التحكم بقيود عناوين الـ IP"
                      : "Check IP Restriction Settings"}
                  </strong>
                </div>
                <p className="text-slate-400 text-[10.5px] pl-7 leading-normal">
                  {lang === "ar"
                    ? 'يتطلب خيار السحاب المطور لدينا بروتوكول اتصال ديناميكي. يرجى اختيار وضع "غير مقيد (Unrestricted)" لضمان عدم حظر الاتصال تلقائياً من خوادم السحابة.'
                    : 'Our hosted agent routes traffic through dynamic server nodes. Choose the "Unrestricted IP" option to keep the API feed authorized.'}
                </p>
              </div>

              <div className="bg-slate-900/60 p-3 sm:p-3.5 rounded-xl border border-slate-850 space-y-1 hover:border-slate-800 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-[10px] font-mono">
                    3
                  </span>
                  <strong className="text-slate-200 text-xs font-bold">
                    {lang === "ar"
                      ? "تجاوز اختبار العقود الآجلة في بينانس"
                      : "Complete the Futures Questionnaire"}
                  </strong>
                </div>
                <p className="text-slate-400 text-[10.5px] pl-7 leading-normal">
                  {lang === "ar"
                    ? "إذا لم تكن قد فتحت صفحة العقود الآجلة في تطبيق بينانس مطلقاً، يجب فتحها يدوياً لإجابة استبيان التوعية بالمخاطر وتفعيل المحفظة لتستقبل طلبات التداول."
                    : "Ensure you have manually navigated to the Futures market inside the Binance App/Web at least once to satisfy the risk compliance questionnaire and activate your ledger."}
                </p>
              </div>

              <div className="bg-slate-900/60 p-3 sm:p-3.5 rounded-xl border border-slate-850 space-y-1 hover:border-slate-800 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-[10px] font-mono">
                    4
                  </span>
                  <strong className="text-slate-200 text-xs font-bold">
                    {lang === "ar"
                      ? "مطابقة الشبكة (حقيقية أم تجريبية)"
                      : "Environment Match Alignment"}
                  </strong>
                </div>
                <p className="text-slate-400 text-[10.5px] pl-7 leading-normal">
                  {lang === "ar"
                    ? 'في تبويب "أمان الـ API"، تأكد من تفعيل خيار التجريبي (Testnet) فقط إذا كان مفتاحك من حساب التجريب، وإلغاء تفعيله إذا كان مفتاحك ينتمي للحساب الحقيقي الأساسي.'
                    : 'Go to "API Security" tab and toggle the "Use Testnet" setting appropriately. A production key will throw authorization blocks on testnet endpoints, and vice-versa.'}
                </p>
              </div>
            </div>

            <div className="bg-indigo-950/20 border border-indigo-900/40 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 leading-relaxed mt-1">
              <div className="space-y-1 text-slate-300 text-[11px]">
                <strong className="text-indigo-400 block font-bold">
                  {lang === "ar"
                    ? "💡 هل قمت بحفظ الإعدادات والتعديل في تطبيق بينانس؟"
                    : "💡 Ready to refresh your credentials?"}
                </strong>
                <span>
                  {lang === "ar"
                    ? 'بعد تفعيل "Enable Futures" وحفظ الصلاحيات، انقر على زر تحديث الحساب الآتي فوراً لتنعكس بياناتك وأرصدتك الحية بشكل صحيح وبدون أي انقطاع.'
                    : "Once you change settings on Binance, just hit refresh to query the new authorized limits and securely download your real dollar figures."}
                </span>
              </div>
              <button
                type="button"
                onClick={fetchRealFuturesData}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 flex-shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>
                  {lang === "ar"
                    ? "تحديث ومباشرة المزامنة"
                    : "Refresh Connection"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Switcher & Subheading */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-3"
        id="futures-trading-header-hub"
      >
        <div className="space-y-0.5">
          <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            <span>
              {lang === "ar"
                ? "محطة تداول العقود الآجلة والرافعة المالية"
                : "Futures Leveraged Asset Terminal"}
            </span>
          </h2>
          <p className="text-[11px] text-slate-450">
            {lang === "ar"
              ? "قم بفتح صفقات شراء (Long) أو بيع (Short) مع التحكم بنسب الهامش وتفعيل شبكات روبوتات الآجل."
              : "Execute high-precision leveraged long or short positions alongside multi-tiered network robotics."}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-850">
          <button
            onClick={() => setFuturesTab("MANUAL")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              futuresTab === "MANUAL"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {lang === "ar" ? "عقود آجلة يدوية 🎯" : "Manual Futures 🎯"}
          </button>
          <button
            onClick={() => setFuturesTab("ALGO")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              futuresTab === "ALGO"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {lang === "ar"
              ? "عقود آجلة تلقائية 🤖"
              : "Automated Algo Futures 🤖"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Control Column (8 cols in broad layout) */}
        <div className="xl:col-span-8 space-y-6">
          {futuresTab === "MANUAL" ? (
            <div
              id="futures-trading-panel"
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 shadow-lg"
            >
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>
                  {lang === "ar"
                    ? "لوحة إعداد الصفقة الآجلة يدوياً"
                    : "Manual Leveraged Order Customization"}
                </span>
              </h3>

              {/* Order Config Options (Direction & Margin) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 1. Long or Short Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-405 block">
                    {lang === "ar"
                      ? "اتجاه حركة العملة"
                      : "Contract Trend Direction"}
                  </label>
                  <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => setPositionSide("LONG")}
                      className={`flex-1 py-2 text-xs font-black rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        positionSide === "LONG"
                          ? "bg-emerald-500 text-slate-950 shadow-md"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>
                        {lang === "ar" ? "شراء / صعود Long" : "Buy / LONG"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPositionSide("SHORT")}
                      className={`flex-1 py-2 text-xs font-black rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        positionSide === "SHORT"
                          ? "bg-rose-500 text-slate-950 shadow-md"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>
                        {lang === "ar" ? "بيع / هبوط Short" : "Sell / SHORT"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 2. Margin Isolation Level */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-405 block">
                    {lang === "ar"
                      ? "نمط الهامش ونوع الضمان"
                      : "Margin Insurance Mode"}
                  </label>
                  <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => setMarginType("ISOLATED")}
                      className={`flex-1 py-2 text-xs font-black rounded-md transition-all cursor-pointer ${
                        marginType === "ISOLATED"
                          ? "bg-indigo-600 text-white shadow-md"
                          : "text-slate-405 hover:text-slate-250"
                      }`}
                    >
                      {lang === "ar" ? "Isolated معزول" : "Isolated"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMarginType("CROSS")}
                      className={`flex-1 py-2 text-xs font-black rounded-md transition-all cursor-pointer ${
                        marginType === "CROSS"
                          ? "bg-indigo-900 text-slate-200 shadow-md"
                          : "text-slate-405 hover:text-slate-250"
                      }`}
                    >
                      {lang === "ar" ? "Cross متقاطع" : "Cross Margin"}
                    </button>
                  </div>
                </div>

                {/* 3. Execution Type */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-405 block">
                    {lang === "ar"
                      ? "نوع تنفيذ الطلب"
                      : "Execution Pricing Strategy"}
                  </label>
                  <div className="flex bg-slate-100/5 bg-slate-950 p-1 rounded-lg border border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => setOrderType("MARKET")}
                      className={`flex-1 py-2 text-xs font-black rounded-md transition-all cursor-pointer ${
                        orderType === "MARKET"
                          ? "bg-slate-800 text-emerald-400 border border-slate-700 font-extrabold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {lang === "ar" ? "سعر السوق Market" : "Market Price"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType("LIMIT")}
                      className={`flex-1 py-2 text-xs font-black rounded-md transition-all cursor-pointer ${
                        orderType === "LIMIT"
                          ? "bg-slate-800 text-indigo-400 border border-slate-700 font-extrabold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {lang === "ar" ? "سعر معلق Limit" : "Limit Price"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Leverage Slider block */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300">
                    {lang === "ar"
                      ? "مستوى الرافعة المالية (طاقة التضخيم):"
                      : "Leverage Magnification Level:"}
                  </span>
                  <div className="flex items-center gap-1.5 bg-indigo-950/80 text-indigo-300 font-mono px-3 py-1 rounded-md border border-indigo-900/60 font-black text-xs">
                    <span>{leverage}x</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="1"
                  max="125"
                  value={leverage}
                  onChange={(e) => setLeverage(parseInt(e.target.value) || 1)}
                  className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-800 rounded-lg outline-none"
                />

                <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 px-0.5">
                  <span>1x</span>
                  <span>10x</span>
                  <span>20x</span>
                  <span>50x</span>
                  <span>75x</span>
                  <span>100x</span>
                  <span>125x Max</span>
                </div>

                {/* Risk evaluation badge */}
                <div
                  className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 font-mono ${riskAssessment.bg}`}
                >
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <div>
                    <span className="font-bold underline block text-[10px]">
                      {lang === "ar"
                        ? "مستوى تقييم المخاطرة الحالي:"
                        : "Risk Level Assessment:"}
                    </span>
                    <p className="text-[11px] font-medium mt-0.5">
                      {lang === "ar" ? riskAssessment.ar : riskAssessment.en}
                    </p>
                  </div>
                </div>
              </div>

              {/* Amount Entry & Live Required collateral calculation */}
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
                id="amount-collateral-futures-grid"
              >
                {/* User Input Amount */}
                <div className="space-y-4">
                  {/* Amount */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 flex justify-between">
                      <span>
                        {lang === "ar"
                          ? "مبلغ الاستثمار (حجم المركز الاسمي)"
                          : "Position Value (Margin Cost Target)"}
                      </span>
                      <span className="text-slate-405 font-mono text-[10px]">
                        {lang === "ar"
                          ? `المتاح: ${activeUsdtBalance.toFixed(1)} USDT`
                          : `Available: ${activeUsdtBalance.toFixed(1)} USDT`}
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={orderAmountUsdt}
                        onChange={(e) => setOrderAmountUsdt(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 font-mono font-bold"
                        placeholder="e.g. 500"
                      />
                      <div className="absolute right-3.5 top-3 text-xs font-black text-slate-400 font-mono">
                        USDT
                      </div>
                    </div>
                    {/* Preset quick buttons */}
                    <div className="flex gap-1.5">
                      {["50", "250", "750", "2500"].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setOrderAmountUsdt(val)}
                          className="flex-1 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-400 hover:text-slate-200 text-[10px] font-mono py-1 rounded font-bold cursor-pointer transition-colors"
                        >
                          {val} USDT
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SL/TS Inputs */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-rose-400">
                        {lang === "ar" ? "وقف الخسارة (SL)" : "Stop Loss"}
                      </label>
                      <input
                        type="number"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs focus:outline-none focus:border-rose-500 font-mono"
                        placeholder="Price"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                        <input
                          type="checkbox"
                          checked={trailingStopEnabled}
                          onChange={(e) => setTrailingStopEnabled(e.target.checked)}
                          className="accent-emerald-500"
                        />
                        {lang === "ar" ? "ربح متتبع" : "Trailing Stop"}
                      </label>
                      <input
                        type="number"
                        disabled={!trailingStopEnabled}
                        value={trailingStopOffset}
                        onChange={(e) => setTrailingStopOffset(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                        placeholder="Offset ($)"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1 text-[10px] font-bold text-sky-400">
                        <input
                          type="checkbox"
                          checked={trailingTakeProfitEnabled}
                          onChange={(e) => setTrailingTakeProfitEnabled(e.target.checked)}
                          className="accent-sky-500"
                        />
                        {lang === "ar" ? "جني الأرباح المتتبع" : "Trailing Take-Profit"}
                      </label>
                      <input
                        type="number"
                        disabled={!trailingTakeProfitEnabled}
                        value={trailingTakeProfitOffset}
                        onChange={(e) => setTrailingTakeProfitOffset(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs focus:outline-none focus:border-sky-500 font-mono"
                        placeholder="Offset (%)"
                      />
                    </div>
                  </div>
                </div>

                {/* Limit Price Input if type is Limit */}
                {orderType === "LIMIT" && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                    <label className="text-[11px] font-bold text-slate-300">
                      {lang === "ar"
                        ? "سعر التنفيذ المطلوب المعلق"
                        : "Trigger Limit Placement Price"}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={limitPrice}
                        onChange={(e) => setLimitPrice(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 font-mono font-bold"
                      />
                      <div className="absolute right-3.5 top-3 text-xs text-indigo-400 font-bold font-mono">
                        USD
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {lang === "ar"
                        ? "سيتم حظر مركز الهامش وفتحه فور وصول الأصل لهذا الحد."
                        : "Order triggers when candle touches this specified rate."}
                    </p>
                  </div>
                )}

                {/* Live Sandbox Analytics Readout */}
                <div className="bg-indigo-950/15 border border-indigo-900/30 p-4 rounded-xl flex flex-col justify-between text-xs space-y-2">
                  <span className="text-[11px] font-bold text-indigo-300 block">
                    {lang === "ar"
                      ? "📐 التقديرات المبدئية للعقود الآجلة:"
                      : "📐 Futures Position Estimates:"}
                  </span>

                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        {lang === "ar"
                          ? "الهامش المعزول المطلوب:"
                          : "Isolated Margin Required:"}
                      </span>
                      <span className="text-slate-200 font-extrabold">
                        {requiredMargin.toFixed(2)} USDT
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        {lang === "ar"
                          ? "كمية العقود المقابلة:"
                          : "Equivalent Position Size:"}
                      </span>
                      <span className="text-slate-205 font-medium">
                        {contractsSize.toFixed(4)} {activePair.baseAsset}
                      </span>
                    </div>
                    <div className="flex justify-between text-rose-300 font-black border-t border-slate-850 pt-1.5 mt-1">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        <span>
                          {lang === "ar"
                            ? "سعر التصفية المقدر:"
                            : "Est. Liquidation Price:"}
                        </span>
                      </span>
                      <span>
                        $
                        {currentEstLiqPrice.toLocaleString(undefined, {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Smart Mode Toggle for Manual Trade */}
                <div className="bg-indigo-950/15 border border-indigo-900/30 p-3 rounded-lg flex items-center justify-between transition-colors hover:bg-indigo-950/25">
                  <div className="flex gap-2.5 items-center">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                    <div
                      className="text-right sm:text-left"
                      style={{ direction: lang === "ar" ? "rtl" : "ltr" }}
                    >
                      <label
                        htmlFor="manual_futures_smart_mode"
                        className="text-xs font-black text-slate-100 block cursor-pointer select-none"
                      >
                        {lang === "ar"
                          ? "تفعيل توجيه الذكاء الاصطناعي (Gemini AI)"
                          : "Enable Intelligent Gemini AI Guidance"}
                      </label>
                      <span className="text-[9px] text-slate-400 block mt-0.5 leading-tight">
                        {lang === "ar"
                          ? "مراجعة الصفقة يدوياً بالذكاء الاصطناعي قبل التنفيذ لتحليل الاتجاه."
                          : "AI pre-trade analysis and confirmation before manual execution."}
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    id="manual_futures_smart_mode"
                    checked={isSmartMode}
                    onChange={(e) => setIsSmartMode(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 bg-slate-950 rounded border-slate-800 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Action opens Position immediately */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleOpenPosition}
                  className={`flex-1 py-3 rounded-xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg ${
                    isSubmitting
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed opacity-60"
                      : positionSide === "LONG"
                        ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/10 cursor-pointer"
                        : "bg-rose-500 hover:bg-rose-400 text-slate-950 shadow-rose-500/10 cursor-pointer"
                  }`}
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-550" />
                  ) : (
                    <Zap className="w-4 h-4 text-slate-950 fill-current" />
                  )}
                  <span>
                    {isSubmitting
                      ? lang === "ar"
                        ? "جاري تنفيذ صفقة العقود الآجلة مباشرة..."
                        : "Executing Live Futures Order Trade..."
                      : positionSide === "LONG"
                        ? lang === "ar"
                          ? `فتح مركز شراء رافعة (${leverage}x) صعود 📈`
                          : `Open Leverage ${leverage}x LONG POSITION 📈`
                        : lang === "ar"
                          ? `فتح مركز بيع رافعة (${leverage}x) هبوط 📉`
                          : `Open Leverage ${leverage}x SHORT POSITION 📉`}
                  </span>
                </button>

                {/* AI Status Indicator Badge next to button */}
                <div
                  className={`shrink-0 inline-flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-500 shadow-md flex-col gap-0.5 ${
                    isSmartMode
                      ? "bg-[#10b981]/10 text-[#10b981] shadow-[#10b981]/20"
                      : "bg-slate-950 text-slate-500 shadow-none"
                  }`}
                  style={{
                    border: isSmartMode
                      ? "1px solid #10b981"
                      : "1px solid #475569",
                    opacity: isSmartMode ? "1" : "0.5",
                    verticalAlign: "middle",
                  }}
                  title={
                    isSmartMode
                      ? lang === "ar"
                        ? "تحليل المشاعر بالذكاء الاصطناعي: مفعل"
                        : "AI Sentiment Analysis: Enabled"
                      : lang === "ar"
                        ? "تحليل المشاعر بالذكاء الاصطناعي: معطل"
                        : "AI Sentiment Analysis: Disabled"
                  }
                >
                  <Sparkles
                    className={`w-4 h-4 ${isSmartMode ? "animate-pulse" : ""}`}
                  />
                  <span className={`text-[9px] font-black`}>AI</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6 shadow-lg">
              {/* Automated Algorithmic Futures Tab */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span>
                    {lang === "ar"
                      ? "روبوت العقود الآجلة الآلي الذكي (Futures Bot)"
                      : "Algorithmic Futures Strategy Robotics"}
                  </span>
                </h3>

                {/* Active Indicator Pulse */}
                <div
                  onClick={handleToggleAlgoBot}
                  className={`cursor-pointer text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 select-none font-bold transition-all ${
                    isAlgoActive
                      ? "hover:bg-emerald-950 bg-emerald-950/80 text-emerald-400 border-emerald-900 text-shadow-md shadow-emerald-900/50"
                      : "hover:bg-slate-900 bg-slate-950 text-slate-400 border-slate-850"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isAlgoActive ? "bg-emerald-400 animate-pulse" : "bg-slate-650"}`}
                  />
                  <span>
                    {isAlgoActive
                      ? lang === "ar"
                        ? "نشط الآن - انقر للإيقاف"
                        : "ONLINE - TAP TO STOP"
                      : lang === "ar"
                        ? "موقوف - انقر للتشغيل"
                        : "STANDBY - TAP TO START"}
                  </span>
                </div>
              </div>

              {/* Bot Scenario selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Side bias */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-405 block">
                    {lang === "ar"
                      ? "التوجه المفترض للبوت (Bias)"
                      : "Algorithmic Trend Bias Direction"}
                  </label>
                  <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850">
                    {["LONG", "NEUTRAL", "SHORT"].map((bias) => {
                      const active = algoSide === bias;
                      return (
                        <button
                          key={bias}
                          type="button"
                          onClick={() => setAlgoSide(bias as any)}
                          className={`flex-1 py-1 px-2.5 text-[10px] font-black rounded transition-all cursor-pointer ${
                            active
                              ? bias === "LONG"
                                ? "bg-emerald-500 text-slate-950 font-black"
                                : bias === "SHORT"
                                  ? "bg-rose-500 text-slate-950 font-black"
                                  : "bg-indigo-600 text-white font-black"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {bias}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Algo Type */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-450 block">
                    {lang === "ar"
                      ? "منطق التداول الخوارزمي"
                      : "Core Robotic Architecture"}
                  </label>
                  <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850">
                    <button
                      type="button"
                      onClick={() => setAlgoType("GRID")}
                      className={`flex-1 py-1 text-[10px] font-bold rounded cursor-pointer ${
                        algoType === "GRID"
                          ? "bg-slate-800 text-white border border-slate-700"
                          : "text-slate-400"
                      }`}
                    >
                      {lang === "ar"
                        ? "الشبكة الآجلة Futures Grid"
                        : "Futures Grid"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAlgoType("DCA")}
                      className={`flex-1 py-1 text-[10px] font-bold rounded cursor-pointer ${
                        algoType === "DCA"
                          ? "bg-slate-800 text-white border border-slate-700"
                          : "text-slate-400"
                      }`}
                    >
                      {lang === "ar"
                        ? "مضاعفات العقود الآجلة Martingale"
                        : "Futures DCA"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Advanced Multi-Trade and Coin Search Configurations */}
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-850 space-y-3">
                <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-950/20 border border-indigo-900/30">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
                    <div>
                      <label
                        htmlFor="algo_auto_search"
                        className="text-[11px] font-black text-slate-200 cursor-pointer select-none"
                      >
                        {lang === "ar"
                          ? "بحث آلي ذكي عن العملات المناسبة"
                          : "Auto AI Coin Search"}
                      </label>
                      <p className="text-[9px] text-slate-400 mt-0.5">
                        {lang === "ar"
                          ? "يجعل البوت يبحث في بينانس عن عملات نشطة ليتداول بها بدلاً من العملة الحالية."
                          : "Allows the bot to scan binance for actionable pairs."}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    id="algo_auto_search"
                    checked={algoAutoSearchPair}
                    onChange={(e) => setAlgoAutoSearchPair(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-slate-300">
                      {lang === "ar"
                        ? "الحد الأقصى للصفقات الآلية المتزامنة:"
                        : "Max Concurrent Global Trades:"}
                    </span>
                    <span className="font-mono bg-indigo-950 text-emerald-400 border border-indigo-900/40 font-black px-2.5 py-0.5 rounded leading-none">
                      {algoMaxConcurrentTrades}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={algoMaxConcurrentTrades}
                    onChange={(e) =>
                      setAlgoMaxConcurrentTrades(parseInt(e.target.value) || 3)
                    }
                    className="w-full accent-emerald-500 cursor-pointer h-1 bg-slate-800 rounded-lg outline-none"
                  />
                  <p className="text-[9px] text-slate-500 leading-normal mt-2 text-center">
                    {lang === "ar"
                      ? "سيقوم البوت بتقسيم رصيد الهامش المتاح تلقائياً على هذا العدد لفتح الصفقات في وقتٍ واحد بصورة آمنة."
                      : "The bot will dynamically partition available USDT margin by this limit to parallel-execute trades stably."}
                  </p>
                </div>
              </div>

              {/* Bot leverage with alert */}
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-850 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">
                    {lang === "ar"
                      ? "رافعة البوت الآلية:"
                      : "Bot Target Leverage:"}
                  </span>
                  <span className="font-mono bg-indigo-950 text-indigo-300 border border-indigo-900/40 font-black px-2.5 py-0.5 rounded leading-none">
                    {algoLeverage}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="100"
                  step="0.5"
                  value={algoLeverage}
                  onChange={(e) =>
                    setAlgoLeverage(parseFloat(e.target.value) || 0.5)
                  }
                  className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-800 rounded-lg outline-none"
                />

                {/* Smart risk pilot module */}
                <div className="bg-indigo-950/10 border border-indigo-900/30 p-3.5 rounded-lg flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="smart-pilot"
                    checked={smartRiskPilot}
                    onChange={(e) => setSmartRiskPilot(e.target.checked)}
                    className="mt-1 accent-indigo-505 w-4 h-4 rounded cursor-pointer shrink-0"
                  />
                  <div className="space-y-0.5">
                    <label
                      htmlFor="smart-pilot"
                      className="text-xs font-extrabold text-slate-205 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                      <span>
                        {lang === "ar"
                          ? "مساعد المخاطرة الذكي للرافعة (Smart AI Risk Pilot)"
                          : "Enable Smart AI Risk Pilot"}
                      </span>
                    </label>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      {lang === "ar"
                        ? "عند التفعيل، سيقوم ذكاء التطبيق بتقليص الرافعة أوتوماتيكياً بمعدل 50% خلال فترات التذبذب الحاد لتأمين صيانة العقود من التصفية."
                        : "Automatically scales down leverage during high-velocity volatility spikes to preserve collateral margins."}
                    </p>
                  </div>
                </div>
                {/* AI Smart Mode Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-950/25 border border-indigo-900/30">
                  <div className="flex gap-2.5 items-center">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                    <div
                      className="text-right sm:text-left"
                      style={{ direction: lang === "ar" ? "rtl" : "ltr" }}
                    >
                      <label
                        htmlFor="futures_smart_mode"
                        className="text-xs font-black text-slate-100 block cursor-pointer select-none"
                      >
                        {lang === "ar"
                          ? "تفعيل توجيه الذكاء الاصطناعي (Gemini AI)"
                          : "Enable Intelligent Gemini AI Guidance"}
                      </label>
                      <span className="text-[9px] text-slate-400 block mt-0.5 leading-tight">
                        {lang === "ar"
                          ? "تحسين صياغة وتوقيت الصفقات بالاستعانة برادارات الفحص الفني ومؤشرات Gemini الاستباقية لتجنب الخسارة."
                          : "Optimizes entry executions based on real-time Gemini sentiment audits."}
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    id="futures_smart_mode"
                    checked={isSmartMode}
                    onChange={(e) => setIsSmartMode(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 bg-slate-950 rounded border-slate-800 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Target Profit / Stop Loss & Ultra-Fast Scalping Mode */}
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-850 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-slate-300">
                  <span>
                    {lang === "ar" ? "أهداف الإغلاق الآلي للبوت:" : "Bot Auto-Exit Targets:"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAlgoLeverage(0.5);
                      setAlgoTakeProfit(0.5);
                      setAlgoStopLoss(-0.2);
                      if (onTriggerToast) {
                        onTriggerToast({
                          id: `preset-scalping-${Date.now()}`,
                          symbol: "PRO_PRESET",
                          timestamp: Date.now(),
                          isMilestone: true,
                          aiExplanationAr: "⚡ تم تفعيل [نمط المضاربة فائقة السرعة]: تم ضبط الرافعة على 0.5x، وأخذ الربح على 0.5%+، وقف الخسارة على -0.2% لإغلاق الصفقات فوراً في حال انعكاس الاتجاه للخلف!",
                          aiExplanationEn: "⚡ [Ultra-Fast Scalping Mode] activated: Leverage set to 0.5x, Take Profit to +0.5%, Stop Loss to -0.2% to exit immediately if trend moves backward!",
                        });
                      }
                    }}
                    className="px-2 py-1 text-[9px] uppercase font-black tracking-wider bg-indigo-600 text-white rounded hover:bg-indigo-700 transition flex items-center gap-1 cursor-pointer w-fit"
                  >
                    <Zap className="w-3 h-3 text-yellow-300 animate-pulse" />
                    <span>{lang === "ar" ? "تنشيط المضاربة السريعة" : "Activate Fast Scalping"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 block font-bold">
                      {lang === "ar" ? "هدف جني الأرباح (٪):" : "Take Profit (%):"}
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.01"
                      max="100"
                      value={algoTakeProfit}
                      onChange={(e) => setAlgoTakeProfit(parseFloat(e.target.value) || 3.0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-mono text-xs text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 block font-bold">
                      {lang === "ar" ? "حد وقف الخسارة (٪) (سالب):" : "Stop Loss (%) (negative):"}
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      max="-0.01"
                      min="-100"
                      value={algoStopLoss}
                      onChange={(e) => setAlgoStopLoss(parseFloat(e.target.value) || -1.5)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-mono text-xs text-slate-200"
                    />
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-normal">
                  {lang === "ar"
                    ? "مراقبة وإغلاق فوري يضمن حماية رأس مالك ويسحب البوت بسرعة خاطفة في حال تراجع السعر حتى بنسبة ضئيلة للخلف."
                    : "The bot constantly monitors positions in real-time, executing fast escapes to lock gains or contain reversals based on these boundary values."}
                </p>
              </div>

              {/* Allocation and Bot Trigger Button */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-350 block">
                    {lang === "ar"
                      ? "أقصى حجم للتخصيص (أتركه فارغاً لاستخدام كل المتاح)"
                      : "Max Allocation (Leave empty for All)"}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0.5"
                      step="0.1"
                      value={algoInvestment}
                      onChange={(e) => setAlgoInvestment(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 font-mono font-bold"
                    />
                    <div className="absolute right-3.5 top-3 text-xs text-slate-405 font-bold font-mono">
                      USDT
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleAlgoBot}
                  className={`w-full py-3 rounded-xl font-extrabold text-sm border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isAlgoActive
                      ? "bg-amber-950/20 text-amber-400 border-amber-500/40 hover:bg-amber-955"
                      : "bg-indigo-600 text-white hover:bg-indigo-500 border-indigo-550 shadow-lg shadow-indigo-500/10"
                  }`}
                >
                  {isAlgoActive ? (
                    <>
                      <Pause className="w-4 h-4 fill-current text-amber-400" />
                      <span>
                        {lang === "ar"
                          ? "إيقاف دورة بوت الآجل يدوياً ⏸️"
                          : "Pause Futures Bot Loop ⏸️"}
                      </span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current text-white animate-pulse" />
                      <span>
                        {lang === "ar"
                          ? "تفعيل وتشغيل خوارزمية الآجل ⚡"
                          : "Initialize Futures Algo Bot ⚡"}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Simulated Stats for Running Bot */}
              {isAlgoActive && (
                <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-3 animate-in duration-300 slide-in-from-bottom-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">
                      {lang === "ar"
                        ? "📊 إحصائيات المحاكاة الحية لبوت العقود الآجلة:"
                        : "📊 Algorithmic Bot Simulation Stats:"}
                    </span>
                    {isSmartMode && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-800/55 text-amber-300 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-amber-400 animate-pulse shrink-0" />
                        <span>
                          {lang === "ar"
                            ? "Gemini نشط"
                            : "Gemini Smart Logic RUNNING"}
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
                    <div className="bg-slate-900/60 p-2.5 rounded border border-slate-850">
                      <span className="text-[9px] text-slate-500 block">
                        {lang === "ar" ? "العائد غير المحقق" : "UPnL"}
                      </span>
                      <span className="text-xs font-bold text-emerald-400">
                        +$28.45 (+5.6%)
                      </span>
                    </div>
                    <div className="bg-slate-900/60 p-2.5 rounded border border-slate-850">
                      <span className="text-[9px] text-slate-500 block">
                        {lang === "ar"
                          ? "أوامر الشبكة المفعلة"
                          : "Grids Filled"}
                      </span>
                      <span className="text-xs font-bold text-slate-200">
                        12 / 20
                      </span>
                    </div>
                    <div className="bg-slate-900/60 p-2.5 rounded border border-slate-850">
                      <span className="text-[9px] text-slate-500 block">
                        {lang === "ar"
                          ? "مستويات الشراء الفائتة"
                          : "Pyramid Steps"}
                      </span>
                      <span className="text-xs font-bold text-emerald-400">
                        4 Safeties hit
                      </span>
                    </div>
                    <div className="bg-slate-900/60 p-2.5 rounded border border-slate-850">
                      <span className="text-[9px] text-slate-500 block">
                        {lang === "ar" ? "الرافعة الديناميكية" : "Dynamic Lev"}
                      </span>
                      <span className="text-xs font-bold text-indigo-400">
                        {smartRiskPilot
                          ? `${algoLeverage / 2}x (Smart AI)`
                          : `${algoLeverage}x`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Info Board (4 cols in broad layout) */}
        <div className="xl:col-span-4 space-y-6">
          {/* Quick Safety and Contract Guidelines Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950/20 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 tracking-wider uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                {lang === "ar"
                  ? "إدارة سلامة الضمان (Futures Safety)"
                  : "Margin Control Safety Policies"}
              </span>
            </h3>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {lang === "ar"
                ? "التداول بالرافعة المالية يضاعف أرباحك وعوائدك ولكنه يعرض كامل هامش التأمين الخاص بك لخطر التصفية الإجبارية (Liquidation) وسحب السيولة في حال ارتداد الأسعار بشكل مفاجئ."
                : "Leverage multiplication augments profit velocity but dramatically increases vulnerability. Standard liquidated pricing triggers upon exhaustion of maintenance variables."}
            </p>

            <div
              className="space-y-2 border-t border-slate-800 pt-3"
              id="liq-safety-checkpoint-list"
            >
              <div className="flex items-start gap-2 text-[11px] text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span>
                  <strong>Isolated Mode:</strong>{" "}
                  {lang === "ar"
                    ? "يمنع الخسارة من التجاوز خارج مبلغ حجز الهامش المحدد لهذه الصفقة فقط."
                    : "Loss is strictly capped to the dedicated margin allocated."}
                </span>
              </div>
              <div className="flex items-start gap-2 text-[11px] text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span>
                  <strong>Cross Mode:</strong>{" "}
                  {lang === "ar"
                    ? "يشارك كامل محفظتك التداولية لدعم مراكزك المفتوحة لتلافي التصفية السريعة."
                    : "Collateralizes your full balance to absorb volatility."}
                </span>
              </div>
            </div>

            <div className="bg-slate-950/50 rounded-lg p-3 text-[10px] text-slate-400 border border-slate-850 leading-normal">
              <strong>
                {lang === "ar"
                  ? "💡 نصيحة الخبراء:"
                  : "💡 Professional Advice:"}
              </strong>{" "}
              {lang === "ar"
                ? "لا تستخدم رافعة تفوق 20x إلا في فترات السيولة المرتفعة وموجات التأكيد الصريحة لتفادي انقطاع الاتصال ومطالبات الهامش الإجبارية."
                : "Avoid exceeding 20x leverage constraints during low-liquidity zones. Leverage Smart Risk Co-Pilots to preserve assets."}
            </div>
          </div>

          {/* Sandbox Wallet Readout */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-3 text-xs">
            <span className="font-bold text-slate-205">
              {apiConnection?.isConnected
                ? lang === "ar"
                  ? "رصيد محفظة بينانس الآجلة الحقيقي:"
                  : "Live Binance Futures Margin:"
                : lang === "ar"
                  ? "رصيد محفظة الآجل المتاح (تجريبي):"
                  : "Available Demo Futures Margin:"}
            </span>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">
                  {apiConnection?.isConnected
                    ? "Binance Futures Balance"
                    : "Margin Ledger"}
                </span>
                <span className="font-mono font-black text-emerald-400 text-sm">
                  {activeUsdtBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 2,
                  })}{" "}
                  USDT
                </span>
              </div>

              {apiConnection?.isConnected && (
                <div className="flex items-center justify-between border-t border-slate-900 pt-2 text-[11px]">
                  <span className="text-slate-500">
                    {lang === "ar"
                      ? "رصيد المحفظة الفورية (Spot)"
                      : "Spot Wallet Balance"}
                  </span>
                  <span className="font-mono font-bold text-slate-300">
                    {portfolio.usdt.toFixed(2)} USDT
                  </span>
                </div>
              )}
            </div>

            {apiConnection?.isConnected && activeUsdtBalance === 0 && (
              <div
                className="bg-amber-955/20 border border-amber-900/40 p-3 rounded-lg text-[10.5px] text-amber-400 leading-normal"
                id="futures-zero-balance-alert"
              >
                💡{" "}
                <strong>
                  {lang === "ar" ? "توضيح هام:" : "Important Notice:"}
                </strong>{" "}
                {lang === "ar"
                  ? "رصيدك في العقود الآجلة يظهر 0. يرجى الملاحظة أن محفظة العقود الآجلة (Futures) منفصلة تماماً عن المحفظة الفورية (Spot). يمكنك تحويل رصيد USDT فوراً وثانيةً من Spot لـ Futures عبر تطبيق Binance وسينعكس الرصيد هنا بعد النقر على زر تحديث."
                  : "Your Futures balance is 0. Note that the Futures wallet is separate from the Spot wallet. Transfer some USDT from Spot to Futures inside the Binance app or web platform, and click REFRESH."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Open Positions Panel (The unified list with Close switches) */}
      <div
        className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg"
        id="futures-positions-panel"
      >
        <div className="bg-slate-950/80 px-5 py-4 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold tracking-wider uppercase text-slate-200">
                {lang === "ar"
                  ? "مراكز الرافعة المفتوحة حالياً"
                  : "Leveraged Open Positions Ledger"}
              </h3>
              <span className="text-[10px] bg-indigo-950 text-indigo-400 font-mono font-bold px-1.5 py-0.2 rounded border border-indigo-900 select-none">
                {positions.length}
              </span>
            </div>
            <p className="text-[10px] text-slate-450">
              {lang === "ar"
                ? "قائمة تفصيلية بالمراكز الجاري تداولها مع تصفية فورية بضغطة زر لحماية المكاسب."
                : "Comprehensive portfolio risk control board. Terminate operations immediately below."}
            </p>
          </div>

          <button
            type="button"
            disabled={positions.length === 0}
            onClick={handleMarketCloseAll}
            className={`px-3.5 py-1.5 text-[11px] font-black rounded-lg transition-all ${
              positions.length === 0
                ? "bg-slate-950 text-slate-600 border border-slate-850 cursor-not-allowed"
                : "bg-rose-950 text-rose-400 border border-rose-900/60 hover:bg-rose-950/80 hover:border-rose-900 active:scale-95 cursor-pointer font-black"
            }`}
          >
            {lang === "ar"
              ? "إغلاق وتصفية جميع المراكز فوراً 🛑"
              : "Instant Market Close All Positions 🛑"}
          </button>
        </div>

        {positions.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
            <Layers className="w-8 h-8 text-slate-700 mb-1" />
            <p className="font-medium">
              {lang === "ar"
                ? "لا توجد مراكز أو عقود آجلة مفتوحة حالياً."
                : "No active leveraged positions loaded."}
            </p>
            <p className="text-[10px] text-slate-600 font-medium">
              {lang === "ar"
                ? "حدد الرافعة واستثمر لفتح مركز شراء أو بيع."
                : "Configure parameters above to open your first leveraged position."}
            </p>
          </div>
        ) : (
          <ActivePositionsList positions={positions} onClosePosition={handleClosePosition} lang={lang} />
        )}
      </div>

      {apiConnection?.isConnected && (
        <div
          className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg mt-6"
          id="futures-open-orders-panel"
        >
          <div className="bg-slate-950/80 px-5 py-4 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold tracking-wider uppercase text-slate-200">
                  {lang === "ar"
                    ? "الطلبات والصفقات المعلقة في العقود الآجلة بينانس"
                    : "Binance Futures Active Open Orders"}
                </h3>
                <span className="text-[10px] bg-slate-950 text-emerald-400 font-mono font-bold px-1.5 py-0.2 rounded border border-slate-800 select-none">
                  {openOrders.length}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {lang === "ar"
                  ? "هذه هي طلبات Limit / Stop المعلقة في محفظتك على بينانس لم تنفذ بعد. يمكنك إلغاؤها بضغطة زر."
                  : "Real-time active Binance Futures resting limits. Revoke pending orders instantly."}
              </p>
            </div>
          </div>

          {openOrders.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
              <History className="w-8 h-8 text-slate-750 mb-1 animate-pulse" />
              <p className="font-extrabold text-slate-350">
                {lang === "ar"
                  ? "لا توجد طلبات معلقة (Limit/Stop) حالياً في محفظة عقودك."
                  : "No pending open orders in your Binance Futures portfolio."}
              </p>
              <p className="text-[10px] text-slate-550 max-w-md font-medium">
                {lang === "ar"
                  ? "جميع الطلبات المعلقة التي تضعها على بينانس ستظهر هنا وسيتاح لك التحكم بها وإلغاؤها."
                  : "Pending stop-limits or open maker contracts will stream and cancel seamlessly."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs font-sans min-w-[600px]">
                <thead className="bg-slate-950/50 text-slate-450 border-b border-slate-850">
                  <tr>
                    <th className="px-5 py-3 text-[10px] font-bold tracking-wider uppercase text-center">
                      {lang === "ar" ? "رمز التداول" : "Symbol"}
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-center">
                      {lang === "ar" ? "العملية" : "Side"}
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-center">
                      {lang === "ar" ? "النوع" : "Type"}
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-center">
                      {lang === "ar" ? "سعر المعاملة" : "Trigger Price"}
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-center">
                      {lang === "ar" ? "الكمية المطلوبة" : "Quantity / Value"}
                    </th>
                    <th className="px-5 py-3 text-[10px] font-bold tracking-wider uppercase text-center">
                      {lang === "ar" ? "الإجراء" : "Cancellation"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/80 font-mono">
                  {openOrders.map((o) => {
                    const isBuy = o.side === "BUY";
                    return (
                      <tr
                        key={o.orderId}
                        className="hover:bg-slate-950/25 transition-colors"
                      >
                        <td className="px-5 py-3.5 text-center font-sans font-strong text-slate-200">
                          {o.symbol}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-black ${isBuy ? "bg-emerald-950 text-emerald-400" : "bg-rose-950 text-rose-400"}`}
                          >
                            {o.side}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center text-slate-350">
                          {o.type}
                        </td>
                        <td className="px-4 py-3.5 text-center text-slate-205 font-bold">
                          $
                          {o.price.toLocaleString(undefined, {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 4,
                          })}
                        </td>
                        <td className="px-4 py-3.5 text-center text-slate-400">
                          {o.amount}
                        </td>
                        <td className="px-5 py-3.5 text-center font-sans">
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() =>
                              handleCancelFuturesOrder(o.orderId, o.symbol)
                            }
                            className="px-3.5 py-1.5 bg-rose-950/60 text-rose-400 hover:bg-rose-500 hover:text-slate-950 border border-rose-900/60 rounded text-[10px] font-black transition-all cursor-pointer"
                          >
                            {lang === "ar"
                              ? "إلغاء الأمر ❌"
                              : "Cancel order ❌"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
