/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MarketPair, OrderType, OrderSide, TradeOrder } from '../types';
import { generateOrderBook, ARABIC_DICT } from '../utils/marketData';
import { ArrowDownRight, ArrowUpLeft, AlertTriangle, Play, HelpCircle, CheckCircle2, Download } from 'lucide-react';
import LeverageRiskCalculator from './LeverageRiskCalculator';

interface ManualTradingProps {
  lang: 'ar' | 'en';
  activePair: MarketPair;
  onSubmitOrder: (order: Omit<TradeOrder, 'id' | 'timestamp' | 'status'>) => void;
  orders: TradeOrder[];
  portfolio: { usdt: number; btc: number };
  isLiveTrading?: boolean;
  manualLeverage?: number;
  setManualLeverage?: (lev: number) => void;
}

export default function ManualTrading({
  lang,
  activePair,
  onSubmitOrder,
  orders,
  portfolio,
  isLiveTrading = false,
  manualLeverage,
  setManualLeverage,
}: ManualTradingProps) {
  const d = ARABIC_DICT;

  // Form states
  const [orderSide, setOrderSide] = useState<OrderSide>('BUY');
  const [orderType, setOrderType] = useState<OrderType>('LIMIT');
  const [price, setPrice] = useState<string>(activePair.currentPrice.toString());
  const [amount, setAmount] = useState<string>('0.01');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  
  const priceRef = React.useRef(price);
  React.useEffect(() => { priceRef.current = price; }, [price]);
  
  const [fallbackLeverage, setFallbackLeverage] = useState<number>(1);
  const [useAiStopLoss, setUseAiStopLoss] = useState(false);
  const calculateSmartSL = React.useCallback(async () => {
    try {
      const klineResp = await fetch(`/api/binance/klines?symbol=${encodeURIComponent(activePair.symbol)}&interval=1h&limit=20`);
      const klines = await klineResp.json();
      
      const response = await fetch('/api/ai/calculate-smart-sl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: activePair.symbol,
          side: orderSide,
          entryPrice: parseFloat(priceRef.current) || activePair.currentPrice,
          currentPrice: activePair.currentPrice,
          klines: klines
        })
      });
      const data = await response.json();
      if (data.slPrice) {
        setStopLoss(data.slPrice.toFixed(2));
      }
    } catch (error) {
      console.error("Smart SL calculation failed", error);
    }
  }, [activePair.symbol, activePair.currentPrice, orderSide]);

  useEffect(() => {
    if (useAiStopLoss) {
      calculateSmartSL();
    }
  }, [useAiStopLoss, calculateSmartSL]);
  const leverage = manualLeverage !== undefined ? manualLeverage : fallbackLeverage;
  const setLeverage = setManualLeverage !== undefined ? setManualLeverage : setFallbackLeverage;
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'refused' } | null>(null);

  // Sync price if market order is selected or when pair switches
  useEffect(() => {
    if (orderType === 'MARKET') {
      setPrice(activePair.currentPrice.toString());
    }
  }, [activePair.currentPrice, orderType]);

  // Sync price once when the pair symbol changes
  useEffect(() => {
    setPrice(activePair.currentPrice.toString());
  }, [activePair.symbol]);

  // Order Book state with real-time Binance Order depth API synchronization
  const [orderBook, setOrderBook] = useState(() => generateOrderBook(activePair.currentPrice));
  const [isLiveBookLoading, setIsLiveBookLoading] = useState<boolean>(false);

  useEffect(() => {
    let isCurrent = true;
    const fetchLiveOrderBook = async () => {
      setIsLiveBookLoading(true);
      try {
        const querySymbol = activePair.symbol;
        const response = await fetch(`/api/binance/depth?symbol=${encodeURIComponent(querySymbol)}&limit=8`);
        if (!response.ok) {
          throw new Error('Local fallback cascade.');
        }
        const data = await response.json();
        if (isCurrent && data && Array.isArray(data.bids) && Array.isArray(data.asks)) {
          setOrderBook(data);
          setIsLiveBookLoading(false);
          return;
        }
      } catch (err) {
        console.log('[OrderBook Sync] Fetching live depth failed, using procedural generator:', err);
      }

      // Procedural Fallback
      if (isCurrent) {
        setOrderBook(generateOrderBook(activePair.currentPrice));
        setIsLiveBookLoading(false);
      }
    };

    fetchLiveOrderBook();

    // Set up a dynamic polling interval every 8 seconds to stay freshly synchronized
    const interval = setInterval(() => {
      fetchLiveOrderBook();
    }, 8000);

    return () => {
      isCurrent = false;
      clearInterval(interval);
    };
  }, [activePair.symbol]);

  // Export Filled orders to tax-compliant CSV for professional portfolio accounting
  const handleExportCSV = () => {
    if (orders.length === 0) return;

    // Define dual language headers depending on client localization
    const headers = lang === 'ar' 
      ? ['معرف الصفقة', 'رمز التداول', 'نوع الأمر', 'العملية', 'سعر التنفيذ (USDT)', 'الكمية منفذة', 'إجمالي القيمة (USDT)', 'الرافعة المالية', 'التاريخ والوقت (UTC)', 'حالة التنفيذ']
      : ['Trade ID', 'Trading Symbol', 'Order Type', 'Side', 'Execution Price (USDT)', 'Executed Qty', 'Total Value (USDT)', 'Leverage Multiplier', 'DateTime (UTC)', 'Trade Status'];

    const rows = orders.map((ord) => {
      const dateStr = new Date(ord.timestamp).toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      const orderSideStr = ord.side === 'BUY' 
        ? (lang === 'ar' ? 'شراء' : 'BUY')
        : (lang === 'ar' ? 'بيع' : 'SELL');
      const orderTypeStr = ord.type === 'LIMIT' 
        ? (lang === 'ar' ? 'محدد السعر' : 'LIMIT')
        : ord.type === 'MARKET'
        ? (lang === 'ar' ? 'سعر السوق' : 'MARKET')
        : (lang === 'ar' ? 'وقف خسارة' : 'STOP_LIMIT');
      const orderStatusStr = ord.status === 'FILLED'
        ? (lang === 'ar' ? 'منفذ' : 'FILLED')
        : ord.status === 'PENDING'
        ? (lang === 'ar' ? 'معلق' : 'PENDING')
        : (lang === 'ar' ? 'ملغي' : 'CANCELLED');

      return [
        ord.id,
        ord.symbol,
        orderTypeStr,
        orderSideStr,
        ord.price.toString(),
        ord.amount.toString(),
        ord.total.toString(),
        `${ord.leverage}x`,
        dateStr,
        orderStatusStr,
      ];
    });

    // Handle standard character escaping for CSV formulas and special symbols
    const escapeCsvCell = (val: string) => {
      const clean = val.replace(/"/g, '""');
      if (clean.includes(',') || clean.includes('"') || clean.includes('\n') || clean.includes('\r')) {
        return `"${clean}"`;
      }
      return clean;
    };

    const csvContent = [
      headers.map(escapeCsvCell).join(','),
      ...rows.map((row) => row.map(escapeCsvCell).join(',')),
    ].join('\n');

    // Include the UTF-8 BOM byte marker so Excel renders Arab characters natively
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Aesthetic and accurate dates in filename
    const filenamePrefix = lang === 'ar' ? 'سجل-الصفقات-المحاسبي' : 'almoharif-tax-ledger';
    const timestampSuffix = new Date().toISOString().slice(0,10);
    link.href = url;
    link.setAttribute('download', `${filenamePrefix}-${timestampSuffix}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle Form Submission
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price);
    const parsedAmount = parseFloat(amount);
    
    if (isNaN(parsedPrice) || parsedPrice <= 0 || isNaN(parsedAmount) || parsedAmount <= 0) {
      setMessage({
        text: lang === 'ar' ? 'الرجاء إدخال كميات وفئات أسعار صحيحة.' : 'Please enter valid numerical digits.',
        type: 'refused',
      });
      return;
    }

    const cost = (parsedPrice * parsedAmount) / leverage;
    
    if (orderSide === 'BUY' && cost > portfolio.usdt) {
      setMessage({
        text: lang === 'ar' ? 'عذراً! رصيد USDT غير كافٍ لتغطية هامش هذه الصفقة.' : 'Insufficient USDT margin balance.',
        type: 'refused',
      });
      return;
    }

    if (orderSide === 'SELL' && parsedAmount > portfolio.btc && activePair.symbol === 'BTC/USDT') {
      setMessage({
        text: lang === 'ar' ? 'عذراً! رصيد BTC غير كافٍ لإتمام عملية البيع المباشر.' : 'Insufficient BTC balance.',
        type: 'refused',
      });
      return;
    }

    const parsedTakeProfit = parseFloat(takeProfit);
    const parsedStopLoss = parseFloat(stopLoss);

    onSubmitOrder({
      symbol: activePair.symbol,
      type: orderType,
      side: orderSide,
      price: parsedPrice,
      amount: parsedAmount,
      total: parsedPrice * parsedAmount,
      leverage: leverage,
      takeProfit: !isNaN(parsedTakeProfit) && parsedTakeProfit > 0 ? parsedTakeProfit : undefined,
      stopLoss: !isNaN(parsedStopLoss) && parsedStopLoss > 0 ? parsedStopLoss : undefined,
    });

    setTakeProfit('');
    setStopLoss('');

    setMessage({
      text: lang === 'ar' 
        ? `عقد ${orderSide === 'BUY' ? 'شراء' : 'بيع'} تم تقديمه بقيمة ${(parsedPrice * parsedAmount).toLocaleString()} USDT` 
        : `Simulated ${orderSide} filled successfully!`,
      type: 'success',
    });

    // Auto clear alert
    setTimeout(() => setMessage(null), 4000);
  };

  const handleApplyCalculatorValues = (calcPrice: string, calcLeverage: number, calcSide: 'BUY' | 'SELL') => {
    setPrice(calcPrice);
    setLeverage(calcLeverage);
    setOrderSide(calcSide);
  };

  const handleQuickTrade = (percentage: number, side: OrderSide) => {
    const currentPrice = activePair.currentPrice;
    let computedAmount = 0;

    if (side === 'BUY') {
      const usdtToSpend = portfolio.usdt * percentage;
      const leveragedPower = usdtToSpend * leverage;
      computedAmount = leveragedPower / currentPrice;
    } else {
      if (activePair.symbol === 'BTC/USDT') {
        computedAmount = portfolio.btc * percentage;
      } else {
        computedAmount = (portfolio.usdt * percentage * leverage) / currentPrice;
      }
    }

    // Round safely according to platform precision mechanics
    computedAmount = parseFloat(computedAmount.toFixed(4));

    if (computedAmount <= 0) {
      setMessage({
        text: lang === 'ar'
          ? 'عذراً! المحفظة لا تحتوي على رصيد كافٍ لحساب هذه النسبة.'
          : 'Insufficient balance to calculate appropriate size.',
        type: 'refused',
      });
      return;
    }

    const totalValue = currentPrice * computedAmount;
    const requiredMargin = totalValue / leverage;

    if (side === 'BUY' && requiredMargin > portfolio.usdt) {
      setMessage({
        text: lang === 'ar' ? 'عذراً! رصيد USDT غير كافٍ لتوفير الهامش.' : 'Insufficient USDT margin balance.',
        type: 'refused',
      });
      return;
    }

    if (side === 'SELL' && activePair.symbol === 'BTC/USDT' && computedAmount > portfolio.btc) {
      setMessage({
        text: lang === 'ar' ? 'عذراً! لا تملك رصيد كافٍ من الرمز لإجراء البيع الفوري.' : 'Insufficient BTC balance.',
        type: 'refused',
      });
      return;
    }

    // Execute direct MARKET order placement
    onSubmitOrder({
      symbol: activePair.symbol,
      type: 'MARKET',
      side: side,
      price: currentPrice,
      amount: computedAmount,
      total: totalValue,
      leverage: leverage,
    });

    // Populate values on manual form inputs for comprehensive logging feedback
    setAmount(computedAmount.toString());
    setPrice(currentPrice.toString());
    setOrderType('MARKET');
    setOrderSide(side);

    setMessage({
      text: lang === 'ar'
        ? `⚡ تم تنفيذ صفقة سوق فورية بنجاح: ${side === 'BUY' ? 'شراء' : 'بيع'} بمقدار ${computedAmount} (${activePair.baseAsset})`
        : `⚡ Instant Market ${side} executed! Size: ${computedAmount} ${activePair.baseAsset}`,
      type: 'success',
    });

    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <div className="space-y-6" id="manual-trading-wrapper">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="manual-trading-root">
      
      {/* LEFT AREA: Order Placement Form (RTL/LTR compliant) */}
      <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div>
          {/* Side Tabs (Buy/Sell) */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 mb-5">
            <button
              type="button"
              onClick={() => setOrderSide('BUY')}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                orderSide === 'BUY'
                  ? 'bg-emerald-600/90 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'ar' ? d.buy : 'BUY POINT'}
            </button>
            <button
              type="button"
              onClick={() => setOrderSide('SELL')}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                orderSide === 'SELL'
                  ? 'bg-rose-600/90 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'ar' ? d.sell : 'SELL POINT'}
            </button>
          </div>

          {/* Form Action Title */}
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-1.5 border-b border-slate-850 pb-2">
            <span>
              {orderSide === 'BUY' 
                ? (lang === 'ar' ? 'تخصيص أمر الشراء المالي' : 'Buy Order Options') 
                : (lang === 'ar' ? 'تخصيص أمر البيع المالي' : 'Sell Order Options')}
            </span>
            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
              orderSide === 'BUY' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-rose-900/40 text-rose-400'
            }`}>
              {activePair.symbol}
            </span>
          </h3>

          <form onSubmit={handlePlaceOrder} className="space-y-4">
            
            {/* Order Type Selection */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">{d.orderType}</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850">
                {['LIMIT', 'MARKET', 'STOP_LIMIT'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setOrderType(t as OrderType)}
                    className={`py-1.5 text-[10px] rounded transition ${
                      orderType === t
                        ? 'bg-slate-800 text-slate-200 shadow'
                        : 'text-slate-500 hover:text-slate-350'
                    }`}
                  >
                    {t === 'LIMIT' ? (lang === 'ar' ? 'محدد' : 'LIMIT') :
                     t === 'MARKET' ? (lang === 'ar' ? 'السوق' : 'MARKET') :
                     (lang === 'ar' ? 'وقف الخسارة' : 'STOP-LIMIT')}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Input (Hidden for pure market execution) */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">
                {lang === 'ar' ? `${d.price} (USDT)` : 'Target Price (USDT)'}
              </label>
              <input
                type="number"
                disabled={orderType === 'MARKET'}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                step="0.01"
                className="w-full bg-slate-950 text-slate-100 font-mono text-sm px-3 py-2 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-600 disabled:opacity-40"
              />
            </div>

            {/* Amount Input */}
            <div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                <span>{lang === 'ar' ? `${d.amount} (${activePair.baseAsset})` : 'Order Quantity'}</span>
                {activePair.symbol === 'BTC/USDT' && (
                  <span>{lang === 'ar' ? `الحد الأقصى: ${portfolio.btc.toFixed(4)}` : `Available: ${portfolio.btc.toFixed(4)}`}</span>
                )}
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.0001"
                className="w-full bg-slate-950 text-slate-100 font-mono text-sm px-3 py-2 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Take Profit & Stop Loss Fields */}
            <div className="grid grid-cols-2 gap-3 bg-slate-950/20 p-3 rounded-lg border border-slate-850">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] text-emerald-400 font-bold block">
                    {lang === 'ar' ? 'جني الأرباح (TP)' : 'Take Profit (TP)'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const basePrice = parseFloat(price) || activePair.currentPrice;
                      // +5% for BUY, -5% for SELL
                      const tpVal = orderSide === 'BUY' ? basePrice * 1.05 : basePrice * 0.95;
                      setTakeProfit(tpVal.toFixed(2));
                    }}
                    className="text-[8px] text-slate-500 hover:text-emerald-450 cursor-pointer font-bold transition font-mono"
                  >
                    {orderSide === 'BUY' ? '+5%' : '-5%'}
                  </button>
                </div>
                <input
                  type="number"
                  placeholder={lang === 'ar' ? 'اختياري' : 'Optional'}
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  step="0.01"
                  className="w-full bg-slate-950 text-slate-100 font-mono text-[11px] px-2.5 py-1.5 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-555"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                    <input 
                      type="checkbox"
                      checked={useAiStopLoss}
                      onChange={(e) => setUseAiStopLoss(e.target.checked)}
                      className="accent-rose-500"
                    />
                    {lang === 'ar' ? 'وقف خسارة ذكي (AI)' : 'Smart Stop-Loss (AI)'}
                  </label>
                </div>
                <input
                  type="number"
                  placeholder="ATR Multiplier"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  step="0.1"
                  className="w-full bg-slate-950 text-slate-100 font-mono text-[11px] px-2.5 py-1.5 border border-slate-800 rounded-lg focus:outline-none focus:border-rose-555"
                />
                <span className="text-[8px] text-slate-500 mt-1 block">
                  {lang === 'ar' ? 'جيمني يراقب ويخرجك' : 'Gemini monitors & exits'}
                </span>
              </div>
            </div>

            {/* Leverage Slider (Futures simulated) */}
            <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850">
              <div className="flex justify-between items-center text-[10px] mb-1">
                <span className="text-slate-400">{d.leverage}</span>
                <span className="text-emerald-400 font-bold font-mono">{leverage}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={leverage}
                onChange={(e) => setLeverage(parseInt(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[8px] text-slate-500 font-mono mt-1">
                <span>1x</span>
                <span>25x</span>
                <span>50x</span>
                <span>100x</span>
              </div>
              
              {leverage > 10 && (
                <div className="flex items-start gap-1.5 mt-2.5 text-amber-500/90 text-[10px]" id="leverage-danger-msg">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <p className="leading-tight">{d.leverageWarn}</p>
                </div>
              )}
            </div>

            {/* Transaction Alert Display */}
            {message && (
              <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                message.type === 'success' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/40' : 'bg-rose-900/30 text-rose-400 border border-rose-800/40'
              }`} id="order-message-banner">
                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <p>{message.text}</p>
              </div>
            )}

            {/* Submit Button with Professional Polish styling */}
            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-bold text-xs text-white transition-all duration-200 mt-2 cursor-pointer ${
                orderSide === 'BUY'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-950/40 border border-emerald-500/20'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-950/40 border border-rose-500/20'
              }`}
            >
              {orderSide === 'BUY' ? d.placeBuyOrder : d.placeSellOrder}
            </button>
          </form>

          {/* Quick-Access Market Trade Buttons Section */}
          <div className="mt-5 pt-4 border-t border-slate-850" id="quick-trade-buttons-root">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                {lang === 'ar' ? 'التداول السريع بضربة واحدة (سعر السوق)' : 'One-Click Quick Market Trade'}
              </span>
            </div>
            
            <div className="space-y-2">
              {/* Instant Market BUY buttons */}
              <div className="grid grid-cols-4 gap-1.5 items-center">
                <span className="text-[10px] text-emerald-400 font-bold">
                  {lang === 'ar' ? 'شراء فوري:' : 'Buy Market:'}
                </span>
                {[0.25, 0.50, 1.00].map((pct) => (
                  <button
                    key={`quick-buy-${pct}`}
                    type="button"
                    onClick={() => handleQuickTrade(pct, 'BUY')}
                    className="bg-slate-950 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-700/30 text-slate-300 hover:text-emerald-400 text-[10px] font-mono font-bold py-1.5 px-2 rounded-lg transition-all cursor-pointer text-center select-none"
                  >
                    {pct * 100}%
                  </button>
                ))}
              </div>

              {/* Instant Market SELL buttons */}
              <div className="grid grid-cols-4 gap-1.5 items-center">
                <span className="text-[10px] text-rose-400 font-bold">
                  {lang === 'ar' ? 'بيع فوري:' : 'Sell Market:'}
                </span>
                {[0.25, 0.50, 1.00].map((pct) => (
                  <button
                    key={`quick-sell-${pct}`}
                    type="button"
                    onClick={() => handleQuickTrade(pct, 'SELL')}
                    className="bg-slate-950 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-700/30 text-slate-300 hover:text-rose-400 text-[10px] font-mono font-bold py-1.5 px-2 rounded-lg transition-all cursor-pointer text-center select-none"
                  >
                    {pct * 100}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Short Balance/Info footer */}
        <div className="mt-5 border-t border-slate-850 pt-3 flex justify-between items-center text-[10px] text-slate-400">
          <span>{lang === 'ar' ? 'الهامش المطلوب المقدر:' : 'Est. Holding Margin:'}</span>
          <span className="font-mono text-slate-200 font-bold">
            ${((parseFloat(price || '0') * parseFloat(amount || '0')) / leverage).toFixed(2)} USDT
          </span>
        </div>
      </div>

      {/* RIGHT AREA: Professional Order Book (RTL/LTR compliant) */}
      <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Order Book Grid */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div>
            <h3 className="text-xs font-semibold text-slate-200 mb-3 block border-b border-slate-850 pb-2">
              {d.orderBook} - {activePair.symbol}
            </h3>
            
            {/* Book Header */}
            <div className="grid grid-cols-3 gap-2 text-[9px] text-slate-500 font-semibold mb-2 font-mono">
              <span className={lang === 'ar' ? 'text-right' : 'text-left'}>{d.price} (USDT)</span>
              <span className="text-center">{d.amount}</span>
              <span className={lang === 'ar' ? 'text-left' : 'text-right'}>{d.total}</span>
            </div>

            {/* Asks (Sells) - Red */}
            <div className="space-y-1" id="asks-list">
              {orderBook.asks.map((ask, i) => (
                <div key={`ask-${i}`} className="grid grid-cols-3 gap-2 text-xs font-mono relative py-0.5" style={{ contentVisibility: 'auto' }}>
                  {/* Depth gauge representation background */}
                  <div
                    className="absolute inset-y-0 right-0 bg-rose-950/20"
                    style={{ width: `${ask.depthPercent}%` }}
                  />
                  <span className={`text-rose-500 font-semibold z-10 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    ${ask.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-slate-300 text-center z-10">{ask.amount.toFixed(4)}</span>
                  <span className={`text-slate-500 z-10 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                    ${ask.total.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Current Ticker Indicator */}
            <div className="my-3 py-2 border-y border-slate-850 flex items-center justify-between px-2 bg-slate-950/60 rounded" id="ticker-middle-display">
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold font-mono ${activePair.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ${activePair.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                {activePair.change24h >= 0 ? (
                  <ArrowUpLeft className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-rose-400" />
                )}
              </div>
              <span className={`text-xs font-semibold font-mono ${activePair.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {activePair.change24h >= 0 ? '+' : ''}{activePair.change24h.toFixed(2)}%
              </span>
            </div>

            {/* Bids (Buys) - Green */}
            <div className="space-y-1" id="bids-list">
              {orderBook.bids.map((bid, i) => (
                <div key={`bid-${i}`} className="grid grid-cols-3 gap-2 text-xs font-mono relative py-0.5" style={{ contentVisibility: 'auto' }}>
                  {/* Depth gauge representation background */}
                  <div
                    className="absolute inset-y-0 left-0 bg-emerald-950/20"
                    style={{ width: `${bid.depthPercent}%` }}
                  />
                  <span className={`text-emerald-400 font-semibold z-10 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    ${bid.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-slate-300 text-center z-10">{bid.amount.toFixed(4)}</span>
                  <span className={`text-slate-500 z-10 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                    ${bid.total.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions log container */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-850 pb-2">
              <h3 className="text-xs font-semibold text-slate-200">
                {d.recentOrders}
              </h3>
              {orders.length > 0 && (
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="flex items-center gap-1 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-[10px] font-bold px-2 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer shadow-sm select-none"
                  id="export-orders-csv-btn"
                  title={lang === 'ar' ? 'تصدير سجل صفقات التداول كملف محاسبي ضريبي CSV' : 'Export trade transactions for tax and portfolio accounting'}
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'ar' ? 'تصدير CSV' : 'Export CSV'}</span>
                </button>
              )}
            </div>
            
            {orders.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-slate-500 text-xs px-4 text-center">
                <HelpCircle className="w-8 h-8 text-slate-600 mb-2" />
                <p>{d.noOrders}</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1" id="orders-log-list">
                {orders.map((ord) => {
                  const buySide = ord.side === 'BUY';
                  return (
                    <div 
                      key={ord.id} 
                      className={`p-3 rounded-lg text-[11px] space-y-1.5 transition-all ${
                        ord.isLive 
                          ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/20 border border-indigo-500/35 shadow-[0_0_12px_rgba(99,102,241,0.15)] shadow-indigo-950/40' 
                          : 'bg-slate-950/80 border border-slate-850'
                      }`} 
                      style={{ contentVisibility: 'auto' }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-300">{ord.symbol}</span>
                          {ord.isLive ? (
                            <span className="bg-indigo-950 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wide flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-indigo-400 animate-ping"></span>
                              {lang === 'ar' ? 'حقيقي API' : 'LIVE API'}
                            </span>
                          ) : (
                            <span className="bg-amber-950/40 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wide flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-amber-400"></span>
                              {lang === 'ar' ? 'تجريبي' : 'PAPER'}
                            </span>
                          )}
                        </div>
                        <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] ${
                          buySide ? 'bg-emerald-900/30 text-emerald-400' : 'bg-rose-900/30 text-rose-400'
                        }`}>
                          {buySide ? (lang === 'ar' ? 'شراء' : 'BUY') : (lang === 'ar' ? 'بيع' : 'SELL')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-y-1 text-slate-400 font-mono">
                        <div>
                          {lang === 'ar' ? 'السعر المحدد:' : 'Price:'}{' '}
                          <span className="text-slate-200 font-semibold">${(ord.price ?? 0).toLocaleString()}</span>
                        </div>
                        <div>
                          {lang === 'ar' ? 'الكمية:' : 'Qty:'}{' '}
                          <span className="text-slate-200 font-semibold">{ord.amount ?? 0}</span>
                        </div>
                        <div>
                          {lang === 'ar' ? 'الرافعة:' : 'Leverage:'}{' '}
                          <span className="text-amber-400 font-semibold">{ord.leverage ?? 1}x</span>
                        </div>
                        <div>
                          {lang === 'ar' ? 'الإجمالي:' : 'Total:'}{' '}
                          <span className="text-slate-200 font-bold">${(ord.total ?? 0).toLocaleString()}</span>
                        </div>
                        {ord.takeProfit && (
                          <div className="col-span-2 text-emerald-400">
                            {lang === 'ar' ? '🎯 جني أرباح (TP):' : '🎯 Take Profit (TP):'}{' '}
                            <span className="font-bold underline decoration-dotted decoration-emerald-500/50">${(ord.takeProfit ?? 0).toLocaleString()}</span>
                          </div>
                        )}
                        {ord.stopLoss && (
                          <div className="col-span-2 text-rose-450 font-semibold">
                            {lang === 'ar' ? '🛑 وقف خسارة (SL):' : '🛑 Stop Loss (SL):'}{' '}
                            <span className="font-bold underline decoration-dotted decoration-rose-500/50">${(ord.stopLoss ?? 0).toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-[9px] text-slate-500 border-t border-slate-900 pt-1.5">
                        <span>{new Date(ord.timestamp).toLocaleTimeString('ar-EG')}</span>
                        <span className="text-emerald-500 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          {lang === 'ar' ? d.filled : 'FILLED'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className={`text-[10px] mt-4 leading-relaxed border-t pt-2 p-2.5 rounded-lg border transition-all ${
            isLiveTrading 
              ? 'text-emerald-400 bg-emerald-990/10 border-emerald-900/30 font-medium' 
              : 'text-slate-500 bg-slate-950/20 border-slate-850'
          }`}>
            {lang === 'ar' ? (
              isLiveTrading ? (
                <span>⚡ <strong>وضع التداول الحقيقي نشط:</strong> يتم إرسال وتنفيذ جميع الصفقات الفورية وتمرير الأوامر مباشرة إلى حسابك ومحفظتك في بينانس بصفة فورية مع مراعاة القيود الأمنية وسرعة الصقور!</span>
              ) : (
                '* تذكر: هذه عمليات تداول تجريبية في بيئة محاكاة معزولة لحماية أموالك من أي مخاطر أثناء إعداد البوتات الخاصة بك.'
              )
            ) : (
              isLiveTrading ? (
                <span>⚡ <strong>Live Trading Mode is Active:</strong> All spot trades are dispatched and settled directly on your real Binance account with extreme falcon speed and safety.</span>
              ) : (
                '* Note: Simulated offline margin terminal for risk-free system valuation and logic checking.'
              )
            )}
          </div>
        </div>

      </div>

    </div>

    {/* Quick-Access Leverage Risk Calculator Section */}
      <LeverageRiskCalculator
        lang={lang}
        activePair={activePair}
        defaultPrice={parseFloat(price) || activePair.currentPrice}
        defaultLeverage={leverage}
        defaultSide={orderSide}
        onApplyToForm={handleApplyCalculatorValues}
      />

    </div>
  );
}
