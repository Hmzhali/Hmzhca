/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import PortfolioGrowthChart from './PortfolioGrowthChart';
import ProfitAnalytics from './ProfitAnalytics';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  Coins, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  ArrowLeftRight, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  Info,
  ChevronRight,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  KeyRound,
  CheckCircle,
  Zap,
  Sparkles,
  Download
} from 'lucide-react';
import { MarketPair } from '../types';

interface PortfolioOverviewProps {
  lang: 'ar' | 'en';
  portfolio: {
    usdt: number;
    btc: number;
    [key: string]: number | undefined;
  };
  pairs: MarketPair[];
  isLiveTrading: boolean;
  isConnected: boolean;
  apiConnection?: any;
  onRefreshBalances?: () => void;
  isSyncingBalances?: boolean;
  balanceSyncError?: string | null;
  onTabChange?: (tab: string) => void;
}

const COLORS = {
  USDT: '#10b981', // Emerald Green
  USDT_FUTURES: '#059669', // Darker Emerald
  BTC: '#f59e0b',  // Amber/Gold
  ETH: '#6366f1',  // Indigo/Violet
  SOL: '#a855f7',  // Purple
  BNB: '#eab308'   // Yellow
};

export const getAssetColor = (name: string): string => {
  const upper = name.toUpperCase();
  if (upper in COLORS) return COLORS[upper as keyof typeof COLORS];
  let hash = 0;
  for (let i = 0; i < upper.length; i++) {
    hash = upper.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 65%, 52%)`;
};

export default function PortfolioOverview({
  lang,
  portfolio,
  pairs,
  isLiveTrading,
  isConnected,
  apiConnection,
  onRefreshBalances,
  isSyncingBalances = false,
  balanceSyncError = null,
  onTabChange,
}: PortfolioOverviewProps) {
  // Current active asset to focus
  const [selectedAsset, setSelectedAsset] = useState<string>('USDT');
  // Visual Mode Toggle: View holdings in Asset Amount or USD equivalent
  const [displayInUSD, setDisplayInUSD] = useState<boolean>(true);
  // Hidden state for balance privacy
  const [hideBalances, setHideBalances] = useState<boolean>(false);
  // Calculator multiplier state
  const [calcMultiplier, setCalcMultiplier] = useState<number>(1.2); // +20% standard growth estimate

  // Safely extract values from portfolio with fallback defaults
  const assets = useMemo(() => {
    const getVal = (keyName: string) => {
      if (isLiveTrading) {
        return isConnected ? ((portfolio as any)[keyName] ?? 0) : 0;
      }
      return (portfolio as any)[keyName] ?? 0;
    };

    const list = [
      { name: 'USDT', value: getVal('usdt'), label_en: 'Tether (Spot)', label_ar: 'تيزر دولار (فوري)', decimals: 2 },
      { name: 'USDT_FUTURES', value: getVal('futuresUsdt'), label_en: 'Tether (Futures)', label_ar: 'تيزر دولار (عقود آجلة)', decimals: 2 }
    ];

    pairs.forEach(pair => {
      const name = pair.baseAsset.toUpperCase();
      if (name === 'USDT' || name === 'USDT_FUTURES' || list.some(item => item.name === name)) return;

      const labelAr = pair.name.includes('/') ? pair.name.split('/')[1]?.trim() : name;
      const labelEn = pair.name.includes('/') ? pair.name.split('/')[0]?.trim() : name;

      list.push({
        name,
        value: getVal(name.toLowerCase()),
        label_en: labelEn,
        label_ar: labelAr,
        decimals: name === 'BTC' ? 6 : 4
      });
    });

    return list;
  }, [portfolio, isLiveTrading, isConnected, pairs]);

  // Retrieve asset current market rate in USDT/USD
  const getAssetPrice = (assetName: string): number => {
    if (assetName === 'USDT' || assetName === 'USDT_FUTURES') return 1;
    const pairSymbol = `${assetName}/USDT`;
    const matched = pairs.find(p => p.symbol === pairSymbol);
    return matched ? matched.currentPrice : 0;
  };

  // Compile detailed balances and compute USD equivalents
  const portfolioData = useMemo(() => {
    let totalUSD = 0;
    const mapped = assets.map(asset => {
      const price = getAssetPrice(asset.name);
      const usdValue = asset.value * price;
      totalUSD += usdValue;
      return {
        ...asset,
        price,
        usdValue,
      };
    });

    return {
      totalUSD,
      assets: mapped.map(item => ({
        ...item,
        percentage: totalUSD > 0 ? (item.usdValue / totalUSD) * 100 : 0
      }))
    };
  }, [assets, pairs]);

  // Format dataset specifically for the Recharts Pie elements
  const pieChartData = useMemo(() => {
    return portfolioData.assets
      .filter(item => item.value > 0)
      .map(item => ({
        name: item.name,
        value: displayInUSD ? item.usdValue : item.value,
        usdValue: item.usdValue,
        rawAmount: item.value,
        percentage: item.percentage,
        color: getAssetColor(item.name)
      }));
  }, [portfolioData, displayInUSD]);

  // Current active asset metadata for conversion card
  const activeAssetData = useMemo(() => {
    const matched = portfolioData.assets.find(a => a.name === selectedAsset);
    return matched || portfolioData.assets[0];
  }, [selectedAsset, portfolioData]);

  // Estimations of potential growth
  const growthEstimates = useMemo(() => {
    const currentPrice = activeAssetData.price;
    const currentValUSD = activeAssetData.usdValue;
    const estimatedPrice = currentPrice * calcMultiplier;
    const estimatedValUSD = currentValUSD * calcMultiplier;
    const rawProfit = estimatedValUSD - currentValUSD;

    return {
      estimatedPrice,
      estimatedValUSD,
      rawProfit
    };
  }, [activeAssetData, calcMultiplier]);

  // Arabic vs English dictionary translations
  const dict = {
    title: lang === 'ar' ? 'تحليل وتوزيع المحفظة' : 'Portfolio Asset Weights',
    subtitle: lang === 'ar' ? 'تتبع أصولك المسعرة مباشرة بالدولار وتوزيعها الاستراتيجي' : 'Live balance weights tracked and analyzed in real-time USD equivalent',
    realTimeFeed: lang === 'ar' ? 'تزامن مباشر مع Binance' : 'Real-Time Binance Sync',
    demoFeed: lang === 'ar' ? 'محاكاة المحفظة الافتراضية' : 'Demo Sandbox Ledger',
    apiConnected: lang === 'ar' ? 'شبكة API متصلة ومفتوحة للتداول' : 'Binance API Channel Opened',
    apiDisconnected: lang === 'ar' ? 'وضع الحساب الافتراضي التراكمي' : 'Offline Paper Sandbox Mode',
    totalBalance: lang === 'ar' ? 'الرصيد الكلي التقريبي' : 'Estimated Total Balance',
    chartDisplayMode: lang === 'ar' ? 'عرض الرسم البياني بـ' : 'Chart Base',
    amount: lang === 'ar' ? 'الكمية الفعلية' : 'Coin Amount',
    usdVal: lang === 'ar' ? 'القيمة بالدولار $' : 'USD Combined',
    hideBal: lang === 'ar' ? 'إخفاء الرصيد' : 'Hide Net worth',
    showBal: lang === 'ar' ? 'إظهار الرصيد' : 'Show Net worth',
    tableAsset: lang === 'ar' ? 'الأصل المالي' : 'Asset Ledger',
    tableQty: lang === 'ar' ? 'الكمية المحتفَظ بها' : 'Balance Qty',
    tableValueUSD: lang === 'ar' ? 'القيمة بالدولار (USDT)' : 'USD Value (USDT)',
    tableWeight: lang === 'ar' ? 'النسبة مئوية' : 'Weight Allocation',
    focusTitle: lang === 'ar' ? 'محلل التحويل والتسوية:' : 'Asset Detailed Convertor:',
    currentRate: lang === 'ar' ? 'سعر الصرف المباشر:' : 'Live Exchange Rate:',
    equivalentBTC: lang === 'ar' ? 'القيمة المعادلة بالبيتكوين (BTC):' : 'BTC Ledger Index Equivalent:',
    growthEstimator: lang === 'ar' ? 'مخطط التقييم وتقدير الأرباح المستهدفة' : 'Forecasting Price Targets & Profits',
    targetPrice: lang === 'ar' ? 'السعر المستهدف المقدر:' : 'Target Price Projection:',
    estimatedVal: lang === 'ar' ? 'القيمة عند الهدف:' : 'Projected Port value:',
    estimatedGain: lang === 'ar' ? 'صافي الأرباح المحررة المعلقة:' : 'Expected Net Return:',
    percentageChange: lang === 'ar' ? 'نسبة تغير السعر بالتمرير:' : 'Adjust Estimated Target Return:',
    emptyChart: lang === 'ar' ? 'لا توجد أصول برصيد نشط حالياً.' : 'No active asset balances found in this ledger.',
    selectAssetPrompt: lang === 'ar' ? 'اضغط على أي أصل لاستعراض تفاصيل تسعيره والتقديرات الرياضية للنمو.' : 'Tap any asset below to trigger instant conversions or growth simulation forecasts.',
    stablecoinText: lang === 'ar' ? 'أصل مستقر مثبّت قيمته بالدولار لحماية رأس المال.' : 'Stable USD coin designed to lock profits and insulate against volatility.'
  };

  // CSV export function for balances
  const handleExportPortfolioCSV = () => {
    const headers = ['Asset', 'Name', 'Balance', 'Price (USDT)', 'USD Value', 'Weight (%)'];
    const rows = portfolioData.assets.map(a => [
      a.name,
      lang === 'ar' ? a.label_ar : a.label_en,
      a.value.toFixed(a.decimals),
      a.price.toFixed(4),
      a.usdValue.toFixed(2),
      a.percentage.toFixed(2)
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `portfolio_balances_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const roundedTotalUSD = portfolioData.totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div id="portfolio-overview-section" className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800 p-6 flex flex-col gap-6">
      {/* Header Panel with Connection Diagnostics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-950 text-indigo-400">
              <Coins className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <h2 className="text-base font-black text-slate-100">{dict.title}</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{dict.subtitle}</p>
        </div>

        {/* Live / Demo Badge & Export */}
        <div className="flex items-center gap-2.5 self-start sm:self-center">
            <button
                onClick={handleExportPortfolioCSV}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 text-[10px] font-bold rounded-lg border border-slate-700 transition cursor-pointer"
                title={lang === 'ar' ? 'تصدير الأرصدة كـ CSV' : 'Export Balances CSV'}
            >
                <Download className="w-3 h-3" />
                <span>{lang === 'ar' ? 'تصدير CSV' : 'Export CSV'}</span>
            </button>
          <div className="flex flex-col items-end">
            <span className={`text-[10px] font-black tracking-wide flex items-center gap-1 px-2.5 py-1 rounded-full ${
              isLiveTrading && isConnected
                ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40' 
                : 'bg-slate-950 text-indigo-400 border border-indigo-900/50'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isLiveTrading && isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400 animate-pulse'}`} />
              {isLiveTrading && isConnected ? dict.realTimeFeed : dict.demoFeed}
            </span>
            <span className="text-[9px] text-slate-500 mt-0.5">
              {isLiveTrading && isConnected ? dict.apiConnected : dict.apiDisconnected}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time sync feedback and helper directives */}
      <div className="w-full" id="live-sync-feedback-wrapper" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
        {/* Scenario 1: API Connected but currently in Paper Trading mode */}
        {isConnected && !isLiveTrading && (
          <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-right sm:text-left select-none animate-in fade-in duration-300">
            <div className="flex gap-2.5 items-start">
              <Info className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-amber-300 block text-right" style={{ direction: 'rtl' }}>
                  {lang === 'ar' ? 'ℹ️ تم ربط مفاتيح API بنجاح، ولكن التداول التجريبي نشط حالياً' : 'ℹ️ API Linked successfully, but Paper Trading is active'}
                </span>
                <p className="text-[10px] text-slate-300 leading-normal text-right" style={{ direction: 'rtl' }}>
                  {lang === 'ar'
                    ? 'لعرض وتحديث محفظتك الحقيقية وأرصدتك المباشرة من منصة بينانس داخل هذا الجدول، يرجى تفعيل الزر الأخضر "تداول حقيقي 🟢" المتواجد في شريط رأس الصفحة بالأعلى.'
                    : 'To fetch, sync, and display your real Binance assets inside this window, please toggle the green "Live Trade 🟢" switch on the main header bar above.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Scenario 2: API Connected and in Live Trading mode but wants to refresh or has error */}
        {isConnected && isLiveTrading && (
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-300">
            <div className="flex gap-2.5 items-start">
              <Zap className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-200 block">
                  {lang === 'ar' ? '💎 اتصال متزامن ومباشر مع محفظة بينانس الرئيسية' : '💎 Active Real-time Binance Wallet Integration'}
                </span>
                <p className="text-[10px] text-slate-400 leading-normal">
                  {lang === 'ar'
                    ? `تنبيه: الأرصدة والنسب الموضحة أدناه مسترجعة مباشرة من حسابك في بينانس (${apiConnection?.useTestnet ? 'بيئة الاختبار التجريبية Vision' : 'السوق الحقيقي Live'}). يتم التحديث آلياً كل 20 ثانية.`
                    : `Notification: The assets and allocation percentages below are pulled live from your Binance account (${apiConnection?.useTestnet ? 'Vision Testnet' : 'Live Mainnet'}). Auto-polls every 20 seconds.`}
                </p>
                {balanceSyncError && (
                  <div className="bg-rose-950/30 border border-rose-900/50 py-1.5 px-2.5 rounded-md flex items-start gap-1.5 text-[10px] text-rose-300 mt-1 max-w-2xl leading-normal">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>{lang === 'ar' ? 'فشل التحديث:' : 'Sync Alert:'}</strong> {balanceSyncError}
                      {lang === 'ar' 
                        ? ' (يرجى التأكد من صحة المفاتيح مئة بالمئة، ومن وضع التداول "تجريبية/حقيقية" المبرمج لدينا في تبويب الأمان لضمان سلامة الاتصال).' 
                        : ' (Check key configuration, IP whitelisting rules, or verify if the targeting environment matches your keys inside the Security tab).'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch md:self-center">
              <button
                type="button"
                disabled={isSyncingBalances}
                onClick={onRefreshBalances}
                className={`w-full md:w-auto flex items-center justify-center gap-2 px-3.5 py-1.5 text-[11px] font-extrabold rounded-lg border transition-all cursor-pointer ${
                  isSyncingBalances
                    ? 'bg-slate-900 text-slate-500 border-slate-800'
                    : 'bg-indigo-950/60 text-indigo-300 border-indigo-500/40 hover:bg-indigo-950/90 hover:border-indigo-500/80 shadow-[0_0_12px_rgba(99,102,241,0.15)] hover:shadow-[0_0_15px_rgba(99,102,241,0.35)]'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isSyncingBalances ? 'animate-spin' : ''}`} />
                <span>
                  {isSyncingBalances 
                    ? (lang === 'ar' ? 'جاري التحديث...' : 'Syncing...') 
                    : (lang === 'ar' ? 'تحديث رصيد بينانس الآن' : 'Force Balance Sync')}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Scenario 3a: API is NOT connected but Live Trading is enabled (revoked keys, or none entered yet) */}
        {!isConnected && isLiveTrading && (
          <div className="bg-rose-950/25 border border-rose-900/60 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 select-none animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex gap-3 items-start text-right md:text-left">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 animate-bounce" />
              <div className="space-y-1">
                <span className="text-[12px] font-black text-rose-500 flex items-center gap-1.5 justify-start" style={{ color: '#ef4444' }}>
                  {lang === 'ar' ? '⚠️ تنبيه أمني: مفاتيح التداول الحقيقي غير متصلة أو تم إلغاؤها!' : '⚠️ Security Alert: Live Trading API Keys Disconnected/Deleted!'}
                </span>
                <p className="text-[11px] text-slate-350 leading-relaxed text-right md:text-left" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                  {lang === 'ar'
                    ? 'أنت حالياً في وضع "التداول الحقيقي"، ولكن لا توجد مفاتيح API صالحة متصلة (أو تم حذف المفاتيح من حسابك في بينانس). تم تصفير المحفظة الحقيقية تلقائياً ومنع صفقات التداول لحمايتك. يرجى التبديل للوضع التجريبي أو إدخال مفاتيح صالحة في تبويب الأمان.'
                    : 'You have enabled "Live Trading", but there are no valid API keys connected (or the keys were deleted/revoked on Binance). Real wallet balances have been zeroed out & automated execution has been disabled for safety. Switch to "Paper Trade" or connect new keys.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 shrink-0 md:justify-end">
              <button
                type="button"
                onClick={() => onTabChange && onTabChange('security')}
                className="px-4 py-2 text-[11px] font-black text-white bg-rose-700 hover:bg-rose-600 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(239,68,68,0.25)]"
              >
                <KeyRound className="w-3.5 h-3.5 text-white" />
                <span>{lang === 'ar' ? 'ربط مفاتيح جديدة 🔑' : 'Provide New Keys 🔑'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Scenario 3b: API is NOT connected and Paper Trading is active - Showcase a guide to setup and linkage */}
        {!isConnected && !isLiveTrading && (
          <div className="bg-indigo-950/15 border border-indigo-900/30 rounded-xl p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 select-none animate-in fade-in duration-300">
            <div className="flex gap-2.5 items-start">
              <KeyRound className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-indigo-300 block">
                  {lang === 'ar' ? '🔌 هل ترغب بربط محفظتك الحقيقية في بينانس؟' : '🔌 Connect and Sync Your Real Binance Wallet'}
                </span>
                <p className="text-[10px] text-slate-400 leading-normal">
                  {lang === 'ar'
                    ? 'يمكنك دمج رصيدك ومحافظ تداولك الفردية الحقيقية من بينانس لمراقبة صفقاتك والتمتع بذكاء بوت التداول التلقائي دون قلق حيال الأمان (خيار السحب معطل تماماً بموجب إعداداتك).'
                    : 'Analyze your real exchange net worth, and empower high-speed grid and DCA algorithms to manage transactions. Full API lock security ensures we cannot withdraw any funds.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onTabChange && onTabChange('security')}
              className="px-3.5 py-1.5 text-[11px] font-bold text-slate-950 bg-indigo-400 hover:bg-indigo-300 rounded-lg transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-[0_0_12px_rgba(129,140,248,0.25)] hover:shadow-[0_0_15px_rgba(129,140,248,0.45)] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-950" />
              <span>{lang === 'ar' ? 'ربط حساب بينانس مجاناً ⚡' : 'Connect Binance API ⚡'}</span>
            </button>
          </div>
        )}
      </div>

      <PortfolioGrowthChart lang={lang} />
      <ProfitAnalytics lang={lang} />

      {/* Main Grid: Chart & Converted assets */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Column 1: Pie Chart Visualization (45%) */}
        <div className="xl:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/35 border border-slate-850/60 relative">
          
          {/* Total Assets Overview Glass Title */}
          <div className="text-center w-full z-10">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-1">
              {dict.totalBalance}
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-black text-slate-100 font-mono">
                {hideBalances ? '••••••' : `$${roundedTotalUSD}`}
              </span>
              <span className="text-xs text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/40 font-bold font-mono">
                USDT
              </span>
            </div>
          </div>

          <div className="w-full h-52 my-3 flex items-center justify-center relative">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const dataItem: any = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-xs leading-none">
                            <p className="font-bold text-slate-200">{dataItem.name}</p>
                            <p className="text-slate-400 mt-1.5 font-mono">
                              {lang === 'ar' ? 'الكمية: ' : 'Qty: '}
                              {dataItem.rawAmount.toFixed(4)}
                            </p>
                            <p className="text-emerald-400 mt-1 font-mono">
                              {lang === 'ar' ? 'القيمة: ' : 'Value: '}
                              ${dataItem.usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-indigo-400 mt-1 font-mono">
                              {dataItem.percentage.toFixed(1)}%
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={650}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        className="cursor-pointer focus:outline-none hover:opacity-90 transition-opacity"
                        onClick={() => setSelectedAsset(entry.name)}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-slate-500 max-w-xs leading-relaxed">
                {dict.emptyChart}
              </div>
            )}

            {/* Inner Ring Text details */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-10">
              <span className="text-[10px] text-slate-500 font-bold uppercase">{lang === 'ar' ? 'توزع الأصول' : 'Asset Weights'}</span>
              <span className="text-xs font-mono font-bold text-indigo-400 mt-0.5">{pieChartData.length} {lang === 'ar' ? 'أصول نشطة' : 'Active Coins'}</span>
            </div>
          </div>

          {/* Settings Control Block (Chart Selector Mode + Privacy Eye) */}
          <div className="w-full flex items-center justify-between border-t border-slate-850/50 pt-3 mt-1 px-1">
            <button
              onClick={() => setHideBalances(!hideBalances)}
              className="text-xs text-slate-400 hover:text-slate-200 transition flex items-center gap-1 px-1.5 py-1 rounded hover:bg-slate-900/40"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{hideBalances ? dict.showBal : dict.hideBal}</span>
            </button>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 font-bold">{dict.chartDisplayMode}</span>
              <div className="flex bg-slate-900 p-0.5 rounded border border-slate-800">
                <button
                  onClick={() => setDisplayInUSD(true)}
                  className={`px-2 py-0.5 rounded text-[9px] font-black transition ${
                    displayInUSD ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  USDT
                </button>
                <button
                  onClick={() => setDisplayInUSD(false)}
                  className={`px-2 py-0.5 rounded text-[9px] font-black transition ${
                    !displayInUSD ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  QTY
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Column 2: Conversions & Pricing Index details (75%) */}
        <div className="xl:col-span-7 flex flex-col gap-4">
          
          {/* Active currency smart converter box */}
          <div className="p-4 rounded-xl bg-indigo-950/15 border border-indigo-900/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                {dict.focusTitle} <strong className="text-indigo-400 font-mono font-black">{selectedAsset}</strong>
              </h3>

              <div className="flex flex-wrap gap-1">
                {portfolioData.assets.map(item => (
                  <button
                    key={item.name}
                    onClick={() => setSelectedAsset(item.name)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono border transition ${
                      selectedAsset === item.name 
                        ? 'bg-indigo-600/80 border-indigo-500 text-white shadow-sm' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Render information for selected asset */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Asset properties & equivalence */}
              <div className="space-y-3 p-3 rounded-lg bg-slate-950/40 border border-slate-850/60" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                <div>
                  <span className="text-[10px] text-slate-500 block leading-none">{lang === 'ar' ? 'الاسم والرمز' : 'Asset Symbol'}</span>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span 
                       className="w-2.5 h-2.5 rounded-full inline-block shrink-0" 
                       style={{ backgroundColor: getAssetColor(selectedAsset) }}
                    />
                    <strong className="text-slate-100 font-mono text-sm uppercase">{selectedAsset}</strong>
                    <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 font-medium">
                      {lang === 'ar' ? activeAssetData.label_ar : activeAssetData.label_en}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block leading-none">{dict.currentRate}</span>
                  <div className="text-xs font-mono font-bold text-slate-200 mt-1 flex items-center gap-1 text-emerald-400">
                    <DollarSign className="w-3 h-3 text-emerald-500" />
                    {selectedAsset === 'USDT' ? '1.00 USDT' : `${activeAssetData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block leading-none">{lang === 'ar' ? 'الرصيد المتاح الكافي:' : 'Current Portfolio Holding:'}</span>
                  <div className="text-sm font-mono font-black text-slate-100 mt-1">
                    {hideBalances ? '••••••' : activeAssetData.value.toFixed(activeAssetData.decimals)} <span className="text-xs font-normal text-slate-400">{selectedAsset}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    ≈ {hideBalances ? '••••' : `$${activeAssetData.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`}
                  </div>
                </div>

                {/* Additional Indices equivalence index info */}
                {selectedAsset !== 'USDT' && (
                  <div className="border-t border-slate-850/55 pt-2.5 mt-2.5">
                    <span className="text-[9px] text-slate-500 block leading-none">{dict.equivalentBTC}</span>
                    <div className="text-[10px] font-mono text-indigo-300 mt-1">
                      {hideBalances 
                        ? '••••' 
                        : `${(activeAssetData.usdValue / getAssetPrice('BTC')).toFixed(6)} BTC`
                      }
                    </div>
                  </div>
                )}

                {selectedAsset === 'USDT' && (
                  <div className="text-[9px] text-slate-400/80 italic mt-3 bg-indigo-950/20 p-2 rounded border border-indigo-900/10 leading-normal">
                    {dict.stablecoinText}
                  </div>
                )}
              </div>

              {/* Advanced Target Price Estimator / Simulator */}
              <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-855 flex flex-col justify-between">
                <div>
                  <h4 className="text-[10.5px] font-black text-indigo-400 flex items-center gap-1 mb-2">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                    <span>{dict.growthEstimator}</span>
                  </h4>

                  {/* Slider simulation input */}
                  <div className="space-y-1.5 my-2">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-400">{dict.percentageChange}</span>
                      <span className={`font-bold ${calcMultiplier >= 1 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {calcMultiplier >= 1 ? '+' : ''}{((calcMultiplier - 1) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="3.0" 
                      step="0.05"
                      disabled={selectedAsset === 'USDT'}
                      value={calcMultiplier} 
                      onChange={(e) => setCalcMultiplier(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-40"
                    />
                  </div>
                </div>

                {/* Dynamic values rendering */}
                <div className="space-y-2 border-t border-slate-850/55 pt-2.5" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">{dict.targetPrice}</span>
                    <span className="font-mono font-bold text-slate-205">
                      ${selectedAsset === 'USDT' ? '1.00' : growthEstimates.estimatedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">{dict.estimatedVal}</span>
                    <span className="font-mono font-bold text-slate-205">
                      ${hideBalances ? '••••' : growthEstimates.estimatedValUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between text-[10px] items-center">
                    <span className="text-slate-500">{dict.estimatedGain}</span>
                    <span className={`font-mono font-black text-[11px] px-1.5 py-0.5 rounded ${
                      growthEstimates.rawProfit >= 0 
                        ? 'text-emerald-400 bg-emerald-950/20' 
                        : 'text-rose-400 bg-rose-950/20'
                    }`}>
                      {growthEstimates.rawProfit >= 0 ? '+' : ''}
                      {hideBalances ? '••••' : `$${growthEstimates.rawProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Quick list of assets inside portfolio */}
          <div className="overflow-x-auto rounded-xl border border-slate-850/60 bg-slate-950/20">
            <table className="w-full text-right text-xs" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-850">
                  <th className="py-2.5 px-3 text-right">{dict.tableAsset}</th>
                  <th className="py-2.5 px-3 text-right">{dict.tableQty}</th>
                  <th className="py-2.5 px-3 text-right font-mono">{dict.tableValueUSD}</th>
                  <th className="py-2.5 px-3 text-right font-mono">{dict.tableWeight}</th>
                </tr>
              </thead>
              <tbody>
                {portfolioData.assets.map(item => {
                  const isFocused = selectedAsset === item.name;
                  const assetColor = getAssetColor(item.name);
                  return (
                    <tr 
                      key={item.name} 
                      onClick={() => setSelectedAsset(item.name)}
                      className={`cursor-pointer transition border-b border-slate-850/40 select-none ${
                        isFocused 
                          ? 'bg-indigo-900/10 hover:bg-indigo-900/15' 
                          : 'hover:bg-slate-900/50'
                      }`}
                    >
                      <td className="py-2 px-3 font-semibold text-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: assetColor }} />
                          <span className="font-mono">{item.name}</span>
                          <span className="text-[10px] text-slate-500 font-normal hidden sm:inline-block">({lang === 'ar' ? item.label_ar : item.label_en})</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-200">
                        {hideBalances ? '••••' : item.value.toFixed(item.decimals)}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-300">
                        ${hideBalances ? '••••' : item.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5 justify-end">
                          <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden hidden sm:block">
                            <div className="h-full rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: assetColor }} />
                          </div>
                          <span className="text-indigo-400 font-bold font-mono">{item.percentage.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-[9.5px] text-slate-500 font-medium px-1 flex items-center gap-1">
            <Info className="w-3 h-3 text-indigo-400 shrink-0" />
            <span>{dict.selectAssetPrompt}</span>
          </p>

        </div>
      </div>
    </div>
  );
}
