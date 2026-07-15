/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

declare global {
  interface Window {
    lastApiErrorToastTime?: number;
  }
}
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MarketPair,
  TradingBot,
  TradeOrder,
  ApiConnection,
  ToastNotification,
  PriceAlert,
  OrderStatus,
  FuturesPosition,
} from "./types";
import { INITIAL_PAIRS, ARABIC_DICT } from "./utils/marketData";
import Header from "./components/Header";
import InteractiveChart from "./components/InteractiveChart";
import { evaluateTradeDecision, EngineInputs, recordTrade, TradeRecord } from "./engine";
import SpotTrading from "./components/SpotTrading";
import Backtester from "./components/Backtester";
import SecurityManager from "./components/SecurityManager";
import AIAnalyst from "./components/AIAnalyst";
import OwnerDashboard from "./components/OwnerDashboard";
import ToastList from "./components/ToastList";
import MarketGauge from "./components/MarketGauge";
import PriceAlertManager from "./components/PriceAlertManager";
import MarketSentimentIndicator from "./components/MarketSentimentIndicator";
import OrderHistory from "./components/OrderHistory";
import PortfolioOverview from "./components/PortfolioOverview";

import FuturesTrading from "./components/FuturesTrading";
import WhaleTracker from "./components/WhaleTracker";
import HamzaLiveMarkets from "./components/HamzaLiveMarkets";

import NotificationCenter from "./components/NotificationCenter";
import {
  TrendingUp,
  Award,
  Coins,
  Percent,
  Cpu,
  Activity,
  ShieldAlert,
  Bell,
  BellOff,
  Play,
  Pause,
  Zap,
  X,
} from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  auth,
  loginWithGoogle,
  logout,
  db,
  registerWithEmail,
  loginWithEmailProvider,
  resetPassword,
} from "./lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  increment,
} from "firebase/firestore";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip as RechartsTooltip,
} from "recharts";

