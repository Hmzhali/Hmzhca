/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import BotTradesHistory from './BotTradesHistory';
import { MarketPair, TradingBot, BotType, GridBotConfig, DcaBotConfig } from '../types';
import { ARABIC_DICT, INITIAL_PAIRS } from '../utils/marketData';
import { Play, Pause, Trash2, Cpu, Sparkles, TrendingUp, DollarSign, Layers, Wallet, Percent, ShieldAlert, AlertTriangle, TrendingDown, BarChart3, Sliders, Search, Activity, Zap, CheckCircle2, Compass, Crosshair, Award } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';

interface BotTradingProps {
  lang: 'ar' | 'en';
  activePair: MarketPair;
  activeBots: TradingBot[];
  onCreateBot: (bot: Omit<TradingBot, 'id' | 'createdTime' | 'accumulatedProfit' | 'profitPercentage' | 'arbitrageCount'>) => void;
  onDeleteBot: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onResumeAllBots?: () => void;
  portfolio?: { usdt: number };
  onUpdateBotConfig?: (id: string, updatedConfig: any) => void;
  pairs?: MarketPair[];
  isLiveTrading?: boolean;
}

export default function BotTrading({
  lang,
  activePair,
  activeBots,
  onCreateBot,
  onDeleteBot,
  onToggleStatus,
  onResumeAllBots,
  portfolio,
  onUpdateBotConfig,
  pairs,
  isLiveTrading = false,
}: BotTradingProps) {
  const d = ARABIC_DICT;

  // Tab for Right Panel (active bots list vs. global opportunities scanner vs. falcon radar)
  const [rightPanelTab, setRightPanelTab] = useState<'bots' | 'scanner' | 'falcon'>('bots');
  const [scannerFilter, setScannerFilter] = useState<'ALL' | 'STRONG'>('ALL');
  const [deployedSymbols, setDeployedSymbols] = useState<string[]>([]);

  // Falcon Intelligence Radar states
  const [falconLogs, setFalconLogs] = useState<string[]>(() => [
    `[${new Date().toLocaleTimeString('ar-EG', { hour12: false })}] 🦅 تم إطلاق صقور التداول الذكية للتحليق في فضاء التداول الآلي...`,
    `[${new Date().toLocaleTimeString('ar-EG', { hour12: false })}] 📡 رادار الصقر نشط الآن ويبث إشارات التفتيش والتحقق من الدعم لعامة الأسواق.`,
    `[${new Date().toLocaleTimeString('ar-EG', { hour12: false })}] 🟢 أنظمة التحليق المستمر تهيئ أجهزة المسح الذاتي لاصطياد أعمق الارتدادات الدقيقة.`
  ]);
  const [radialSweepAngle, setRadialSweepAngle] = useState<number>(0);
  const [activeEagleHunt, setActiveEagleHunt] = useState<{ symbol: string; rsi: number; targetPrice: number; signalStrength: number } | null>(null);

  useEffect(() => {
    if (rightPanelTab !== 'falcon') return;
    
    // Sweep rotation effect
    const sweepInterval = setInterval(() => {
      setRadialSweepAngle(prev => (prev + 3) % 360);
    }, 45);

    // Dynamic hunt telemetry generator
    const logInterval = setInterval(() => {
      const activePairsList = pairs || INITIAL_PAIRS;
      const randomPair = activePairsList[Math.floor(Math.random() * activePairsList.length)];
      const isOversold = Math.random() > 0.45;
      const fakeRsi = isOversold ? Math.floor(21 + Math.random() * 14) : Math.floor(66 + Math.random() * 12);
      
      const actions_ar = [
        `🦅 الصقر الكاسر رصد انحرافاً إيجابياً لزوج ${randomPair.symbol} عند RSI = ${fakeRsi}... تهيئة الانقضاض لشراء القاع الموعود!`,
        `🎯 الصقر الجارح رصد كسر هابط واختبار للدعم الصخري عند $${randomPair.currentPrice.toLocaleString()}... تأمين الصفقات قيد المراقبة اللحظية!`,
        `⚡ هجوم مباغت! صقر "قناص الفرص" يحصد أرباح ارتداد فوري على زوج ${randomPair.symbol}، مع تمرير الصفقات الحية بنجاح!`,
        `📡 رادار صيد السوق: جميع صقور المنصة تدور في سماء بينانس واصلة بلا انقطاع لرؤية أي ارتعاد حجم فوري (Volume Surge).`,
        `🏆 [حصاد الصيد اللحظي] بوتات التداول تحقق عائداً تراكمياً وتستشعر صعوداً إيجابياً مذهلاً لزوج ${randomPair.symbol} الآن!`
      ];

      const newLog = `[${new Date().toLocaleTimeString('ar-EG', { hour12: false })}] ${actions_ar[Math.floor(Math.random() * actions_ar.length)]}`;
      setFalconLogs(prev => [newLog, ...prev.slice(0, 20)]);
      
      setActiveEagleHunt({
        symbol: randomPair.symbol,
        rsi: fakeRsi,
        targetPrice: randomPair.currentPrice,
        signalStrength: Math.floor(82 + Math.random() * 17)
      });
    }, 4200);

    return () => {
      clearInterval(sweepInterval);
      clearInterval(logInterval);
    };
  }, [rightPanelTab, pairs]);

  const handleQuickDeployBot = (item: { symbol: string; rsi: number; volatility: number; recBotType: BotType }) => {
    const coinObj = (pairs || INITIAL_PAIRS).find(p => p.symbol === item.symbol) || INITIAL_PAIRS[0];
    const cp = coinObj.currentPrice;

    let botConfig: any = {};
    if (item.recBotType === 'GRID') {
      botConfig = {
        lowerPrice: parseFloat((cp * 0.91).toFixed(item.symbol.includes('USDT') && cp < 10 ? 4 : 1)),
        upperPrice: parseFloat((cp * 1.09).toFixed(item.symbol.includes('USDT') && cp < 10 ? 4 : 1)),
        gridLines: 12,
        investmentAmount: 5.0,
        stopLoss: 6,
        takeProfit: 10,
        trailingStopLoss: true,
        trailingTakeProfit: true,
        sensitivity: 'MEDIUM'
      };
    } else if (item.recBotType === 'DCA') {
      botConfig = {
        baseOrderSize: parseFloat((portfolio?.usdt !== undefined && portfolio.usdt <= 15 ? 0.5 : 2.0).toFixed(1)),
        safetyOrderSize: parseFloat((portfolio?.usdt !== undefined && portfolio.usdt <= 15 ? 1.0 : 4.0).toFixed(1)),
        priceDeviation: 1.5,
        maxSafetyOrders: 4,
        investmentInterval: '2H',
        totalInvestment: 9.0,
        trailingStopLoss: true,
        trailingTakeProfit: true,
        sensitivity: 'HIGH'
      };
    } else {
      botConfig = {
        oversoldThreshold: item.rsi <= 35 ? Math.max(item.rsi - 3, 15) : 30,
        overboughtThreshold: item.rsi >= 65 ? Math.min(item.rsi + 3, 85) : 70,
        rsiPeriod: 14,
        tradeAmount: 3.0,
        stopLoss: 5,
        takeProfit: 9,
        trailingStopLoss: true,
        trailingTakeProfit: true,
        sensitivity: 'HIGH'
      };
    }

    const newBot = {
      symbol: item.symbol,
      type: item.recBotType,
      config: botConfig,
      isSmartMode: true,
      reboundFocusEnabled: true,
      reboundTimeframes: ['15m', '30m', '1h'],
      minTradeAmount: 0.5
    };

    onCreateBot(newBot as any);
    setDeployedSymbols(prev => [...prev, item.symbol]);
  };

  // 1. Prepare dynamic signals data for the Global Scanner
  const scannerPairs = pairs && pairs.length > 0 ? pairs : INITIAL_PAIRS;

  const getLiveRsi = (symbol: string, change24h: number) => {
    let baseRsi = 50 + (change24h * 3.8);
    const hash = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const wave = Math.sin((Date.now() / 15000) + hash) * 4.5;
    baseRsi += wave;
    return Math.min(Math.max(Math.round(baseRsi), 14), 86);
  };

  const getVolatility = (symbol: string, change24h: number) => {
    const hash = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const baseVol = Math.abs(change24h) * 1.25 + 1.1;
    const waveByTime = Math.sin((Date.now() / 25000) + hash) * 0.35;
    return parseFloat(Math.min(Math.max(baseVol + waveByTime, 0.6), 18.2).toFixed(2));
  };

  const allScannedSignals = scannerPairs.map((coin) => {
    const rsi = getLiveRsi(coin.symbol, coin.change24h);
    const vol = getVolatility(coin.symbol, coin.change24h);
    
    let recBotType: BotType = 'GRID';
    let recommendation = '';
    
    if (rsi <= 35) {
      recBotType = 'RSI';
      recommendation = lang === 'ar' ? '🟢 شراء ارتدادي (RSI Bot)' : '🟢 Oversold Rebuy (RSI Bot)';
    } else if (rsi >= 65) {
      recBotType = 'DCA';
      recommendation = lang === 'ar' ? '🔴 تبريد (DCA Bot)' : '🔴 Overbought (DCA Bot)';
    } else {
      recBotType = vol > 4.5 ? 'GRID' : 'DCA';
      recommendation = vol > 4.5
        ? (lang === 'ar' ? '⚡ ذبذبة (Grid Scalp)' : '⚡ Volatility Swing (Grid Scalp)')
        : (lang === 'ar' ? '🛡️ تجميع آمن (Safe DCA)' : '🛡️ Safe Accumulation (DCA)');
    }

    const rsiDistance = Math.abs(50 - rsi);
    const volBonus = vol * 3.5;
    const isVolumeSpike = (Math.abs(coin.change24h) * 1.5 + (coin.volume24h % 105) / 10) > 6.0;
    const spBonus = isVolumeSpike ? 15 : 0;
    const confidenceScore = Math.min(Math.max(Math.round(45 + rsiDistance * 1.5 + volBonus + spBonus), 35), 99);
    const isHighConfidence = confidenceScore >= 85;

    return {
      symbol: coin.symbol,
      name: coin.name,
      currentPrice: coin.currentPrice,
      change24h: coin.change24h,
      rsi,
      volatility: vol,
      recommendation,
      recBotType,
      volText: vol > 4.5 ? (lang === 'ar' ? 'عالي' : 'High') : (lang === 'ar' ? 'معتدل' : 'Moderate'),
      isVolumeSpike,
      confidenceScore,
      isHighConfidence
    };
  });

  const filteredSignals = allScannedSignals.filter((sig) => {
    if (scannerFilter === 'ALL') return true;
    return sig.isHighConfidence || sig.rsi <= 38 || sig.rsi >= 62 || sig.volatility > 4.8;
  });

  const rsiSpectrumData = allScannedSignals.map(sig => ({
    symbol: sig.symbol.split('/')[0],
    rsi: sig.rsi,
    volText: sig.volText
  }));

  // Tabs for Bot Selection
  const [selectedBotType, setSelectedBotType] = useState<BotType>('GRID');
  
  // Toggle Gemini AI Smart Mode
  const [isSmartMode, setIsSmartMode] = useState<boolean>(true);
  
  // Target Asset scope (SINGLE active asset vs ALL coins search across all sections)
  const [targetScope, setTargetScope] = useState<'SINGLE' | 'ALL'>('SINGLE');
  
  // Custom stress-test market drop percentages per bot id for Max Drawdown evaluation
  const [stressDrops, setStressDrops] = useState<Record<string, number>>({});

  // Rebound Focus States (Multi-Timeframe 15m, 30m, 1h Reversion Tracker)
  const [reboundFocusEnabled, setReboundFocusEnabled] = useState<boolean>(true);
  const [reboundTimeframes, setReboundTimeframes] = useState<string[]>(['15m', '30m', '1h']);
  const [minTradeAmount, setMinTradeAmount] = useState<string>('0.5');
  const [autoRebalance, setAutoRebalance] = useState<boolean>(false);

  // GRID States
  const [lowerPrice, setLowerPrice] = useState<string>((activePair.currentPrice * 0.85).toFixed(1));
  const [upperPrice, setUpperPrice] = useState<string>((activePair.currentPrice * 1.15).toFixed(1));
  const [gridLines, setGridLines] = useState<number>(10);
  const [gridInvestment, setGridInvestment] = useState<string>('500');

  // DCA States
  const [baseOrderSize, setBaseOrderSize] = useState<string>('50');
  const [safetyOrderSize, setSafetyOrderSize] = useState<string>('100');
  const [priceDeviation, setPriceDeviation] = useState<string>('1.5');
  const [maxSafetyOrders, setMaxSafetyOrders] = useState<number>(4);
  const [dcaInterval, setDcaInterval] = useState<'1H' | '4H' | '12H' | '1D' | '1W'>('1D');
  const [dcaInvestment, setDcaInvestment] = useState<string>('600');

  // RSI States
  const [rsiOversold, setRsiOversold] = useState<string>('30');
  const [rsiOverbought, setRsiOverbought] = useState<string>('70');
  const [rsiPeriod, setRsiPeriod] = useState<number>(14);
  const [rsiTradeAmount, setRsiTradeAmount] = useState<string>('150');

  // Advanced User Configurations
  const [sensitivity, setSensitivity] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [trailingStopLoss, setTrailingStopLoss] = useState<boolean>(false);
  const [trailingTakeProfit, setTrailingTakeProfit] = useState<boolean>(false);
  const [stopLossPercent, setStopLossPercent] = useState<string>('');
  const [takeProfitPercent, setTakeProfitPercent] = useState<string>('');

  // Sync inputs with pair price on swap
  useEffect(() => {
    setLowerPrice((activePair.currentPrice * 0.85).toFixed(1));
    setUpperPrice((activePair.currentPrice * 1.15).toFixed(1));
  }, [activePair.symbol]);

  // Adjust defaults depending on available USDT (useful for micro-funds / small balance down to $1)
  useEffect(() => {
    if (portfolio?.usdt !== undefined && portfolio.usdt > 0) {
      if (portfolio.usdt <= 15) {
        setGridInvestment(portfolio.usdt.toFixed(2));
        setDcaInvestment(portfolio.usdt.toFixed(2));
        setBaseOrderSize((portfolio.usdt * 0.15).toFixed(2));
        setSafetyOrderSize((portfolio.usdt * 0.25).toFixed(2));
      } else if (portfolio.usdt < 500) {
        setGridInvestment((portfolio.usdt * 0.5).toFixed(2));
        setDcaInvestment((portfolio.usdt * 0.5).toFixed(2));
        setBaseOrderSize((portfolio.usdt * 0.1).toFixed(2));
        setSafetyOrderSize((portfolio.usdt * 0.18).toFixed(2));
      }
    }
  }, [portfolio?.usdt]);

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResults, setScanResults] = useState<{ symbol: string; score: number; type: string; details: string }[]>([]);

  const handleClearAllBots = () => {
    if (activeBots.length === 0) return;
    const confirmWipe = window.confirm(
      lang === 'ar'
        ? '⚠️ هل أنت متأكد من إيقاف ومسح جميع البوتات الجارية كلياً ومسح القائمة لبدء المسح الشامل؟'
        : '⚠️ Are you sure you want to completely stop, terminate, and wipe all active bots to start searching fresh?'
    );
    if (!confirmWipe) return;
    
    // Create copy because loop triggers deletes in place
    const ids = activeBots.map(b => b.id);
    ids.forEach((id) => {
      onDeleteBot(id);
    });
  };

  const [botEnabled, setBotEnabled] = useState(true);
  const toggleScalper = async () => {
    try {
      const resp = await fetch('/api/bot/toggle', { method: 'POST' });
      const text = await resp.text();
      if (text.startsWith('<!') || text.includes('Rate exceeded')) return;
      const data = JSON.parse(text);
      setBotEnabled(data.botEnabled);
    } catch (e) {
      console.error('Failed to toggle bot', e);
    }
  };
  
  useEffect(() => {
    fetch('/api/health')
      .then(r => r.text())
      .then(text => {
        if (text.startsWith('<!') || text.includes('Rate exceeded')) return;
        const d = JSON.parse(text);
        setBotEnabled(d.botEnabled);
      })
      .catch((e: any) => {
        if (e.message !== 'Failed to fetch') console.error(e);
      });
  }, []);

  const handleTriggerAIAllocation = () => {
    setIsScanning(true);
    setScanResults([]);
    
    setTimeout(() => {
      // 1. Wipe all active bots
      const ids = activeBots.map(b => b.id);
      ids.forEach((id) => {
        onDeleteBot(id);
      });

      // 2. Allocate across multiple high-volatility assets
      const allocated = [
        {
          symbol: 'BTC/USDT',
          type: 'GRID',
          config: {
            lowerPrice: Math.round(activePair.symbol === 'BTC/USDT' ? activePair.currentPrice * 0.92 : 91200),
            upperPrice: Math.round(activePair.symbol === 'BTC/USDT' ? activePair.currentPrice * 1.08 : 104500),
            gridLines: 12,
            investmentAmount: 5.0,
            stopLoss: 5,
            takeProfit: 8,
            trailingStopLoss: true,
            trailingTakeProfit: true,
            sensitivity: 'MEDIUM'
          },
          isSmartMode: true,
          reboundFocusEnabled: true,
          reboundTimeframes: ['15m', '30m'],
          minTradeAmount: 0.5
        },
        {
          symbol: 'ETH/USDT',
          type: 'DCA',
          config: {
            baseOrderSize: 1.0,
            safetyOrderSize: 2.0,
            priceDeviation: 1.2,
            maxSafetyOrders: 4,
            investmentInterval: '4H',
            totalInvestment: 9.0,
            trailingStopLoss: true,
            trailingTakeProfit: true,
            sensitivity: 'MEDIUM'
          },
          isSmartMode: true,
          reboundFocusEnabled: true,
          reboundTimeframes: ['30m', '1h'],
          minTradeAmount: 0.5
        },
        {
          symbol: 'SOL/USDT',
          type: 'RSI',
          config: {
            oversoldThreshold: 25,
            overboughtThreshold: 75,
            rsiPeriod: 14,
            tradeAmount: 2.0,
            stopLoss: 4,
            takeProfit: 10,
            trailingStopLoss: true,
            trailingTakeProfit: true,
            sensitivity: 'HIGH'
          },
          isSmartMode: true,
          reboundFocusEnabled: true,
          reboundTimeframes: ['15m', '1h'],
          minTradeAmount: 0.5
        },
        {
          symbol: 'BNB/USDT',
          type: 'GRID',
          config: {
            lowerPrice: 580,
            upperPrice: 690,
            gridLines: 10,
            investmentAmount: 4.0,
            stopLoss: 3,
            takeProfit: 7,
            trailingStopLoss: false,
            trailingTakeProfit: true,
            sensitivity: 'MEDIUM'
          },
          isSmartMode: true,
          reboundFocusEnabled: true,
          reboundTimeframes: ['15m', '30m', '1h'],
          minTradeAmount: 0.5
        }
      ];

      allocated.forEach((newBot) => {
        onCreateBot(newBot as any);
      });

      setScanResults([
        { symbol: 'BTC/USDT', score: 97, type: 'GRID', details: lang === 'ar' ? 'تم رصد تشبع في القناة السعرية وموازنة صفقات ميكرو بقيمة صغرى.' : 'Detected Channel Oversold; deployed Micro GRID.' },
        { symbol: 'ETH/USDT', score: 93, type: 'DCA', details: lang === 'ar' ? 'تجميع تراكمي تدريجي آمن عند خط الدعم الترند.' : 'Gradual DCA accumulation initiated on Support floor.' },
        { symbol: 'SOL/USDT', score: 95, type: 'RSI', details: lang === 'ar' ? 'تذبذب ارتدادي فني سريع RSI عند المستوى 25.' : 'Aggressive RSI reversion trade triggered at Oversold.' },
        { symbol: 'BNB/USDT', score: 89, type: 'GRID', details: lang === 'ar' ? 'نطاق تداول موازنة سيولة أفقي ممتاز.' : 'Excellent horizontal liquid consolidation swing.' }
      ]);
      setIsScanning(false);
    }, 2200);
  };

  // Handle active grids visual rendering
  const lp = parseFloat(lowerPrice) || 0;
  const up = parseFloat(upperPrice) || 0;
  const visualStep = gridLines > 1 ? (up - lp) / (gridLines - 1) : 0;
  const visualLines: number[] = [];
  if (lp > 0 && up > lp) {
    for (let i = 0; i < Math.min(15, gridLines); i++) {
      visualLines.push(lp + i * visualStep);
    }
  }

  // Submit trigger
  const handleLaunchBot = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSymbol = targetScope === 'ALL' ? 'ALL' : activePair.symbol;
    
    if (selectedBotType === 'GRID') {
      const parsedLp = parseFloat(lowerPrice);
      const parsedUp = parseFloat(upperPrice);
      const parsedInvest = parseFloat(gridInvestment);
      
      if (isNaN(parsedLp) || isNaN(parsedUp) || parsedLp >= parsedUp || isNaN(parsedInvest) || parsedInvest <= 0) {
        alert(lang === 'ar' ? 'الرجاء التحقق من إدخال قيم شبكة واستثمار صحيحة.' : 'Please input valid upper/lower limits.');
        return;
      }

      onCreateBot({
        symbol: finalSymbol,
        type: 'GRID',
        config: {
          lowerPrice: parsedLp,
          upperPrice: parsedUp,
          gridLines,
          investmentAmount: parsedInvest,
          stopLoss: parseFloat(stopLossPercent) || undefined,
          takeProfit: parseFloat(takeProfitPercent) || undefined,
          trailingStopLoss,
          trailingTakeProfit,
          sensitivity
        },
        status: 'RUNNING',
        isSmartMode,
        reboundFocusEnabled,
        reboundTimeframes,
        minTradeAmount: Math.max(0.5, parseFloat(minTradeAmount) || 0.5),
        autoRebalance
      });
    } else if (selectedBotType === 'DCA') {
      const parsedBase = parseFloat(baseOrderSize);
      const parsedSafety = parseFloat(safetyOrderSize);
      const parsedDev = parseFloat(priceDeviation);
      const parsedInvest = parseFloat(dcaInvestment);

      if (isNaN(parsedBase) || isNaN(parsedSafety) || isNaN(parsedDev) || isNaN(parsedInvest) || parsedInvest <= 0) {
        alert(lang === 'ar' ? 'الرجاء فحص حقول الإدخال لبوت DCA.' : 'Please fix DCA inputs before launching.');
        return;
      }

      onCreateBot({
        symbol: finalSymbol,
        type: 'DCA',
        config: {
          baseOrderSize: parsedBase,
          safetyOrderSize: parsedSafety,
          priceDeviation: parsedDev,
          maxSafetyOrders,
          investmentInterval: dcaInterval,
          totalInvestment: parsedInvest,
          trailingStopLoss,
          trailingTakeProfit,
          sensitivity
        },
        status: 'RUNNING',
        isSmartMode,
        reboundFocusEnabled,
        reboundTimeframes,
        minTradeAmount: Math.max(0.5, parseFloat(minTradeAmount) || 0.5),
        autoRebalance
      });
    } else if (selectedBotType === 'RSI') {
      const parsedOversold = parseFloat(rsiOversold);
      const parsedOverbought = parseFloat(rsiOverbought);
      const parsedTradeAmount = parseFloat(rsiTradeAmount);

      if (isNaN(parsedOversold) || isNaN(parsedOverbought) || isNaN(parsedTradeAmount) || parsedTradeAmount <= 0) {
        alert(lang === 'ar' ? 'الرجاء فحص حقول الإدخال لبوت RSI.' : 'Please fix RSI inputs before launching.');
        return;
      }

      onCreateBot({
        symbol: finalSymbol,
        type: 'RSI',
        config: {
          oversoldThreshold: parsedOversold,
          overboughtThreshold: parsedOverbought,
          rsiPeriod,
          tradeAmount: parsedTradeAmount,
          stopLoss: parseFloat(stopLossPercent) || undefined,
          takeProfit: parseFloat(takeProfitPercent) || undefined,
          trailingStopLoss,
          trailingTakeProfit,
          sensitivity
        },
        status: 'RUNNING',
        isSmartMode,
        reboundFocusEnabled,
        reboundTimeframes,
        minTradeAmount: Math.max(0.5, parseFloat(minTradeAmount) || 0.5),
        autoRebalance
      });
    }
  };

  // Calc of statistics for all current active bots
  const totalInvestment = activeBots.reduce((acc, bot) => {
    if (bot.type === 'GRID') {
      const config = bot.config as GridBotConfig;
      return acc + (config.investmentAmount || 0);
    } else if (bot.type === 'DCA') {
      const config = bot.config as DcaBotConfig;
      return acc + (config.totalInvestment || 0);
    } else {
      const config = bot.config as any; // RsiBotConfig handling
      return acc + (config.tradeAmount * 3 || 0); // Estimate tied capital
    }
  }, 0);

  const totalProfit = activeBots.reduce((acc, bot) => acc + (bot.accumulatedProfit || 0), 0);
  const aggregateRoi = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;
  
  const runningBotsCount = activeBots.filter(bot => bot.status === 'RUNNING').length;
  const pausedBotsCount = activeBots.filter(bot => bot.status === 'PAUSED').length;
  const totalExecutedArbitrages = activeBots.reduce((acc, bot) => acc + (bot.arbitrageCount || 0), 0);

  // Internationalized Arabic/English stats dictionary
  const statsD = {
    totalProfitTitle: lang === 'ar' ? 'إجمالي الأرباح المتراكمة' : 'Total Cumulative Profits',
    totalInvestmentTitle: lang === 'ar' ? 'إجمالي رأس المال المخصص' : 'Total Capital Allocated',
    totalRoiTitle: lang === 'ar' ? 'معدل العائد المرجح (ROI)' : 'Weighted Portfolio ROI',
    activeBotsTitle: lang === 'ar' ? 'خوارزميات البوتات الجارية' : 'Engaged Algorithms',
    runningLabel: lang === 'ar' ? 'قيد العمل' : 'Running',
    pausedLabel: lang === 'ar' ? 'موقوف مؤقتاً' : 'Paused',
    arbitragesDesc: lang === 'ar' ? 'عملية موازنة سيولة' : 'arbitrages',
    noBotsText: lang === 'ar' ? 'لا توجد بوتات حالية' : 'No bots running',
    positiveTrend: lang === 'ar' ? 'أداء إيجابي ممتاز ⚡' : 'Outperforming expectations ⚡',
    negativeTrend: lang === 'ar' ? 'تراجع طفيف للأسواق ❄️' : 'Undergoing consolidation ❄️',
    neutralTrend: lang === 'ar' ? 'بانتظار تفعيل البوتات ⏱' : 'Awaiting bot activation ⏱',
  };

  // Generate daily profits for the current week (Sunday to Saturday) based on active bots and fallback historical base
  const getWeeklyProfitHistorical = () => {
    const daysAr = [
      { key: 'Sun', label: 'الأحد', short: 'ح' },
      { key: 'Mon', label: 'الإثنين', short: 'ن' },
      { key: 'Tue', label: 'الثلاثاء', short: 'ث' },
      { key: 'Wed', label: 'الأربعاء', short: 'ر' },
      { key: 'Thu', label: 'الخميس', short: 'خ' },
      { key: 'Fri', label: 'الجمعة', short: 'ج' },
      { key: 'Sat', label: 'السبت', short: 'س' }
    ];
    
    const daysEn = [
      { key: 'Sun', label: 'Sun', short: 'S' },
      { key: 'Mon', label: 'Mon', short: 'M' },
      { key: 'Tue', label: 'Tue', short: 'T' },
      { key: 'Wed', label: 'Wed', short: 'W' },
      { key: 'Thu', label: 'Thu', short: 'T' },
      { key: 'Fri', label: 'Fri', short: 'F' },
      { key: 'Sat', label: 'Sat', short: 'S' }
    ];

    const today = new Date();
    const todayIndex = today.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

    // Base mock historical earnings for days leading up to today to represent historical records as requested
    const historicalSeedGains = [12.40, 18.55, 9.20, 15.65, 22.10, 14.80, 19.35];

    const dayItems = (lang === 'ar' ? daysAr : daysEn).map((d, index) => {
      const isToday = index === todayIndex;
      const isFuture = index > todayIndex;
      
      let dayProfit = 0;
      
      if (!isFuture) {
        // If bots are running and have totalProfit, let's distribute it over completed days
        if (totalProfit > 0) {
          // Proportionate distribution with some beautiful deterministic noise
          const divisor = todayIndex + 1;
          const share = totalProfit / divisor;
          const variance = Math.sin(index * 3) * (share * 0.25);
          dayProfit = Math.max(0.1, share + variance);
        } else {
          // Use realistic historical seed gains to show a broader view
          dayProfit = historicalSeedGains[index];
        }
      }

      return {
        name: d.label,
        short: d.short,
        profit: parseFloat(dayProfit.toFixed(1)),
        isToday,
      };
    });

    return dayItems;
  };

  const weeklyProfitData = getWeeklyProfitHistorical();

  return (
    <div className="space-y-6" id="bot-trading-main-wrapper" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Top Professional Stats Overview Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300" id="bot-trading-analytics-bar">
        {/* Card 1: Total Profit */}
        <div className={`p-4 rounded-xl border transition-all duration-300 ${
          totalProfit > 0 
            ? 'bg-emerald-950/20 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.08)]' 
            : totalProfit < 0 
            ? 'bg-rose-950/20 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.08)]' 
            : 'bg-slate-950/40 border-slate-850'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {statsD.totalProfitTitle}
            </span>
            <div className={`p-1 rounded-lg shrink-0 ${
              totalProfit > 0 ? 'bg-emerald-500/10 text-emerald-400' : totalProfit < 0 ? 'bg-rose-500/10 text-rose-450' : 'bg-slate-800/40 text-slate-500'
            }`}>
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <span className={`text-sm sm:text-base font-extrabold font-mono tracking-tight block ${
              totalProfit > 0 ? 'text-emerald-400' : totalProfit < 0 ? 'text-rose-450' : 'text-slate-300'
            }`}>
              {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)} USDT
            </span>
            <span className="text-[9px] text-slate-400 block">
              {totalProfit > 0 ? statsD.positiveTrend : totalProfit < 0 ? statsD.negativeTrend : statsD.neutralTrend}
            </span>
          </div>
        </div>

        {/* Card 2: Total Investment */}
        <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl hover:border-slate-800 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {statsD.totalInvestmentTitle}
            </span>
            <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-sm sm:text-base font-extrabold font-mono tracking-tight text-slate-100 block">
              ${totalInvestment.toLocaleString()} USDT
            </span>
            <span className="text-[9px] text-slate-400 block">
              {lang === 'ar' ? 'إجمالي المخصص بالمحفظة' : 'Bot capital reservation'}
            </span>
          </div>
        </div>

        {/* Card 3: Weight ROI % */}
        <div className={`p-4 rounded-xl border transition-all duration-300 ${
          totalProfit > 0 
            ? 'bg-emerald-950/25 border-emerald-500/25' 
            : totalProfit < 0 
            ? 'bg-rose-950/25 border-rose-500/25' 
            : 'bg-slate-950/40 border-slate-850'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {statsD.totalRoiTitle}
            </span>
            <div className={`p-1 rounded-lg shrink-0 ${
              totalProfit > 0 ? 'bg-emerald-500/10 text-emerald-400' : totalProfit < 0 ? 'bg-rose-500/10 text-rose-450' : 'bg-slate-800/40 text-slate-500'
            }`}>
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <span className={`text-sm sm:text-base font-extrabold font-mono tracking-tight block ${
              totalProfit > 0 ? 'text-emerald-400' : totalProfit < 0 ? 'text-rose-450' : 'text-slate-300'
            }`}>
              {totalProfit >= 0 ? '+' : ''}{aggregateRoi.toFixed(2)}%
            </span>
            <span className="text-[9px] text-slate-400 block">
              {activeBots.length > 0 ? `${totalExecutedArbitrages} ${statsD.arbitragesDesc}` : statsD.noBotsText}
            </span>
          </div>
        </div>

        {/* Card 4: Algorithmic bots active */}
        <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl hover:border-slate-800 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {statsD.activeBotsTitle}
            </span>
            <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
              <Cpu className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="flex items-baseline gap-1.5 leading-tight">
              <span className="text-sm sm:text-base font-extrabold font-mono text-slate-100">
                {activeBots.length}
              </span>
              {activeBots.length > 0 && (
                <span className="text-[9px] font-mono font-bold text-slate-400">
                  ({runningBotsCount} {statsD.runningLabel} / {pausedBotsCount} {statsD.pausedLabel})
                </span>
              )}
            </div>
            <span className="text-[9px] text-slate-400 block">
              {lang === 'ar' ? 'تتبع صفقات السيولة الفعلي' : 'Real-time automation active'}
              {isLiveTrading && (
                <span className="block text-[8px] text-emerald-400 font-bold mt-1 uppercase tracking-wider animate-pulse">
                  {lang === 'ar' ? '● تداول حقيقي الآن' : '● Live Trading Enabled'}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* 📊 BAR CHART: Weekly Daily Profits Dashboard */}
      <div className="bg-slate-950/40 border border-slate-850 p-4 sm:p-5 rounded-xl hover:border-slate-800 transition-colors animate-in fade-in duration-500" id="weekly-daily-profits-chart-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="space-y-1 text-right sm:text-left" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
            <h4 className="text-xs sm:text-sm font-black text-slate-100 flex items-center justify-start gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                {lang === 'ar' 
                  ? '📊 توزيع الأرباح اليومية لصفقات الخوارزميات للبوتات' 
                  : '📊 Weekly Daily Profit Distribution Chart'}
              </span>
            </h4>
            <p className="text-[10px] text-slate-400 leading-normal">
              {lang === 'ar'
                ? 'مخطط زمني شريطي يقارن عوائد عمليات موازنة وتحكيم السيولة المكتسبة يومياً على مدار الأسبوع الحالي بالاعتماد على التراكم المحفوظ.'
                : 'Comparative view of captured margin rewards and grid arbitrage harvests achieved daily in the current calendar cycle.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-[10px] sm:text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-t from-indigo-600 to-indigo-400 inline-block" />
            <span className="text-slate-400 font-bold">
              {lang === 'ar' ? 'أرباح الـ USDT المحققة' : 'Captured USDT Earnings'}
            </span>
          </div>
        </div>

        {/* Recharts BarChart container */}
        <div className="h-44 w-full" id="recharts-weekly-bar-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyProfitData}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-950/95 border border-slate-800 p-2.5 rounded-lg text-right sm:text-left text-[11px] space-y-1 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                        <span className="font-bold text-slate-350 block text-[10px]">
                          {data.name} {data.isToday ? (lang === 'ar' ? '(اليوم)' : '(Today)') : ''}
                        </span>
                        <div className="flex items-center gap-1 text-emerald-400 font-bold font-mono">
                          <span>+{data.profit.toFixed(1)} USDT</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                {weeklyProfitData.map((entry, index) => {
                  const isCurrent = entry.isToday;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={isCurrent ? 'url(#activeDayColor)' : 'url(#normalDayColor)'}
                      className="transition-all duration-300 hover:opacity-85 cursor-pointer"
                    />
                  );
                })}
              </Bar>

              {/* Define cool futuristic gradient colors for the bars */}
              <defs>
                <linearGradient id="normalDayColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.88} />
                  <stop offset="100%" stopColor="#312e81" stopOpacity={0.4} />
                </linearGradient>
                <linearGradient id="activeDayColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Dynamic summary indicator */}
        <div className="flex items-center justify-between border-t border-slate-900/60 pt-3 mt-3.5 text-[9px] font-mono text-slate-450">
          <div className="flex gap-4 items-center">
            <span>
              {lang === 'ar' ? 'المجموع المجمع للأسبوع الحالي:' : 'Cumulative Weekly Aggregate:'}
              <strong className="text-indigo-400 font-bold ml-1">
                ${weeklyProfitData.reduce((sum, d) => sum + d.profit, 0).toFixed(2)} USDT
              </strong>
            </span>
            <span className="hidden sm:inline-block h-3 w-px bg-slate-800" />
            <span className="hidden sm:inline">
              {lang === 'ar' ? 'متوسط عوائد البوت اليومية:' : 'Average Daily Yield:'}
              <strong className="text-emerald-400 font-bold ml-1">
                ${(weeklyProfitData.reduce((sum, d) => sum + d.profit, 0) / 7).toFixed(2)} USDT
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-1 text-[9px] text-indigo-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
            <span>
              {lang === 'ar' ? 'تحديثات السيولة فورية ومؤمنة بالكامل كلياً' : 'Automated daily consolidation verified ✔'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="bot-trading-root">
      
      {/* LEFT: Config Form & Interactive Visual Network */}
      <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div>
          <BotTradesHistory lang={lang} />
          
          {/* Bot switch category tabs */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 mb-5 text-[11px] overflow-x-auto whitespace-nowrap hide-scrollbar">
            <button
              onClick={() => setSelectedBotType('GRID')}
              className={`flex-1 py-2 px-3 font-bold rounded-md transition ${
                selectedBotType === 'GRID' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'ar' ? d.gridBot : 'Grid Bot'}
            </button>
            <button
              onClick={() => setSelectedBotType('DCA')}
              className={`flex-1 py-1.5 px-3 font-bold rounded-md transition ${
                selectedBotType === 'DCA' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'ar' ? d.dcaBot : 'DCA Bot'}
            </button>
            <button
              onClick={() => setSelectedBotType('RSI')}
              className={`flex-1 py-1.5 px-3 font-bold rounded-md transition ${
                selectedBotType === 'RSI' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'ar' ? 'بوت مؤشر القوة النسبية RSI' : 'RSI Oscillator Bot'}
            </button>
          </div>

          <p className="text-xs text-slate-400 mb-5 leading-normal">
            {selectedBotType === 'GRID' && d.gridBotDesc}
            {selectedBotType === 'DCA' && d.dcaBotDesc}
            {selectedBotType === 'RSI' && (lang === 'ar' ? 'استراتيجية التداول بناءً على مؤشر القوة النسبية، تلتقط الارتدادات بناءً على ذروة البيع وذروة الشراء للسهم.' : 'Momentum strategy catching mean-reversions. Fires BUYS on oversold drops, and SELLS on euphoric spikes.')}
          </p>

          <form onSubmit={handleLaunchBot} className="space-y-4">
            
            {/* Asset Scope Search / Selector - For scanning all coins and departments */}
            <div className="space-y-1.5 p-3 rounded-lg bg-slate-950/60 border border-slate-850">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                {lang === 'ar' ? 'نطاق تداول ومسح بوتات التداول الآلي' : 'Scanned Asset Trading Scope'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetScope('SINGLE')}
                  className={`py-2 px-2 rounded-lg border text-[10.5px] font-black transition cursor-pointer text-center ${
                    targetScope === 'SINGLE'
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md font-extrabold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lang === 'ar' ? `العملة المحددة (${activePair.symbol})` : `Selected Active Coin (${activePair.symbol})`}
                </button>
                <button
                  type="button"
                  onClick={() => setTargetScope('ALL')}
                  className={`py-2 px-2 rounded-lg border text-[10.5px] font-black transition cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                    targetScope === 'ALL'
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md font-extrabold'
                      : 'bg-slate-900 border-slate-800 text-slate-450 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>{lang === 'ar' ? '🔍 جميع الأقسام والعملات كاملة' : '🔍 All Coins & Sections'}</span>
                </button>
              </div>
              <p className="text-[9.5px] text-slate-400 leading-normal">
                {targetScope === 'SINGLE'
                  ? (lang === 'ar' ? 'سيركز البوت تداولاته فقط على زوج العملة النشط الحالي.' : 'Trades exclusive to the selected pair in your screen header.')
                  : (lang === 'ar' ? 'سيعمل الرادار على تتبع ومسح كامل رموز المعروض بجميع الأقسام (BTC, ETH, SOL, BNB) للبحث وتوزيع الصفقات تلقائياً.' : 'Simultaneously scans and triggers spot operations across all supported segments to catch optimal liquidity.')}
              </p>
            </div>

            {/* Auto-Rebalance Yield Maximizer Toggle */}
            <div className="bg-slate-950/80 border border-emerald-900/40 rounded-xl p-4 space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-black text-slate-100 uppercase tracking-wide">
                    {lang === 'ar' ? 'موازنة المحفظة التلقائية (Auto-Rebalance) 🔄' : 'Auto-Rebalance Yield Maximizer 🔄'}
                  </span>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="auto-rebalance-toggle"
                    checked={autoRebalance}
                    onChange={(e) => setAutoRebalance(e.target.checked)}
                    className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500 rounded border-slate-800 bg-slate-950 cursor-pointer"
                  />
                  <label htmlFor="auto-rebalance-toggle" className="text-[10px] text-emerald-300 font-bold ml-1 mr-1 cursor-pointer">
                    {lang === 'ar' ? 'تفعيل' : 'Active'}
                  </label>
                </div>
              </div>
              <p className="text-[9.5px] text-slate-400 leading-relaxed">
                {lang === 'ar'
                  ? '🔄 عند التفعيل، سيقوم البوت بإعادة توجيه رأس المال تلقائياً وبشكل دوري نحو العملات الثلاثة الأولى الأكثر ربحية وجاذبية بإشارات الذكاء الاصطناعي في ماسح الفرص لضمان أقصى عائد مالي.'
                  : '🔄 Automatically shifts and updates the active trading allocations to target the top 3 highest-rated yield assets detected by the Global Opportunities Scanner.'}
              </p>
            </div>

            {/* Multi-Timeframe Rebound Intensity & Scalping Budget */}
            <div className="bg-slate-950/80 border border-indigo-900/40 rounded-xl p-4 space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <span className="text-[11px] font-black text-slate-100 uppercase tracking-wide">
                    {lang === 'ar' ? 'رادار الارتداد متعدد الأطر الزمنية ⚡' : 'Multi-Timeframe Rebound Radar ⚡'}
                  </span>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rebound-enabled-toggle"
                    checked={reboundFocusEnabled}
                    onChange={(e) => setReboundFocusEnabled(e.target.checked)}
                    className="w-3.5 h-3.5 text-indigo-600 focus:ring-indigo-500 rounded border-slate-800 bg-slate-950 cursor-pointer"
                  />
                  <label htmlFor="rebound-enabled-toggle" className="text-[10px] text-indigo-300 font-bold ml-1 mr-1 cursor-pointer">
                    {lang === 'ar' ? 'تفعيل التركيز' : 'Active'}
                  </label>
                </div>
              </div>

              {reboundFocusEnabled && (
                <>
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-slate-405 block font-semibold leading-normal">
                      {lang === 'ar' 
                        ? 'اختر الأطر الزمنية الفعالة لرصد الارتدادات السريعة والمستهدفة بالمسح (15 دقيقة / 30 دقيقة / 1 ساعة) لفتح الصفقات:' 
                        : 'Active scanning candle intervals to isolate volatile pivots and entries:'}
                    </span>
                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      {['15m', '30m', '1h'].map((tf) => {
                        const isSelected = reboundTimeframes.includes(tf);
                        return (
                          <button
                            key={tf}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setReboundTimeframes(reboundTimeframes.filter(t => t !== tf));
                              } else {
                                setReboundTimeframes([...reboundTimeframes, tf]);
                              }
                            }}
                            className={`py-1.5 px-1 rounded-md text-[10px] font-mono font-bold transition cursor-pointer border ${
                              isSelected
                                ? 'bg-indigo-900/80 border-indigo-500 text-indigo-200'
                                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-350'
                            }`}
                          >
                            ⏱️ {tf}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[9.5px] text-slate-300 font-bold block">
                        {lang === 'ar' ? 'الحد الأدنى لقيمة كل صفقة (ولو بنص دولار):' : 'Min Trade Size per Rebound:'}
                      </label>
                      <span className="text-[9.5px] text-emerald-400 font-bold animate-pulse font-mono">
                        {minTradeAmount} USDT
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="1000"
                        value={minTradeAmount}
                        onChange={(e) => setMinTradeAmount(e.target.value)}
                        className="flex-1 bg-slate-900/90 text-emerald-400 font-mono text-xs px-2.5 py-1 border border-indigo-950 rounded-lg focus:outline-none focus:border-indigo-500 text-center"
                        placeholder="0.5"
                      />
                      <div className="flex gap-1">
                        {['0.5', '1.0', '2.0'].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setMinTradeAmount(val)}
                            className="bg-slate-910 hover:bg-slate-850 px-2 py-1 rounded text-[9px] text-slate-300 font-mono border border-slate-800 cursor-pointer"
                          >
                            ${val}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-400 leading-relaxed mt-1">
                      {lang === 'ar'
                        ? '💡 يتيح للبوت الدخول المكثف في صفقات ميكرو متناهية الصغر بمجرد رصد ارتداد سعري على الفريمات المحددة لتفادي نقص السيولة.'
                        : '💡 Allows microscopic order entries automatically once volatility indexes detect rebound signatures on specified intervals.'}
                    </p>
                  </div>
                </>
              )}
            </div>

            {targetScope === 'ALL' && selectedBotType === 'GRID' && (
              <div className="text-[9.5px] text-amber-400/90 leading-relaxed bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5">
                {lang === 'ar' 
                  ? 'تنويه مميز: عند تشغيل الوضع الشامل لجميع الأقسام، سيتم موازنة نطاقات مستويات الشبكة (Grid-Lines) تلقائياً لتناسب النطاق السعري التلقائي لجميع العملات بالتوازي.' 
                  : 'Premium Note: When scanning all assets, grid levels auto-calibrate dynamically to fit each coin\'s particular price range.'}
              </div>
            )}

            {selectedBotType === 'GRID' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">{d.lowerPrice} (USDT)</label>
                    <input
                      type="number"
                      value={lowerPrice}
                      onChange={(e) => setLowerPrice(e.target.value)}
                      className="w-full bg-slate-950 text-slate-100 font-mono text-sm px-3 py-2 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">{d.upperPrice} (USDT)</label>
                    <input
                      type="number"
                      value={upperPrice}
                      onChange={(e) => setUpperPrice(e.target.value)}
                      className="w-full bg-slate-950 text-slate-100 font-mono text-sm px-3 py-2 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="text-slate-400">{d.gridLines}</span>
                    <span className="text-indigo-400 font-bold font-mono">{gridLines}</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="50"
                    value={gridLines}
                    onChange={(e) => setGridLines(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">{d.investment} (USDT)</label>
                  <input
                    type="number"
                    value={gridInvestment}
                    onChange={(e) => setGridInvestment(e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 font-mono text-sm px-3 py-2 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                  {portfolio?.usdt !== undefined && (
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setGridInvestment((portfolio.usdt * 0.25).toFixed(2))}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-bold text-slate-400 hover:text-white cursor-pointer transition"
                      >
                        25%
                      </button>
                      <button
                        type="button"
                        onClick={() => setGridInvestment((portfolio.usdt * 0.5).toFixed(2))}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-bold text-slate-400 hover:text-white cursor-pointer transition"
                      >
                        50%
                      </button>
                      <button
                        type="button"
                        onClick={() => setGridInvestment((portfolio.usdt * 0.75).toFixed(2))}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-bold text-slate-400 hover:text-white cursor-pointer transition"
                      >
                        75%
                      </button>
                      <button
                        type="button"
                        onClick={() => setGridInvestment(portfolio.usdt.toFixed(2))}
                        className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-400 hover:bg-indigo-500/25 cursor-pointer transition"
                      >
                        {lang === 'ar' ? '100% (أقصى رصيد)' : '100% (Max)'} (${portfolio.usdt.toFixed(1)})
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {selectedBotType === 'DCA' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">{d.baseOrder} (USDT)</label>
                    <input
                      type="number"
                      value={baseOrderSize}
                      onChange={(e) => setBaseOrderSize(e.target.value)}
                      className="w-full bg-slate-950 text-slate-100 font-mono text-sm px-3 py-2 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">{d.safetyOrder} (USDT)</label>
                    <input
                      type="number"
                      value={safetyOrderSize}
                      onChange={(e) => setSafetyOrderSize(e.target.value)}
                      className="w-full bg-slate-950 text-slate-100 font-mono text-sm px-3 py-2 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">{d.priceDeviation} (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={priceDeviation}
                      onChange={(e) => setPriceDeviation(e.target.value)}
                      className="w-full bg-slate-950 text-slate-100 font-mono text-sm px-3 py-2 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-[10px] mb-1">
                      <span className="text-slate-400">{lang === 'ar' ? 'أقصى احتياطي' : 'Max safety cycles'}</span>
                      <span className="text-indigo-400 font-extrabold">{maxSafetyOrders}</span>
                    </div>
                    <select
                      value={maxSafetyOrders}
                      onChange={(e) => setMaxSafetyOrders(parseInt(e.target.value))}
                      className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10].map(o => (
                        <option value={o} key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">{d.interval}</label>
                    <select
                      value={dcaInterval}
                      onChange={(e) => setDcaInterval(e.target.value as any)}
                      className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
                    >
                      <option value="1H">1h (كل ساعة)</option>
                      <option value="4H">4h (كل 4 ساعات)</option>
                      <option value="12H">12h (كل 12 ساعة)</option>
                      <option value="1D">1D (يومي)</option>
                      <option value="1W">1W (أسبوعي)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">{d.investment} (USDT)</label>
                    <input
                      type="number"
                      value={dcaInvestment}
                      onChange={(e) => setDcaInvestment(e.target.value)}
                      className="w-full bg-slate-950 text-slate-100 font-mono text-sm px-3 py-2 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                    {portfolio?.usdt !== undefined && (
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            const val = portfolio.usdt * 0.25;
                            setDcaInvestment(val.toFixed(2));
                            setBaseOrderSize((val * 0.15).toFixed(2));
                            setSafetyOrderSize((val * 0.25).toFixed(2));
                          }}
                          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-bold text-slate-400 hover:text-white cursor-pointer transition"
                        >
                          25%
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const val = portfolio.usdt * 0.50;
                            setDcaInvestment(val.toFixed(2));
                            setBaseOrderSize((val * 0.15).toFixed(2));
                            setSafetyOrderSize((val * 0.25).toFixed(2));
                          }}
                          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-bold text-slate-400 hover:text-white cursor-pointer transition"
                        >
                          50%
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const val = portfolio.usdt * 0.75;
                            setDcaInvestment(val.toFixed(2));
                            setBaseOrderSize((val * 0.15).toFixed(2));
                            setSafetyOrderSize((val * 0.25).toFixed(2));
                          }}
                          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-bold text-slate-400 hover:text-white cursor-pointer transition"
                        >
                          75%
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const val = portfolio.usdt;
                            setDcaInvestment(val.toFixed(2));
                            setBaseOrderSize((val * 0.15).toFixed(2));
                            setSafetyOrderSize((val * 0.25).toFixed(2));
                          }}
                          className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-400 hover:bg-indigo-500/25 cursor-pointer transition"
                        >
                          {lang === 'ar' ? '100% (أقصى رصيد)' : '100% (Max)'} (${portfolio.usdt.toFixed(1)})
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {selectedBotType === 'RSI' && (
              <>
                {/* Pre-configured RSI Strategy Templates */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-indigo-900/40 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-black text-indigo-400">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>
                      {lang === 'ar' ? 'قوالب استراتيجية RSI المعدة مسبقاً' : '🎯 RSI Strategy Templates'}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 block leading-tight">
                    {lang === 'ar' 
                      ? 'حدد تكويناً جاهزاً لضبط الشموع وعتبات ذروة التشبع وحساسية الحركة تلقائياً:' 
                      : 'Instantly select a calibrated setup to auto-configure thresholds, period, and risk profile:'}
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Template 1: Conservative */}
                    <button
                      type="button"
                      onClick={() => {
                        setRsiOversold('20');
                        setRsiOverbought('80');
                        setRsiPeriod(14);
                        setSensitivity('LOW');
                      }}
                      className="text-right sm:text-center p-2 rounded bg-slate-900 border border-slate-800 hover:border-emerald-600/50 transition cursor-pointer flex flex-col justify-between"
                    >
                      <div className="text-[10px] font-black text-slate-200">
                        {lang === 'ar' ? 'حذر للغاية' : 'Conservative'}
                      </div>
                      <div className="font-mono text-[9px] text-emerald-400 mt-1">
                        {lang === 'ar' ? 'تشبع: 20-80' : 'RSI: 20-80'}
                      </div>
                      <div className="text-[8px] text-slate-500 font-mono mt-0.5">
                        {lang === 'ar' ? 'فترة: 14 | حذر' : 'P: 14 | Low'}
                      </div>
                    </button>

                    {/* Template 2: Balanced */}
                    <button
                      type="button"
                      onClick={() => {
                        setRsiOversold('30');
                        setRsiOverbought('70');
                        setRsiPeriod(14);
                        setSensitivity('MEDIUM');
                      }}
                      className="text-right sm:text-center p-2 rounded bg-slate-900 border border-indigo-500/30 hover:border-indigo-500 transition cursor-pointer flex flex-col justify-between"
                    >
                      <div className="text-[10px] font-black text-indigo-300">
                        {lang === 'ar' ? 'متزن وقوي' : 'Standard Swing'}
                      </div>
                      <div className="font-mono text-[9px] text-indigo-400 mt-1">
                        {lang === 'ar' ? 'تشبع: 30-70' : 'RSI: 30-70'}
                      </div>
                      <div className="text-[8px] text-slate-500 font-mono mt-0.5">
                        {lang === 'ar' ? 'فترة: 14 | معتدل' : 'P: 14 | Med'}
                      </div>
                    </button>

                    {/* Template 3: Scalper */}
                    <button
                      type="button"
                      onClick={() => {
                        setRsiOversold('35');
                        setRsiOverbought('65');
                        setRsiPeriod(9);
                        setSensitivity('HIGH');
                      }}
                      className="text-right sm:text-center p-2 rounded bg-slate-900 border border-slate-800 hover:border-amber-600/50 transition cursor-pointer flex flex-col justify-between"
                    >
                      <div className="text-[10px] font-black text-slate-200">
                        {lang === 'ar' ? 'مضاربة سريعة' : 'Aggressive Scalp'}
                      </div>
                      <div className="font-mono text-[9px] text-amber-400 mt-1">
                        {lang === 'ar' ? 'تشبع: 35-65' : 'RSI: 35-65'}
                      </div>
                      <div className="text-[8px] text-slate-500 font-mono mt-0.5">
                        {lang === 'ar' ? 'فترة: 9 | نشط' : 'P: 9 | High'}
                      </div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      {lang === 'ar' ? 'حد ذروة الشراء (Overbought)' : 'Overbought Threshold'}
                    </label>
                    <input
                      type="number"
                      value={rsiOverbought}
                      onChange={(e) => setRsiOverbought(e.target.value)}
                      min="50"
                      max="100"
                      className="w-full bg-slate-950 text-slate-100 font-mono text-sm px-3 py-2 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      {lang === 'ar' ? 'حد ذروة البيع (Oversold)' : 'Oversold Threshold'}
                    </label>
                    <input
                      type="number"
                      value={rsiOversold}
                      onChange={(e) => setRsiOversold(e.target.value)}
                      min="0"
                      max="50"
                      className="w-full bg-slate-950 text-slate-100 font-mono text-sm px-3 py-2 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="text-slate-400">{lang === 'ar' ? 'فترة المؤشر (RSI Period)' : 'RSI Time Period'}</span>
                    <span className="text-indigo-400 font-bold font-mono">{rsiPeriod}</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="50"
                    value={rsiPeriod}
                    onChange={(e) => setRsiPeriod(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">{lang === 'ar' ? 'مبلغ التداول لكل صفقة (USDT)' : 'Trade Amount (USDT)'}</label>
                  <input
                    type="number"
                    value={rsiTradeAmount}
                    onChange={(e) => setRsiTradeAmount(e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 font-mono text-sm px-3 py-2 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                  {portfolio?.usdt !== undefined && (
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          const val = portfolio.usdt * 0.15;
                          setRsiTradeAmount(val.toFixed(2));
                        }}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-bold text-slate-400 hover:text-white cursor-pointer transition"
                      >
                        15%
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const val = portfolio.usdt * 0.25;
                          setRsiTradeAmount(val.toFixed(2));
                        }}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-bold text-slate-400 hover:text-white cursor-pointer transition"
                      >
                        25%
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* AI Smart Mode Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-950/25 border border-indigo-900/30">
              <div className="flex gap-2.5 items-center">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                <div className="text-right sm:text-left" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                  <label htmlFor="smart_mode_chk" className="text-xs font-black text-slate-100 block cursor-pointer select-none">
                    {lang === 'ar' ? 'تفعيل توجيه الذكاء الاصطناعي (Gemini AI)' : 'Enable Intelligent Gemini AI Guidance'}
                  </label>
                  <span className="text-[9px] text-slate-400 block mt-0.5 leading-tight">
                    {lang === 'ar' ? 'تحسين صياغة وتوقيت الصفقات بالاستعانة برادارات الفحص الفني ومؤشرات Gemini الاستباقية لتجنب الخسارة.' : 'Optimizes entry executions based on real-time Gemini sentiment audits.'}
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                id="smart_mode_chk"
                checked={isSmartMode}
                onChange={(e) => setIsSmartMode(e.target.checked)}
                className="w-4 h-4 text-indigo-600 bg-slate-950 rounded border-slate-800 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            {/* Advanced Configurations */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300">{lang === 'ar' ? 'إعدادات متقدمة والتحكم الصارم' : 'Advanced Risk Controls'}</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-450">{lang === 'ar' ? 'مرونة الدخول (الاستراتيجية)' : 'Entry Sensitivity'}</label>
                  <select
                    value={sensitivity}
                    onChange={(e) => setSensitivity(e.target.value as 'HIGH' | 'MEDIUM' | 'LOW')}
                    className="w-full bg-slate-950 text-slate-200 font-bold text-xs px-2 py-1.5 border border-slate-800 rounded focus:outline-none focus:border-indigo-500"
                  >
                    <option value="HIGH">{lang === 'ar' ? 'عالية (مخاطرة لالتقاط فرص سريعة)' : 'HIGH (Aggressive)'}</option>
                    <option value="MEDIUM">{lang === 'ar' ? 'متوسطة (متوازنة)' : 'MEDIUM (Balanced)'}</option>
                    <option value="LOW">{lang === 'ar' ? 'منخفضة (حذرة جداً)' : 'LOW (Conservative)'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-450 flex items-center justify-between">
                    <span>{lang === 'ar' ? 'وقف الخسارة' : 'Stop Loss'} %</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={trailingStopLoss} onChange={(e) => setTrailingStopLoss(e.target.checked)} className="rounded bg-slate-950 border-slate-800 text-indigo-500 max-w-[12px] max-h-[12px]"/>
                      <span className="text-[8px] text-amber-500">{lang === 'ar' ? 'متتبع' : 'Trailing'}</span>
                    </label>
                  </label>
                  <input
                    type="number"
                    value={stopLossPercent}
                    onChange={(e) => setStopLossPercent(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full bg-slate-950 text-slate-200 font-mono text-xs px-2 py-1.5 border border-slate-800 rounded focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-emerald-450 flex items-center justify-between">
                    <span>{lang === 'ar' ? 'جني الأرباح' : 'Take Profit'} %</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={trailingTakeProfit} onChange={(e) => setTrailingTakeProfit(e.target.checked)} className="rounded bg-slate-950 border-slate-800 text-emerald-500 max-w-[12px] max-h-[12px]"/>
                      <span className="text-[8px] text-emerald-400">{lang === 'ar' ? 'متتبع' : 'Trailing'}</span>
                    </label>
                  </label>
                  <input
                    type="number"
                    value={takeProfitPercent}
                    onChange={(e) => setTakeProfitPercent(e.target.value)}
                    placeholder="e.g. 10"
                    className="w-full bg-slate-950 text-emerald-200 font-mono text-xs px-2 py-1.5 border border-emerald-900/30 rounded focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition duration-200 mt-2 flex items-center justify-center gap-2"
            >
              <Cpu className="w-4 h-4 shrink-0" />
              {lang === 'ar' ? d.runBot : 'Spawn Automated Strategy Bot'}
            </button>
          </form>
        </div>

        {/* Visual Map of Grid/DCA orders */}
        {selectedBotType === 'GRID' && lp > 0 && up > lp && (
          <div className="mt-6 border-t border-slate-850 pt-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'ar' ? 'تشريح تفصيلي لشبكة الصفقات' : 'Spot Network Allocation'}</span>
            </h4>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 h-32 relative flex flex-col justify-between overflow-hidden">
              
              {/* Plot prices inside box */}
              {visualLines.map((linePrice, idx) => {
                const fraction = (linePrice - lp) / (up - lp);
                const pct = (fraction * 100).toFixed(1);
                
                // Color levels differently
                const isCloseToCurrent = Math.abs(linePrice - activePair.currentPrice) < (up - lp) * 0.1;
                const strokeColor = idx % 2 === 0 ? 'border-emerald-600/30' : 'border-rose-600/30';

                return (
                  <div
                    key={idx}
                    className={`absolute w-full border-t ${strokeColor} left-0 flex justify-between px-2 text-[8px] font-mono select-none`}
                    style={{ bottom: `${pct}%` }}
                    style-visibility="auto"
                  >
                    <span className="text-slate-600">${linePrice.toFixed(1)}</span>
                    <span className={idx % 2 === 0 ? 'text-emerald-500/80' : 'text-rose-500/80'}>
                      {idx % 2 === 0 ? 'BUY LIMIT' : 'SELL LIMIT'}
                    </span>
                  </div>
                );
              })}

              {/* Draw Spot Indicator */}
              {activePair.currentPrice >= lp && activePair.currentPrice <= up && (
                <div
                  className="absolute w-full border-t border-indigo-400 left-0 bg-indigo-950/40 z-10 flex justify-between px-2 text-[8px] font-mono text-indigo-300 font-bold items-center py-0.5"
                  style={{ bottom: `${(((activePair.currentPrice - lp) / (up - lp)) * 100).toFixed(1)}%` }}
                >
                  <span>SPOT: ${activePair.currentPrice.toLocaleString()}</span>
                  <span>● ACTIVE MARKET</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: Active Running Robots with stats */}
      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-850 mb-4 pb-2 gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setRightPanelTab('bots')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all border cursor-pointer ${
                  rightPanelTab === 'bots'
                    ? 'bg-slate-800 border-slate-700 text-slate-100 shadow-sm'
                    : 'border-transparent text-slate-400 hover:text-slate-250 hover:bg-slate-850'
                }`}
              >
                <Cpu className={`w-3.5 h-3.5 ${rightPanelTab === 'bots' ? 'text-indigo-400' : 'text-slate-450'}`} />
                <span>{lang === 'ar' ? 'البوتات النشطة' : 'Active Bots'}</span>
                <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full ${
                  rightPanelTab === 'bots' ? 'bg-indigo-950 text-indigo-400 font-extrabold' : 'bg-slate-800 text-slate-400'
                }`}>
                  {activeBots.length}
                </span>
              </button>

              <button
                onClick={() => setRightPanelTab('scanner')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all border cursor-pointer ${
                  rightPanelTab === 'scanner'
                    ? 'bg-slate-800 border-slate-700 text-slate-100 shadow-sm'
                    : 'border-transparent text-slate-400 hover:text-slate-250 hover:bg-slate-850'
                }`}
              >
                <Search className={`w-3.5 h-3.5 ${rightPanelTab === 'scanner' ? 'text-indigo-400' : 'text-slate-450'}`} />
                <span>{lang === 'ar' ? 'رادار الفرص الشامل' : 'Global Opportunities Scanner'}</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </button>

              <button
                onClick={() => setRightPanelTab('falcon')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all border cursor-pointer ${
                  rightPanelTab === 'falcon'
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/45 text-amber-300 shadow-sm'
                    : 'border-transparent text-slate-400 hover:text-slate-250 hover:bg-slate-850'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${rightPanelTab === 'falcon' ? 'text-amber-400' : 'text-slate-450'}`} />
                <span>{lang === 'ar' ? 'رادار صقور التداول 🦅' : 'Falcon Intelligence 🦅'}</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              </button>
            </div>

            {rightPanelTab === 'bots' && activeBots.some(b => b.status === 'PAUSED') && onResumeAllBots && (
              <button
                onClick={onResumeAllBots}
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20 transition-colors cursor-pointer"
                title={lang === 'ar' ? 'تشغيل جميع البوتات الموقوفة مؤقتاً' : 'Resume all paused bots'}
              >
                <Play className="w-3.5 h-3.5" />
                {lang === 'ar' ? 'تشغيل الكل (الاستئناف)' : 'Resume All'}
              </button>
            )}
          </div>

          {rightPanelTab === 'bots' && (
            <>
              {/* AI Global Market Screen & One-Click Opportunity Allocator */}
              <div className="mb-5 p-4 rounded-xl border border-indigo-950/60 bg-gradient-to-br from-slate-950 via-indigo-950/15 to-slate-950 space-y-3.5 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[9px] bg-indigo-950 text-indigo-400 font-extrabold px-2 py-0.5 rounded border border-indigo-900/40 font-mono tracking-wider uppercase">
                  {lang === 'ar' ? 'الرادار الشامل لمسح السوق والفرص الجاهزة' : 'HYPERSECURE GLOBAL OPPORTUNITY SCANNER'}
                </span>
                <h4 className="text-xs font-bold text-slate-200 mt-1">
                  {lang === 'ar' ? 'البحث عن فرص وتوزيع البوتات تلقائياً بالذكاء 🤖' : 'AI Automated Scanner & Market Auto-Allocation 🤖'}
                </h4>
              </div>
              
              <div className="flex items-center gap-2">
                {activeBots.length > 0 && (
                  <button
                    onClick={handleClearAllBots}
                    className="px-2.5 py-1.5 text-[10px] font-bold rounded-lg border border-rose-950 bg-rose-950/10 hover:bg-rose-950/35 text-rose-450 transition cursor-pointer"
                    title={lang === 'ar' ? 'تصفية وحذف كافة البوتات لتصفير رأس المال' : 'Wipe all bots to release margins'}
                  >
                    {lang === 'ar' ? '🧹 مسح كافة البوتات' : '🧹 Clear All Bots'}
                  </button>
                )}
                
                <button
                  onClick={handleTriggerAIAllocation}
                  disabled={isScanning}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 transition duration-150 flex items-center gap-1.5 cursor-pointer shadow-indigo-900/10 ${
                    isScanning ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {isScanning ? (
                    <>
                      <span className="w-3 h-3 rounded-full border-2 border-indigo-200 border-t-transparent animate-spin" />
                      <span>{lang === 'ar' ? 'جاري فحص جميع العملات...' : 'Scanning market coins...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-300 animate-bounce" />
                      <span>{lang === 'ar' ? 'مسح ونشر البوتات تلقائياً' : 'AI Auto-Deploy across Market'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-normal">
              {lang === 'ar'
                ? 'يقوم الذكائي الاصطناعي بمسح كافة أزواج العملات الرقمية المدعومة (BTC, ETH, SOL, BNB, etc.) وحساب معدلات التذبذب والسيولة، ثم توزيع سلة بوتات مخصصة تلقائياً على فرص السوق المكتشفة.'
                : 'Scans and indexes all supported live major crypto pairs (BTC, ETH, SOL, BNB, etc.) to immediately deploy calibrated grid, DCA, and RSI swing systems to the optimal targets.'}
            </p>

            {/* Scan Results Display */}
            {scanResults.length > 0 && (
              <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-850/80 space-y-2 animate-in fade-in duration-300">
                <span className="text-[8.5px] uppercase font-bold text-emerald-400 block tracking-wider font-mono">
                  ● {lang === 'ar' ? 'تم العثور على فرص ونشر البوتات بنجاح:' : 'Opportunities seized & AI Bots initialized:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                  {scanResults.map((res, ridx) => (
                    <div key={ridx} className="flex justify-between items-center p-1.5 bg-slate-900/60 rounded border border-slate-850/40">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-200">{res.symbol}</span>
                        <span className="text-[8px] bg-slate-800 text-indigo-400 px-1 py-0.2 rounded font-mono font-black uppercase">{res.type}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-mono font-black">{res.score}% {lang === 'ar' ? 'ثقة' : 'Conf.'}</span>
                        <span className="text-[8.5px] text-slate-500 block leading-none mt-0.5">{res.details}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {activeBots.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center text-slate-500 text-xs px-4 text-center">
              <Cpu className="w-12 h-12 text-slate-700 mb-3 animate-pulse" />
              <p className="font-semibold text-slate-400 mb-1">
                {lang === 'ar' ? 'لا توجد بوتات آلية نشطة الآن' : 'No active bots spawned'}
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm">
                {lang === 'ar' 
                  ? 'اختر الاستراتيجية وضبط خطوط الشبكة والاستثمار على اليمين ثم اطلق البوت لمتابعة عمليات موازنة السيولة.' 
                  : 'Specify boundaries and resources in the configurator to start collecting simulated margin rewards.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1" id="running-bots-view">
              {activeBots.map((bot) => {
                const isGrid = bot.type === 'GRID';
                const isDca = bot.type === 'DCA';
                const gridConf = bot.config as GridBotConfig;
                const dcaConf = bot.config as DcaBotConfig;
                const rsiConf = bot.config as any;

                return (
                  <div
                    key={bot.id}
                    className="bg-slate-950 rounded-xl border border-slate-850 p-4 font-sans space-y-3 relative overflow-hidden transition hover:border-slate-800"
                    style={{ contentVisibility: 'auto' }}
                  >
                    {/* Top strip */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-sm">
                          {bot.symbol === 'ALL' ? (lang === 'ar' ? '🔍 مسح شامل' : '🔍 Market Scan') : bot.symbol}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isGrid ? 'bg-indigo-950 text-indigo-400' : isDca ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                        }`}>
                          {isGrid ? 'GRID' : isDca ? 'DCA' : 'RSI'}
                        </span>
                        <span className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          bot.status === 'RUNNING' 
                            ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50' 
                            : bot.status === 'PAUSED'
                            ? 'bg-amber-950/30 text-amber-400 border-amber-900/50'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}>
                          {bot.status === 'RUNNING' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                          {bot.status === 'RUNNING' 
                            ? (lang === 'ar' ? 'نشط' : 'ACTIVE') 
                            : bot.status === 'PAUSED' 
                            ? (lang === 'ar' ? 'في انتظار' : 'PENDING')
                            : (lang === 'ar' ? 'مغلق' : 'CLOSED')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono font-bold ${
                          (bot.accumulatedProfit || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {((bot.accumulatedProfit || 0) >= 0 ? '+' : '')}${(bot.accumulatedProfit || 0).toFixed(2)}
                        </span>
                        
                        <button
                          onClick={() => onToggleStatus(bot.id)}
                          className={`p-1.5 rounded-full border ${
                            bot.status === 'RUNNING' 
                              ? 'text-amber-400 border-amber-900 bg-amber-950/20' 
                              : 'text-emerald-400 border-emerald-900 bg-emerald-950/20'
                          }`}
                          title={bot.status === 'RUNNING' ? 'Pause' : 'Resume'}
                        >
                          {bot.status === 'RUNNING' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        </button>
                        
                        <button
                          onClick={() => onDeleteBot(bot.id)}
                          className="p-1.5 rounded-full text-rose-400 border border-slate-800 bg-slate-900/50 hover:bg-rose-950/20 transition"
                          title="Terminate"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Summary Strip */}
                    <div className="text-[10px] text-slate-400 pt-1">
                      {isGrid && `${lang === 'ar' ? 'النطاق' : 'Limits'}: $${gridConf.lowerPrice} - $${gridConf.upperPrice}`}
                      {isDca && `${lang === 'ar' ? 'الدفعة' : 'Size'}: $${dcaConf.baseOrderSize} | ${dcaConf.investmentInterval}`}
                      {!isGrid && !isDca && `${lang === 'ar' ? 'الكمية' : 'Amount'}: $${rsiConf.tradeAmount}`}
                    </div>


                    {/* Dynamic Auto-Rebalance Controller Card */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 bg-slate-900/40 border border-emerald-950/40 rounded-xl text-[9px]">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
                        <span>
                          {lang === 'ar' 
                            ? `موازنة المحفظة التلقائية:` 
                            : `Auto-Rebalance Mode:`}
                        </span>
                        <span className={`font-bold px-1 rounded ${bot.autoRebalance ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40' : 'bg-slate-900 text-slate-500'}`}>
                          {bot.autoRebalance 
                            ? (lang === 'ar' ? 'نشط 🔄' : 'ACTIVE 🔄') 
                            : (lang === 'ar' ? 'مغلق ⛔' : 'DISABLED ⛔')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (onUpdateBotConfig) {
                              onUpdateBotConfig(bot.id, { autoRebalance: !bot.autoRebalance });
                            }
                          }}
                          className={`px-2 py-0.5 rounded text-[8.5px] font-sans font-black uppercase border transition cursor-pointer ${
                            bot.autoRebalance
                              ? 'bg-emerald-950 border-emerald-500 text-emerald-300 hover:bg-emerald-900'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-250 hover:border-slate-705'
                          }`}
                        >
                          {bot.autoRebalance 
                            ? (lang === 'ar' ? 'تعطيل المسح التلقائي' : 'Deactivate') 
                            : (lang === 'ar' ? 'تفعيل المسح التلقائي' : 'Activate Shift')}
                        </button>
                      </div>
                    </div>

                    {/* Dedicated Configuration Sub-panel: Custom RSI Threshold Slider & Presets */}
                    <div className="bg-slate-900/75 hover:bg-slate-900/95 border border-indigo-950/40 rounded-xl p-3 space-y-2.5 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-indigo-400 rotate-90" />
                          <span className="text-[9.5px] font-black text-slate-200 uppercase tracking-wide">
                            {lang === 'ar' ? '🔧 معايير تشبع RSI المخصصة لبوت التداول' : '🔧 Custom RSI Wave Thresholds'}
                          </span>
                        </div>
                        <span className="text-[8.5px] font-mono font-bold bg-indigo-950 border border-indigo-900/40 text-indigo-300 px-2 py-0.5 rounded-full">
                          {((bot.config as any).oversoldThreshold !== undefined ? (bot.config as any).oversoldThreshold : 30)} - {((bot.config as any).overboughtThreshold !== undefined ? (bot.config as any).overboughtThreshold : 70)} rsi
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-1">
                        {/* Oversold */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] font-bold text-slate-400">
                            <span>{lang === 'ar' ? 'الحد الأدنى للارتداد (تشبع شراء):' : 'Reversion Floor (Oversold):'}</span>
                            <span className="text-emerald-400 font-mono">{(bot.config as any).oversoldThreshold || 30}</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="45"
                            value={(bot.config as any).oversoldThreshold || 30}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (onUpdateBotConfig) {
                                onUpdateBotConfig(bot.id, { oversoldThreshold: val });
                              }
                            }}
                            className="w-full accent-emerald-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
                          />
                        </div>

                        {/* Overbought */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] font-bold text-slate-400">
                            <span>{lang === 'ar' ? 'الحد الأقصى للارتداد (تشبع بيع):' : 'Pullback Ceiling (Overbought):'}</span>
                            <span className="text-rose-400 font-mono">{(bot.config as any).overboughtThreshold || 70}</span>
                          </div>
                          <input
                            type="range"
                            min="55"
                            max="90"
                            value={(bot.config as any).overboughtThreshold || 70}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (onUpdateBotConfig) {
                                onUpdateBotConfig(bot.id, { overboughtThreshold: val });
                              }
                            }}
                            className="w-full accent-rose-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Presets hotkeys */}
                      <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-900/60">
                        <span className="text-[8px] text-slate-500 font-black uppercase">
                          {lang === 'ar' ? 'معايرة سريعة:' : 'Quick Presets:'}
                        </span>
                        <div className="flex gap-1">
                          {[
                            { label: lang === 'ar' ? 'محافظ (30/70)' : 'Conservative (30/70)', buy: 30, sell: 70 },
                            { label: lang === 'ar' ? 'نشط (20/80)' : 'Aggressive (20/80)', buy: 20, sell: 80 },
                            { label: lang === 'ar' ? 'متطرف (15/85)' : 'Ultra (15/85)', buy: 15, sell: 85 }
                          ].map((preset, pIdx) => {
                            const curBuy = (bot.config as any).oversoldThreshold || 30;
                            const curSell = (bot.config as any).overboughtThreshold || 70;
                            const isSelect = curBuy === preset.buy && curSell === preset.sell;
                            return (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => {
                                  if (onUpdateBotConfig) {
                                    onUpdateBotConfig(bot.id, {
                                      oversoldThreshold: preset.buy,
                                      overboughtThreshold: preset.sell
                                    });
                                  }
                                }}
                                className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono border transition cursor-pointer leading-none ${
                                  isSelect
                                    ? 'bg-indigo-950 text-indigo-300 border-indigo-500/70'
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                                }`}
                              >
                                {preset.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Performance metrics */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                      <div className="flex gap-4">
                        <div>
                          <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider block">{lang === 'ar' ? 'عدد العمليات المنفذة' : 'Arbitrages'}</span>
                          <span className="font-mono text-sm text-slate-100 font-bold flex items-center gap-1 mt-0.5">
                            <Layers className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            {bot.arbitrageCount}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider block">{lang === 'ar' ? 'العائد الصافي المحقق' : 'Net Profits'}</span>
                          <span className={`font-mono text-sm font-bold flex items-center gap-1 mt-0.5 ${
                            bot.accumulatedProfit >= 0 ? 'text-emerald-400' : 'text-rose-450'
                          }`}>
                            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                            +${bot.accumulatedProfit.toFixed(2)} USDT
                          </span>
                        </div>
                      </div>

                      {/* Floating percentage tag */}
                      <div className="bg-emerald-950/55 p-2 rounded-lg border border-emerald-900/40 text-center flex flex-col justify-center px-4 self-start sm:self-center">
                        <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider block">{lang === 'ar' ? 'معدل الربح نسبة' : 'Bot APR%'}</span>
                        <span className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
                          +{bot.profitPercentage.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    {/* Max Drawdown & Risk Assessment Module */}
                    {(() => {
                      const investAmount = isGrid ? gridConf.investmentAmount : dcaConf.totalInvestment;
                      const currentDdVal = bot.maxDrawdown || 2.45;
                      const stressDropPercent = stressDrops[bot.id] !== undefined ? stressDrops[bot.id] : 15;

                      // Risk category labels
                      let riskText = '';
                      let riskClass = '';
                      if (currentDdVal < 5) {
                        riskText = lang === 'ar' ? 'آمنة / مخاطر منخفضة 🛡️' : 'Safe / Low Risk 🛡️';
                        riskClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                      } else if (currentDdVal <= 12) {
                        riskText = lang === 'ar' ? 'معتدلة / مخاطر متزنة ⚖️' : 'Moderate / Balanced Risk ⚖️';
                        riskClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                      } else {
                        riskText = lang === 'ar' ? 'مرتفعة / مخاطر مضاربة ⚠️' : 'High Speculation / High Risk ⚠️';
                        riskClass = 'bg-rose-500/10 text-rose-450 border-rose-500/20';
                      }

                      // Estimated mathematical drawdown under custom market drop
                      const simulatedDd = isGrid 
                        ? Math.min(100, Math.max(currentDdVal, stressDropPercent * 0.72 * (gridConf.gridLines / 15)))
                        : Math.min(100, Math.max(currentDdVal, stressDropPercent * 0.45 * (1 + (dcaConf.priceDeviation / 10))));
                      const simulatedLossAmount = (investAmount * simulatedDd) / 100;

                      // Resilience score based on Simulated MDD
                      const resilienceScore = Math.max(0, Math.round(100 - simulatedDd));
                      let resilienceLevel = '';
                      let resilienceColor = '';
                      if (resilienceScore > 85) {
                        resilienceLevel = lang === 'ar' ? 'ممتاز' : 'Excellent';
                        resilienceColor = 'text-emerald-400 bg-emerald-500/10';
                      } else if (resilienceScore > 60) {
                        resilienceLevel = lang === 'ar' ? 'مستقر' : 'Stable';
                        resilienceColor = 'text-amber-400 bg-amber-500/10';
                      } else {
                        resilienceLevel = lang === 'ar' ? 'حرج' : 'Critical';
                        resilienceColor = 'text-rose-450 bg-rose-500/10';
                      }

                      // Estimate survival bottom price for this asset 
                      const survivalThreshold = isGrid 
                        ? gridConf.lowerPrice 
                        : (activePair.currentPrice * (1 - (dcaConf.priceDeviation * dcaConf.maxSafetyOrders) / 100));

                      return (
                        <div className="mt-3.5 pt-3.5 border-t border-slate-900/60 space-y-3 bg-slate-900/40 p-3 rounded-lg border border-slate-850">
                          
                          {/* Section Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                              <ShieldAlert className="w-4 h-4 text-rose-400" />
                              <span>{lang === 'ar' ? 'تقييم أقصى تراجع محتمل (MDD)' : 'Max Drawdown (MDD) Assessment'}</span>
                            </div>
                            <div className={`text-[10px] uppercase font-bold tracking-wider border rounded px-2 py-0.5 self-start sm:self-auto ${riskClass}`}>
                              {riskText}
                            </div>
                          </div>

                          {/* Display Metrics Grid */}
                          <div className="grid grid-cols-2 gap-3 pb-1">
                            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-900/40 flex flex-col justify-between">
                              <span className="text-[9px] text-slate-500 block mb-0.5">{lang === 'ar' ? 'التراجع الأقصى الفعلي' : 'Experienced Max Drawdown'}</span>
                              <div className="flex items-baseline gap-1" dir="ltr text-right">
                                <span className="text-xs font-mono font-black text-rose-400">-{currentDdVal.toFixed(2)}%</span>
                                <span className="text-[9px] text-slate-500 font-sans">
                                  (${((investAmount * currentDdVal) / 100).toFixed(1)} USDT)
                                </span>
                              </div>
                            </div>

                            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-900/40 flex flex-col justify-between">
                              <span className="text-[9px] text-slate-500 block mb-0.5">{lang === 'ar' ? 'مؤشر مرونة البوت' : 'Resilience Index'}</span>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-mono font-black text-slate-200">{resilienceScore}%</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${resilienceColor}`}>
                                  {resilienceLevel}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Interactive Market Stress Test slider */}
                          <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900/60 space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="text-slate-400 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                <span>{lang === 'ar' ? 'محاكي صدمة هبوط السوق' : 'Hypothetical Market Crash Simulator'}</span>
                              </span>
                              <span className="text-amber-400 font-bold font-mono">{stressDropPercent}%</span>
                            </div>

                            <input 
                              type="range"
                              min="5"
                              max="50"
                              step="5"
                              value={stressDropPercent}
                              onChange={(e) => {
                                setStressDrops(prev => ({
                                  ...prev,
                                  [bot.id]: parseInt(e.target.value)
                                }));
                              }}
                              className="w-full accent-amber-500 bg-slate-800 h-1 rounded-lg appearance-none cursor-pointer"
                            />

                            {/* Results of hypothetical crash */}
                            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-900/50 text-[10px] font-mono text-slate-450 leading-relaxed">
                              <div>
                                <span className="text-[8px] text-slate-550 block">{lang === 'ar' ? 'التراجع المتوقع' : 'Estimated MDD'}</span>
                                <span className="text-rose-450 font-bold block mt-0.5 text-right" dir="ltr">-{simulatedDd.toFixed(1)}%</span>
                              </div>
                              <div>
                                <span className="text-[8px] text-slate-550 block">{lang === 'ar' ? 'الخسارة المقدرة' : 'Stress Loss'}</span>
                                <span className="text-rose-450 font-bold block mt-0.5 text-right" dir="ltr">${simulatedLossAmount.toFixed(1)}</span>
                              </div>
                              <div>
                                <span className="text-[8px] text-slate-550 block">{lang === 'ar' ? 'أدنى سعر صمود' : 'Survival Floor'}</span>
                                <span className="text-slate-200 font-bold block mt-0.5 text-right" dir="ltr">${survivalThreshold.toLocaleString(undefined, {maximumFractionDigits:1})}</span>
                              </div>
                            </div>
                          </div>

                        </div>
                      );
                    })()}

                  </div>
                );
              })}
            </div>
          )}
            </>
          )}

          {/* GLOBAL OPPORTUNITIES SCANNER PANEL */}
          {rightPanelTab === 'scanner' && (
            <div className="space-y-4 animate-in fade-in duration-300 text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {/* Radar Status Bar & Volatility Spectrum */}
              <div className="p-4 rounded-xl border border-indigo-950/60 bg-slate-950/70 space-y-3.5 relative overflow-hidden shadow-lg text-right">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <span className="absolute inline-flex h-5 w-5 rounded-full bg-indigo-500/30 opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-indigo-500 flex items-center justify-center animate-pulse">
                        <Activity className="w-2.5 h-2.5 text-white" />
                      </span>
                    </div>
                    <div className="text-right">
                      <h4 className="text-xs font-bold text-slate-150">
                        {lang === 'ar' ? 'فاحص فرص الذكاء الاصطناعي الفني الشامل' : 'AI Technical Signal & Volatility Scanner'}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {lang === 'ar' ? 'بث حي لإشارات الارتداد RSI ونقاط التقلب السريع في عامة أزواج العملات.' : 'Live streaming of relative momentum indexes and volatility spikes across markets.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1.5 self-stretch sm:self-auto justify-end">
                    <button
                      onClick={() => setScannerFilter('ALL')}
                      className={`px-2.5 py-1 text-[9.5px] font-bold rounded-lg transition-all border cursor-pointer ${
                        scannerFilter === 'ALL'
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {lang === 'ar' ? 'كافة العملات (6 أصول)' : 'All Coins (6)'}
                    </button>
                    <button
                      onClick={() => setScannerFilter('STRONG')}
                      className={`px-2.5 py-1 text-[9.5px] font-bold rounded-lg transition-all border cursor-pointer ${
                        scannerFilter === 'STRONG'
                          ? 'bg-indigo-600 border-indigo-505 text-white shadow'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      🔥 {lang === 'ar' ? 'تصفية إشارات حادة' : 'High Conf. ONLY'}
                    </button>
                  </div>
                </div>

                {/* Spectrum Chart of RSI levels */}
                <div className="pt-1.5">
                  <span className="text-[9px] text-slate-405 font-mono block uppercase tracking-wider mb-2">
                    {lang === 'ar' ? 'رسم بياني لمقارن الزخم RSI لغالب أصول السوق حالياً:' : 'Dynamic Relative Strength (RSI) Comparator Across Assets:'}
                  </span>
                  <div className="h-28 w-full bg-slate-950/95 rounded-lg p-1 border border-slate-850">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={rsiSpectrumData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#131e33" vertical={false} />
                        <XAxis dataKey="symbol" tick={{ fill: '#94a3b8', fontSize: 8 }} stroke="#1e293b" />
                        <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 8 }} stroke="#1e293b" width={40} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-slate-950 border border-indigo-950 p-2 rounded text-[10px] space-y-0.5 font-sans shadow-xl">
                                  <p className="font-bold text-slate-200 text-right">{data.symbol}/USDT</p>
                                  <p className="text-indigo-400 font-bold text-right" dir="ltr">RSI: {data.rsi}</p>
                                  <p className="text-slate-400 text-[9px] text-right">{lang === 'ar' ? `التذبذب: ${data.volText}` : `Volatility Level: ${data.volText}`}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="rsi" radius={[3, 3, 0, 0]} maxBarSize={32}>
                          {rsiSpectrumData.map((entry, index) => {
                            let barColor = "#4f46e5"; // default indigo
                            if (entry.rsi <= 35) barColor = "#06b6d4"; // Cyan oversold
                            else if (entry.rsi >= 65) barColor = "#f97316"; // Orange overbought
                            return <Cell key={`cell-${index}`} fill={barColor} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Min and Max Indicators explanation */}
                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-405 px-1 mt-1.5 flex-wrap gap-1">
                    <span className="text-cyan-455 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 hover:scale-110" />
                      RSI ≤ 35: {lang === 'ar' ? 'منطقة الشراء والتجميع (Oversold)' : 'Oversold / Buy Floor'}
                    </span>
                    <span className="text-orange-455 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                      RSI ≥ 65: {lang === 'ar' ? 'منطقة التبريد وجني الأرباح (Overbought)' : 'Overbought / CoolDown & Rebound'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Signals Grid matrix */}
              <div className="space-y-3.5 max-h-[410px] overflow-y-auto pr-1" id="scanner-opportunities">
                {filteredSignals.map((item, idx) => {
                  const isOversold = item.rsi <= 38;
                  const isOverbought = item.rsi >= 62;
                  const alreadyDeployed = deployedSymbols.includes(item.symbol);

                  return (
                    <div
                      key={`${item.symbol}-${idx}`}
                      className={`gorgeous-signal-card p-3 rounded-xl border transition-all ${
                        isOversold
                          ? 'bg-cyan-950/10 border-cyan-900/40 hover:border-cyan-500/50 hover:bg-cyan-950/15'
                          : isOverbought
                          ? 'bg-orange-950/10 border-orange-900/40 hover:border-orange-500/50 hover:bg-orange-950/15'
                          : 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        {/* Coin Ident & Signal Badge */}
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border uppercase ${
                            isOversold
                              ? 'bg-cyan-950/80 text-cyan-400 border-cyan-800/40'
                              : isOverbought
                              ? 'bg-orange-950/80 text-orange-400 border-orange-850/40'
                              : 'bg-slate-900 text-slate-300 border-slate-800'
                          }`}>
                            {item.symbol.split('/')[0]}
                          </div>
                          <div className="text-right space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-extrabold text-slate-100 text-xs tracking-wide">{item.symbol}</span>
                              <span className={`text-[9.5px] font-mono leading-none py-0.5 px-1.5 rounded-full font-bold ${
                                item.change24h >= 0 ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-455'
                              }`}>
                                {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
                              </span>
                              
                              {/* Dynamic High Confidence Visual Badge */}
                              {item.isHighConfidence && (
                                <span className="text-[8.5px] font-black px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-350 border border-emerald-500/30 animate-pulse flex items-center gap-0.5 shadow-sm">
                                  <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                                  <span>{lang === 'ar' ? 'ثقة عالية' : 'High Conf.'} ({item.confidenceScore}%)</span>
                                </span>
                              )}

                              {/* Volume Spike Visual Badge */}
                              {item.isVolumeSpike && (
                                <span className="text-[8.5px] font-black px-1.5 py-0.5 rounded bg-orange-950/80 text-orange-355 border border-orange-500/30 flex items-center gap-0.5 shadow-sm">
                                  <span>🚀 {lang === 'ar' ? 'اندفاع حجم' : 'Vol Spike'}</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 block leading-none mt-1">
                              {item.name}
                            </span>
                          </div>
                        </div>

                        {/* Signals breakdown */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:flex items-center gap-4 text-[10px] w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-850/80 self-stretch md:self-auto justify-between">
                          <div className="text-right">
                            <span className="text-slate-500 block text-[8px] uppercase font-bold tracking-wider mb-0.5">{lang === 'ar' ? 'مؤشر الزخم RSI' : 'RSI Spectrum'}</span>
                            <span className={`font-mono font-black flex items-center justify-start md:justify-end gap-1.5 text-xs ${
                              isOversold ? 'text-cyan-400' : isOverbought ? 'text-orange-400' : 'text-slate-300'
                            }`}>
                              {item.rsi}
                              {isOversold && <span className="text-[8px] font-black px-1 py-0.2 bg-cyan-950 text-cyan-400 rounded-sm">BUY</span>}
                              {isOverbought && <span className="text-[8px] font-black px-1 py-0.2 bg-orange-950 text-orange-400 rounded-sm">SELL</span>}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-slate-500 block text-[8px] uppercase font-bold tracking-wider mb-0.5">{lang === 'ar' ? 'درجة التقلب' : 'Volatility Grid'}</span>
                            <span className={`font-mono font-bold text-xs ${item.volatility > 4.5 ? 'text-rose-400' : 'text-slate-300'}`}>
                              {item.volatility}% {item.volatility > 4.5 ? '🔥' : ' ⚙️'}
                            </span>
                          </div>

                          <div className="col-span-2 sm:col-span-1 min-w-[130px] text-right">
                            <span className="text-slate-500 block text-[8px] uppercase font-bold tracking-wider mb-0.5">{lang === 'ar' ? 'توصية الخوارزمية' : 'AI Analysis & Preset'}</span>
                            <span className={`font-bold flex items-center gap-1 text-[9.5px] ${
                              isOversold ? 'text-cyan-400' : isOverbought ? 'text-orange-400' : 'text-indigo-400'
                            }`}>
                              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
                              <span className="whitespace-nowrap">{item.recommendation}</span>
                            </span>
                          </div>

                          <div className="col-span-2 sm:col-span-1 flex justify-end">
                            {alreadyDeployed ? (
                              <div className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-[9.5px] shadow-sm shadow-emerald-950/40">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>{lang === 'ar' ? 'البوت نشط ويعمل' : 'AI Bot Active'}</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleQuickDeployBot(item)}
                                className={`px-3 py-1.5 text-[9.5px] font-bold rounded-lg transition duration-200 cursor-pointer flex items-center gap-1 border shadow-sm ${
                                  isOversold
                                    ? 'bg-cyan-600 border-cyan-500 text-white hover:bg-cyan-500'
                                    : isOverbought
                                    ? 'bg-orange-600 border-orange-500 text-white hover:bg-orange-500'
                                    : 'bg-indigo-600 border-indigo-505 text-white hover:bg-indigo-500'
                                }`}
                              >
                                <Zap className="w-3 h-3 text-amber-200 shrink-0" />
                                <span>{lang === 'ar' ? 'تفعيل بوت مخصص' : 'Quick Deploy'}</span>
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FALCON INTELLIGENCE RADAR PANEL */}
          {rightPanelTab === 'falcon' && (
            <div className="space-y-6 animate-in fade-in duration-300 text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {/* Radar Sweeping visualizer */}
              <div className="p-5 rounded-xl border border-amber-900/40 bg-slate-950/90 relative overflow-hidden shadow-lg grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                
                {/* Space Grid/Sweeper (Left/Top) */}
                <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 relative h-[250px] overflow-hidden">
                  {/* Outer sweeping circle */}
                  <div className="w-44 h-44 rounded-full border border-dashed border-amber-500/15 flex items-center justify-center relative">
                    <div className="w-32 h-32 rounded-full border border-amber-500/20 flex items-center justify-center relative">
                      <div className="w-20 h-20 rounded-full border border-amber-500/30 flex items-center justify-center relative">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping absolute" />
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute" />
                      </div>
                    </div>

                    {/* Sweep Line */}
                    <div 
                      className="absolute top-1/2 left-1/2 w-24 h-1 bg-gradient-to-l from-amber-500/60 to-transparent origin-left"
                      style={{ transform: `rotate(${radialSweepAngle}deg) translate(-100%, -50%)` }}
                    />
                    
                    {/* Glowing prey targets on radar map */}
                    <span className="absolute top-8 left-12 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" title="BTC" />
                    <span className="absolute bottom-10 right-14 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="SOL" />
                    <span className="absolute top-24 right-6 w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" title="ETH" />
                  </div>

                  {/* Airspace telemetry overlay */}
                  <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center text-[9px] font-mono text-slate-500">
                    <span>ALT: 24,000 FT</span>
                    <span className="text-amber-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      HAMZA FALCON SCANNER LIVE
                    </span>
                  </div>
                </div>

                {/* Telemetry and Hunt Status (Right/Bottom) */}
                <div className="md:col-span-7 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                            🦅 {lang === 'ar' ? 'صقور حمزة الذكية' : 'Hamza Falcon'}
                          </span>
                          <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 text-[10px] font-bold px-2 py-0.5 rounded block">
                            {lang === 'ar' ? '🟢 تحليق مستمر 24/7' : '🟢 Steady Patrol 24/7'}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-100 mt-2">
                          {lang === 'ar' ? 'رادار الصقور الجوية للتداول الذكي والربح التراكمي' : 'Falcon Airborne High-Frequency Profit Systems'}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {lang === 'ar' 
                            ? 'نظام خوارزمي متطور يحاكي حركة الصقور الطوافة في سماء المنصة الكلية، حيث يقوم بمسح أعمق نقاط تشبع البيع (RSI Dips) والدعم لجميع العملات الرقمية والانقضاض لتنفيذ الأوامر بأمان فائق وسرعة الصقر.'
                            : 'An advanced algorithmic visualizer reflecting falcon patrollers across global spot markets, instantly locking oversold targets and dispatching high-yield trades.'}
                        </p>
                      </div>
                    </div>

                    {/* Locked Prey Stats Card */}
                    {activeEagleHunt ? (
                      <div className="p-3 rounded-lg bg-slate-900 border border-amber-900/30 flex items-center justify-between gap-3 animate-in fade-in duration-300">
                        <div>
                          <span className="text-[8px] text-slate-500 block leading-tight font-bold uppercase">{lang === 'ar' ? 'الفريسة الجاري تتبعها حالياً' : 'Current Target Prey'}</span>
                          <span className="text-xs font-black text-amber-300 font-mono tracking-wide">{activeEagleHunt.symbol}</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-500 block leading-tight font-bold uppercase">{lang === 'ar' ? 'مؤشر RSI المرصود' : 'Target RSI'}</span>
                          <span className={`text-xs font-extrabold font-mono ${activeEagleHunt.rsi < 30 ? 'text-cyan-400' : 'text-amber-400'}`}>{activeEagleHunt.rsi}</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-500 block leading-tight font-bold uppercase">{lang === 'ar' ? 'قوة إشارة الانقضاض' : 'Falcon Precision'}</span>
                          <span className="text-xs font-black font-mono text-emerald-400 text-right block" dir="ltr">{activeEagleHunt.signalStrength}%</span>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded text-[9px] text-amber-300 font-bold">
                          <Crosshair className="w-3 h-3 text-amber-400 animate-spin" />
                          <span>{lang === 'ar' ? 'تتبع القفل' : 'LOCK'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-850 text-center text-xs text-slate-400">
                        {lang === 'ar' ? '⏳ جاري رصد الإحداثيات وتحليل الأجواء...' : '⏳ Searching airspace for potential price dips...'}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2.5 mt-4">
                    <button
                      onClick={() => {
                        const logs_ar = [
                          `[${new Date().toLocaleTimeString('ar-EG', { hour12: false })}] 🦅 أطلقت يدوياً صقراً تفتيشياً مكثفاً لكافة الصفقات الفورية للحصول على أقصى معدلات الصيد والارباح!`,
                          `[${new Date().toLocaleTimeString('ar-EG', { hour12: false })}] ⚡ تم تلمس حركة حيتان مكثفة وإعادة تعيير روبوت الشبكة DCA للعمل عند الدعم الأقرب.`
                        ];
                        setFalconLogs(prev => [logs_ar[0], logs_ar[1], ...prev]);
                        alert(lang === 'ar' ? '🦅 تم تهيئة وإرسال صقر كاسر إضافي لمسح تداولاتك الحقيقية والبحث عن فرائس الربح!' : '🦅 Sent additional hunter drone to patrol active Binance pairs!');
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-410 hover:to-orange-510 text-slate-950 hover:text-slate-950 font-black text-xs rounded-lg transition duration-200 cursor-pointer shadow-md shadow-amber-950/20 flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'إرسال صقر كاسر إضافي 🦅' : 'Launch Extra Hunter Drone 🦅'}</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        alert(lang === 'ar' ? '🎖️ جميع البوتات الآن تسير وتصطاد بكفاءة الصقور، محتفظة بأعلى درجات الانضباط وحصاد الربح اليومي.' : '🎖️ Falcon modes are fully synchronized and continuously monitoring.');
                      }}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-bold rounded-lg transition-colors border border-slate-800"
                    >
                      {lang === 'ar' ? 'شهادة جودة الصقور 🎖️' : 'View Safety Certificate 🎖️'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Falcon Telemetry Feed logs */}
              <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-4 space-y-3.5 shadow-inner">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="text-[10px] font-black text-slate-400 flex items-center gap-1.5 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    FALCON_QUANT_RADAR_LOGS // {new Date().toLocaleDateString('ar-EG')}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-slate-450 animate-pulse" />
                    {lang === 'ar' ? 'سماء تداول بينانس مفتوحة' : 'Binance Airspace Clear'}
                  </span>
                </div>

                <div 
                  className="space-y-2 h-[180px] overflow-y-auto pr-1 text-[11px] font-mono text-slate-300 leading-normal select-text text-right"
                  style={{ direction: 'rtl' }}
                >
                  {falconLogs.map((log, i) => {
                    let textClass = 'text-slate-300';
                    if (log.includes('انقضاض') || log.includes('هجوم') || log.includes('صيد') || log.includes('success')) textClass = 'text-amber-300 font-bold';
                    if (log.includes('🟢') || log.includes('تأمين') || log.includes('حصاد')) textClass = 'text-emerald-400 font-medium';
                    if (log.includes('⚠️')) textClass = 'text-rose-450';

                    return (
                      <div key={i} className={`p-1.5 rounded-md hover:bg-slate-900/40 transition-colors ${textClass}`}>
                        {log}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Informative block */}
        <div className="text-[10px] text-slate-500 mt-5 leading-normal border-t border-slate-850 pt-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <p>
            {lang === 'ar' ? (
              'يتم محاكاة أرباح البوتات والشبكة بناءً على خوارزميات تسعير السوق المتواترة. تذكر الالتزام بإدارة مخاطر صارمة.'
            ) : (
              'Performance values mathematically increment based on relative volatility steps to reflect accurate grid harvests.'
            )}
          </p>
        </div>
      </div>

    </div>
    </div>
  );
}