// Helper to enforce precision rules for Binance api globally
export const formatPrecision = (qty: number, symbol: string, p: number) => {
  const n = symbol.toUpperCase();
  if (n.includes("BTC") || n.includes("ETH")) return parseFloat(qty.toFixed(3));
  if (n.includes("SOL") || n.includes("BNB")) return parseFloat(qty.toFixed(2));
  if (p < 1) return parseFloat(qty.toFixed(0)); // Meme coins
  return parseFloat(qty.toFixed(1)); // Altcoins
};

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [userData, setUserData] = useState<any>(null);
  const [emailForSignIn, setEmailForSignIn] = useState<string>("");
  const [passwordForSignIn, setPasswordForSignIn] = useState<string>("");
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">(
    "login",
  );
  const [authError, setAuthError] = useState<string>("");
  const [authSuccess, setAuthSuccess] = useState<string>("");
  const [mathA, setMathA] = useState(Math.floor(Math.random() * 10) + 1);
  const [mathB, setMathB] = useState(Math.floor(Math.random() * 10) + 1);
  const [mathAnswer, setMathAnswer] = useState("");

  useEffect(() => {
    if (user) {
      const storedUid = localStorage.getItem("almoharif_user_uid");
      if (storedUid !== user.uid) {
        // User switched or fresh login! Clear all local preferences/API keys to start from zero
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (
            key &&
            key.startsWith("almoharif_") &&
            key !== "almoharif_user_uid"
          ) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
        localStorage.setItem("almoharif_user_uid", user.uid);
        window.location.reload();
        return;
      }

      const unsub = onSnapshot(
        doc(db, "users", user.uid),
        (docRef) => {
          if (docRef.exists()) {
            setUserData(docRef.data());
          }
        },
        (error) => {
          console.warn("User data snapshot error:", error);
        },
      );
      return () => unsub();
    } else {
      setUserData(null);
    }
  }, [user]);

  // Localization setup (default to Arabic 'ar' as requested, saved to local storage)
  const [lang, setLang] = useState<"ar" | "en">(() => {
    const saved = localStorage.getItem("almoharif_lang");
    return (saved === "ar" || saved === "en") ? saved : "ar";
  });

  useEffect(() => {
    localStorage.setItem("almoharif_lang", lang);
  }, [lang]);

  // Day/Night (Light/Dark) theme state
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("almoharif_theme");
    return saved === "light" ? "light" : "dark";
  });

  useEffect(() => {
    localStorage.setItem("almoharif_theme", theme);
  }, [theme]);

  // Automated whale trading integrations and full market scanner controls
  const [whaleTradingEnabled, setWhaleTradingEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("almoharif_whale_trading_enabled");
    return saved === null ? true : saved === "true";
  });

  const [manualWatchlistScannerEnabled, setManualWatchlistScannerEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("almoharif_manual_watchlist_scanner");
    return saved === null ? true : saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("almoharif_whale_trading_enabled", String(whaleTradingEnabled));
    localStorage.setItem("almoharif_manual_watchlist_scanner", String(manualWatchlistScannerEnabled));
  }, [whaleTradingEnabled, manualWatchlistScannerEnabled]);

  // New Simulation control switches (persistently saved)
  const [simulationsEnabled, setSimulationsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("almoharif_simulations_enabled");
    return saved === null ? true : saved === "true"; // Defaults to true
  });

  useEffect(() => {
    localStorage.setItem(
      "almoharif_simulations_enabled",
      String(simulationsEnabled),
    );
  }, [simulationsEnabled]);

  const simulationsEnabledRef = useRef<boolean>(simulationsEnabled);
  useEffect(() => {
    simulationsEnabledRef.current = simulationsEnabled;
  }, [simulationsEnabled]);

  // Screen Toast alerts popup muting control (persistently saved - defaults to true for quiet professional trading)
  const handleDismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const [toastsMuted, setToastsMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem("almoharif_toasts_muted");
    return saved === null ? true : saved === "true"; // Defaults to true
  });

  useEffect(() => {
    localStorage.setItem("almoharif_toasts_muted", String(toastsMuted));
  }, [toastsMuted]);

  // Shared manual trading states for the Quick Buy ticker shortcut button
  const [manualLeverage, setManualLeverage] = useState<number>(() => {
    const saved = localStorage.getItem("almoharif_manual_leverage");
    return saved ? parseInt(saved, 10) : 1;
  });

  const [quickBuyAmountUsdt, setQuickBuyAmountUsdt] = useState<number>(() => {
    const saved = localStorage.getItem("almoharif_quick_buy_amount");
    return saved ? parseFloat(saved) : 15;
  });

  useEffect(() => {
    localStorage.setItem("almoharif_manual_leverage", String(manualLeverage));
  }, [manualLeverage]);

  useEffect(() => {
    localStorage.setItem("almoharif_quick_buy_amount", String(quickBuyAmountUsdt));
  }, [quickBuyAmountUsdt]);

  const [quickScalpProtectorEnabled, setQuickScalpProtectorEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("almoharif_quick_scalp_protector");
    return saved !== "false"; // defaults to true
  });

  const [quickScalpScannerEnabled, setQuickScalpScannerEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("almoharif_quick_scalp_scanner_rebound");
    return saved === "true"; // defaults to false (manual start preferred)
  });

  const [reboundRadarTimeframe, setReboundRadarTimeframe] = useState<"1m" | "5m" | "15m" | "30m">(() => {
    const saved = localStorage.getItem("almoharif_rebound_radar_timeframe");
    return (saved as "1m" | "5m" | "15m" | "30m") || "5m";
  });

  const [quickScalpScannerLog, setQuickScalpScannerLog] = useState<any[]>(() => {
    const saved = localStorage.getItem("almoharif_quick_scalp_scanner_logs");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeScannedCoin, setActiveScannedCoin] = useState<string>("");

  useEffect(() => {
    localStorage.setItem("almoharif_quick_scalp_protector", String(quickScalpProtectorEnabled));
  }, [quickScalpProtectorEnabled]);

  useEffect(() => {
    localStorage.setItem("almoharif_rebound_radar_timeframe", reboundRadarTimeframe);
  }, [reboundRadarTimeframe]);

  useEffect(() => {
    localStorage.setItem("almoharif_quick_scalp_scanner_rebound", String(quickScalpScannerEnabled));
  }, [quickScalpScannerEnabled]);

  useEffect(() => {
    localStorage.setItem("almoharif_quick_scalp_scanner_logs", JSON.stringify(quickScalpScannerLog.slice(0, 50)));
  }, [quickScalpScannerLog]);

  const toastsMutedRef = useRef<boolean>(toastsMuted);
  useEffect(() => {
    toastsMutedRef.current = toastsMuted;
  }, [toastsMuted]);

  // System Update Notification tracker
  const [systemUpdate, setSystemUpdate] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      doc(db, "system", "update_notification"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const lastSeenVersion = parseInt(
            localStorage.getItem("almoharif_seen_update_ver") || "0",
            10,
          );
          if (data.version && data.version > lastSeenVersion) {
            setSystemUpdate(data);
          }
        }
      },
      (error) => {
        console.error("System update snapshot error: ", error);
      }
    );
    return () => unsub();
  }, [user]);

  const handleAcknowledgeUpdate = (reset: boolean) => {
    if (reset) {
      if (systemUpdate) {
        localStorage.setItem(
          "almoharif_seen_update_ver",
          String(systemUpdate.version)
        );
      }
      setSystemUpdate(null);
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          key.startsWith("almoharif_") &&
          key !== "almoharif_user_uid" &&
          key !== "almoharif_seen_update_ver"
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      if (systemUpdate) {
        localStorage.setItem(
          "almoharif_seen_update_ver",
          String(systemUpdate.version),
        );
      }
      setSystemUpdate(null);
    }
  };

  // Global Live vs Paper Trading mode toggle (persistent in localStorage)
  const [isLiveTrading, setIsLiveTrading] = useState<boolean>(() => {
    return localStorage.getItem("almoharif_is_live_trading") === "true";
  });

  useEffect(() => {
    localStorage.setItem("almoharif_is_live_trading", String(isLiveTrading));
  }, [isLiveTrading]);

  // Synchronized ref for tracking latest live trading setting in background intervals/hooks
  const isLiveTradingRef = useRef<boolean>(isLiveTrading);
  useEffect(() => {
    isLiveTradingRef.current = isLiveTrading;
  }, [isLiveTrading]);

  // Navigation
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Market Pairs feed with local storage persistence
  
      const [pairsRaw, setPairsRaw] = useState<MarketPair[]>(() => {
    const saved = localStorage.getItem("almoharif_market_pairs");
    const rawPairs = saved ? JSON.parse(saved) : INITIAL_PAIRS;
    const uniqueMap = new Map<string, MarketPair>();
    rawPairs.forEach((p: MarketPair) => {
      if (p && p.symbol) {
        uniqueMap.set(p.symbol, p);
      }
    });
    return Array.from(uniqueMap.values());
  });

  const pairs = pairsRaw;

  const setPairs = React.useCallback((val: any) => {
      setPairsRaw(val);
  }, []);

  const handleAddPair = (symbol: string) => {
    const formattedSymbol = symbol.toUpperCase().includes('/') ? symbol.toUpperCase() : `${symbol.toUpperCase()}/USDT`;
    
    // Check if pair already exists
    if (pairs.find(p => p.symbol === formattedSymbol)) return;

    const newPair: MarketPair = {
      symbol: formattedSymbol,
      name: formattedSymbol,
      currentPrice: 0,
      change24h: 0,
      high24h: 0,
      low24h: 0,
      volume24h: 0,
      baseAsset: formattedSymbol.split('/')[0],
      quoteAsset: 'USDT'
    };

    setPairs([...pairs, newPair]);
  };

  const [selectedPairIndex, setSelectedPairIndex] = useState<number>(() => {
    const savedIdx = localStorage.getItem("almoharif_selected_pair_index");
    if (savedIdx) {
      const idx = parseInt(savedIdx, 10);
      return isNaN(idx) ? 0 : idx;
    }
    return 0;
  });
  const activePair = pairs[selectedPairIndex] || pairs[0] || INITIAL_PAIRS[0];

  useEffect(() => {
    localStorage.setItem("almoharif_market_pairs", JSON.stringify(pairs));
  }, [pairs]);

  useEffect(() => {
    localStorage.setItem(
      "almoharif_selected_pair_index",
      String(selectedPairIndex),
    );
  }, [selectedPairIndex]);

  // Safely guard selected pair index from getting out-of-bounds
  useEffect(() => {
    if (selectedPairIndex >= pairs.length) {
      setSelectedPairIndex(Math.max(0, pairs.length - 1));
    }
  }, [pairs, selectedPairIndex]);

  const canTrade = userData?.permissions?.canTrade !== false;
  const isOwner = user?.email === "alamryhmzh7@gmail.com" || userData?.role === "OWNER";

  // Manual Orders Storage with local storage persistence
  const [orders, setOrders] = useState<TradeOrder[]>(() => {
    const saved = localStorage.getItem("almoharif_manual_orders");
    if (!saved) return [];

    const parsedOrders: TradeOrder[] = JSON.parse(saved);
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const filteredOrders = parsedOrders.filter(
      (order) => order.timestamp > thirtyDaysAgo
    );

    // If we removed orders, update localStorage immediately to reflect cleaned state
    if (filteredOrders.length !== parsedOrders.length) {
      localStorage.setItem("almoharif_manual_orders", JSON.stringify(filteredOrders));
    }

    return filteredOrders;
  });

  useEffect(() => {
    localStorage.setItem("almoharif_manual_orders", JSON.stringify(orders));
  }, [orders]);

  // Active Automated Bots list (defaults to empty [] to prevent fake spammy startup bots)
  const [activeBots, setActiveBots] = useState<TradingBot[]>(() => {
    const saved = localStorage.getItem("almoharif_active_bots");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("almoharif_active_bots", JSON.stringify(activeBots));
  }, [activeBots]);

  // Wallet Portfolio Balances
  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem("almoharif_portfolio");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Give the user 15000 default if they happen to be at exactly 0 from previous saves.
      if (parsed.usdt === 0 && (!parsed.futuresUsdt || parsed.futuresUsdt === 0)) {
        parsed.usdt = 10000;
        parsed.futuresUsdt = 5000;
      }
      return parsed;
    }
    return {
      usdt: 10000,
      futuresUsdt: 5000,
      btc: 0,
      eth: 0,
      sol: 0,
      bnb: 0,
    };
  });

  useEffect(() => {
    localStorage.setItem("almoharif_portfolio", JSON.stringify(portfolio));
  }, [portfolio]);

  // Lifted Futures Positions state for global Equity calculation
  const [futuresPositions, setFuturesPositions] = useState<FuturesPosition[]>(() => {
    const saved = localStorage.getItem("almoharif_futures_positions");
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("almoharif_futures_positions", JSON.stringify(futuresPositions));
  }, [futuresPositions]);

  // Real-time Futures Equity Calculation (Futures Wallet + Margin + Total uPNL)
  const [futuresEquity, setFuturesEquity] = useState<number>(portfolio.futuresUsdt);

  useEffect(() => {
    const totalPnl = futuresPositions.reduce((acc, p) => acc + (p.unrealizedPnl || 0), 0);
    // Total Futures Equity = Wallet Balance + Unrealized PNL
    // Wallet Balance (portfolio.futuresUsdt) already includes the margin held in positions
    const newEquity = parseFloat((portfolio.futuresUsdt + totalPnl).toFixed(4));
    
    // Only update if value changed to prevent unnecessary re-renders
    setFuturesEquity((prev) => (Math.abs(prev - newEquity) > 0.0001 ? newEquity : prev));
  }, [futuresPositions, portfolio.futuresUsdt]);

  // Sync positions PNL with real-time price feed in App.tsx (Optimized with Ref)
  const pairsRef = useRef<MarketPair[]>(pairs);
  useEffect(() => {
    pairsRef.current = pairs;
  }, [pairs]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFuturesPositions((prev) => {
        if (prev.length === 0) return prev;
        let changed = false;
        const next = prev.map((p) => {
          const match = pairsRef.current.find((pair) => pair.symbol === p.symbol);
          if (match && match.currentPrice !== p.currentPrice) {
            changed = true;
            
            // For live positions, we trust the server-side sync from FuturesTrading.tsx
            // Recalculating here using Spot prices causes significant discrepancies with Binance
            if (p.id.startsWith("pos-live-") && isLiveTrading) {
              return {
                ...p,
                currentPrice: match.currentPrice,
              };
            }

            const diff = match.currentPrice - p.entryPrice;
            const pnlDirection = p.side === "LONG" ? 1 : -1;
            const unrealPnl = diff * p.amount * pnlDirection;
            
            // ROE % = (Unrealized PNL / Initial Margin) * 100
            // Initial Margin = (Position Size * Entry Price) / Leverage
            const initialMargin = (p.amount * p.entryPrice) / p.leverage;
            const uPnlPercent = (unrealPnl / initialMargin) * 100;

            return {
              ...p,
              currentPrice: match.currentPrice,
              unrealizedPnl: unrealPnl,
              unrealizedPnlPercent: uPnlPercent,
            };
          }
          return p;
        });
        return changed ? next : prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []); // Run once, uses ref

  const handleFuturesUpdatePortfolio = useCallback((incUsdt: number, incBtc: number) => {
    setTimeout(() => {
      setPortfolio((p) => ({
        ...p,
        futuresUsdt: parseFloat((p.futuresUsdt + incUsdt).toFixed(2)),
        btc: parseFloat((p.btc + incBtc).toFixed(6)),
      }));
    }, 0);
  }, []);
  const handleAIUpdatePortfolio = useCallback((incUsdt: number, incAsset: number, assetName?: string) => {
    const lowerAssetName = (assetName || "btc").toLowerCase();
    setTimeout(() => {
      setPortfolio((p) => {
        const updated = { ...p };
        updated.usdt = parseFloat((p.usdt + incUsdt).toFixed(2));
        if (lowerAssetName in p) {
          const decimals = lowerAssetName === "btc" ? 6 : 4;
          const prevAssetVal = (p as any)[lowerAssetName] ?? 0;
          (updated as any)[lowerAssetName] = parseFloat(
            (prevAssetVal + incAsset).toFixed(decimals),
          );
        }
        return updated;
      });
    }, 0);
  }, []);

  const handleAIReboundCapture = useCallback(() => {
    setReboundStats((prev) => ({
      captures: prev.captures + 1,
      chances: prev.chances + (Math.random() > 0.5 ? 1 : 0),
    }));
  }, []);

  const [profitHistory, setProfitHistory] = useState<
    { time: string; profit: number; botsCount: number }[]
  >(() => {
    const now = new Date();
    const data = [];
    const initialBotProfit = 0;
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60 * 60 * 1050);
      const hourStr = d.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const simulatedBotsCount = i === 0 ? 0 : Math.max(1, Math.min(5, Math.round(2 + Math.sin(i * 0.5) * 2)));
      data.push({ time: hourStr, profit: 0, botsCount: simulatedBotsCount });
    }
    return data;
  });

  // Exchange API Connection state
  const [reboundStats, setReboundStats] = useState({
    captures: 14,
    chances: 18,
  });
  const [isAggressiveRebound, setIsAggressiveRebound] = useState<boolean>(() => {
    return localStorage.getItem("almoharif_is_aggressive_rebound") === "true";
  });

  useEffect(() => {
    localStorage.setItem("almoharif_is_aggressive_rebound", String(isAggressiveRebound));
  }, [isAggressiveRebound]);
  const [apiConnection, setApiConnection] = useState<ApiConnection>(() => {
    const saved = localStorage.getItem("almoharif_api_connection");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.telegramBotToken = parsed.telegramBotToken || "";
        parsed.telegramChatId = parsed.telegramChatId || "";
        
        return parsed;
      } catch (e) {
        // ignore JSON parse errors and fallback
      }
    }
    return {
      exchange: "Binance",
      apiKey: "",
      apiSecret: "",
      ipWhitelisting: false,
      withdrawalDisabled: true,
      readOnly: true,
      tradingEnabled: false,
      isConnected: false,
      lastTested: 0,
      telegramBotToken: "",
      telegramChatId: "",
      useTestnet: false,
    };
  });

  // State to track manual live balance synchronization
  const [isSyncingBalances, setIsSyncingBalances] = useState<boolean>(false);
  const [balanceSyncError, setBalanceSyncError] = useState<string | null>(null);
  const [futuresApiError, setFuturesApiError] = useState<string | null>(null);

  const handleSetFuturesApiError = useCallback((err: string | null) => {
    setTimeout(() => {
      setFuturesApiError(err);
    }, 0);
  }, []);

  // Dynamic custom coin/trading pair selection manager states
  const [isAddCoinOpen, setIsAddCoinOpen] = useState<boolean>(false);
  const [addCoinSearchQuery, setAddCoinSearchQuery] = useState<string>("");
  const [addCoinFeedback, setAddCoinFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    localStorage.setItem(
      "almoharif_api_connection",
      JSON.stringify(apiConnection),
    );
  }, [apiConnection]);

  // Toast notifications active storage
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Persistent notifications history log
  const [notificationsHistory, setNotificationsHistory] = useState<ToastNotification[]>(() => {
    const saved = localStorage.getItem("almoharif_notifications_history");
    return saved ? JSON.parse(saved) : [];
  });

  const handleClearNotificationsHistory = () => {
    setNotificationsHistory([]);
    localStorage.removeItem("almoharif_notifications_history");
  };

  // Local storage synchronized Price alerts configuration state
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    const saved = localStorage.getItem("almoharif_price_alerts");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("almoharif_price_alerts", JSON.stringify(priceAlerts));
  }, [priceAlerts]);

  // Synchronized refs for tracking latest state values safely in background timers and observers
  const activeBotsRef = useRef<TradingBot[]>(activeBots);
  const portfolioRef = useRef(portfolio);
  const priceAlertsRef = useRef<PriceAlert[]>(priceAlerts);
  const apiConnectionRef = useRef<ApiConnection>(apiConnection);
  const userRef = useRef<any>(user);
  const userDataRef = useRef<any>(userData);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  useEffect(() => {
    activeBotsRef.current = activeBots;
  }, [activeBots]);

  useEffect(() => {
    portfolioRef.current = portfolio;
  }, [portfolio]);

  useEffect(() => {
    priceAlertsRef.current = priceAlerts;
  }, [priceAlerts]);

  useEffect(() => {
    apiConnectionRef.current = apiConnection;
  }, [apiConnection]);

  // Handle to add a custom coin and dynamically validate it on Binance
  const handleAddCustomCoin = async (tokenSymbol: string) => {
    setAddCoinFeedback(null);
    const raw = tokenSymbol.toUpperCase().replace("/", "").trim();
    if (!raw) {
      setAddCoinFeedback({
        type: "error",
        text:
          lang === "ar"
            ? "⚠️ يرجى إدخال رمز العملة بشكل صحيح."
            : "⚠️ Please enter a valid currency ticker.",
      });
      return;
    }

    let base = raw;
    let parsedSymbol = "";
    if (raw.endsWith("USDT")) {
      base = raw.slice(0, -4);
      parsedSymbol = `${base}/USDT`;
    } else {
      parsedSymbol = `${raw}/USDT`;
    }

    if (pairs.some((p) => p.symbol === parsedSymbol)) {
      setAddCoinFeedback({
        type: "error",
        text:
          lang === "ar"
            ? `⚠️ العملة ${parsedSymbol} مضافة بالفعل في قائمة المراقبة.`
            : `⚠️ The pair ${parsedSymbol} is already active on your watch-list.`,
      });
      return;
    }

    try {
      // Validate with Binance server price lookup
      const url = `https://api.binance.com/api/v3/ticker/price?symbol=${base}USDT`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Not found");
      }
      const data = await res.json();
      const currentPrice = parseFloat(data.price) || 1.0;

      let arName = base;
      let enName = base;
      if (base === "XRP") {
        arName = "ريبل";
        enName = "Ripple";
      } else if (base === "DOGE") {
        arName = "دوج كوين";
        enName = "Dogecoin";
      } else if (base === "ADA") {
        arName = "كاردانو";
        enName = "Cardano";
      } else if (base === "LTC") {
        arName = "لايت كوين";
        enName = "Litecoin";
      } else if (base === "AVAX") {
        arName = "أفالانش";
        enName = "Avalanche";
      } else if (base === "DOT") {
        arName = "بولكادوت";
        enName = "Polkadot";
      } else if (base === "LINK") {
        arName = "تشينلينك";
        enName = "Chainlink";
      } else if (base === "SHIB") {
        arName = "شيبا إينو";
        enName = "Shiba Inu";
      } else if (base === "PEPE") {
        arName = "بيبي كوين";
        enName = "Pepe Coin";
      } else if (base === "SUI") {
        arName = "سوي نتورك";
        enName = "Sui Network";
      } else if (base === "FET") {
        arName = "ذكاء اصطناعي";
        enName = "Artificial Intelligence";
      } else {
        arName = `عملة ${base}`;
        enName = `${base} Token`;
      }

      const newPair: MarketPair = {
        symbol: parsedSymbol,
        name: `${enName} / ${arName}`,
        currentPrice: currentPrice,
        change24h: 0.0,
        high24h: currentPrice,
        low24h: currentPrice,
        volume24h: 10000000,
        baseAsset: base,
        quoteAsset: "USDT",
      };

      // Add to portfolio defaults if not present
      const baseLower = base.toLowerCase();
      if (!(baseLower in portfolio)) {
        setPortfolio((prev) => ({
          ...prev,
          [baseLower]: 0.0,
        }));
      }

      setPairs((prev) => {
        if (prev.some((p) => p.symbol === parsedSymbol)) {
          return prev;
        }
        return [...prev, newPair];
      });
      setAddCoinSearchQuery("");
      setAddCoinFeedback({
        type: "success",
        text:
          lang === "ar"
            ? `✅ تم إضافة ${parsedSymbol} بنجاح إلى شاشات التداول!`
            : `✅ Successfully added ${parsedSymbol} to the active watch-list!`,
      });

      handleTriggerToast({
        id: `toast-${Date.now()}-${Math.random().toString().substring(2, 7)}`,
        botId: "system",
        botType: "GRID",
        symbol: parsedSymbol,
        profit: 0.0,
        timestamp: Date.now(),
      });
    } catch (e) {
      setAddCoinFeedback({
        type: "error",
        text:
          lang === "ar"
            ? `❌ تعذر التحقق من العملة ${base}USDT على بينانس. تأكد من صحة الرمز العام.`
            : `❌ Currency pairing ${base}USDT could not be validated on Binance. Confirm spelling.`,
      });
    }
  };

  // Handle to remove an active stream/coin
  const handleRemoveCoin = (idxToRemove: number) => {
    if (pairs.length <= 1) {
      handleTriggerToast({
        id: `toast-${Date.now()}-${Math.random().toString().substring(2, 7)}`,
        botId: "price-alert",
        symbol: "SYSTEM",
        timestamp: Date.now(),
        isError: true,
        aiExplanationAr:
          "⚠️ يرجى الإبقاء على عملة تداول واحدة على الأقل في قائمة المراقبة.",
        aiExplanationEn:
          "⚠️ Please keep at least one active watch-list option.",
      });
      return;
    }

    const pairToRemove = pairs[idxToRemove];
    setPairs((prev) => prev.filter((_, idx) => idx !== idxToRemove));

    if (selectedPairIndex === idxToRemove) {
      setSelectedPairIndex(0);
    }

    handleTriggerToast({
      id: `toast-${Date.now()}-${Math.random().toString().substring(2, 7)}`,
      botId: "system",
      botType: "GRID",
      symbol: pairToRemove.symbol,
      profit: 0.0,
      timestamp: Date.now(),
    });
  };

  // Synthesise professional auditory chime for alerts
  const playAlertChime = () => {
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      const now = ctx.currentTime;
      // Ascending major chord sonic indicator
      playTone(587.33, now, 0.25); // D5
      playTone(698.46, now + 0.08, 0.25); // F5
      playTone(880.0, now + 0.16, 0.35); // A5
      playTone(1174.66, now + 0.24, 0.45); // D6
    } catch (e) {
      console.warn("Audio synthesis skipped:", e);
    }
  };

  // Helper to send beautiful, real-time Telegram alerts with custom ASCII charts (رسوم بيانية)
  const sendTelegramNotification = useCallback(async (toast: ToastNotification) => {
    const isOwner = userDataRef.current?.role === "OWNER" || userDataRef.current?.email === "alamryhmzh7@gmail.com" || user?.email === "alamryhmzh7@gmail.com";
    
    // Read from ref to always ensure we get the latest saved token/ID in real-time background threads
    const { telegramBotToken, telegramChatId } = apiConnectionRef.current || {};
    
    const isEmpty = !telegramBotToken || !telegramChatId;

    // Rule: Allow all users who have set valid telegram credentials to receive notifications.
    if (isEmpty) {
      console.log(
        "[Telegram Guard] Telegram notifications skipped: User did not configure telegram credentials.",
      );
      return;
    }

    const isAr = lang === "ar";
    let title = "🔔 <b>تنبيه منصة التداول الهجين (Al-Moharif Hybrid bot)</b>";
    let body = "";
    let asciiChart = "";

    if (toast.isError) {
      title = "❌ <b>فشل تنفيذ العملية (Execution Failure)</b>";
      body = isAr
        ? `⚠️ فشل تنفيذ العملية أو الصفقة المطلوبة.\n📊 الأصل المالي: <b>${toast.symbol}</b>\n\n📌 <b>السبب الفني والتعليمات:</b>\n${toast.aiExplanationAr || ""}`
        : `⚠️ Target execution or transaction failure.\n📊 Target Asset: <b>${toast.symbol}</b>\n\n📌 <b>Technical Error Reason:</b>\n${toast.aiExplanationEn || ""}`;
    } else if (toast.isVolatilityWarning) {
      title = "🚨 <b>تحذير تذبذب أسعار حاد (Volatility Incident)</b>";
      const percent = toast.volatilityChange || 0;
      const changeStr = `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`;

      body = isAr
        ? `⚠️ تم رصد انحراف أو هبوط خاطف مفاجئ في الأسواق المراقبة!\n📊 الأصل المالي: <b>${toast.symbol}</b>\n📈 نسبة الارتجاج: <b>${changeStr}</b>\n\n📌 <b>التحليل الفني والتعليمات المباشرة:</b>\n${toast.aiExplanationAr || ""}`
        : `⚠️ Sudden extreme price shock registered in exchange liquidity fields!\n📊 Target Asset: <b>${toast.symbol}</b>\n📈 Impact Margin: <b>${changeStr}</b>\n\n📌 <b>AI Technical Analysis & Advice:</b>\n${toast.aiExplanationEn || ""}`;

      if (percent < 0) {
        asciiChart = isAr
          ? `📉 <b>مخطط محاكاة الهبوط (Crash Curve Chart):</b>\n<code>${toast.volatilityPriceStart?.toFixed(1) || "100"} ──┐\n       └──┐\n          └───🛡️ ${toast.volatilityPriceEnd?.toFixed(1) || "80"} (${changeStr})</code>`
          : `📉 <b>Price Flash Drop Curve Chart:</b>\n<code>${toast.volatilityPriceStart?.toFixed(1) || "100"} ──┐\n       └──┐\n          └───🛡️ ${toast.volatilityPriceEnd?.toFixed(1) || "80"} (${changeStr})</code>`;
      } else {
        asciiChart = isAr
          ? `📈 <b>مخطط محاكاة الارتفاع (Spike Curve Chart):</b>\n<code>          ───🚀 ${toast.volatilityPriceEnd?.toFixed(1) || "120"} (${changeStr})\n       ┌──┘\n${toast.volatilityPriceStart?.toFixed(1) || "100"} ──┘</code>`
          : `📈 <b>Price Spike Curve Chart:</b>\n<code>          ───🚀 ${toast.volatilityPriceEnd?.toFixed(1) || "120"} (${changeStr})\n       ┌──┘\n${toast.volatilityPriceStart?.toFixed(1) || "100"} ──┘</code>`;
      }
    } else if (toast.symbol === "PORTFOLIO_LIQUIDATION") {
      title = "🛑 <b>إطلاق مفتاح تصفية الطوارئ (Emergency KILL SWITCH)</b>";
      const recoveredSum = toast.volatilityPriceStart
        ? toast.volatilityPriceStart.toFixed(2)
        : "0.00";

      body = isAr
        ? `⚡ <b>تم إطلاق تصفية الطوارئ بنجاح بنقرة واحدة!</b>\n🛡️ تم إغلاق وتسويه كافة صفقات ومراكز التداول المفتوحة فوراً وتجميد العقود لمنع تسييل المحفظة عند تذبذب السعر الفجائي.\n\n💰 المبلغ المالي المؤمن محلياً: <b>$${recoveredSum} USDT</b>`
        : `⚡ <b>Emergency Kill Switch was Dispatched Successfully!</b>\n🛡️ Terminated all running leverage/spot contracts instantly to guard against catastrophic margin liquidation.\n\n💰 Transferred Asset Value Protected: <b>$${recoveredSum} USDT</b>`;

      asciiChart = isAr
        ? `📋 <b>حصة تأمين المحفظة (Safety Guarantee Break):</b>\n<code>[████████████████████] 100% SECURED</code>\n<code>الرصيد المحرر: $${recoveredSum} USDT</code>\n<code>مستوى الأمان: 100% (أقصى درجات الحماية الاستباقية)</code>`
        : `📋 <b>Portfolio Safety Standing Visual Chart:</b>\n<code>[████████████████████] 100% SECURED</code>\n<code>Liquidated Balance: $${recoveredSum} USDT</code>\n<code>Vulnerability Risk: 0% (Fully Shielded)</code>`;
    } else if (toast.isMilestone) {
      title =
        "🏆 <b>إنجاز خط تداول واقتناص أرباح (Profit Milestone Reached)</b>";
      const profitVal = toast.profit ? toast.profit.toFixed(2) : "0.00";
      const mPercent = toast.milestonePercentage || 15;

      body = isAr
        ? `🎉 مبارك! تخطت أرباح صفقات التداول الهجين لزوج <b>${toast.symbol}</b> مستويات مذهلة بنسبة <b>${mPercent}%</b>!\n💸 الأرباح الصافية المحققة والمضافة: <b>+$${profitVal} USDT</b>`
        : `🎉 Congratulations! Your grid bot systems for <b>${toast.symbol}</b> surpassed custom targets of over <b>${mPercent}%</b>!\n💸 Pure Profit Transferred: <b>+$${profitVal} USDT</b>`;

      const filled = Math.min(10, Math.max(1, Math.round(mPercent / 5)));
      const empty = 10 - filled;
      const progress = "█".repeat(filled) + "░".repeat(empty);
      asciiChart = isAr
        ? `📊 <b>رادار مستويات الأرباح الفوري (Profit Progress Chart):</b>\n<code>[${progress}] ${mPercent}%</code>`
        : `📊 <b>Milestone Profit Progress Chart:</b>\n<code>[${progress}] ${mPercent}%</code>`;
    } else {
      title = "📊 <b>تنفيذ صفقة تداول آلية (Almoharif Trading Order)</b>";
      const profitVal = toast.profit ? toast.profit.toFixed(2) : "0.00";
      body = isAr
        ? `🤖 تم معالجة صفقة تداول ومطابقتها خوارزمياً!\n📊 زوج الأصول: <b>${toast.symbol}</b>\n🦾 الأداة المشغلة: <b>${toast.botType || "GRID"} Automatic</b>\n💵 أرباح الصفقة الفورية: <b>+${profitVal} USDT</b>` + (toast.aiExplanationAr ? `\n\n📌 <b>تأكيد وتوضيح الذكاء الاصطناعي:</b>\n${toast.aiExplanationAr}` : '')
        : `🤖 Algorithmic order successfully matched on target gateways!\n📊 Market Pair: <b>${toast.symbol}</b>\n🦾 Execution Module: <b>${toast.botType || "GRID"} Automatic</b>\n💵 Instant captured return: <b>+${profitVal} USDT</b>` + (toast.aiExplanationEn ? `\n\n📌 <b>AI Verdict & Analytics:</b>\n${toast.aiExplanationEn}` : '');

      asciiChart = isAr
        ? `📊 <b>درجة نجاح الصفقة (Capture Ratio Chart):</b>\n<code>[████████░░ 80%] SUCCESSFUL MATCH</code>`
        : `📊 <b>Order Execution Capture ratio:</b>\n<code>[████████░░ 80%] SUCCESSFUL MATCH</code>`;
    }

    const finalMessage = `${title}\n\n${body}\n\n${asciiChart}\n\n🤖 <i>إشعار آلي آمن ومباشر من خدمة الأمان لـ المحترف Al-Moharif</i>`;

    try {
      await fetch("/api/telegram/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botToken: telegramBotToken,
          chatId: telegramChatId,
          message: finalMessage,
        }),
      });
    } catch (err) {
      console.error(
        "[Telegram Guard] Failed to issue alert telegram message:",
        err,
      );
    }
  }, []);

  // Unified toast dispatch wrapper that additionally sends real-time Telegram alerts
  const handleTriggerToast = useCallback((toast: ToastNotification) => {
    setTimeout(() => {
      if (!toastsMutedRef.current) {
        setToasts((prev) => [toast, ...prev].slice(0, 5));
      }

      // Save to local notifications history (max 100 entries to prevent local storage size overflow)
      setNotificationsHistory((prev) => {
        const updated = [toast, ...prev].slice(0, 100);
        localStorage.setItem("almoharif_notifications_history", JSON.stringify(updated));
        return updated;
      });

      sendTelegramNotification(toast);
    }, 0);
  }, [sendTelegramNotification]);

  // Keep track of the historical prices of pairs to detect sharp changes in price (>=2.0% within <60s)
  const priceHistoryRef = useRef<
    Record<string, { timestamp: number; price: number }[]>
  >({});
  const priceHistory5mRef = useRef<
    Record<string, { timestamp: number; price: number }[]>
  >({});
  const priceHistory15mRef = useRef<
    Record<string, { timestamp: number; price: number }[]>
  >({});
  const priceHistory30mRef = useRef<
    Record<string, { timestamp: number; price: number }[]>
  >({});
  const lastVolatilityTriggerRef = useRef<Record<string, number>>({});
  const peakPricesRef = useRef<Record<string, number>>({});

  // Browser-native push notification dispatcher
  const dispatchBrowserNotification = (
    symbol: string,
    alertType: "PRICE" | "RSI",
    value: number,
    condition: "ABOVE" | "BELOW",
    currentValue: number,
  ) => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      const title =
        lang === "ar"
          ? "🚨 تم بلوغ السعر المستهدف!"
          : "🚨 Price Alert Triggered!";
      const displayValue = alertType === 'PRICE' ? '$' + value : value;
      const displayCurrent = alertType === 'PRICE' ? '$' + currentValue : currentValue;
      const msgEn = `${symbol} has crossed ${condition === "ABOVE" ? "above" : "below"} your target of ${displayValue}! Current: ${displayCurrent}`;
      const msgAr = `تخطى زوج ${symbol} حدك المستهدف ${condition === "ABOVE" ? "صعوداً" : "هبوطاً"} عند ${displayValue}! السعر الحالي: ${displayCurrent}`;

      try {
        new Notification(title, {
          body: lang === "ar" ? msgAr : msgEn,
          icon: "/favicon.ico",
          tag: `alert-${symbol}-${value}`,
        });
      } catch (err) {
        console.warn("Native notification issue:", err);
      }
    }
  };

  // Real-time surveillance of prices and alert conditions trigger
  useEffect(() => {
    const currentAlerts = priceAlertsRef.current;
    if (currentAlerts.length === 0) return;

    let changed = false;
    const triggered: PriceAlert[] = [];

    const updatedAlerts = currentAlerts.map((alert) => {
      if (alert.isTriggered) return alert;

      const currentPair = pairs.find((p) => p.symbol === alert.symbol);
      if (!currentPair) return alert;

      let reached = false;
      const currentValue = alert.type === 'PRICE' ? currentPair.currentPrice : (currentPair as any).rsi;
      if (
        alert.condition === "ABOVE" &&
        currentValue >= alert.value
      ) {
        reached = true;
      } else if (
        alert.condition === "BELOW" &&
        currentValue <= alert.value
      ) {
        reached = true;
      }

      if (reached) {
        triggered.push(alert);
        changed = true;
        return { ...alert, isTriggered: true };
      }

      return alert;
    });

    if (changed) {
      setPriceAlerts(updatedAlerts);

      triggered.forEach(async (alert) => {
        const livePair = pairs.find((p) => p.symbol === alert.symbol);
        const currentValue = alert.type === 'PRICE' ? livePair?.currentPrice : (livePair as any)?.rsi;
        
        let aiAnalysis = "";
        try {
            const resp = await fetch('/api/gemini/alert-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    symbol: alert.symbol,
                    type: alert.type,
                    value: alert.value,
                    condition: alert.condition,
                    currentValue,
                    lang: 'ar'
                })
            });
            const data = await resp.json();
            aiAnalysis = data.reply || "";
        } catch (e) {
            console.error('AI alert analysis failed', e);
        }

        // Trigger Audio Chime
        playAlertChime();

        // Dispatch Native Push
        dispatchBrowserNotification(
          alert.symbol,
          alert.type,
          alert.value,
          alert.condition,
          currentValue || 0,
        );

        // Deliver App toast with AI analysis
        handleTriggerToast({
          id: `alert-toast-${Date.now()}-${Math.random().toString().substring(2, 7)}`,
          botId: "price-alert",
          botType: "GRID", // Or handle dynamically
          symbol: alert.symbol,
          profit: 0,
          timestamp: Date.now(),
          condition: alert.condition,
          type: alert.type,
          value: alert.value,
          aiExplanationAr: `⚠️ ${alert.symbol} alert triggered!\n\n${aiAnalysis}`
        } as any);
      });
    }
  }, [pairs]);

  // Surveillance of sharp price fluctuations (>= 2.0% within less than 1 minute)
  useEffect(() => {
    if (!pairs || pairs.length === 0) return;
    const now = Date.now();
    const history = priceHistoryRef.current;

    pairs.forEach((pair) => {
      // 1-minute history
      if (!history[pair.symbol]) {
        history[pair.symbol] = [];
      }
      const list = history[pair.symbol];
      list.push({ timestamp: now, price: pair.currentPrice });
      const filtered = list.filter((item) => now - item.timestamp <= 60000);
      history[pair.symbol] = filtered;

      // 5-minute history
      if (!priceHistory5mRef.current[pair.symbol]) {
        priceHistory5mRef.current[pair.symbol] = [];
      }
      const list5m = priceHistory5mRef.current[pair.symbol];
      list5m.push({ timestamp: now, price: pair.currentPrice });
      priceHistory5mRef.current[pair.symbol] = list5m.filter((item) => now - item.timestamp <= 300000);

      // 15-minute history
      if (!priceHistory15mRef.current[pair.symbol]) {
        priceHistory15mRef.current[pair.symbol] = [];
      }
      const list15m = priceHistory15mRef.current[pair.symbol];
      list15m.push({ timestamp: now, price: pair.currentPrice });
      priceHistory15mRef.current[pair.symbol] = list15m.filter((item) => now - item.timestamp <= 900000);

      // 30-minute history
      if (!priceHistory30mRef.current[pair.symbol]) {
        priceHistory30mRef.current[pair.symbol] = [];
      }
      const list30m = priceHistory30mRef.current[pair.symbol];
      list30m.push({ timestamp: now, price: pair.currentPrice });
      priceHistory30mRef.current[pair.symbol] = list30m.filter((item) => now - item.timestamp <= 1800000);

      // Look for a point in filtered where price has changed by >= 2.0%
      if (filtered.length < 2) return;
      const initialPoint = filtered[0]; // oldest point in last 60 seconds
      const priceDiffPercent =
        ((pair.currentPrice - initialPoint.price) / initialPoint.price) * 100;

      if (Math.abs(priceDiffPercent) >= 2.0) {
        // Prevent triggering mock alert popups if simulations are off or muted
        if (!simulationsEnabledRef.current || toastsMutedRef.current) {
          return;
        }

        // Prevent triggering multiple alerts in a short span (e.g. 30 seconds) to avoid spam
        const lastTrigger = lastVolatilityTriggerRef.current[pair.symbol] || 0;
        if (now - lastTrigger > 30000) {
          lastVolatilityTriggerRef.current[pair.symbol] = now;

          // Trigger Chime
          playAlertChime();

          // Fetch highly structured AI explanatory analysis from server-side secure Gemini proxy
          fetch("/api/gemini/volatility-analysis", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              symbol: pair.symbol,
              changePercent: priceDiffPercent,
              priceStart: initialPoint.price,
              priceEnd: pair.currentPrice,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              handleTriggerToast({
                id: `volatility-${pair.symbol}-${Date.now()}`,
                botId: "volatility-warning",
                symbol: pair.symbol,
                timestamp: Date.now(),
                isVolatilityWarning: true,
                volatilityChange: priceDiffPercent,
                volatilityPriceStart: initialPoint.price,
                volatilityPriceEnd: pair.currentPrice,
                aiExplanationAr: data.explanation_ar,
                aiExplanationEn: data.explanation_en,
              });
            })
            .catch((err) => {
              console.error("Error generating AI volatility analysis:", err);
            });
        }
      }
    });
  }, [pairs]);

  const handleAddPriceAlert = (
    type: "PRICE" | "RSI",
    value: number,
    condition: "ABOVE" | "BELOW",
  ) => {
    const alert: PriceAlert = {
      id: `alert-${Math.random().toString().substring(2, 8)}`,
      symbol: activePair.symbol,
      type,
      value,
      condition,
      isTriggered: false,
      createdAt: Date.now(),
    };
    setPriceAlerts((prev) => [alert, ...prev]);
  };

  const handleDeletePriceAlert = (id: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const triggerVolatilityMockEvent = (isUpward: boolean) => {
    setPairs((prevPairs) =>
      prevPairs.map((p, idx) => {
        if (idx !== selectedPairIndex) return p;

        const now = Date.now();
        // Clear history first to force accurate calculations
        priceHistoryRef.current[p.symbol] = [
          {
            timestamp: now - 5000,
            price: p.currentPrice,
          },
        ];

        // Clear any previous debounce lock to allow immediate re-triggering of warnings
        delete lastVolatilityTriggerRef.current[p.symbol];

        // Calculate sharp movement (+2.85% or -3.42%)
        const multiplier = isUpward ? 1.0285 : 0.9658;
        const updatedPrice = parseFloat(
          (p.currentPrice * multiplier).toFixed(2),
        );

        // Compute new limits
        const high = Math.max(p.high24h, updatedPrice);
        const low = Math.min(p.low24h, updatedPrice);

        return {
          ...p,
          currentPrice: updatedPrice,
          high24h: parseFloat(high.toFixed(2)),
          low24h: parseFloat(low.toFixed(2)),
        };
      }),
    );
  };

  // Real-time Live Market Rates from Binance Official Public API via High-performance WebSockets
  const serializedSymbols = JSON.stringify(pairs.map((p) => p.symbol));

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let isMounted = true;

    // Fetch initial baseline prices instantly via REST API
    const fetchInitialBaseline = async () => {
      if (pairs.length === 0) return;
      try {
        const symbolList = pairs.map((p) =>
          p.symbol.replace("/", "").toUpperCase(),
        );
        const stringified = JSON.stringify(symbolList);

        // Try local server-side proxy (bypasses browser CORS completely)
        const proxyResponse = await fetch(
          `/api/gateway/prices?symbols=${encodeURIComponent(stringified)}`,
        );
        if (proxyResponse.ok) {
          const contentType = proxyResponse.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const data = await proxyResponse.json();
            if (isMounted && Array.isArray(data)) {
              setPairs((prevPairs) =>
                prevPairs.map((pair) => {
                  const liveData = data.find(
                    (item: any) => item.symbol === pair.symbol,
                  );
                  if (liveData) {
                    return {
                      ...pair,
                      currentPrice: liveData.currentPrice,
                      change24h: liveData.change24h,
                      high24h: liveData.high24h,
                      low24h: liveData.low24h,
                      volume24h: liveData.volume24h,
                    };
                  }
                  return pair;
                }),
              );
              return;
            }
          } else {
            console.warn(
              "[fetchInitialBaseline] Expected JSON but received:",
              contentType,
            );
          }
        }

        // Fallback to direct fetch if proxy fails
        const response = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(stringified)}`,
        );
        if (!response.ok) {
          throw new Error(
            `Binance Baseline REST API error: ${response.status}`,
          );
        }
        const data = await response.json();
        const dataArr = Array.isArray(data) ? data : [data];
        if (isMounted && dataArr.length > 0) {
          setPairs((prevPairs) =>
            prevPairs.map((pair) => {
              const rawSymbol = pair.symbol.replace("/", "");
              const liveData = dataArr.find(
                (item: any) => item.symbol === rawSymbol,
              );
              if (liveData) {
                return {
                  ...pair,
                  currentPrice: parseFloat(liveData.lastPrice),
                  change24h: parseFloat(
                    parseFloat(liveData.priceChangePercent).toFixed(2),
                  ),
                  high24h: parseFloat(liveData.highPrice),
                  low24h: parseFloat(liveData.lowPrice),
                  volume24h: parseFloat(
                    parseFloat(liveData.quoteVolume || liveData.volume).toFixed(
                      0,
                    ),
                  ),
                };
              }
              return pair;
            }),
          );
        }
      } catch (err) {
        console.log(
          "[Binance Baseline Ticker] Initial setup note:",
          err instanceof Error ? err.message : err,
        );
      }
    };

    // Establish WebSocket Connection with Binance Streams
    const connectBinanceWS = () => {
      if (!isMounted) return;
      if (pairs.length === 0) return;

      try {
        // Multi-symbol ticker socket stream (Combined Streams)
        const streams = pairs
          .map((p) => p.symbol.toLowerCase().replace("/", "") + "@ticker")
          .join("/");
        ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

        ws.onopen = () => {
          console.log(
            "⚡ Connected securely to Binance Real-time Ticker WebSocket Stream.",
          );
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const parsedEvent = JSON.parse(event.data);
            const rawData = parsedEvent.data || parsedEvent;
            
            if (rawData && rawData.s) {
              const wsSymbol = rawData.s; // e.g., 'BTCUSDT'
              setPairs((prevPairs) =>
                prevPairs.map((pair) => {
                  const sanitizedSymbol = pair.symbol.replace("/", "");
                  if (sanitizedSymbol === wsSymbol) {
                    return {
                      ...pair,
                      currentPrice: parseFloat(rawData.c),
                      change24h: parseFloat(parseFloat(rawData.P).toFixed(2)),
                      high24h: parseFloat(rawData.h),
                      low24h: parseFloat(rawData.l),
                      volume24h: parseFloat(
                        parseFloat(rawData.q || rawData.v).toFixed(0),
                      ),
                    };
                  }
                  return pair;
                }),
              );
            }
          } catch (parseErr) {
            // Safe swallow parse exceptions to ensure app continuity
          }
        };

        ws.onerror = (err) => {
          console.warn(
            "[Binance WebSocket] Stream connection encountered an issue.",
            err,
          );
        };

        ws.onclose = () => {
          console.log(
            "[Binance WebSocket] Stream closed. Scheduling automatic reconnect in 5 seconds...",
          );
          if (isMounted) {
            reconnectTimeout = setTimeout(connectBinanceWS, 5000);
          }
        };
      } catch (err: any) {
        console.warn("[Binance WebSocket warning] Initialization error:", err.message || err);
        if (isMounted) {
          reconnectTimeout = setTimeout(connectBinanceWS, 5000);
        }
      }
    };

    fetchInitialBaseline().then(() => {
      connectBinanceWS();
    });

    return () => {
      isMounted = false;
      if (ws) {
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [serializedSymbols]);

  // Fake price fluctuations removed because we now have reliable websocket data

  const langRef = useRef<"ar" | "en">(lang);
  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  // General function to synchronize live Binance wallet balances on-demand or automatically
  const syncLiveBalances = useCallback(async (silent = true) => {
    if (
      !apiConnection.isConnected ||
      !apiConnection.apiKey ||
      !apiConnection.apiSecret
    ) {
      if (!silent) {
        setBalanceSyncError(
          lang === "ar"
            ? 'الرجاء ربط مفاتيح API أولاً من تبويب "أمان الـ API"'
            : 'Please link API keys first under "API Security" tab.',
        );
      }
      return;
    }
    if (!silent) {
      setIsSyncingBalances(true);
      setBalanceSyncError(null);
    }
    try {
      const response = await fetch("/api/gateway/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: apiConnection.apiKey,
          apiSecret: apiConnection.apiSecret,
          useTestnet: apiConnection.useTestnet === true,
        }),
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const text = await response.text();
          throw new Error(
            "Server returned HTML instead of JSON: " + text.slice(0, 100),
          );
        }
        const resData = await response.json();
        if (resData.success && resData.balances) {
          const rawBalances = resData.balances;

          // Extract USDT and BTC assets, alongside other major tradeable assets
          const usdtAsset = rawBalances.find((b: any) => b.asset === "USDT");
          const usdcAsset = rawBalances.find((b: any) => b.asset === "USDC");
          const fdusdAsset = rawBalances.find((b: any) => b.asset === "FDUSD");
          const btcAsset = rawBalances.find((b: any) => b.asset === "BTC");
          const ethAsset = rawBalances.find((b: any) => b.asset === "ETH");
          const solAsset = rawBalances.find((b: any) => b.asset === "SOL");
          const bnbAsset = rawBalances.find((b: any) => b.asset === "BNB");

          const liveUsdt = (usdtAsset ? parseFloat(usdtAsset.free) + parseFloat(usdtAsset.locked) : 0)
                         + (usdcAsset ? parseFloat(usdcAsset.free) + parseFloat(usdcAsset.locked) : 0)
                         + (fdusdAsset ? parseFloat(fdusdAsset.free) + parseFloat(fdusdAsset.locked) : 0);
          const liveBtc = btcAsset
            ? parseFloat(btcAsset.free) + parseFloat(btcAsset.locked)
            : 0;
          const liveEth = ethAsset
            ? parseFloat(ethAsset.free) + parseFloat(ethAsset.locked)
            : 0;
          const liveSol = solAsset
            ? parseFloat(solAsset.free) + parseFloat(solAsset.locked)
            : 0;
          const liveBnb = bnbAsset
            ? parseFloat(bnbAsset.free) + parseFloat(bnbAsset.locked)
            : 0;

          setPortfolio({
            usdt: parseFloat(liveUsdt.toFixed(4)),
            futuresUsdt: parseFloat((resData.futuresUsdt || 0).toFixed(4)),
            btc: parseFloat(liveBtc.toFixed(8)),
            eth: parseFloat(liveEth.toFixed(6)),
            sol: parseFloat(liveSol.toFixed(6)),
            bnb: parseFloat(liveBnb.toFixed(6)),
          });
          if (!silent) {
            setBalanceSyncError(null);
          }
        } else {
          const errText = (resData.error || "").toLowerCase();
          const isAuthError =
            errText.includes("api-key") ||
            errText.includes("apikey") ||
            errText.includes("signature") ||
            errText.includes("invalid") ||
            errText.includes("exist") ||
            errText.includes("permission") ||
            errText.includes("unauthorized");
          if (isAuthError) {
            setApiConnection((prev) => ({ ...prev, isConnected: false }));
            setPortfolio({ usdt: 0, futuresUsdt: 0, btc: 0, eth: 0, sol: 0, bnb: 0 });
            setBalanceSyncError(
              lang === "ar"
                ? "❌ تم الكشف عن إلغاء أو حذف مفاتيح API من منصة بينانس! تم تصفير المحفظة وفصل الاتصال تلقائياً لحمايتك."
                : "❌ Binance API keys have been revoked or deleted! Real wallet connection has been severed and balances set to 0.",
            );
          } else if (!silent) {
            setBalanceSyncError(
              resData.error ||
                (lang === "ar"
                  ? "فشل اتصال واجهة API لبينانس. تأكد من أن مفاتيحك صالحة."
                  : "Binance API rejected authorization keys. Verify validity."),
            );
          }
        }
      } else {
        const contentType = response.headers.get("content-type") || "";
        let resData: any = {};
        if (contentType.includes("application/json")) {
          resData = await response.json().catch(() => ({}));
        } else {
          const t = await response.text();
          throw new Error(
            `Server returned HTTP ${response.status} with non-JSON format: ` +
              t.substring(0, 100),
          );
        }
        const errText = (resData.error || "").toLowerCase();
        const isAuthError =
          response.status === 401 ||
          response.status === 452 ||
          errText.includes("api-key") ||
          errText.includes("apikey") ||
          errText.includes("signature") ||
          errText.includes("invalid") ||
          errText.includes("exist") ||
          errText.includes("permission") ||
          errText.includes("unauthorized");
        if (isAuthError) {
          setApiConnection((prev) => ({ ...prev, isConnected: false }));
          setPortfolio({ usdt: 0, futuresUsdt: 0, btc: 0, eth: 0, sol: 0, bnb: 0 });
          setBalanceSyncError(
            lang === "ar"
              ? "❌ تم الكشف عن إلغاء أو حذف مفاتيح API من منصة بينانس! تم تصفير المحفظة وفصل الاتصال تلقائياً لحمايتك."
              : "❌ Binance API keys have been revoked or deleted! Real wallet connection has been severed and balances set to 0.",
          );
        } else if (!silent) {
          setBalanceSyncError(
            resData.error ||
              (lang === "ar"
                ? "تعذر جلب الأرصدة. تأكد من الشبكة المبرمجة (تجريبية أم حقيقية)"
                : "Unable to load wallet ledger assets. Confirm network environment."),
          );
        }
      }
    } catch (err: any) {
      console.warn(
        "[Binance Balance Synchronizer warning] Failed to sync live wallet assets:",
        err.message || err,
      );
      if (!silent) {
        setBalanceSyncError(err.message || "Fatal connection failure.");
      }
    } finally {
      if (!silent) {
        setIsSyncingBalances(false);
      }
    }
  }, [
    apiConnection.isConnected,
    apiConnection.apiKey,
    apiConnection.apiSecret,
    apiConnection.useTestnet,
    lang
  ]);

  // Periodically fetch and update real Binance balances if Live Trading is enabled and connection is valid
  useEffect(() => {
    let balanceTimer: NodeJS.Timeout | null = null;

    const autoSync = () => {
      syncLiveBalances(true);
    };

    if (isLiveTrading && apiConnection.isConnected && apiConnection.apiKey) {
      autoSync();
      // Poll every 8 seconds to keep platform balance perfectly aligned with Binance
      balanceTimer = setInterval(autoSync, 8000);
    }

    return () => {
      if (balanceTimer) clearInterval(balanceTimer);
    };
  }, [
    isLiveTrading,
    apiConnection.isConnected,
    apiConnection.apiKey,
    apiConnection.apiSecret,
    apiConnection.useTestnet,
    syncLiveBalances
  ]);

  // Background trading bot profit generator (collect simulated arbitrage yield!)
  useEffect(() => {
    const getLiveRsiAttr = (symbol: string, change24h: number) => {
      let baseRsi = 50 + (change24h * 3.8);
      const hash = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const wave = Math.sin((Date.now() / 15000) + hash) * 4.5;
      baseRsi += wave;
      return Math.min(Math.max(Math.round(baseRsi), 14), 86);
    };

    const getVolatilityAttr = (symbol: string, change24h: number) => {
      const hash = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const baseVol = Math.abs(change24h) * 1.25 + 1.1;
      const waveByTime = Math.sin((Date.now() / 25000) + hash) * 0.35;
      return parseFloat(Math.min(Math.max(baseVol + waveByTime, 0.6), 18.2).toFixed(2));
    };

    const getLiveScannerOpportunities = () => {
      const availablePairs = pairs.length > 0 ? pairs : INITIAL_PAIRS;
      return availablePairs.map((coin) => {
        const rsi = getLiveRsiAttr(coin.symbol, coin.change24h);
        const vol = getVolatilityAttr(coin.symbol, coin.change24h);
        const isVolumeSpike = (Math.abs(coin.change24h) * 1.5 + (coin.volume24h % 100) / 10) > 6.0;
        
        const rsiDistance = Math.abs(50 - rsi);
        const volBonus = vol * 3.5;
        const spBonus = isVolumeSpike ? 15 : 0;
        const confidenceScore = Math.min(Math.max(Math.round(45 + rsiDistance * 1.5 + volBonus + spBonus), 35), 99);

        return {
          symbol: coin.symbol,
          rsi,
          volatility: vol,
          isVolumeSpike,
          confidenceScore,
          isHighConfidence: confidenceScore >= 85,
          pairObj: coin
        };
      }).sort((a, b) => b.confidenceScore - a.confidenceScore);
    };

    const executeSmartBotAction = async (
      bot: TradingBot,
      increment: number,
      crossedMilestone: boolean,
      newMilestone?: number,
    ) => {
      const currentLang = langRef.current;
      
      const availableOpportunities = getLiveScannerOpportunities();
      const topOpportunity = availableOpportunities[0] || { symbol: "BTC/USDT", pairObj: (pairs.length > 0 ? pairs[0] : INITIAL_PAIRS[0]), confidenceScore: 80 };
      
      const resolvedSymbol = topOpportunity.symbol;
      const targetPairObj = topOpportunity.pairObj;
      let botTradeAmount = bot.minTradeAmount !== undefined ? bot.minTradeAmount : 0.5;
      botTradeAmount = Math.max(0.5, botTradeAmount);

      const inputs: EngineInputs = {
          symbol: resolvedSymbol,
          currentPrice: targetPairObj.currentPrice,
          hist5m: [],
          hist15m: [],
          volume24h: targetPairObj.volume24h,
          change24h: targetPairObj.change24h,
          rsi: targetPairObj.rsi || 50,
          sentimentScore: targetPairObj.sentimentScore || 50,
          whaleActivity: Math.random() * 100 
      };
      
      const decision = evaluateTradeDecision(inputs);
      
      // If the unified engine rejects it or score is too low, bots can't force trades
      if (decision.action === 'HOLD' || decision.score < 70) return; 

      let chosenSide: "BUY" | "SELL" = decision.action;
      let aiExplanationEn = `🤖 [DECISION ENGINE] Score: ${decision.score}%. ${decision.aiCommentaryEn}`;
      let aiExplanationAr = `🤖 [محرك القرار] التقييم: ${decision.score}%. ${decision.aiCommentaryAr}`;

      // Bypass Gemini sentiment analysis to make bots aggressive and fast
      // (User explicitly requested raw execution over AI analysis)
      /*
      if (bot.isSmartMode) {
        ... original ai logic
      }
      */

      // Dispatch order to real Binance exchange if LIVE setting is active
      if (
        isLiveTradingRef.current &&
        apiConnectionRef.current?.isConnected &&
        apiConnectionRef.current?.apiKey
      ) {
        const liveCoinPrice = targetPairObj?.currentPrice || 100.0;
        const computedAmount = botTradeAmount / liveCoinPrice;
        const testAmount = formatPrecision(computedAmount, resolvedSymbol, liveCoinPrice);

        try {
          const binResponse = await fetch("/api/gateway/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              apiKey: apiConnectionRef.current.apiKey,
              apiSecret: apiConnectionRef.current.apiSecret,
              useTestnet: apiConnectionRef.current.useTestnet === true,
              symbol: resolvedSymbol,
              side: chosenSide,
              type: "MARKET",
              amount: testAmount,
            }),
          });
          const binData = await binResponse.json();
          if (binData.success) {
            console.log(
              `[Binance Smart AI Outflows] Transmitted bot order successfully: Asset ${resolvedSymbol}, Side ${chosenSide}, Order ID ${binData.orderId}`,
            );
            aiExplanationEn = `✅ [REAL LIVE EXECUTION] ${aiExplanationEn}`;
            aiExplanationAr = `✅ [تداول حقيقي في منصة بينانس مباشر] ${aiExplanationAr}`;
          } else {
            console.warn(
              `[Binance Smart AI Outflows] Order failed on Binance network: ${binData.error}`,
            );
            aiExplanationEn = `❌ [LIVE REJECTED/NSF] Binance response: ${binData.error || "Check asset liquidity"}. ${aiExplanationEn}`;
            aiExplanationAr = `❌ [فشل تداول مباشر] رد بينانس: ${binData.error || "مجهول"}. ${aiExplanationAr}`;
            failedBotsCooldownRef.current[bot.id] = Date.now();
          }
        } catch (binErr: any) {
          console.warn(
            "[Binance Smart AI Broker warning] Connection timeout placing order:",
            binErr.message || binErr,
          );
          aiExplanationEn = `⚠️ [LIVE NET TIMEOUT] ${binErr.message || binErr}. ${aiExplanationEn}`;
          aiExplanationAr = `⚠️ [خطأ اتصال بالشبكة لمراكز بينانس] ${binErr.message || binErr}. ${aiExplanationAr}`;
          failedBotsCooldownRef.current[bot.id] = Date.now();
        }
      }

      handleTriggerToast({
        id: `toast-${Date.now()}-${Math.random().toString().substring(2, 7)}`,
        botId: bot.id,
        botType: bot.type,
        symbol: resolvedSymbol,
        profit: parseFloat(increment.toFixed(2)),
        timestamp: Date.now(),
        isMilestone: crossedMilestone,
        milestonePercentage: newMilestone,
        aiExplanationEn,
        aiExplanationAr,
      });
    };

    const t = setInterval(() => {
      // Respect our new simulation automation toggle
      if (!simulationsEnabledRef.current) return;
      const currentBots = activeBotsRef.current;
      let walletUsdtIncrement = 0;
      let botsChanged = false;

      const nextBots = currentBots.map((bot) => {
        if (bot.status !== "RUNNING") return bot;

        // Perform dynamic Auto-Rebalance to the top scanner signals (top 1 of top 3)
        let currentBotSymbol = bot.symbol;
        if (bot.autoRebalance) {
          const scannedOpportunities = getLiveScannerOpportunities();
          if (scannedOpportunities.length > 0) {
            const topAsset = scannedOpportunities[0].symbol;
            if (currentBotSymbol !== topAsset) {
              currentBotSymbol = topAsset;
              botsChanged = true;
            }
          }
        }

        // Bots execute arbitrage trades based on market volatility, generating tiny cash returns
        const probability =
          bot.type === "GRID" ? 0.65 : bot.type === "DCA" ? 0.55 : 0.45; // Increased cadence for visibly active bots
        const executesTrade = Math.random() < probability;

        if (executesTrade) {
          botsChanged = true;
          const increment =
            bot.type === "GRID"
              ? Math.random() * 5.2 + 1.8 // Proportional grid arbitrages for 18-sec intervals
              : bot.type === "DCA"
                ? Math.random() * 3.8 + 1.2 // Proportional DCA adjustments
                : Math.random() * 8.5 + 3.0; // Proportional RSI bigger swings

          const newProfit = bot.accumulatedProfit + increment;

          // Extract investment amount
          const invest =
            bot.type === "GRID"
              ? (bot.config as any).investmentAmount
              : bot.type === "DCA"
                ? (bot.config as any).totalInvestment
                : (bot.config as any).tradeAmount * 3;

          const profitPercentage = (newProfit / invest) * 100;

          const oldPercent = bot.profitPercentage || 0;
          const oldMilestone = Math.floor(oldPercent / 5) * 5;
          const newMilestone = Math.floor(profitPercentage / 5) * 5;
          const crossedMilestone =
            newMilestone > oldMilestone && newMilestone >= 5;

          walletUsdtIncrement += increment;

          // Asynchronously perform bot trading decision and live Binance routing
          const updatedBot = { ...bot, symbol: currentBotSymbol };
          executeSmartBotAction(
            updatedBot,
            increment,
            crossedMilestone,
            crossedMilestone ? newMilestone : undefined,
          );

          const currentDd = bot.maxDrawdown || 2.5;
          const shift = Math.random() * 0.32 - 0.11; // upward bias slightly
          const finalDd = Math.max(0.4, Math.min(22, currentDd + shift));

          return {
            ...bot,
            symbol: currentBotSymbol,
            accumulatedProfit: parseFloat(newProfit.toFixed(2)),
            profitPercentage: parseFloat(profitPercentage.toFixed(2)),
            arbitrageCount: bot.arbitrageCount + 1,
            maxDrawdown: parseFloat(finalDd.toFixed(2)),
          };
        }

        if (currentBotSymbol !== bot.symbol) {
          return {
            ...bot,
            symbol: currentBotSymbol,
          };
        }

        return bot;
      });

      if (botsChanged) {
        setActiveBots(nextBots);

        if (walletUsdtIncrement > 0) {
          // If in paper trading mode, update local portfolio representation. (Live balances will sync separately via poller)
          if (!isLiveTradingRef.current) {
            setPortfolio((prevWallet) => ({
              ...prevWallet,
              usdt: parseFloat(
                (prevWallet.usdt + walletUsdtIncrement).toFixed(2),
              ),
            }));
          }

          // COMMISSION FEATURE: Extract 10% from simulated profits to the platform wallet if the user is not the owner
          const currentUserData = userDataRef.current;
          if (currentUserData && currentUserData.role !== "OWNER" && currentUserData.email !== "alamryhmzh7@gmail.com") {
            const commission = walletUsdtIncrement * 0.1;
            try {
              updateDoc(doc(db, "platform", "wallet"), {
                balanceUsdt: increment(commission),
              });
            } catch (e) {
              // Ignore transient network errors during high frequency simulations
            }
          }

          setProfitHistory((prevHistory) => {
            const updated = [...prevHistory];
            if (updated.length > 0) {
              const lastIdx = updated.length - 1;
              updated[lastIdx] = {
                ...updated[lastIdx],
                profit: parseFloat(
                  (updated[lastIdx].profit + walletUsdtIncrement).toFixed(2),
                ),
                botsCount: nextBots.length,
              };
            }
            return updated;
          });
        }
      }
    }, 7000);

    return () => clearInterval(t);
  }, []);

  // Quick Market Buy Handler for ticker strip shortcut button
  const handleQuickMarketBuy = async (pair: MarketPair) => {
    if (!canTrade) {
      alert(
        lang === "ar"
          ? "⚠️ عذراً، تداولك معطل حالياً من قبل الإدارة."
          : "⚠️ Trading features are currently suspended."
      );
      return;
    }

    const marginCost = quickBuyAmountUsdt;
    if (marginCost > portfolio.usdt) {
      alert(
        lang === "ar"
          ? `❌ خطأ في الرصيد: رصيدك الحالي من USDT ($${portfolio.usdt.toFixed(2)}) غير كافٍ لتغطية تكلفة الهامش المسبقة ($${marginCost.toFixed(2)}).`
          : `❌ Balance Error: Your current USDT balance ($${portfolio.usdt.toFixed(2)}) is insufficient to cover the quick buy cost ($${marginCost.toFixed(2)}).`
      );
      return;
    }

    // Calculate coin quantity
    const calculatedAmount = (quickBuyAmountUsdt * manualLeverage) / pair.currentPrice;
    const finalAmount = formatPrecision(calculatedAmount, pair.symbol, pair.currentPrice);

    if (finalAmount <= 0) {
      alert(
        lang === "ar"
          ? "❌ خطأ فني: كمية الشراء المحسوبة أصغر من الحد الأدنى المسموح التداول به لهذا الرمز."
          : "❌ Technical Error: Computed purchase size is below the minimum tradeable precision limit for this token."
      );
      return;
    }

    // Place the order
    await handleAddNewOrder({
      symbol: pair.symbol,
      type: "MARKET",
      side: "BUY",
      price: pair.currentPrice,
      amount: finalAmount,
      total: pair.currentPrice * finalAmount,
      leverage: manualLeverage,
      isQuickBuy: true,
    } as any);

    // Provide a beautiful success toast feedback
    handleTriggerToast({
      id: `quick-market-buy-${pair.symbol}-${Date.now()}`,
      symbol: pair.symbol,
      timestamp: Date.now(),
      isMilestone: true,
      aiExplanationAr: `⚡ **[صفقة سريعة - شراء فوري للرمز]**
📊 **الرمز المتداول:** ${pair.symbol}
💵 **الهامش المستخدم:** $${quickBuyAmountUsdt} USDT برافعة ${manualLeverage}x
🏹 **حالة تنفيذ الطلب:** تم ملء الصفقة بنجاح بسعر السوق الفوري الحالي $${pair.currentPrice}.`,
      aiExplanationEn: `⚡ **[Quick Market Order - Executed Successfully]**
📊 **Asset Symbol:** ${pair.symbol}
💵 **Invested Margin:** $${quickBuyAmountUsdt} USDT with leverage ${manualLeverage}x
🏹 **Order Status:** Order filled successfully at current spot price $${pair.currentPrice}.`
    });
  };

  // Manual Order Handler
  const handleAddNewOrder = async (
    newOrder: Omit<TradeOrder, "id" | "timestamp" | "status">,
  ) => {
    const cost = newOrder.price * newOrder.amount;
    const isBuy = newOrder.side === "BUY";

    let orderId = `ord-${Math.random().toString().substring(2, 8)}`;
    let status: OrderStatus = "FILLED";
    let finalPrice = newOrder.price;
    let finalAmount = newOrder.amount;
    let orderStoredLive = false;

    finalAmount = formatPrecision(newOrder.amount, newOrder.symbol, newOrder.price);

    // Manual Trade Logging
    const nowDetect = Date.now();
    setQuickScalpScannerLog(prev => [{
      id: `manual-log-${nowDetect}-${Math.random()}`,
      timestamp: nowDetect,
      symbol: newOrder.symbol,
      type: "INFO",
      msgAr: `👤 [صفقة يدوية] تم رصد ${newOrder.side === 'BUY' ? 'شراء' : 'بيع'} للعملة ${newOrder.symbol} بسعر ${finalPrice}`,
      msgEn: `👤 [Manual Trade] ${newOrder.side === 'BUY' ? 'BUY' : 'SELL'} order detected for ${newOrder.symbol} at ${finalPrice}`,
    }, ...prev]);

    if (isLiveTrading) {
      if (
        apiConnection.isConnected &&
        apiConnection.apiKey &&
        apiConnection.apiSecret
      ) {
        try {
          const response = await fetch("/api/gateway/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              apiKey: apiConnection.apiKey,
              apiSecret: apiConnection.apiSecret,
              useTestnet: apiConnection.useTestnet === true,
              symbol: newOrder.symbol,
              side: newOrder.side,
              type: newOrder.type === "STOP_LIMIT" ? "LIMIT" : newOrder.type,
              amount: newOrder.amount,
              price: newOrder.price,
              isFutures: newOrder.isFutures,
            }),
          });

          const resData = await response.json();
          if (response.ok && resData.success) {
            orderId = `bnc-${resData.orderId || Math.random().toString().substring(2, 8)}`;
            status =
              resData.status === "FILLED" || resData.status === "NEW"
                ? "FILLED"
                : "PENDING";
            if (resData.price && parseFloat(resData.price) > 0) {
              finalPrice = parseFloat(resData.price);
            }
            if (resData.executedQty && parseFloat(resData.executedQty) > 0) {
              finalAmount = parseFloat(resData.executedQty);
            }
            orderStoredLive = true;

            if (newOrder.originType !== "BOT") {
              alert(
                lang === "ar"
                  ? `⚡ تم إرسال وتمرير الصفقة بنجاح إلى منصة بينانس ومحفظتك الحية! الرقم التعريفي للأمر: ${resData.orderId}`
                  : `⚡ Binance live trade executed successfully! Destination: ${apiConnection.useTestnet ? "Testnet" : "Mainnet"}. OrderId: ${resData.orderId}`,
              );
            }
          } else {
            const directionAr = newOrder.side === "BUY" ? "شراء (Long)" : "بيع (Short)";
            const directionEn = newOrder.side === "BUY" ? "BUY (Long)" : "SELL (Short)";
            
            handleTriggerToast({
              id: Date.now().toString(),
              symbol: newOrder.symbol,
              timestamp: Date.now(),
              isError: true,
              aiExplanationAr: `❌ فشل تنفيذ الصفقة على منصة بينانس!\nاتجاه الصفقة: ${directionAr}\nالسعر: ${newOrder.price}\nالسبب الفني والمؤشرات: ${newOrder.aiReasonAr || "غير متوفر"}\nسبب الرفض من بينانس: ${resData.error || "مجهول"}`,
              aiExplanationEn: `❌ Binance live trade failed!\nDirection: ${directionEn}\nPrice: ${newOrder.price}\nTechnical Reason & Indicators: ${newOrder.aiReasonEn || "N/A"}\nBinance Rejection Reason: ${resData.error || "Unknown error"}`,
            });
            
            if (newOrder.originType !== "BOT") {
              alert(
                lang === "ar"
                  ? `❌ رفضت بينانس تنفيذ الصفقة.\n\nالسبب: ${resData.error || "عطل مجهول"}.\n\nملاحظة هامة: لتنفيذ الصفقات حقيقياً يجب التأكد من توفر رصيد كافٍ لتغطية قيمة الصفقة المحددة حسب شروط المنصة، ويجب إدخال مفتاح API صحيح تماماً.\n\nتم حفظ الصفقة الآن كمحاكاة تجريبية.`
                  : `❌ Binance order rejected: ${resData.error || "Unknown error"}.\nNote: Spot orders must meet the exchange's minimum notional value and API keys must have Spot Trading Enabled.\nLogged as paper-demo instead.`
              );
            }
            throw new Error(`Binance order rejected: ${resData.error || "Unknown error"}`);
          }
        } catch (err: any) {
          console.warn("Binance direct dispatch warning:", err.message || err);
          if (newOrder.originType === "BOT") {
            throw err;
          }
        }
      } else {
        if (newOrder.originType !== "BOT") {
          alert(
            lang === "ar"
              ? `⚠️ التداول حقيقي ولكن مفاتيح API مفقودة!\n\nأنت في وضع التداول الحقيقي، ولكن لم يتم ربط وتفعيل مفاتيح API الخاصة بك. المنصة لا تستطيع تنفيذ الصفقات حقيقياً بدون مفاتيحك.\n\nالرجاء إدخال المفاتيح من تبويب 'أمان الـ API' لتنفيذ صفقات حقيقية في بينانس.\n\nتم تنفيذ العملية كمحاكاة تجريبية.`
              : `⚠️ Live Trading but API keys missing!\n\nYou must securely link your Binance API keys in the 'API Security' tab first. Without them, trades are logged as paper-demo.`,
          );
        } else {
          if (Date.now() - (window.lastApiErrorToastTime || 0) > 300000) {
            window.lastApiErrorToastTime = Date.now();
            handleTriggerToast({
              id: Date.now().toString(),
              symbol: newOrder.symbol,
              timestamp: Date.now(),
              isError: true,
              aiExplanationAr: `⚠️ التداول حقيقي ولكن مفاتيح API مفقودة!\nتم تحويل صفقات البوت التلقائية مؤقتاً إلى المحاكاة التجريبية (Demo) حتى تقوم بربط حساب بينانس من قسم (أمان الـ API).`,
              aiExplanationEn: `⚠️ Live Trading enabled but API keys missing!\nAutomated bot trades have temporarily fallen back to paper-demo until you link your Binance API.`,
            });
          }
          // Proceed as paper trade silently
        }
      }
    }

    // Deduct/Credit available spot assets
    setPortfolio((prev) => {
      const addedAsset = isBuy ? finalAmount : -finalAmount;
      const symbolSplit = newOrder.symbol.split("/");
      const baseAsset = (symbolSplit[0] ? symbolSplit[0] : activePair.baseAsset).toLowerCase();

      const newAssets: any = {};
      if (baseAsset === "btc") {
        newAssets.btc = parseFloat(((prev.btc ?? 0) + addedAsset).toFixed(6));
      } else if (baseAsset === "eth") {
        newAssets.eth = parseFloat(((prev.eth ?? 0) + addedAsset).toFixed(4));
      } else if (baseAsset === "sol") {
        newAssets.sol = parseFloat(((prev.sol ?? 0) + addedAsset).toFixed(4));
      } else if (baseAsset === "bnb") {
        newAssets.bnb = parseFloat(((prev.bnb ?? 0) + addedAsset).toFixed(4));
      } else {
        const prevBal = (prev as any)[baseAsset] ?? 0;
        (newAssets as any)[baseAsset] = parseFloat(
          (prevBal + addedAsset).toFixed(4),
        );
      }

      const usdtDiff = isBuy
        ? -(cost / (newOrder.leverage || 1))
        : cost / (newOrder.leverage || 1);

      if (newOrder.isFutures) {
        return {
          ...prev,
          futuresUsdt: parseFloat((prev.futuresUsdt + usdtDiff).toFixed(2)),
        };
      }

      return {
        ...prev,
        usdt: parseFloat((prev.usdt + usdtDiff).toFixed(2)),
        ...newAssets,
      };
    });

    const populatedOrder: TradeOrder = {
      ...newOrder,
      id: orderId,
      timestamp: Date.now(),
      status: status,
      price: finalPrice,
      amount: finalAmount,
      isLive: orderStoredLive,
    };

    setOrders((prev) => [populatedOrder, ...prev]);
  };

  // Trigger manual Take Profit or Stop Loss
  const triggerManualTpSl = (
    order: TradeOrder,
    triggered: "TP" | "SL",
    currentPrice: number,
  ) => {
    // 1. Mark this specific order's TP/SL as cleared to prevent re-entrancy
    setOrders((prevOrders) =>
      prevOrders.map((o) =>
        o.id === order.id
          ? { ...o, takeProfit: undefined, stopLoss: undefined }
          : o,
      ),
    );

    const counterSide = order.side === "BUY" ? "SELL" : "BUY";

    // 2. Formulate counter order parameters
    const counterOrder: Omit<TradeOrder, "id" | "timestamp" | "status"> = {
      symbol: order.symbol,
      type: "MARKET",
      side: counterSide,
      price: currentPrice,
      amount: order.amount,
      total: currentPrice * order.amount,
      leverage: order.leverage,
    };

    // 3. Place counter order immediately which will re-adjust portfolio assets and log the closing order
    handleAddNewOrder(counterOrder);

    // 4. Highlight the trigger via a toast notification
    const isArabic = lang === "ar";
    const targetLabel =
      triggered === "TP"
        ? isArabic
          ? "جني الأرباح (Take Profit)"
          : "Take Profit"
        : isArabic
          ? "وقف الخسارة (Stop Loss)"
          : "Stop Loss";

    const phraseAr = `🤖 [تنفيذ تلقائي] تم تفعيل أمر ${targetLabel} لـ ${order.symbol} بنجاح عند سعر السوق $${(currentPrice ?? 0).toLocaleString()}.`;
    const phraseEn = `🤖 [Auto Executed] ${targetLabel} triggered for ${order.symbol} successfully at trigger rate $${(currentPrice ?? 0).toLocaleString()}!`;

    handleTriggerToast({
      id: `tpsl-toast-${Date.now()}-${Math.random()}`,
      symbol: order.symbol,
      timestamp: Date.now(),
      isMilestone: triggered === "TP",
      isVolatilityWarning: triggered === "SL",
      profit:
        triggered === "TP"
          ? Math.abs((currentPrice - order.price) * order.amount)
          : undefined,
      aiExplanationAr: phraseAr,
      aiExplanationEn: phraseEn,
    });
  };

  // Trigger Quick Market Close for Scalping order under 1-Cent Scalp Shield or Completed Rebound
  const triggerManualQuickScalpExit = (
    order: TradeOrder,
    currentPrice: number,
    exitReason?: "QUICK_SCALP" | "REBOUND_COMPLETED",
  ) => {
    const savedPeak = peakPricesRef.current[order.id] || order.peakPrice || order.price;

    // 1. Mark this specific order as closed to avoid re-entrancy
    setOrders((prevOrders) =>
      prevOrders.map((o) =>
        o.id === order.id
          ? { 
              ...o, 
              isClosedScalped: true, 
              peakPrice: savedPeak, 
              takeProfit: undefined, 
              stopLoss: undefined 
            }
          : o,
      ),
    );

    const counterSide = order.side === "BUY" ? "SELL" : "BUY";

    // 2. Formulate counter sell order parameters
    const counterOrder: Omit<TradeOrder, "id" | "timestamp" | "status"> = {
      symbol: order.symbol,
      type: "MARKET",
      side: counterSide,
      price: currentPrice,
      amount: order.amount,
      total: currentPrice * order.amount,
      leverage: order.leverage,
    };

    // 3. Place counter order immediately which will re-adjust portfolio assets and log the closing order
    handleAddNewOrder(counterOrder);

    // 4. Highlight the trigger via a toast notification
    const isArabic = lang === "ar";
    const netProfit = (currentPrice - order.price) * order.amount;
    const isProfit = netProfit >= 0;

    let phraseAr = "";
    let phraseEn = "";

    if (exitReason === "REBOUND_COMPLETED") {
      phraseAr = `📈 **[البوت السريع - اكتمال الارتداد]** تم إغلاق الصفقة بنجاح وسحب البوت تلقائياً لعملة ${order.symbol} بعد اكتمال موجة الارتداد على فريم الدقيقة وفريم خمس دقائق ونقص العزم!\n💵 **سعر الشراء:** $${(order.price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}\n🏹 **سعر الإغلاق:** $${(currentPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}\n⚖️ **العائد:** $${(netProfit ?? 0).toLocaleString(undefined, { minimumFractionDigits: 3 })} USDT`;
      phraseEn = `📈 **[Quick Bot - Rebound Wave Completed]** Successfully closed trade and pulled out bot for ${order.symbol} after the 1m & 5m rebound trend reached its peak!\n💵 **Entry Price:** $${(order.price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}\n🏹 **Closing Price:** $${(currentPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}\n⚖️ **Net Return:** $${(netProfit ?? 0).toLocaleString(undefined, { minimumFractionDigits: 3 })} USDT`;

      const exitLog = {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        symbol: order.symbol,
        type: "INFO",
        msgAr: `📈 [اكتمال الارتداد والانسحاب] تم الخروج تلقائياً من صفقة ${order.symbol} بنجاح بعد اكتمال الموجة الارتدادية وعجز السعر عن الصعود بربح $${netProfit.toFixed(3)} USDT.`,
        msgEn: `📈 [Rebound Completed & Pulled] Auto-withdrew from ${order.symbol} trade successfully after rebound completed. Profit: $${netProfit.toFixed(3)} USDT.`,
        price: currentPrice,
        profit: netProfit,
      };
      setQuickScalpScannerLog((prev) => [exitLog, ...prev]);
    } else {
      phraseAr = `🛡️ **[درع الحماية الديناميكي للمضاربة السريعة]** تم إغلاق الصفقة السريعة تلقائياً لعملة ${order.symbol} بعد التراجع من الذروة لتجنب الخسارة السريعة!\n💵 **سعر الشراء:** $${(order.price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}\n📈 **أعلى سعر (الذروة):** $${(savedPeak ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}\n🏹 **سعر الإغلاق:** $${(currentPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}\n⚖️ **العائد:** $${(netProfit ?? 0).toLocaleString(undefined, { minimumFractionDigits: 3 })} USDT`;
      phraseEn = `🛡️ **[Dynamic Scalp Shield]** Instantly auto-closed quick trade for ${order.symbol} due to a retrace from peak!\n💵 **Entry Price:** $${(order.price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}\n📈 **Peak Price Reached:** $${(savedPeak ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}\n🏹 **Closing Price:** $${(currentPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}\n⚖️ **Net Return:** $${(netProfit ?? 0).toLocaleString(undefined, { minimumFractionDigits: 3 })} USDT`;

      const shieldLog = {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        symbol: order.symbol,
        type: "SHIELD",
        msgAr: `🛡️ [تفعيل درع الحماية] تم الإغلاق التلقائي لعملة ${order.symbol} بعد تراجع طفيف لتأمين الأرباح/الرأس المال. النتيجة: $${netProfit.toFixed(3)} USDT.`,
        msgEn: `🛡️ [Shield Active] Instantly closed ${order.symbol} on a slight retrace. Net: $${netProfit.toFixed(3)} USDT.`,
        price: currentPrice,
        profit: netProfit,
      };
      setQuickScalpScannerLog((prev) => [shieldLog, ...prev]);
    }

    // Record trade in Self Learning system
    recordTrade({
      symbol: order.symbol,
      reasons: ["Triggered by Quick Scalp/Shield", exitReason || "UNKNOWN"],
      factors: { "pricePeak": savedPeak, "exitPrice": currentPrice, "entryPrice": order.price },
      result: isProfit ? "PROFIT" : "LOSS",
      pnlPercentage: ((currentPrice - order.price) / order.price) * 100 * (order.side === "BUY" ? 1 : -1)
    });

    handleTriggerToast({
      id: `quick-scalp-shield-toast-${Date.now()}-${Math.random()}`,
      symbol: order.symbol,
      timestamp: Date.now(),
      isMilestone: isProfit,
      isVolatilityWarning: !isProfit,
      profit: parseFloat(netProfit.toFixed(2)),
      aiExplanationAr: phraseAr,
      aiExplanationEn: phraseEn,
    });
  };

  // Monitor manual order Take Profit / Stop Loss thresholds & Quick Scalp Protector!
  useEffect(() => {
    // A) Dynamic Peak Price Tracking for active Quick Buy orders using useRef to completely prevent re-render cascades
    ordersRef.current.forEach((o) => {
      if (o.status === "FILLED" && o.isQuickBuy && !o.isClosedScalped) {
        const pair = pairs.find((p) => p.symbol === o.symbol);
        if (pair) {
          const currentPrice = pair.currentPrice;
          const savedPeak = peakPricesRef.current[o.id];
          const currentPeak = savedPeak !== undefined ? savedPeak : (o.peakPrice !== undefined ? o.peakPrice : o.price);
          
          if (o.side === "BUY") {
            if (currentPrice > currentPeak) {
              peakPricesRef.current[o.id] = currentPrice;
            }
          } else {
            // For SHORT (SELL), the "peak" is the lowest price it reaches (maximum profit point)
            if (currentPrice < currentPeak) {
              peakPricesRef.current[o.id] = currentPrice;
            }
          }
        }
      }
    });

    // B) Check Threshold Exits (TP/SL & 1-Cent Scalp Protector)
    const activeFilledOrders = ordersRef.current.filter(
      (o) => o.status === "FILLED" && !o.isClosedScalped
    );

    if (activeFilledOrders.length === 0) return;

    for (const order of activeFilledOrders) {
      const pair = pairs.find((p) => p.symbol === order.symbol);
      if (!pair) continue;

      const currentPrice = pair.currentPrice;
      let triggered: "TP" | "SL" | "QUICK_SCALP" | "REBOUND_COMPLETED" | null = null;

      // Check Quick Scalp Trailing Protection Mode (Smart Exit Shield)
      if (quickScalpProtectorEnabled && order.isQuickBuy) {
        const savedPeak = peakPricesRef.current[order.id];
        const peakPrice = savedPeak !== undefined ? savedPeak : (order.peakPrice !== undefined ? order.peakPrice : order.price);

        const isLong = order.side === "BUY";
        const entryPrice = order.price;
        const now = Date.now();
        const tradeAgeMs = now - (order.timestamp || now);
        
        // Real-adjustment: Lock in profits/prevent losses at 1% retrace immediately as requested
        const minProfitMet = isLong 
          ? (currentPrice > entryPrice * 1.005) // Reduced to 0.5% to allow for fee coverage
          : (currentPrice < entryPrice * 0.995);
        
        const canExitSafe = tradeAgeMs > 10000; // Reduced to 10 seconds to allow fast exits if it dumps
          
        if (isLong) {
          // Adjusted to strict 1% retrace from peak as requested
          const trailDistance = Math.max(0.01, peakPrice * 0.01); 
          if (currentPrice <= peakPrice - trailDistance && minProfitMet && canExitSafe) {
            triggered = "QUICK_SCALP";
          } else if (currentPrice <= entryPrice * 0.95) { // Stop loss at 5% instead of 15% to prevent deep losses
            triggered = "QUICK_SCALP";
          }
        } else {
          const trailDistance = Math.max(0.01, peakPrice * 0.01);
          if (currentPrice >= peakPrice + trailDistance && minProfitMet && canExitSafe) {
            triggered = "QUICK_SCALP";
          } else if (currentPrice >= entryPrice * 1.05) { // Stop loss at 5% instead of 15%
            triggered = "QUICK_SCALP";
          }
        }
      }

      // Check if 1-minute Trend Rebound cycle is completed/overheated ("وعندما يكتمل ينسحب مباشرة")
      if (!triggered && order.isQuickBuy) {
        const hist1m = priceHistoryRef.current[order.symbol] || [];
        if (hist1m.length >= 3) {
          const prices = hist1m.map((h) => h.price);
          const lastPrice = prices[prices.length - 1];
          const prevPrice = prices[prices.length - 2];
          
          let change1m = 0;
          if (hist1m.length > 1) {
            const pOld = hist1m[0].price;
            change1m = ((currentPrice - pOld) / pOld) * 100;
          }
          const rsi1m = 50 + change1m * 12;

          const isLong = order.side === "BUY";
          const isProfitable = isLong 
             ? (currentPrice > order.price * 1.002) 
             : (currentPrice < order.price * 0.998);

          // If RSI has reached extremes and starts reversing, the quick wave has fully finished
          if (isLong && rsi1m > 68 && lastPrice < prevPrice && isProfitable) {
            triggered = "REBOUND_COMPLETED";
          } else if (!isLong && rsi1m < 32 && lastPrice > prevPrice && isProfitable) {
            triggered = "REBOUND_COMPLETED";
          }
        }
      }

      // Check standard manually defined TP/SL thresholds
      if (!triggered) {
        if (order.side === "BUY") {
          if (
            order.takeProfit &&
            order.takeProfit > 0 &&
            currentPrice >= order.takeProfit
          ) {
            triggered = "TP";
          } else if (
            order.stopLoss &&
            order.stopLoss > 0 &&
            currentPrice <= order.stopLoss
          ) {
            triggered = "SL";
          }
        } else {
          if (
            order.takeProfit &&
            order.takeProfit > 0 &&
            currentPrice <= order.takeProfit
          ) {
            triggered = "TP";
          } else if (
            order.stopLoss &&
            order.stopLoss > 0 &&
            currentPrice >= order.stopLoss
          ) {
            triggered = "SL";
          }
        }
      }

      if (triggered) {
        if (triggered === "QUICK_SCALP") {
          triggerManualQuickScalpExit(order, currentPrice);
        } else if (triggered === "REBOUND_COMPLETED") {
          triggerManualQuickScalpExit(order, currentPrice, "REBOUND_COMPLETED");
        } else {
          triggerManualTpSl(order, triggered, currentPrice);
        }
        break; // Trigger sequentially one order at a time per render tick for secure state updates
      }
    }
  }, [pairs, lang, quickScalpProtectorEnabled]);

  // Bot Manager Triggers
  const handleCreateBot = (newBotData: any) => {
    const isGrid = newBotData.type === "GRID";
    const isDca = newBotData.type === "DCA";
    
    // Support ultra-low micro budgets down to 0.5 USDT ("ولو بنص دولار")
    const botMinAllowed = newBotData.minTradeAmount !== undefined ? newBotData.minTradeAmount : 0.5;

    let cost = isGrid
      ? newBotData.config.investmentAmount
      : isDca
        ? newBotData.config.totalInvestment
        : newBotData.config.tradeAmount * 3; // Reserve capital for 3 trades

    // If they specified a tiny budget or have low wallet balance, scale down cost to fit
    if (cost > portfolio.usdt && portfolio.usdt >= botMinAllowed) {
      cost = portfolio.usdt;
    }

    if (cost > portfolio.usdt || portfolio.usdt < botMinAllowed) {
      alert(
        lang === "ar"
          ? `عذراً! رصيد USDT غير كافٍ لتشغيل هذا البوت. يرجى توفر ${botMinAllowed} USDT على الأقل لتغطية الصفقات الصغرى للارتداد.`
          : `Insufficient funds. Minimum wallet USDT required to cover rebound micro trades is ${botMinAllowed} USDT.`,
      );
      return;
    }

    // Freeze USDT investment inside active trading bots
    setPortfolio((prev) => ({
      ...prev,
      usdt: parseFloat((prev.usdt - cost).toFixed(2)),
    }));

    const instantiatedBot: TradingBot = {
      id: `bot-${Math.random().toString().substring(2, 8)}`,
      symbol: newBotData.symbol,
      type: newBotData.type,
      config: {
        ...newBotData.config,
        // Ensure investment value represents the calibrated cost
        investmentAmount: isGrid ? cost : (newBotData.config as any).investmentAmount,
        totalInvestment: isDca ? cost : (newBotData.config as any).totalInvestment,
      },
      status: "RUNNING",
      createdTime: Date.now(),
      accumulatedProfit: 0,
      profitPercentage: 0,
      arbitrageCount: 0,
      maxDrawdown: parseFloat((Math.random() * 2.2 + 1.1).toFixed(2)),
      isSmartMode: newBotData.isSmartMode !== false,
      reboundFocusEnabled: newBotData.reboundFocusEnabled !== false,
      reboundTimeframes: newBotData.reboundTimeframes || ["15m", "30m", "1h"],
      minTradeAmount: botMinAllowed
    };

    setActiveBots((prev) => [instantiatedBot, ...prev]);
  };

  const handleDeleteBot = (id: string) => {
    // Release frozen investment pools back to USDT wallet
    const targetBot = activeBots.find((b) => b.id === id);
    if (targetBot) {
      const invest =
        targetBot.type === "GRID"
          ? (targetBot.config as any).investmentAmount
          : targetBot.type === "DCA"
            ? (targetBot.config as any).totalInvestment
            : (targetBot.config as any).tradeAmount * 3;

      setPortfolio((prev) => ({
        ...prev,
        usdt: parseFloat((prev.usdt + invest).toFixed(2)),
      }));
    }

    setActiveBots((prev) => prev.filter((b) => b.id !== id));
  };

  const handleToggleBotStatus = (id: string) => {
    setActiveBots((prev) =>
      prev.map((bot) => {
        if (bot.id === id) {
          return {
            ...bot,
            status: bot.status === "RUNNING" ? "PAUSED" : "RUNNING",
          };
        }
        return bot;
      }),
    );
  };

  const handleResumeAllBots = () => {
    setActiveBots((prev) =>
      prev.map((bot) => {
        if (bot.status === "PAUSED") {
          return {
            ...bot,
            status: "RUNNING",
          };
        }
        return bot;
      }),
    );
  };

  const handleUpdateBotConfig = (id: string, updatedConfig: any) => {
    setActiveBots((prev) =>
      prev.map((bot) => {
        if (bot.id === id) {
          const topLevelUpdates: any = {};
          const configUpdates: any = {};
          
          Object.keys(updatedConfig).forEach((key) => {
            if (key === 'autoRebalance' || key === 'status' || key === 'symbol') {
              topLevelUpdates[key] = updatedConfig[key];
            } else {
              configUpdates[key] = updatedConfig[key];
            }
          });

          return {
            ...bot,
            ...topLevelUpdates,
            config: {
              ...bot.config,
              ...configUpdates,
            },
          };
        }
        return bot;
      }),
    );
  };

  const [isKilling, setIsKilling] = useState<boolean>(false);
  const [killCountdown, setKillCountdown] = useState<number | null>(null);

  const executeKillSequence = async () => {
    setIsKilling(true);
    try {
      // 1. Pause all active running algorithmic instances instantly
      setActiveBots((prev) =>
        prev.map((bot) => ({
          ...bot,
          status: "PAUSED",
        })),
      );

      // Reset spot holdings to simulate exit positions back to USDT safely for paper/local accounts
      setPortfolio((prev) => {
        const btcValue =
          prev.btc *
          (pairs.find((p) => p.symbol === "BTC/USDT")?.currentPrice || 64000);
        const ethValue =
          (prev.eth ?? 0) *
          (pairs.find((p) => p.symbol === "ETH/USDT")?.currentPrice || 3450);
        const solValue =
          (prev.sol ?? 0) *
          (pairs.find((p) => p.symbol === "SOL/USDT")?.currentPrice || 160);
        const bnbValue =
          (prev.bnb ?? 0) *
          (pairs.find((p) => p.symbol === "BNB/USDT")?.currentPrice || 580);
        const totalValue = btcValue + ethValue + solValue + bnbValue;

        return {
          ...prev,
          usdt: parseFloat((prev.usdt + totalValue).toFixed(2)),
          btc: 0,
          eth: 0,
          sol: 0,
          bnb: 0,
        };
      });

      if (isLiveTrading) {
        if (
          apiConnection.isConnected &&
          apiConnection.apiKey &&
          apiConnection.apiSecret
        ) {
          // 2. Call the backend proxy endpoint to cancel all open orders in Binance
          const response = await fetch("/api/gateway/cancel-all", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              apiKey: apiConnection.apiKey,
              apiSecret: apiConnection.apiSecret,
              useTestnet: apiConnection.useTestnet === true,
            }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            alert(
              lang === "ar"
                ? `⚡ تم تشغيل مفتاح الطوارئ بنجاح وسحب كافة الصفقات!\nتم الاتصال ببينانس بنجاح وإلغاء صفقات الأزواج المشفرة بنجاح، كما تم إيقاف وتعليق جميع بوتات التداول الآلية لمنع فتح أي مراكز مالية جديدة.`
                : `⚡ Emergency Kill Switch executed successfully!\nAll pending and active orders on Binance have been cancelled, and all automated trading strategies have been safely halted.`,
            );
          } else {
            alert(
              lang === "ar"
                ? `⚠️ تم تعليق تداول البوتات محلياً، ولكن واجهت منصة بينانس عطلاً أثناء إلغاء الأوامر: ${data.error || "يرجى مراجعة مفاتيح الاتصال وطبيعة الأرصدة."}`
                : `⚠️ Bots halted locally. However, Binance returned an issue: ${data.error || "Please verify API keys and network capabilities."}`,
            );
          }
        } else {
          alert(
            lang === "ar"
              ? "⚠️ مفتاح تصفية الطوارئ قيد العمل للتداول التجريبي فقط! لم يرسل أمر تصفية لبينانس لعدم وجود مفتاح API متصل بنجاح."
              : "⚠️ Emergency Kill Switch activated in offline sandbox mode! No active API keys were found connected to dispatch live Binance requests.",
          );
        }
      } else {
        alert(
          lang === "ar"
            ? "⚡ تم تفعيل مفتاح تصفية الطوارئ بنجاح! تم تعليق وإيقاف جميع البوتات والصفقات التجريبية المفتوحة فورياً وتصفيتها لحماية حسابك الافتراضي."
            : "⚡ Emergency Kill Switch triggered successfully! All active demo bots and paper trading positions have been halted immediately.",
        );
      }
    } catch (err: any) {
      console.warn("Core Kill Switch Warning:", err.message || err);
      alert(
        lang === "ar"
          ? `❌ حدث خطأ غير متوقع أثناء تمرير إشارة الطوارئ: ${err.message || err}`
          : `❌ Fatal error occurred during Emergency sequence: ${err.message || err}`,
      );
    } finally {
      setIsKilling(false);
    }
  };

  const handleEmergencyKillSwitch = () => {
    if (isKilling) return;

    if (killCountdown !== null) {
      setKillCountdown(null);
      alert(
        lang === "ar"
          ? "🛑 تم إلغاء تصفية الطوارئ وإيقاف العملية بنجاح!"
          : "🛑 Emergency Kill Switch cancelled successfully!",
      );
      return;
    }

    setKillCountdown(5);
  };

  useEffect(() => {
    if (killCountdown === null) return;

    if (killCountdown === 0) {
      setKillCountdown(null);
      executeKillSequence();
      return;
    }

    const timer = setTimeout(() => {
      setKillCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [killCountdown]);

  // Background Tracker for last automated whale trade timing to prevent high-frequency spam execution (min 8 seconds cooldown)
  const lastWhaleTradeTimeRef = useRef<number>(0);

  const handleWhaleSignal = async (signal: {
    symbol: string;
    type: 'INFLOW' | 'OUTFLOW' | 'TRANSFER' | 'CONTRACT';
    amount: number;
    usdValue: number;
    classification_ar: string;
    classification_en: string;
  }) => {
    if (!whaleTradingEnabled || !canTrade) return;

    // Reject low-value whale signals from auto-trading (min $100k USD)
    if (signal.usdValue < 100000) return;

    // Cooldown check (prevent placing 20 trades in 2 seconds)
    const nowLocal = Date.now();
    if (nowLocal - lastWhaleTradeTimeRef.current < 8000) return;
    
    const lastFail = failedCoinsCooldownRef.current[signal.symbol] || 0;
    if (nowLocal - lastFail < 60000) return; // 60s cooldown for a failed coin

    // Find if we have a matching pair in our listed pairs (the list of coins in manual trading / system pairs)
    const availablePairs = pairs.length > 0 ? pairs : INITIAL_PAIRS;
    const matchedPair = availablePairs.find(p => p.symbol.startsWith(signal.symbol + '/'));
    if (!matchedPair) return;

    // Map: OUTFLOW (whales withdrawing, accumulation) -> BUY
    // Map: INFLOW (whales depositing, sell pressure) -> SELL
    const tradeSide = signal.type === 'OUTFLOW' ? 'BUY' : 'SELL';

    // Use Futures balance for Whale Radar
    // Smart Compounding: Use 15% to 30% of portfolio for whales, or the set quick buy amount, whichever is larger
    let sizeInUsdt = Math.max(quickBuyAmountUsdt, portfolio.futuresUsdt * 0.15);
    const minimumTradeSize = isLiveTrading ? 5.1 : 0.5; // Enforce Binance $5 minimum for live trading

    if (portfolio.futuresUsdt < sizeInUsdt) {
      if (portfolio.futuresUsdt >= minimumTradeSize) {
        sizeInUsdt = parseFloat((portfolio.futuresUsdt * 0.90).toFixed(2));
      } else {
        // Not enough funds for a safe trade
        failedCoinsCooldownRef.current[matchedPair.symbol] = Date.now() + 300000; // 5 min cooldown
        return;
      }
    }

    // Fasten sizeInUsdt to not exceed portfolio.futuresUsdt and make sure it has 4 dec max
    sizeInUsdt = parseFloat(Math.min(sizeInUsdt, portfolio.futuresUsdt).toFixed(4));

    const coinPrice = matchedPair.currentPrice;
    
    // Adaptive Leverage to pass Binance $5 Minimum Notional Value Rule (Safely)
    let optimizedLeverage = 10; // Default to safer 10x
    if (isLiveTrading) {
       // If size is small, we calculate needed leverage to reach $5.5 (buffer)
       // But we CAP it at 20x to avoid instant liquidation
       const neededLeverage = Math.ceil(5.5 / sizeInUsdt);
       optimizedLeverage = Math.min(20, Math.max(10, neededLeverage));
       
       // If even at 20x we can't reach $5 notional, we don't trade.
       if (sizeInUsdt * optimizedLeverage < 5.0) {
         console.warn(`[Whale Bot] Margin $${sizeInUsdt} is too small for Binance $5 limit even at 20x leverage.`);
         return;
       }
    }

    const defaultLeverage = optimizedLeverage;
    const finalAmount = formatPrecision(((sizeInUsdt * defaultLeverage) / coinPrice), matchedPair.symbol, coinPrice);

    if (finalAmount <= 0) return;

    lastWhaleTradeTimeRef.current = nowLocal;

    // Place the order!
    try {
      if (isLiveTrading && apiConnection.isConnected && apiConnection.apiKey) {
        const response = await fetch("/api/gateway/futures/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey: apiConnection.apiKey,
            apiSecret: apiConnection.apiSecret,
            useTestnet: apiConnection.useTestnet === true,
            symbol: matchedPair.symbol,
            side: tradeSide,
            type: "MARKET",
            amount: finalAmount,
            price: coinPrice,
            leverage: defaultLeverage,
            marginType: "ISOLATED"
          }),
        });
        
        const resData = await response.json();
        if (!response.ok || !resData.success) {
           throw new Error(resData.error || 'Futures API rejected order.');
        }
      } else {
         // Paper Futures trading -> inject into localStorage
         const saved = localStorage.getItem("almoharif_futures_positions");
         const positions = saved ? JSON.parse(saved) : [];
         
         const newPos = {
            id: `fst-${Date.now()}-${Math.random().toString().substring(2,8)}`,
            symbol: matchedPair.symbol,
            side: tradeSide === "BUY" ? "LONG" : "SHORT",
            marginType: "ISOLATED",
            margin: sizeInUsdt,
            leverage: defaultLeverage,
            amount: finalAmount,
            entryPrice: coinPrice,
            currentPrice: coinPrice,
            liquidationPrice: tradeSide === "BUY" ? coinPrice * 0.9 : coinPrice * 1.1,
            unrealizedPnl: 0,
            unrealizedPnlPercent: 0,
         };
         
         positions.push(newPos);
         localStorage.setItem("almoharif_futures_positions", JSON.stringify(positions));
         window.dispatchEvent(new Event("futures_positions_updated"));

         // Update portfolio futures balance
         setPortfolio(prev => ({
           ...prev,
           futuresUsdt: prev.futuresUsdt - sizeInUsdt
         }));
      }

      // Dispatch visual feedback
      handleTriggerToast({
        id: `whale-autotrade-${Date.now()}`,
        botId: "whale-tracker-bot",
        botType: "DCA",
        symbol: matchedPair.symbol,
        profit: 0,
        timestamp: Date.now(),
        isMilestone: true,
        aiExplanationAr: `🐳 [رادار صفقات الحيتان] صفقة عقود آجلة (Futures) تلقائية رافعة (${defaultLeverage}x)! حركة حوت لعملة ${signal.symbol}.. تم الدخول الفوري بصفقة ${tradeSide === 'BUY' ? 'شراء (Long) 📈' : 'بيع (Short) 📉'} بقيمة هامش $${sizeInUsdt} بسعر $${coinPrice}.`,
        aiExplanationEn: `🐳 [Whale radar system] Auto-Futures Trade leveraging ${defaultLeverage}x! Detected whale activity on ${signal.symbol}. Automated engine instantly triggered a ${tradeSide === 'BUY' ? 'BUY (Long)' : 'SELL (Short)'} position margin $${sizeInUsdt} at $${coinPrice}.`,
      });
    } catch (err: any) {
      console.warn("Failed to dispatch automated whale-triggered futures trade:", err.message || err);
      failedCoinsCooldownRef.current[signal.symbol] = Date.now() + 300000; // 5 min cooldown for this coin
      const msg = err.message || err.toString();
      if (Date.now() - (window.lastApiErrorToastTime || 0) > 60000) { // Global 60s cooldown for API errors
        window.lastApiErrorToastTime = Date.now();
        handleTriggerToast({
          id: `whale-err-${Date.now()}`,
          symbol: signal.symbol,
          timestamp: Date.now(),
          isError: true,
          aiExplanationAr: `❌ فشل تنفيذ صفقة الحيتان التلقائية!\nالسبب: ${msg}\nيرجى التحقق من توفر رصيد كاف ومفاتيح API صالحة.`,
          aiExplanationEn: `❌ Failed to execute automated whale trade!\nReason: ${msg}\nPlease verify API keys and balance.`,
        });
      }
    }
  };

  const lastScannedTradeTimeRef = useRef<number>(0);
  const failedCoinsCooldownRef = useRef<Record<string, number>>({});
  const failedBotsCooldownRef = useRef<Record<string, number>>({});

  // Background Watchlist Scanner of all manual trading pairs
  useEffect(() => {
    if (!manualWatchlistScannerEnabled || !canTrade) return;

    const blob = new Blob([`
      let timer = null;
      self.onmessage = function(e) {
        if (e.data.command === 'start') {
          timer = setInterval(() => self.postMessage('tick'), e.data.delay);
        } else if (e.data.command === 'stop') {
          clearInterval(timer);
        }
      };
    `], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);
    
    worker.onmessage = async () => {
      // Cooldown check (minimum 15 seconds between scanner automated trades to manage fees and funds)
      const nowMs = Date.now();
      if (nowMs - lastScannedTradeTimeRef.current < 15000) return;

      const availablePairs = pairsRef.current.length > 0 ? pairsRef.current : INITIAL_PAIRS;
      if (availablePairs.length === 0) return;

      // Check active orders count to avoid spamming or over-trading
      const activeOrdersCount = ordersRef.current.filter(o => o.status === 'FILLED').length;

      // Map each coin to its indicators and analyze opportunities
      const candidates = availablePairs.map((coin) => {
        // Calculate dynamic real-time simulated RSI & volatility indicators
        let baseRsi = 50 + (coin.change24h * 3.8);
        const hash = coin.symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const wave = Math.sin((Date.now() / 3000) + hash) * 8.5; // faster wave, larger amplitude
        const rsi = Math.min(Math.max(Math.round(baseRsi + wave), 14), 86);

        const baseVol = Math.abs(coin.change24h) * 1.25 + 1.1;
        const waveVolByTime = Math.sin((Date.now() / 5000) + hash) * 1.5;
        const vol = parseFloat(Math.min(Math.max(baseVol + waveVolByTime, 0.6), 18.2).toFixed(2));

        const isVolumeSpike = (Math.abs(coin.change24h) * 1.5 + (coin.volume24h % 100) / 10) > 6.0;
        
        const rsiDistance = Math.abs(50 - rsi);
        const volBonus = vol * 3.5;
        const spBonus = isVolumeSpike ? 15 : 0;
        const confidenceScore = Math.min(Math.max(Math.round(45 + rsiDistance * 1.5 + volBonus + spBonus), 35), 99);

        // Optimal triggers:
        // Buy: if oversold (RSI < 30) with extremely high confidence
        // Sell/Short: if overbought (RSI > 70) with extremely high confidence
        let suggestedSide: "BUY" | "SELL" | null = null;
        const requiredConfidence = isLiveTrading ? 90 : 70; // Even higher barrier for real funds

        if (confidenceScore >= requiredConfidence) { 
          if (rsi < 30) {
            suggestedSide = "BUY";
          } else if (rsi > 70) {
            suggestedSide = "SELL";
          }
        }

        return {
          pair: coin,
          rsi,
          volatility: vol,
          isVolumeSpike,
          confidenceScore,
          suggestedSide,
        };
      }).filter(c => c.suggestedSide !== null);

      // Sort candidates by highest confidence score
      candidates.sort((a, b) => b.confidenceScore - a.confidenceScore);

      if (candidates.length > 0) {
        const bestCandidate = candidates[0];
        
        // Active Bot Orders
        const activeBotOrders = ordersRef.current.filter(o => o.status === 'FILLED' && !o.isClosedScalped && o.originType === "BOT");
        
        if (activeBotOrders.length >= 1) {
          if (bestCandidate.confidenceScore >= 80) {
            // Exceptional opportunity found! Close existing bot trades to free up capital
            activeBotOrders.forEach(o => {
               const latestCoin = pairsRef.current.find(p => p.symbol === o.symbol);
               const cPrice = latestCoin ? latestCoin.currentPrice : (o.price || 0);
               triggerManualQuickScalpExit(o, cPrice, "REBOUND_COMPLETED");
            });
          } else {
            // Wait until current trades are closed
            return;
          }
        }

        const coin = bestCandidate.pair;
        const tradeSide = bestCandidate.suggestedSide!;
        
        // Ensure we don't spam duplicate orders on the same coin too close to each other
        const isDuplicate = ordersRef.current.slice(0, 5).some(o => o.symbol === coin.symbol && o.side === tradeSide);
        if (isDuplicate) return;

        const nowCooldownMs = Date.now();
        const lastFail = failedCoinsCooldownRef.current[coin.symbol] || 0;
        // Increased cooldown to 10 minutes (600,000ms) after a trade or failure on a specific coin
        if (nowCooldownMs - lastFail < 600000) return; 

        // Trade sizing & Leverage dynamically scaled based on signal strength
        let baseSizing = quickBuyAmountUsdt;
        let scalingMultiplier = 1;
        let dynamicLeverage = 10; // Safer default

        if (bestCandidate.confidenceScore >= 75) {
          scalingMultiplier = 1 + ((bestCandidate.confidenceScore - 75) / 25) * 1.0; 
          dynamicLeverage = Math.round(10 + ((bestCandidate.confidenceScore - 75) / 25) * 10); // max 20x
        }

        let sizeInUsdt = baseSizing * scalingMultiplier;
        const currentPortfolio = portfolioRef.current;
        const minimumTradeSize = isLiveTrading ? 5.1 : 0.5;

        const tradeDirectionAr = tradeSide === "BUY" ? "شراء (Long - ارتداد للارتفاع 📈)" : "بيع (Short - ارتداد للهبوط 📉)";
        const tradeDirectionEn = tradeSide === "BUY" ? "BUY (Long - Upward Rebound 📈)" : "SELL (Short - Downward Rebound 📉)";
        const reasonAr = tradeSide === "BUY" 
          ? (bestCandidate.rsi < 42 ? "مؤشر القوة النسبية (RSI) يشير إلى تشبع بيعي مفرط" : "زخم شرائي مفاجئ قوي مع ارتفاع حجم التداول")
          : (bestCandidate.rsi > 58 ? "مؤشر القوة النسبية (RSI) يشير إلى تشبع شرائي مفرط" : "زخم بيعي قوي مع هبوط سريع");
        const reasonEn = tradeSide === "BUY"
          ? (bestCandidate.rsi < 42 ? "RSI indicates extreme oversold conditions" : "Strong sudden bullish momentum with volume spike")
          : (bestCandidate.rsi > 58 ? "RSI indicates extreme overbought conditions" : "Strong bearish momentum with rapid drop");

        if (currentPortfolio.futuresUsdt < sizeInUsdt) {
          if (currentPortfolio.futuresUsdt >= minimumTradeSize) {
             // Fallback to use available balance if it meets minimum
             sizeInUsdt = parseFloat((currentPortfolio.futuresUsdt * 0.95).toFixed(2));
          } else {
            if (isLiveTrading) {
            }
            return;
          }
        }
        
        sizeInUsdt = parseFloat(Math.min(sizeInUsdt, currentPortfolio.futuresUsdt).toFixed(4));

        const coinPrice = coin.currentPrice;
        const finalAmount = formatPrecision(((sizeInUsdt * dynamicLeverage) / coinPrice), coin.symbol, coinPrice);

        if (finalAmount <= 0) return;

        lastScannedTradeTimeRef.current = nowMs;

        try {
          await handleAddNewOrder({
            symbol: coin.symbol,
            side: tradeSide,
            type: "MARKET",
            price: coinPrice,
            amount: finalAmount,
            total: parseFloat((coinPrice * finalAmount).toFixed(2)),
            leverage: dynamicLeverage,
            originType: "BOT",
            isFutures: true,
            aiReasonAr: `${reasonAr} (RSI: ${bestCandidate.rsi} / Volatility: ${bestCandidate.volatility}%)`,
            aiReasonEn: `${reasonEn} (RSI: ${bestCandidate.rsi} / Volatility: ${bestCandidate.volatility}%)`,
          });

          // Dispatch premium notification
          handleTriggerToast({
            id: `scan-autotrade-${Date.now()}`,
            botId: "sweep-scanner-bot",
            botType: "GRID",
            symbol: coin.symbol,
            profit: 0,
            timestamp: Date.now(),
            isMilestone: true,
            aiExplanationAr: `🔍 [مستكشف صفقات التداول اليدوي - بداية الارتداد] صفقة تلقائية بأقصى استجابة! رصد البوت إشارة دخول قوية لعملة ${coin.symbol}.
اتجاه الصفقة: ${tradeDirectionAr}
السبب الفني: ${reasonAr} (RSI: ${bestCandidate.rsi} / Volatility: ${bestCandidate.volatility}%)
📊 **الفرصة:** ثقة فائقة بمستوى ${bestCandidate.confidenceScore}%
⚡ **الرافعة الديناميكية:** ${dynamicLeverage}x (مضاعفة ديناميكياً)
💵 **رصيد الدخول والمامش المخصص:** $${sizeInUsdt.toFixed(2)} USDT`,
            aiExplanationEn: `🔍 [Manual Watchlist Scanner - Rebound] Premium auto-recovery trigger! Located gold entry signal on ${coin.symbol}.
Direction: ${tradeDirectionEn}
Technical Reason: ${reasonEn} (RSI: ${bestCandidate.rsi} / Volatility: ${bestCandidate.volatility}%)
📊 **Confidence Level:** Ultra high ${bestCandidate.confidenceScore}%
⚡ **Dynamic Leverage:** ${dynamicLeverage}x (automatically elevated)
💵 **Allotted Entry Margin:** $${sizeInUsdt.toFixed(2)} USDT`,
          });
        } catch (err: any) {
          console.warn("Watchlist scanner auto order failed:", err.message || err);
          failedCoinsCooldownRef.current[coin.symbol] = Date.now() + 300000; // 5 min cooldown for this coin
          const msg = err.message || err.toString();
          if (Date.now() - (window.lastApiErrorToastTime || 0) > 60000) {
            window.lastApiErrorToastTime = Date.now();
            handleTriggerToast({
              id: `scan-err-${Date.now()}`,
              symbol: coin.symbol,
              timestamp: Date.now(),
              isError: true,
              aiExplanationAr: `❌ فشل إطلاق صفقة ارتداد تلقائية!\nالسبب: ${msg}\nيرجى التأكد من ربط حساب بينانس وتوفر رصيد كاف.`,
              aiExplanationEn: `❌ Failed to execute auto-rebound trade!\nReason: ${msg}\nPlease verify your Binance API connection and balance.`,
            });
          }
        }
      }
    };
    worker.postMessage({ command: 'start', delay: 20000 }); // Scan every 20 seconds instead of 15

    return () => {
      worker.postMessage({ command: 'stop' });
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };
  }, [manualWatchlistScannerEnabled]);

  const ordersRef = useRef(orders);
  useEffect(() => {                
    ordersRef.current = orders;                
  }, [orders]);

  const canTradeRef = useRef(canTrade);
  useEffect(() => {
    canTradeRef.current = canTrade;
  }, [canTrade]);

  // High-Speed 1-Minute & 5-Minute Quick Scalp Rebound Monitoring and Automated Entry
  const isScanningRef = useRef(false);
  useEffect(() => {
    if (!quickScalpScannerEnabled) return;

    async function scanAction() {
      if (!canTradeRef.current || isScanningRef.current) return;
      isScanningRef.current = true;
      
      const now = Date.now();
      const availablePairs = pairsRef.current.length > 0 ? pairsRef.current : INITIAL_PAIRS;
      if (availablePairs.length === 0) {
        isScanningRef.current = false;
        return;
      }
      
      const logsToBatch: any[] = [];
      
      for (const coin of availablePairs) {
        let selectedHist = priceHistory5mRef.current[coin.symbol] || [];
        if (reboundRadarTimeframe === "1m") selectedHist = priceHistoryRef.current[coin.symbol] || [];
        if (reboundRadarTimeframe === "15m") selectedHist = priceHistory15mRef.current[coin.symbol] || [];
        if (reboundRadarTimeframe === "30m") selectedHist = priceHistory30mRef.current[coin.symbol] || [];
        
        const hist15m = priceHistory15mRef.current[coin.symbol] || [];
        if (selectedHist.length < 2) continue;
        
        const inputs: EngineInputs = {
          symbol: coin.symbol,
          currentPrice: coin.currentPrice,
          hist5m: selectedHist, // Use selected timeframe as primary short-term history
          hist15m,
          volume24h: coin.volume24h,
          change24h: coin.change24h,
          whaleActivity: 50, // Simulated or real if available
          btcCorrelation: 0.8,
        };

        const decision = evaluateTradeDecision(inputs);
        
        // Filter out non-actionable decisions or low scores based on threshold
        // Reduced threshold to make the bot extremely active and fast-moving as requested
        if (decision.score < 45 || decision.action === 'HOLD') continue;
        
        const nowMs = Date.now();
        const lastFail = failedCoinsCooldownRef.current[coin.symbol] || 0;
        if (nowMs - lastFail < 60000) continue; // 60 seconds cooldown for a failed coin

        const alreadyTradingThisCoin = ordersRef.current.some(o => o.symbol === coin.symbol && o.status === "FILLED" && !o.isClosedScalped);
        if (alreadyTradingThisCoin) continue;

        let lev = manualLeverage;
        let entryAmountUsdt = quickBuyAmountUsdt;
        const minimumTradeSize = isLiveTrading ? 1.0 : 0.5;
        
        let notional = entryAmountUsdt * lev;
        if (notional < 20) {
          lev = Math.min(20, Math.ceil(20 / Math.max(0.5, entryAmountUsdt)));
          notional = entryAmountUsdt * lev;
        }

        if (portfolioRef.current.futuresUsdt < entryAmountUsdt) {
          if (portfolioRef.current.futuresUsdt >= minimumTradeSize) {
            entryAmountUsdt = parseFloat((portfolioRef.current.futuresUsdt * 0.95).toFixed(2));
          } else {
            const warnMsgAr = `⚠️ رصيد غير كافٍ. المطلوب: $${entryAmountUsdt} USDT، الرصيد: $${portfolioRef.current.futuresUsdt} USDT. (الحد الأدنى: ${minimumTradeSize} USDT)\nاتجاه الصفقة: ${decision.action === 'BUY' ? 'شراء' : 'بيع'}\nالسبب: ${decision.reasons.join(', ')}`;
            const warnMsgEn = `⚠️ Insufficient balance. Required: $${entryAmountUsdt} USDT, Balance: $${portfolioRef.current.futuresUsdt} USDT. (Min: ${minimumTradeSize} USDT)\nDirection: ${decision.action}\nReason: ${decision.reasons.join(', ')}`;
            logsToBatch.push({
              id: `log-${now}-${Math.random()}`,
              timestamp: now,
              symbol: coin.symbol,
              type: "WARNING",
              msgAr: warnMsgAr,
              msgEn: warnMsgEn,
              rsi5m: decision.score,
              rsi15m: decision.confidence,
            });
            // Intentionally omit toast for insufficient balance to prevent spam
            failedCoinsCooldownRef.current[coin.symbol] = Date.now();
            continue;
          }
        }

        const finalQty = formatPrecision(((entryAmountUsdt * lev) / coin.currentPrice), coin.symbol, coin.currentPrice);
        if (finalQty <= 0) continue;

        try {
          await handleAddNewOrder({
            symbol: coin.symbol,
            side: decision.action,
            type: "MARKET",
            price: coin.currentPrice,
            amount: finalQty,
            total: parseFloat((coin.currentPrice * finalQty).toFixed(2)),
            leverage: lev,
            originType: "BOT",
            isQuickBuy: true,
            isFutures: true,
            takeProfit: decision.takeProfitRef,
            stopLoss: decision.stopLossRef,
            aiReasonAr: decision.reasons.join(', '),
            aiReasonEn: decision.reasons.join(', ')
          });

          const label = decision.score >= 95 ? "استثنائية" : decision.score >= 85 ? "قوية" : "عادية";

          logsToBatch.push({
            id: `log-${now}-${Math.random()}`,
            timestamp: now,
            symbol: coin.symbol,
            type: "SUCCESS",
            msgAr: `⚡ [المحرك الذكي - ${label}] تم تنفيذ ${decision.action === 'BUY' ? 'شراء' : 'بيع'} للعملة ${coin.symbol}! الثقة: ${decision.score}%. السبب: ${decision.reasons.join(', ')}`,
            msgEn: `⚡ [AI Engine - ${label}] Executed ${decision.action} on ${coin.symbol}! Confidence: ${decision.score}%. Reasons: ${decision.reasons.join(', ')}`,
            rsi5m: decision.score,
            rsi15m: decision.confidence,
            price: coin.currentPrice,
            amount: finalQty,
            leverage: lev
          });

          handleTriggerToast({
            id: `ai-engine-${now}`,
            botId: "decision-engine",
            botType: "RSI",
            symbol: coin.symbol,
            profit: 0,
            timestamp: now,
            isVolatilityWarning: decision.score >= 90,
            aiExplanationAr: `🤖 [محرك القرار الذكي] 
${decision.aiCommentaryAr}

الأسباب:
${decision.reasons.map(r => '• '+r).join('\n')}`,
            aiExplanationEn: `🤖 [Smart Decision Engine] 
${decision.aiCommentaryEn}

Reasons:
${decision.reasons.map(r => '• '+r).join('\n')}`,
          });
        } catch (er: any) {
          console.warn("AI Engine order fail:", er.message);
          failedCoinsCooldownRef.current[coin.symbol] = Date.now() + 300000; // 5 min cooldown for this coin
          const msg = er.message || er.toString();
          if (Date.now() - (window.lastApiErrorToastTime || 0) > 60000) {
            window.lastApiErrorToastTime = Date.now();
            handleTriggerToast({
              id: `ai-err-${Date.now()}`,
              symbol: coin.symbol,
              timestamp: Date.now(),
              isError: true,
              aiExplanationAr: `❌ فشل تنفيذ صفقة الذكاء الاصطناعي!\nالسبب: ${msg}\nقم بمراجعة الرصيد والمفاتيح.`,
              aiExplanationEn: `❌ Failed to execute AI engine trade!\nReason: ${msg}\nCheck balance and API keys.`,
            });
          }
        }
      }
      
      if (logsToBatch.length > 0) {
        setQuickScalpScannerLog(prev => [...logsToBatch, ...prev]);
      }
      
      isScanningRef.current = false;
    };
    const blob = new Blob([`
      let timer = null;
      self.onmessage = function(e) {
        if (e.data.command === 'start') {
          timer = setInterval(() => self.postMessage('tick'), e.data.delay);
        } else if (e.data.command === 'stop') {
          clearInterval(timer);
        }
      };
    `], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);
    
    worker.onmessage = () => {
      scanAction();
    };
    worker.postMessage({ command: 'start', delay: 1500 });

    return () => {
      worker.postMessage({ command: 'stop' });
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };
  }, [quickScalpScannerEnabled, reboundRadarTimeframe]);

  // Calculate and simulate offline elapsed time profits automatically
  // Heartbeat to save online time every 5 seconds
  useEffect(() => {
    const heartbeat = setInterval(() => {
      localStorage.setItem("almoharif_last_online", Date.now().toString());
    }, 5000);
    return () => clearInterval(heartbeat);
  }, []);

  const openBots = activeBots.filter((bot) => bot.status === "RUNNING");
  const openBotsCount = openBots.length;

  const totalBotInvestment = openBots.reduce((acc, bot) => {
    const invest =
      bot.type === "GRID"
        ? (bot.config as any).investmentAmount
        : bot.type === "DCA"
          ? (bot.config as any).totalInvestment
          : (bot.config as any).tradeAmount * 3;
    return acc + (invest || 0);
  }, 0);

  const totalBotProfit = openBots.reduce(
    (acc, bot) => acc + (bot.accumulatedProfit || 0),
    0,
  );

  // Average Cumulative Return on Investment (ROI) for all open bots
  const averageCumulativeRoi =
    openBotsCount > 0
      ? openBots.reduce((acc, bot) => acc + (bot.profitPercentage || 0), 0) /
        openBotsCount
      : 0;

  // Weighted Portfolio ROI
  const weightedBotRoi =
    totalBotInvestment > 0 ? (totalBotProfit / totalBotInvestment) * 100 : 0;

  // Derived sparkline data to ensure the absolute latest 'totalBotProfit' is mapped as the final point
  const sparklineData = profitHistory.map((pt, idx) => {
    if (idx === profitHistory.length - 1) {
      return {
        ...pt,
        profit: parseFloat(totalBotProfit.toFixed(2)),
        botsCount: activeBots.length,
      };
    }
    return pt;
  });

  const isTransitioningSession =
    user && localStorage.getItem("almoharif_user_uid") !== user.uid;

  const renderTradingSuspended = () => (
    <div className="flex flex-col items-center justify-center p-12 bg-slate-900 border border-slate-800 rounded-xl my-6 shadow-xl w-full">
      <div className="w-16 h-16 bg-rose-900/30 rounded-full flex items-center justify-center mb-6 border border-rose-500/50">
        <ShieldAlert className="w-8 h-8 text-rose-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-200 mb-2">
        {lang === "ar"
          ? "صلاحيات التداول معلقة"
          : "Trading Privileges Suspended"}
      </h2>
      <p className="text-slate-400 text-center max-w-md">
        {lang === "ar"
          ? "عذراً، لم يعد لديك الصلاحية لإجراء صفقات أو تفعيل البوتات. يرجى التواصل مع إدارة النظام."
          : "Sorry, you no longer have permission to execute trades or activate bots. Please contact system administration."}
      </p>
    </div>
  );

  if (loading || isTransitioningSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-bold">
          {lang === "ar"
            ? "جاري تهيئة المساحة الآمنة..."
            : "Initializing Secure Environment..."}
        </p>
      </div>
    );
  }

  if (
    user &&
    userData?.permissions &&
    userData.permissions.canAccess === false
  ) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mb-6 border border-red-500/50">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-red-400 mb-4">
            {lang === "ar" ? "تم تعليق الوصول" : "Access Suspended"}
          </h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            {lang === "ar"
              ? "لقد قام إدارة النظام بتعليق أو منع وصولك إلى المنصة. يرجى التواصل مع فريق الدعم الفني للمزيد من التفاصيل."
              : "System administration has suspended or blocked your access to the platform. Please contact tech support for more details."}
          </p>
          <button
            onClick={() => {
              logout();
              window.location.reload();
            }}
            className="w-full bg-slate-800 hover:bg-slate-750 text-white font-bold py-3.5 px-6 rounded-xl border border-slate-700 transition"
          >
            {lang === "ar" ? "تسجيل الخروج" : "Log Out"}
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    const handleAuthSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError("");
      setAuthSuccess("");

      if (!emailForSignIn) {
        setAuthError(
          lang === "ar"
            ? "الرجاء إدخال البريد الإلكتروني"
            : "Please enter your email",
        );
        return;
      }

      try {
        if (authMode === "forgot") {
          await resetPassword(emailForSignIn);
          setAuthSuccess(
            lang === "ar"
              ? "تم إرسال رابط استعادة كلمة المرور إلى بريدك"
              : "Password reset link sent to your email",
          );
          return;
        }

        if (!passwordForSignIn) {
          setAuthError(
            lang === "ar"
              ? "الرجاء إدخال كلمة المرور"
              : "Please enter your password",
          );
          return;
        }

        if (authMode === "register") {
          const expectedAnswer = (mathA + mathB).toString();
          if (mathAnswer !== expectedAnswer) {
            setAuthError(
              lang === "ar"
                ? "إجابة التحقق البشري خاطئة"
                : "Incorrect human verification answer",
            );
            setMathA(Math.floor(Math.random() * 10) + 1);
            setMathB(Math.floor(Math.random() * 10) + 1);
            setMathAnswer("");
            return;
          }
          await registerWithEmail(emailForSignIn, passwordForSignIn);
          // Wait to see if user logs in automatically, usually they do
        } else {
          // Login
          await loginWithEmailProvider(emailForSignIn, passwordForSignIn);
        }
      } catch (err: any) {
        console.error("Auth failed:", err);
        let msg = err.message || "Authentication error";
        if (msg.includes("auth/invalid-credential"))
          msg =
            lang === "ar" ? "أوراق الاعتماد غير صالحة" : "Invalid credentials";
        if (msg.includes("auth/network-request-failed"))
          msg =
            lang === "ar"
              ? "فشل الاتصال بالخادم. يرجى التأكد من اتصالك بالإنترنت أو إيقاف مانع الإعلانات، أو استخدم 'تسجيل الدخول عبر Google'."
              : "Network error. Please check your internet, disable adblockers, or try 'Log In via Google'.";
        if (msg.includes("auth/email-already-in-use"))
          msg =
            lang === "ar"
              ? "البريد الإلكتروني مستخدم بالفعل"
              : "Email already in use";
        if (msg.includes("auth/weak-password"))
          msg =
            lang === "ar" ? "كلمة المرور ضعيفة جدًا" : "Password is too weak";
        setAuthError(msg);
      }
    };

    return (
      <div className="min-h-[100dvh] w-full bg-slate-950 flex flex-col items-center justify-center p-4 overflow-y-auto relative z-0">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center my-auto relative z-10">
          <Activity className="w-16 h-16 text-indigo-500 mb-6 animate-pulse" />
          <h1 className="text-2xl font-black text-white mb-2 font-mono">
            Al-Moharif AI
          </h1>
          <p className="text-slate-400 text-sm mb-6 max-w-sm">
            {lang === "ar"
              ? "قم بتسجيل الدخول بأمان إلى منصتك الاحترافية"
              : "Sign in securely to access your professional trading platform"}
          </p>

          <form
            onSubmit={handleAuthSubmit}
            className="w-full space-y-3 mb-4"
            dir={lang === "ar" ? "rtl" : "ltr"}
          >
            <input
              type="email"
              value={emailForSignIn}
              onChange={(e) => setEmailForSignIn(e.target.value)}
              placeholder={
                lang === "ar" ? "البريد الإلكتروني" : "Email Address"
              }
              className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm text-center"
              required
            />

            {authMode !== "forgot" && (
              <input
                type="password"
                value={passwordForSignIn}
                onChange={(e) => setPasswordForSignIn(e.target.value)}
                placeholder={
                  lang === "ar" ? "كلمة المرور المشفرة" : "Secure Password"
                }
                className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm text-center"
                required
              />
            )}

            {authMode === "register" && (
              <div className="bg-slate-950/50 border border-slate-800 p-3 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-slate-400">
                  {lang === "ar"
                    ? "للتحقق أنك لست روبوت، أجب:"
                    : "Anti-bot verification: Answer this:"}{" "}
                  {mathA} + {mathB} = ?
                </label>
                <input
                  type="number"
                  value={mathAnswer}
                  onChange={(e) => setMathAnswer(e.target.value)}
                  placeholder={lang === "ar" ? "الإجابة" : "Answer"}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-slate-100 text-center focus:border-indigo-500"
                  required
                />
              </div>
            )}

            {authError && (
              <div className="text-rose-400 text-xs font-bold p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
                {authError}
              </div>
            )}

            {authSuccess && (
              <div className="text-emerald-400 text-xs font-bold p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                {authSuccess}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl transition text-sm flex justify-center items-center gap-2 pointer-events-auto cursor-pointer relative z-10"
            >
              {authMode === "login"
                ? lang === "ar"
                  ? "تسجيل الدخول"
                  : "Sign In"
                : authMode === "register"
                  ? lang === "ar"
                    ? "إنشاء حساب جديد وتفعيل البريد"
                    : "Create Account & Verify"
                  : lang === "ar"
                    ? "استعادة كلمة المرور"
                    : "Reset Password"}
            </button>
          </form>

          <div className="w-full flex justify-between px-2 mb-6 text-xs font-bold text-slate-400">
            {authMode !== "login" && (
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                  setAuthSuccess("");
                }}
                className="hover:text-indigo-400 transition"
              >
                {lang === "ar"
                  ? "لدي حساب بالفعل"
                  : "I already have an account"}
              </button>
            )}
            {authMode !== "register" && (
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setAuthError("");
                  setAuthSuccess("");
                }}
                className="hover:text-amber-400 transition"
              >
                {lang === "ar" ? "إنشاء حساب لأول مرة" : "Create a new account"}
              </button>
            )}
            {authMode !== "forgot" && (
              <button
                type="button"
                onClick={() => {
                  setAuthMode("forgot");
                  setAuthError("");
                  setAuthSuccess("");
                }}
                className="hover:text-slate-300 transition"
              >
                {lang === "ar" ? "نسيت كلمة المرور؟" : "Forgot password?"}
              </button>
            )}
          </div>

          <div className="w-full flex items-center justify-center gap-3 mb-6">
            <div className="h-px bg-slate-800 flex-1"></div>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              {lang === "ar" ? "أو" : "OR"}
            </span>
            <div className="h-px bg-slate-800 flex-1"></div>
          </div>

          <button
            type="button"
            onClick={async () => {
              setAuthError("");
              try {
                await loginWithGoogle();
              } catch (err: any) {
                console.error("Google Auth failed:", err);
                let msg = err.message || "Authentication error";
                if (msg.includes("auth/network-request-failed")) {
                  msg = lang === "ar"
                    ? "فشل الاتصال بالخادم. يرجى التأكد من اتصالك بالإنترنت أو إيقاف مانع الإعلانات."
                    : "Network error. Please check your internet or disable adblockers.";
                } else if (msg.includes("popup-closed-by-user")) {
                  msg = lang === "ar" ? "تم إغلاق نافذة تسجيل الدخول." : "Sign-in popup was closed.";
                }
                setAuthError(msg);
              }
            }}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition pointer-events-auto cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            {lang === "ar" ? "تسجيل الدخول عبر Google" : "Log In via Google"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${theme === 'light' ? 'theme-light bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'} flex flex-col font-sans selection:bg-emerald-600 selection:text-white transition-colors duration-200`}
      id="main-terminal-app"
    >
      {/* Dynamic Header navbar */}
      <Header
        lang={lang}
        setLang={setLang}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        portfolio={portfolio}
        futuresEquity={futuresEquity}
        isConnected={apiConnection.isConnected}
        isLiveTrading={isLiveTrading}
        setIsLiveTrading={setIsLiveTrading}
        balanceSyncError={balanceSyncError}
        futuresApiError={futuresApiError}
        userData={userData}
        isOwner={isOwner}
        notificationsHistory={notificationsHistory}
        onClearNotifications={handleClearNotificationsHistory}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main scrolling content frame */}
      <main
        className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6"
        id="primary-view-container"
      >
        {/* Trading pair fast select strip (Visible in relevant screens) */}
        {(activeTab === "spot" ||
          
          activeTab === "backtest" || activeTab === "futures") && (
          <div
            className="mb-6 flex flex-col gap-2.5 font-sans"
            dir={lang === "ar" ? "rtl" : "ltr"}
          >
            <div className="flex items-center justify-between border-b border-slate-800/40 pb-1.5 mb-1.5 flex-wrap gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-indigo-400" />
                {lang === "ar"
                  ? "📊 قائمة مراقبة وتداول العملات النشطة"
                  : "📊 WATCHED CRYPTO ASSET POOLS"}
              </span>

              <button
                onClick={() => {
                  setAddCoinFeedback(null);
                  setIsAddCoinOpen(true);
                }}
                className="flex items-center gap-1.5 text-xs text-indigo-455 hover:text-indigo-300 font-bold bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 hover:border-indigo-500/40 px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>
                  {lang === "ar"
                    ? "إضافة / إدارة العملات"
                    : "Manage & Add Coins"}
                </span>
              </button>
            </div>

            {/* Quick Buy Ticker Settings Bar */}
            <div className="flex flex-wrap items-center gap-4 bg-slate-900/40 border border-slate-800/50 p-2 rounded-xl text-xs justify-between mb-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-slate-400 font-bold flex items-center gap-1">
                  <span className="text-emerald-400 font-bold">⚡</span>
                  {lang === "ar" ? "الشراء السريع:" : "Active Quick Buy:"}
                </span>

                {/* Amount Config */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {lang === "ar" ? "القيمة:" : "Spend:"}
                  </span>
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 animate-pulse">
                    <input
                      type="number"
                      value={quickBuyAmountUsdt}
                      onChange={(e) => setQuickBuyAmountUsdt(Math.max(1, parseFloat(e.target.value) || 0))}
                      className="w-12 bg-transparent text-emerald-400 outline-none font-bold text-center font-mono"
                      min="1"
                    />
                    <span className="text-[10px] text-emerald-500 font-bold ml-1 font-mono">USDT</span>
                  </div>
                </div>

                {/* Leverage sync */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {lang === "ar" ? "الرافعة:" : "Lev:"}
                  </span>
                  <select
                    value={manualLeverage}
                    onChange={(e) => setManualLeverage(parseInt(e.target.value, 10))}
                    className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 font-bold font-mono outline-none cursor-pointer"
                  >
                    {[1, 2, 3, 5, 10, 15, 20, 25, 33, 50, 75, 100].map((lev) => (
                      <option key={lev} value={lev}>
                        {lev}x
                      </option>
                    ))}
                  </select>
                </div>

                {/* 1-Cent Scalping Protectors Toggle */}
                <div className="flex items-center gap-1.5 border-l border-slate-800/80 pl-3">
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    🛡️ {lang === "ar" ? "حامي السنت:" : "1-Cent Shield:"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuickScalpProtectorEnabled(prev => !prev)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all uppercase flex items-center gap-1 cursor-pointer border ${
                      quickScalpProtectorEnabled
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/15"
                        : "bg-slate-950 text-slate-500 border-slate-850 hover:bg-slate-900"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${quickScalpProtectorEnabled ? "bg-emerald-400 animate-ping" : "bg-slate-600"}`}></span>
                    <span>{quickScalpProtectorEnabled ? (lang === "ar" ? "نشط" : "ACTIVE") : (lang === "ar" ? "ملغى" : "MUTED")}</span>
                  </button>
                </div>
              </div>

              <span className="text-[9.5px] text-slate-500 font-semibold uppercase tracking-wide hidden md:inline animate-pulse">
                {lang === "ar" 
                  ? "🛡️ حامي الصفقات السريعة يغلق الصفقات تلقائياً عند أول تراجع حقيقي من الذروة" 
                  : "🛡️ Dynamic Scalp Shield closes lightning trades upon a confirmed drop from peak"}
              </span>
            </div>

            {/* 1m & 5m Lightning Rebound Scanner Dashboard Panel */}
            <div className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl mb-3 flex flex-col gap-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-800/60">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400">
                    <Activity className={`w-4 h-4 ${quickScalpScannerEnabled ? "animate-spin" : ""}`} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      {lang === "ar" ? "رادار الارتدادات السريعة" : "Lightning Rebound Radar"}
                      <span className="bg-indigo-500/15 text-indigo-400 text-[9px] px-1.5 py-0.5 rounded font-mono font-black">
                        QUANT
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      {lang === "ar" 
                        ? "يتحسس بوادر ارتداد السعر على الفريمات اللحظية ويدخل البوت السريع، وينسحب مباشرة عند اكتمال الارتداد."
                        : "Detects support bounces on micro timeframes to enter quick scalps, exiting immediately upon completion."}
                    </p>
                  </div>
                </div>

                {/* Control Toggle Switch */}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={reboundRadarTimeframe}
                    onChange={(e) => setReboundRadarTimeframe(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1.5 outline-none font-medium cursor-pointer hover:border-slate-600 transition"
                  >
                    <option value="1m">{lang === "ar" ? "1 دقيقة" : "1m"}</option>
                    <option value="5m">{lang === "ar" ? "5 دقائق" : "5m"}</option>
                    <option value="15m">{lang === "ar" ? "15 دقيقة" : "15m"}</option>
                    <option value="30m">{lang === "ar" ? "30 دقيقة" : "30m"}</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const bestCoin = pairs.reduce((best, coin) => {
                        let hist = priceHistory5mRef.current[coin.symbol] || [];
                        if (reboundRadarTimeframe === "1m") hist = priceHistoryRef.current[coin.symbol] || [];
                        if (reboundRadarTimeframe === "15m") hist = priceHistory15mRef.current[coin.symbol] || [];
                        if (reboundRadarTimeframe === "30m") hist = priceHistory30mRef.current[coin.symbol] || [];
                        
                        if (hist.length < 2) return best;
                        const pCurrent = coin.currentPrice;
                        const pMin = Math.min(...hist.map(h => h.price));
                        const reboundScore = (pCurrent - pMin) / pMin;
                        if (!best || reboundScore > best.score) {
                          return { symbol: coin.symbol, score: reboundScore };
                        }
                        return best;
                      }, null as { symbol: string, score: number } | null);

                      if (bestCoin) {
                        const now = Date.now();
                        setQuickScalpScannerLog(prev => [{
                          id: `log-${now}-${Math.random()}`,
                          timestamp: now,
                          symbol: bestCoin.symbol,
                          type: "INFO",
                          msgAr: `🔎 [أفضل فرصة - ${reboundRadarTimeframe}] تم العثور على ${bestCoin.symbol} كأفضل مرشح حالياً بناءً على ارتداد الفريم المحدد!`,
                          msgEn: `🔎 [Best Opportunity - ${reboundRadarTimeframe}] ${bestCoin.symbol} identified as currently best candidate based on timeframe rebound!`
                        }, ...prev]);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/15 cursor-pointer flex items-center gap-1.5 transition"
                  >
                    <span>{lang === "ar" ? "مسح الفرص" : "SCAN BEST"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuickScalpScannerEnabled(prev => !prev);
                      const now = Date.now();
                      const msgAr = !quickScalpScannerEnabled 
                        ? `🟢 تم تشغيل رادار الارتدادات (${reboundRadarTimeframe}) وجاري مسح السيولة للعملات...`
                        : "🔴 تم إيقاف رادار مسح صفقات الارتداد اللحظي.";
                      const msgEn = !quickScalpScannerEnabled 
                        ? `🟢 Rebound Radar (${reboundRadarTimeframe}) initiated. Scanning watched candidate assets...` 
                        : "🔴 Rebound Radar scanning suspended.";
                      setQuickScalpScannerLog(prev => [{
                        id: `log-${now}-${Math.random()}`,
                        timestamp: now,
                        symbol: "SYSTEM",
                        type: "INFO",
                        msgAr,
                        msgEn
                      }, ...prev]);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                      quickScalpScannerEnabled
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/15 shadow-md shadow-emerald-500/5 cursor-pointer"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850 hover:border-slate-700 cursor-pointer"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${quickScalpScannerEnabled ? "bg-emerald-400 animate-ping" : "bg-slate-500"}`}></span>
                    <span>
                      {quickScalpScannerEnabled 
                        ? (lang === "ar" ? "رادار الارتداد: نـشـط" : "REBOUND RADAR: ACTIVE") 
                        : (lang === "ar" ? "تفعيل بحث الارتداد" : "ACTIVATE REBOUND SCANNER")}
                    </span>
                  </button>
                  
                  {quickScalpScannerLog.length > 0 && (
                    <button
                      onClick={() => setQuickScalpScannerLog([])}
                      className="p-1 px-2.5 rounded text-[10px] text-slate-500 border border-slate-800/80 hover:bg-slate-900 hover:text-slate-300 transition cursor-pointer"
                      title={lang === "ar" ? "مسح السجل" : "Clear Logs"}
                    >
                      {lang === "ar" ? "مسح" : "Clear"}
                    </button>
                  )}
                </div>
              </div>

              {/* Status panel and sliding ticker */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-900/30 p-2.5 rounded-lg border border-slate-900">
                <div className="flex flex-col justify-center">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{lang === "ar" ? "تواتر الفحص:" : "SCAN INTERVAL:"}</span>
                  <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1">
                    ⏱️ 4.5s <span className="text-[10px] text-slate-500 font-normal font-sans">({lang === "ar" ? "فائق السرعة" : "lightning speed"})</span>
                  </span>
                </div>
                <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-800/60 md:pl-3">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{lang === "ar" ? "العملة المفحوصة:" : "ACTIVE TARGET:"}</span>
                  <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                    {quickScalpScannerEnabled ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                        {lang === "ar" ? "كافة العملات" : "Scanning All"}
                      </>
                    ) : "---"}
                  </span>
                </div>
                <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-800/60 md:pl-3">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{lang === "ar" ? "حالة المستشعر:" : "SENSOR STATE:"}</span>
                  <span className={`text-xs font-bold font-mono ${quickScalpScannerEnabled ? "text-emerald-400" : "text-slate-500"}`}>
                    {quickScalpScannerEnabled 
                      ? (lang === "ar" ? "🟢 يبحث عن بوادر ارتداد" : "🟢 SEEKING BOUNCE SIGNALS") 
                      : (lang === "ar" ? "💤 خامل" : "💤 SLEEPING")}
                  </span>
                </div>
                <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-800/60 md:pl-3">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{lang === "ar" ? "فريمات المسح:" : "SCAN FRAMES:"}</span>
                  <span className="text-[11px] font-bold text-indigo-400 font-mono">
                    ⏱️ {reboundRadarTimeframe} / 15m
                  </span>
                </div>
              </div>

              {/* Glowing Console Realtime Log Stream */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                  📟 {lang === "ar" ? "سجل رادار العمليات والارتدادات اللحظي:" : "Live Radar Operations & Rebound Ticker Log:"}
                </span>
                
                <div className="max-h-[140px] overflow-y-auto bg-slate-950 border border-slate-850 rounded-lg p-2 font-mono text-[10px] flex flex-col gap-1.5 no-scrollbar scroll-smooth">
                  {quickScalpScannerLog.length === 0 ? (
                    <div className="text-slate-600 text-center py-4 italic">
                      {lang === "ar" 
                        ? "[سجل العمليات فارغ. قم بتشغيل الرادار للبدء في مسح فريم الـ 5 والـ 15 دقيقة]" 
                        : "[Radar log is empty. Turn on the radar scanner to begin 5m & 15m analysis]"}
                    </div>
                  ) : (
                    quickScalpScannerLog.map((log) => {
                      let typeColor = "text-slate-400";
                      let typeLabel = "LOG";
                      if (log.type === "SUCCESS") {
                        typeColor = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                        typeLabel = lang === "ar" ? "صاعقة" : "BUY SPIKE";
                      } else if (log.type === "WARNING") {
                        typeColor = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
                        typeLabel = lang === "ar" ? "تحذير" : "WARN";
                      } else if (log.type === "SHIELD") {
                        typeColor = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
                        typeLabel = lang === "ar" ? "درع السنت" : "SHIELD";
                      } else if (log.type === "INFO") {
                        typeColor = "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
                        typeLabel = lang === "ar" ? "إرشاد" : "PULL LOG";
                      }

                      return (
                        <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-1.5 rounded hover:bg-slate-900/40 border border-transparent hover:border-slate-800/40 transition">
                          <div className="flex items-start gap-2">
                            <span className="text-slate-600 shrink-0 select-none">[{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                            <span className={`text-[9.5px] font-black px-1 py-0.5 rounded ${typeColor} shrink-0`}>
                              {typeLabel}
                            </span>
                            {log.symbol !== "SYSTEM" && (
                              <span className="text-indigo-400 font-bold shrink-0">{log.symbol}</span>
                            )}
                            <span className="text-slate-300 leading-relaxed">
                              {lang === "ar" ? log.msgAr : log.msgEn}
                            </span>
                          </div>
                          
                          {/* Live signal metrics if relevant */}
                          {(log.rsi1m !== undefined || log.rsi5m !== undefined) && (
                            <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-semibold self-end sm:self-auto shrink-0 bg-slate-900/50 p-1 rounded border border-slate-800/40">
                              <span>1m RSI: <span className={log.rsi1m < 40 ? "text-emerald-400 font-bold" : "text-slate-400"}>{log.rsi1m}</span></span>
                              <span className="text-slate-700">|</span>
                              <span>5m RSI: <span className={log.rsi5m < 45 ? "text-emerald-400 font-bold" : "text-slate-400"}>{log.rsi5m}</span></span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="flex overflow-x-auto gap-2 no-scrollbar pb-1">
              {pairs.map((p, idx) => {
                const active = idx === selectedPairIndex;
                const isProfit = p.change24h >= 0;
                return (
                  <div
                    key={`${p.symbol}-${idx}`}
                    className={`relative group/paircard shrink-0 w-[145px] p-2.5 rounded border transition-all flex flex-col justify-between ${
                      active
                        ? "bg-gradient-to-tr from-slate-900 to-indigo-950/40 border-indigo-500 shadow-sm shadow-indigo-900/10"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-750"
                    }`}
                  >
                    {/* Upper Selectable Area */}
                    <div
                      onClick={() => setSelectedPairIndex(idx)}
                      className="cursor-pointer text-right mb-2.5 select-none"
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-bold font-mono text-slate-200 block truncate leading-none">
                          {p.symbol}
                        </span>
                        <span
                          className={`text-[10px] font-semibold block leading-none ${isProfit ? "text-emerald-400" : "text-rose-400"}`}
                        >
                          {isProfit ? "+" : ""}
                          {p.change24h.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] text-slate-500 font-bold block truncate max-w-[65px] leading-none">
                          {lang === "ar"
                            ? p.name.includes("/")
                              ? p.name.split("/")[1]?.trim()
                              : p.name
                            : p.name.includes("/")
                              ? p.name.split("/")[0]?.trim()
                              : p.name}
                        </span>
                        <span className="text-[10.5px] font-extrabold block font-mono leading-none text-slate-100">
                          $
                          {p.currentPrice.toLocaleString(undefined, {
                            minimumFractionDigits: 1,
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Quick Market Buy Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickMarketBuy(p);
                      }}
                      className="w-full bg-emerald-500/10 hover:bg-emerald-600 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 hover:text-white transition duration-200 text-[10px] font-extrabold py-1 px-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span className="animate-pulse text-emerald-400 group-hover/paircard:text-white">⚡</span>
                      <span>{lang === "ar" ? "شراء سريع" : "Quick Buy"}</span>
                    </button>

                    {/* Quick remove button on hover */}
                    {pairs.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCoin(idx);
                        }}
                        title={lang === "ar" ? "إزالة العملة" : "Remove Coin"}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 border border-slate-800 hover:bg-rose-600 flex items-center justify-center text-white text-[8px] font-black cursor-pointer scale-0 group-hover/paircard:scale-100 transition z-10"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Add Custom Coin shortcut card */}
              <button
                onClick={() => {
                  setAddCoinFeedback(null);
                  setIsAddCoinOpen(true);
                }}
                className="shrink-0 w-[110px] p-2 rounded border border-dashed border-slate-850 bg-slate-950/40 hover:bg-slate-950/70 hover:border-indigo-500/40 text-slate-500 hover:text-indigo-400 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer h-full"
              >
                <span className="font-bold text-[10px] text-center leading-tight">
                  {lang === "ar" ? "أضف عملة" : "+ Add Coin"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* NEW SYSTEM-WIDE AUTOMATION STATS DECK */}
        {(activeTab === "spot" ||
           activeTab === "backtest") && (
          <div
            className="mb-4 bg-slate-900 border border-slate-800/80 rounded-xl p-3 shadow-md"
            id="global-automation-stats-deck"
            dir={lang === "ar" ? "rtl" : "ltr"}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-450 shrink-0">
                  <Activity className="w-4 h-4 animate-pulse text-indigo-400" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-[11px] font-black text-slate-100 block">
                    {lang === "ar" ? "لوحة المراقبة ⚡" : "Smart Bots Deck ⚡"}
                  </span>
                </div>
              </div>
              <div className="flex items-center flex-wrap gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer bg-slate-950/60 border border-slate-850 px-2 py-1.5 rounded select-none hover:bg-slate-900 transition">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isAggressiveRebound}
                    onChange={(e) => setIsAggressiveRebound(e.target.checked)}
                  />
                  <div className="w-6 h-3.5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:rtl:right-[2px] after:rtl:left-auto after:bg-white after:border-gray-300 after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-indigo-500 relative"></div>
                  <span className="text-[10px] font-bold text-slate-300">
                    {lang === "ar"
                      ? "التقاط ارتداد هجومي"
                      : "Aggressive Rebound"}
                  </span>
                </label>

                <div className="flex items-center gap-1.5 text-[10px] font-mono bg-slate-950/60 border border-slate-850 px-2 py-1.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-450 animate-pulse"></span>
                  <span className="text-slate-400">
                    {lang === "ar" ? "البوتات:" : "Bots:"}
                  </span>
                  <span className="text-emerald-450 font-bold">
                    {openBotsCount}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[10px]">
                  <button
                    onClick={() => setSimulationsEnabled(!simulationsEnabled)}
                    className={`flex items-center justify-center gap-1.5 px-2 py-1.5 border rounded-lg font-bold transition-all ${
                      simulationsEnabled
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                    }`}
                  >
                    {simulationsEnabled ? (
                      <Play className="w-3 h-3" />
                    ) : (
                      <Pause className="w-3 h-3" />
                    )}
                    <span>
                      {lang === "ar"
                        ? simulationsEnabled
                          ? "محاكاة: تعمل"
                          : "محاكاة: إيقاف"
                        : simulationsEnabled
                          ? "Sim: ON"
                          : "Sim: PAUSED"}
                    </span>
                  </button>

                  <button
                    onClick={() => setToastsMuted(!toastsMuted)}
                    className={`flex items-center justify-center gap-1.5 px-2 py-1.5 border rounded-lg font-bold transition-all ${
                      !toastsMuted
                        ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-450 hover:bg-amber-500/20"
                    }`}
                  >
                    {toastsMuted ? (
                      <BellOff className="w-3 h-3" />
                    ) : (
                      <Bell className="w-3 h-3" />
                    )}
                  </button>
                </div>

                <button
                  id="emergency-kill-switch-btn"
                  onClick={handleEmergencyKillSwitch}
                  disabled={isKilling}
                  className={`px-2 py-1.5 text-[10px] font-black rounded-lg transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                    isKilling
                      ? "bg-rose-950 text-rose-400 border border-rose-800 animate-pulse"
                      : killCountdown !== null
                        ? "bg-amber-600 hover:bg-amber-500 text-white border border-amber-500 animate-pulse hover:scale-[1.02] active:scale-95 shadow-[0_0_12px_rgba(217,119,6,0.5)]"
                        : "bg-rose-600 hover:bg-rose-500 text-white font-black hover:scale-[1.02] active:scale-95 border border-rose-505"
                  }`}
                >
                  <ShieldAlert className="w-3 h-3" />
                  <span className="hidden sm:block">
                    {isKilling
                      ? lang === "ar"
                        ? "جاري الإغلاق..."
                        : "SQUASHING..."
                      : killCountdown !== null
                        ? lang === "ar"
                          ? `إلغاء (${killCountdown}ث)`
                          : `CANCEL (${killCountdown}s)`
                        : lang === "ar"
                          ? "تصفية الطوارئ"
                          : "EMERGENCY"}
                  </span>
                  {killCountdown !== null && (
                    <span className="sm:hidden font-extrabold text-[10px]">
                      {killCountdown}s
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Stat 1: Weighted average ROI % */}
              <div className="bg-slate-950/40 border border-slate-850/60 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-black block">
                    {lang === "ar"
                      ? "متوسط العائد التراكمي (ROI)"
                      : "Average Cumulative ROI"}
                  </span>
                  <span
                    className={`text-sm sm:text-base font-extrabold font-mono tracking-tight block mt-1 ${
                      averageCumulativeRoi > 0
                        ? "text-emerald-400"
                        : "text-slate-300"
                    }`}
                  >
                    {averageCumulativeRoi >= 0 ? "+" : ""}
                    {averageCumulativeRoi.toFixed(2)}%
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/5 text-emerald-400">
                  <Percent className="w-4 h-4" />
                </div>
              </div>

              {/* Stat 2: Weighted Portfolio ROI % */}
              <div className="bg-slate-950/40 border border-slate-850/60 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-black block">
                    {lang === "ar"
                      ? "العائد المرجح للميزانية"
                      : "Weighted Margin ROI"}
                  </span>
                  <span
                    className={`text-sm sm:text-base font-extrabold font-mono tracking-tight block mt-1 ${
                      weightedBotRoi > 0 ? "text-emerald-400" : "text-slate-300"
                    }`}
                  >
                    {weightedBotRoi >= 0 ? "+" : ""}
                    {weightedBotRoi.toFixed(2)}%
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-indigo-500/5 text-indigo-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>

              {/* Stat 3: Total bot cumulative profits */}
              <div className="bg-slate-950/40 border border-slate-850/60 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-black block">
                    {lang === "ar"
                      ? "إجمالي أرباح المحاكاة"
                      : "Total Simulated Profits"}
                  </span>
                  <span
                    className={`text-sm sm:text-base font-extrabold font-mono tracking-tight block mt-1 ${
                      totalBotProfit > 0 ? "text-emerald-400" : "text-slate-300"
                    }`}
                  >
                    {totalBotProfit >= 0 ? "+" : ""}${totalBotProfit.toFixed(2)}{" "}
                    USDT
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/5 text-amber-400">
                  <Coins className="w-4 h-4" />
                </div>
              </div>

              {/* Stat 4: Cap Allocation */}
              <div className="bg-slate-950/40 border border-slate-850/60 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-black block">
                    {lang === "ar" ? "رأس المال المخصص" : "Allocated Capital"}
                  </span>
                  <span className="text-sm sm:text-base font-extrabold font-mono tracking-tight text-slate-100 block mt-1">
                    ${totalBotInvestment.toLocaleString()} USDT
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/40 text-slate-400">
                  <Cpu className="w-4 h-4" />
                </div>
              </div>

              {/* Stat 5: Rebound Capture Rate */}
              <div className="bg-slate-950/40 border border-slate-850/60 p-3 rounded-xl flex items-center justify-between col-span-2 md:col-span-1 border-emerald-500/30 glow-sm">
                <div>
                  <span className="text-[10px] text-slate-400 font-black block">
                    {lang === "ar"
                      ? "معدل التقاط الارتداد"
                      : "Rebound Capture Rate"}
                  </span>
                  <span className="text-sm sm:text-base font-extrabold font-mono tracking-tight block mt-1 text-emerald-400">
                    {Math.round(
                      (reboundStats.captures / reboundStats.chances) * 100,
                    )}
                    %{" "}
                    <span className="text-[10px] text-slate-500 font-sans">
                      ({reboundStats.captures}/{reboundStats.chances})
                    </span>
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 animate-pulse">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Custom Interactive Recharts Sparkline */}
            <div
              className="mt-4 pt-3 border-t border-slate-850/40"
              id="stats-sparkline-row"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] sm:text-[11px] font-black text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {lang === "ar"
                      ? "مسار نمو أرباح البوتات المتراكم (آخر 24 ساعة) 📈"
                      : "Simulated Profit Growth Path (24h Trend) 📈"}
                  </span>
                  <span className="text-[9px] text-slate-400 mt-0.5">
                    {lang === "ar"
                      ? "مخطط بياني تفاعلي يعرض تصاعد الأرباح المحققة بمرور الساعات"
                      : "Live-updating Recharts timeline mapping automated yield expansion."}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[9px] font-mono text-slate-400 bg-slate-950/40 border border-slate-850 px-2 py-0.5 rounded-md self-start md:self-auto">
                  <span>
                    {lang === "ar" ? "البداية:" : "Start:"}{" "}
                    <strong className="text-slate-300">
                      ${sparklineData[0]?.profit || "12.00"}
                    </strong>
                  </span>
                  <span className="text-slate-700">|</span>
                  <span>
                    {lang === "ar" ? "الذروة الحالية:" : "Current Peak:"}{" "}
                    <strong className="text-emerald-450">
                      ${totalBotProfit.toFixed(2)} USDT
                    </strong>
                  </span>
                </div>
              </div>

              <div
                className="h-14 w-full mt-2.5 pr-2"
                id="sparkline-chart-container"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={sparklineData}
                    margin={{ top: 5, right: 5, left: 5, bottom: 2 }}
                  >
                    <defs>
                      <linearGradient
                        id="profitGraphGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-slate-950 border border-slate-800 px-2 py-1 rounded text-[9px] font-mono shadow-xl text-left">
                              <p className="text-slate-400">
                                {lang === "ar"
                                  ? `الساعة: ${item.time}`
                                  : `Hour: ${item.time}`}
                              </p>
                              <p className="text-emerald-400 font-bold mt-0.5">
                                {lang === "ar"
                                  ? `الأرباح: $${item.profit.toFixed(2)}`
                                  : `Profit: $${item.profit.toFixed(2)}`}{" "}
                                USDT
                              </p>
                              {/* Historical active bot count tooltip element */}
                              <p className="text-indigo-400 font-bold mt-0.5">
                                {lang === "ar"
                                  ? `البوتات النشطة: ${item.botsCount !== undefined ? item.botsCount : 0}`
                                  : `Active Bots: ${item.botsCount !== undefined ? item.botsCount : 0}`}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stroke="#10b981"
                      strokeWidth={1.5}
                      fillOpacity={1}
                      fill="url(#profitGraphGrad)"
                      activeDot={{
                        r: 4,
                        stroke: "#10b981",
                        strokeWidth: 1.5,
                        fill: "#020617",
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Tab route triggers switcher */}
        <div className="transition-all duration-305">
          {activeTab === "dashboard" && <HamzaLiveMarkets lang={lang} pairs={pairs} onAddPair={handleAddPair} />}

          {activeTab === "owner" && isOwner && <OwnerDashboard lang={lang} />}

          <div className={activeTab === "futures" ? "block" : "hidden"}>
            {!canTrade ? (
              renderTradingSuspended()
            ) : (
              <FuturesTrading
                lang={lang}
                activePair={activePair}
                allPairs={pairs}
                portfolio={portfolio}
                positions={futuresPositions}
                setPositions={setFuturesPositions}
                onUpdatePortfolio={handleFuturesUpdatePortfolio}
                onTriggerToast={handleTriggerToast}
                apiConnection={apiConnection}
                isLiveTrading={isLiveTrading}
                futuresApiError={futuresApiError}
                setFuturesApiError={handleSetFuturesApiError}
              />
            )}
          </div>

          
          <div className={activeTab === "spot" ? "space-y-6 block" : "hidden"}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <InteractiveChart lang={lang} activePair={activePair} />
              </div>
              <div className="lg:col-span-1 flex flex-col gap-6">
                <MarketGauge lang={lang} activePair={activePair} />
                <PriceAlertManager
                  lang={lang}
                  activePair={activePair}
                  priceAlerts={priceAlerts}
                  onAddAlert={handleAddPriceAlert}
                  onDeleteAlert={handleDeletePriceAlert}
                />
                <MarketSentimentIndicator lang={lang} activePair={activePair} />
              </div>
            </div>
            {!canTrade ? (
              renderTradingSuspended()
            ) : (
              <SpotTrading
                lang={lang}
                activePair={activePair.symbol}
                pairs={pairs}
                onSubmitOrder={handleAddNewOrder}
                orders={orders}
                portfolio={portfolio}
                activeBots={activeBots}
                onCreateBot={handleCreateBot}
                onDeleteBot={handleDeleteBot}
                onToggleStatus={handleToggleBotStatus}
              />
            )}
          </div>
{activeTab === "backtest" && (<Backtester lang={lang} activePair={activePair} />)}

          {activeTab === "history" && (
            <OrderHistory
              lang={lang}
              connection={apiConnection}
              isLiveTrading={isLiveTrading}
              localOrders={orders}
            />
          )}

          {activeTab === "notifications" && (
            <NotificationCenter
              lang={lang}
              notificationsHistory={notificationsHistory}
              onClearNotifications={handleClearNotificationsHistory}
            />
          )}

          {activeTab === "security" && (
            <SecurityManager
              lang={lang}
              connection={apiConnection}
              onUpdateConnection={(conn) =>
                setApiConnection((prev) => ({ ...prev, ...conn }))
              }
              userData={userData}
            />
          )}

          {activeTab === "ai" && <AIAnalyst lang={lang} activeBots={activeBots} allPairs={pairs} />}

          
          <div className={activeTab === "whales" ? "block" : "hidden"}>
<WhaleTracker lang={lang} pairs={pairs} />
          </div>
        </div>
      </main>

      {/* Dynamic Coin selection and search Management Modal Dialog */}
      <AnimatePresence>
        {isAddCoinOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddCoinOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            {/* Modal Body Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.35 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col"
              dir={lang === "ar" ? "rtl" : "ltr"}
              id="custom-coin-manager-modal"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-850 pb-4 mb-4 select-none">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Coins className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">
                      {lang === "ar"
                        ? "إضافة وإدارة العملات في المنصة"
                        : "Manage & Add Crypto Coins"}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {lang === "ar"
                        ? "ابحث عن أي زوج تداول Binance USDT وتحقق منه فورياً."
                        : "Search and validate any ticker on Binance instantly."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddCoinOpen(false)}
                  className="p-1 hover:bg-slate-850 rounded-lg text-slate-450 hover:text-white transition cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Input for search query ticker */}
              <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    {lang === "ar"
                      ? "🔍 رمز العملة الجديد (مثال: XRP أو SOL)"
                      : "🔍 New Coin Symbol (Example: XRP or SOL)"}
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-slate-950 font-mono font-bold text-sm text-slate-100 placeholder-slate-600 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 outline-none transition"
                      placeholder={
                        lang === "ar"
                          ? "أدخل الرمز، مثل: ADA"
                          : "Enter ticker, e.g. XRP"
                      }
                      value={addCoinSearchQuery}
                      onChange={(e) => {
                        setAddCoinSearchQuery(e.target.value);
                        setAddCoinFeedback(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddCustomCoin(addCoinSearchQuery);
                        }
                      }}
                    />

                    <button
                      onClick={() => handleAddCustomCoin(addCoinSearchQuery)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 px-5 rounded-xl transition duration-200 outline-none flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-900/10 active:scale-95"
                    >
                      <span>
                        {lang === "ar" ? "🔍 تحقق وإضافة" : "🔍 Find & Add"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Display Feedback text */}
                {addCoinFeedback && (
                  <div
                    className={`p-3 rounded-lg border text-xs leading-relaxed ${
                      addCoinFeedback.type === "success"
                        ? "bg-emerald-950/25 border-emerald-900/40 text-emerald-400"
                        : "bg-rose-950/25 border-rose-900/40 text-rose-400"
                    }`}
                  >
                    {addCoinFeedback.text}
                  </div>
                )}

                {/* Recommendations Grid */}
                <div className="space-y-2 select-none pt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                    {lang === "ar"
                      ? "💡 عملات تداول مقترحة شائعة:"
                      : "💡 Recommended Hot Pairs:"}
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {[
                      { sym: "XRP", label: lang === "ar" ? "ريبل" : "Ripple" },
                      {
                        sym: "DOGE",
                        label: lang === "ar" ? "دوج كوين" : "Dogecoin",
                      },
                      {
                        sym: "ADA",
                        label: lang === "ar" ? "كاردانو" : "Cardano",
                      },
                      {
                        sym: "AVAX",
                        label: lang === "ar" ? "أفالانش" : "Avalanche",
                      },
                      { sym: "NEAR", label: lang === "ar" ? "نير" : "Near" },
                      {
                        sym: "DOT",
                        label: lang === "ar" ? "بولكادوت" : "Polkadot",
                      },
                      {
                        sym: "LTC",
                        label: lang === "ar" ? "لايت كوين" : "Litecoin",
                      },
                      {
                        sym: "PEPE",
                        label: lang === "ar" ? "بيبي كوين" : "Pepe",
                      },
                      {
                        sym: "SUI",
                        label: lang === "ar" ? "سوي نتورك" : "Sui",
                      },
                      {
                        sym: "SHIB",
                        label: lang === "ar" ? "شيبا إينو" : "Shiba",
                      },
                      {
                        sym: "FET",
                        label: lang === "ar" ? "ذكاء اصطناعي" : "FET",
                      },
                      {
                        sym: "MATIC",
                        label: lang === "ar" ? "ماتيك" : "Polygon",
                      },
                    ].map((rec) => {
                      const alreadyAdded = pairs.some(
                        (p) => p.baseAsset === rec.sym,
                      );
                      return (
                        <button
                          key={rec.sym}
                          disabled={alreadyAdded}
                          onClick={() => handleAddCustomCoin(rec.sym)}
                          className={`p-2 rounded-lg border text-right transition-all outline-none flex flex-col gap-0.5 justify-center ${
                            alreadyAdded
                              ? "bg-slate-950/20 border-slate-950 text-slate-600 cursor-not-allowed text-center"
                              : "bg-slate-950/60 border-slate-850 hover:border-slate-750 hover:bg-slate-950/90 text-slate-300 cursor-pointer text-right"
                          }`}
                        >
                          <span className="font-mono font-black text-xs block text-slate-200">
                            {rec.sym}/USDT
                          </span>
                          <span className="text-[9px] text-slate-500 block truncate">
                            {rec.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Currently managed coins list */}
                <div className="space-y-2 pt-4 border-t border-slate-850/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    {lang === "ar"
                      ? "💼 العملات المراقبة حالياً والمدرجة لتداولاتك:"
                      : "💼 Your Active Watched Cryptocurrencies:"}
                  </span>

                  <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                    {pairs.map((p, idx) => (
                      <div
                        key={`${p.symbol}-${idx}`}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/30 border border-slate-850/60 font-sans"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                          <div>
                            <span className="font-mono text-xs font-bold text-slate-200 block">
                              {p.symbol}
                            </span>
                            <span className="text-[9px] text-slate-500 block">
                              {lang === "ar"
                                ? p.name.split("/")[1]?.trim()
                                : p.name.split("/")[0]?.trim()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 font-mono shrink-0">
                          <div className="text-left text-xs font-bold text-slate-350">
                            $
                            {p.currentPrice.toLocaleString(undefined, {
                              minimumFractionDigits: 1,
                            })}
                          </div>

                          <button
                            onClick={() => handleRemoveCoin(idx)}
                            disabled={pairs.length <= 1}
                            className={`p-1.5 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 transition duration-150 cursor-pointer ${
                              pairs.length <= 1
                                ? "opacity-30 cursor-not-allowed"
                                : ""
                            }`}
                            title={
                              lang === "ar"
                                ? "إزالة من قائمة المراقبة والتداول"
                                : "Remove form tracking pools"
                            }
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification Hub */}
      <ToastList
        lang={lang}
        toasts={toasts}
        onDismiss={handleDismissToast}
      />

      {/* Footer Status Bar with Professional Polish specs */}
      <footer
        className="h-9 bg-slate-900 border-t border-slate-800 px-6 flex items-center justify-between text-[10px] text-slate-500 font-sans mt-12"
        id="app-footer-bar"
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        <div className="flex gap-4 items-center">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.7)]"></span>
            {lang === "ar"
              ? "خادم التداول نشط"
              : "Trading backend thread active"}
          </span>
          <span className="text-slate-600">|</span>
          <span>
            {lang === "ar" ? "وقت الاستجابة: 14ms" : "Ping Latency: 14ms"}
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <span>
            {lang === "ar"
              ? "المنطقة الزمنية: UTC+3 (الرياض)"
              : "Timezone: UTC+3 (Riyadh)"}
          </span>
          <span className="text-slate-600">|</span>
          <span>
            {lang === "ar" ? "الإصدار ٢.١.٠-برو" : "Version 2.1.0-pro"}
          </span>
        </div>
      </footer>


      {/* System Update Notification Overlay */}
      {systemUpdate && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 font-sans"
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl max-w-lg w-full shadow-2xl relative">
            <div className="w-20 h-20 bg-indigo-900/40 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/30">
              <Activity className="w-10 h-10 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-slate-100 mb-3 text-center tracking-tight">
              {lang === "ar"
                ? "إشعار تحديث من المنصة"
                : "Platform Update Notice"}
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed text-center font-medium">
              {lang === "ar"
                ? systemUpdate.message_ar
                : systemUpdate.message_en}
            </p>

            {systemUpdate.requiresReset ? (
              <div className="space-y-3">
                <button
                  onClick={() => handleAcknowledgeUpdate(true)}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-5 h-5" />
                  {lang === "ar"
                    ? "إعادة ضبط الإعدادات (مطلوب لاستمرار العمل)"
                    : "Reset Settings (Required for stability)"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={() => handleAcknowledgeUpdate(false)}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition flex justify-center items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  {lang === "ar"
                    ? "متابعة بدون تصفير الإعدادات"
                    : "Continue (Keep Settings)"}
                </button>
                <button
                  onClick={() => handleAcknowledgeUpdate(true)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 rounded-xl transition text-sm"
                >
                  {lang === "ar"
                    ? "إعادة ضبط الإعدادات (تصفير نظيف اختياري)"
                    : "Reset Settings (Clean start - Optional)"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
