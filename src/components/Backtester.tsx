/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { MarketPair, BotType, BacktestResult, Candlestick } from '../types';
import { generateHistoricalData, simulateBacktest, ARABIC_DICT } from '../utils/marketData';
import { Play, TrendingUp, BarChart2, Layers, AlertCircle, RefreshCw, Star } from 'lucide-react';

interface BacktesterProps {
  lang: 'ar' | 'en';
  activePair: MarketPair;
}

export default function Backtester({ lang, activePair }: BacktesterProps) {
  const d = ARABIC_DICT;
  const chartWrapperRef = useRef<HTMLDivElement>(null);

  // States
  const [botType, setBotType] = useState<BotType>('GRID');
  const [running, setRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<BacktestResult | null>(null);
  
  // Custom container width and height for charts
  const [chartWidth, setChartWidth] = useState<number>(550);
  const chartHeight = 220;

  // Grid Fields
  const [lowerPrice, setLowerPrice] = useState<string>((activePair.currentPrice * 0.85).toFixed(1));
  const [upperPrice, setUpperPrice] = useState<string>((activePair.currentPrice * 1.15).toFixed(1));
  const [gridLines, setGridLines] = useState<number>(12);
  const [investment, setInvestment] = useState<string>('1000');

  // Sync lower/upper on active pair switch
  useEffect(() => {
    setLowerPrice((activePair.currentPrice * 0.85).toFixed(1));
    setUpperPrice((activePair.currentPrice * 1.15).toFixed(1));
  }, [activePair.symbol]);

  // Handle Resize of SVG
  useEffect(() => {
    if (!chartWrapperRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries.length > 0) {
        setChartWidth(Math.max(280, entries[0].contentRect.width));
      }
    });
    observer.observe(chartWrapperRef.current);
    return () => observer.disconnect();
  }, [result]);

  // Execute Backtest with animation
  const handleRunBacktest = (e: React.FormEvent) => {
    e.preventDefault();
    setRunning(true);
    setProgress(5);
    setResult(null);

    // Dynamic progress intervals to look highly professional
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Complete Simulation Calculation
          try {
            // Load large 60-day candlestick data array for deep backtesting
            const historicalCandles = generateHistoricalData(activePair.symbol, 60, '1D', activePair.currentPrice);
            const conf = botType === 'GRID' 
              ? { lowerPrice: parseFloat(lowerPrice), upperPrice: parseFloat(upperPrice), gridLines, investmentAmount: parseFloat(investment) }
              : { baseOrderSize: 100, investmentInterval: '1D', totalInvestment: parseFloat(investment) };

            const finalResult = simulateBacktest(activePair.symbol, botType, conf, historicalCandles);
            setResult(finalResult);
          } catch (err) {
            console.error(err);
          }
          setRunning(false);
          return 100;
        }
        // Random incremental hops
        return prev + Math.floor(Math.random() * 20) + 10;
      });
    }, 250);
  };

  // SVG Chart Plotting Vectors
  const paddingX = 45;
  const paddingY = 20;
  const plotWidth = chartWidth - paddingX * 2;
  const plotHeight = chartHeight - paddingY * 2;

  // Compute boundaries for plot
  const botValues = result?.chartData.map(d => d.botValue) || [];
  const hodlValues = result?.chartData.map(d => d.hodlValue) || [];
  const allValues = [...botValues, ...hodlValues];
  
  const minVal = d3Min(allValues) * 0.98;
  const maxVal = d3Max(allValues) * 1.02;

  function d3Min(arr: number[]) {
    return arr.length === 0 ? 0 : Math.min(...arr);
  }

  function d3Max(arr: number[]) {
    return arr.length === 0 ? 1000 : Math.max(...arr);
  }

  const getSvgX = (index: number, total: number) => {
    if (total <= 1) return paddingX;
    return paddingX + (index * plotWidth) / (total - 1);
  };

  const getSvgY = (value: number) => {
    const range = maxVal - minVal;
    if (range === 0) return paddingY + plotHeight / 2;
    return paddingY + plotHeight - ((value - minVal) * plotHeight) / range;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg" id="backtest-terminal-root" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="border-b border-slate-800 pb-3 mb-5">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-indigo-400" />
          <span>{d.backtestTerminal}</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">{d.backtestDesc}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Param setting */}
        <div className="lg:col-span-4 bg-slate-950/60 p-4 rounded-xl border border-slate-850">
          <form onSubmit={handleRunBacktest} className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">{lang === 'ar' ? 'نوع البوت المطلوب تقييمه:' : 'Bot Type to Backtest:'}</label>
              <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setBotType('GRID')}
                  className={`py-1.5 text-xs font-bold rounded transition ${
                    botType === 'GRID' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'
                  }`}
                >
                  {lang === 'ar' ? 'الشبكي GRID' : 'Grid Spot'}
                </button>
                <button
                  type="button"
                  onClick={() => setBotType('DCA')}
                  className={`py-1.5 text-xs font-bold rounded transition ${
                    botType === 'DCA' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'
                  }`}
                >
                  {lang === 'ar' ? 'التراكمي DCA' : 'DCA Cycle'}
                </button>
              </div>
            </div>

            {botType === 'GRID' && (
              <div className="grid grid-cols-2 gap-3 bg-slate-900/30 p-2.5 rounded border border-slate-900">
                <div>
                  <label className="text-[9px] text-slate-550 block mb-0.5">{d.lowerPrice}</label>
                  <input
                    type="number"
                    value={lowerPrice}
                    onChange={(e) => setLowerPrice(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 font-mono text-xs px-2.5 py-1.5 border border-slate-800 rounded"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-550 block mb-0.5">{d.upperPrice}</label>
                  <input
                    type="number"
                    value={upperPrice}
                    onChange={(e) => setUpperPrice(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 font-mono text-xs px-2.5 py-1.5 border border-slate-800 rounded"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-[11px]">
              {botType === 'GRID' ? (
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">{d.gridLines}</label>
                  <input
                    type="number"
                    min="3"
                    max="60"
                    value={gridLines}
                    onChange={(e) => setGridLines(parseInt(e.target.value))}
                    className="w-full bg-slate-950 text-slate-200 font-mono px-3 py-1.5 border border-slate-800 rounded-lg"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">{lang === 'ar' ? 'الدفعة الدورية:' : 'Interval Buy'}</label>
                  <input
                    type="text"
                    disabled
                    value="100 USDT"
                    className="w-full bg-slate-950 text-slate-400 font-mono px-3 py-1.5 border border-slate-800 rounded-lg opacity-60"
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">{lang === 'ar' ? 'رأس المال:' : 'Initial Pool'}</label>
                <input
                  type="number"
                  value={investment}
                  onChange={(e) => setInvestment(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 font-mono px-3 py-1.5 border border-slate-800 rounded-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={running}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5" />
              {running ? d.runningTest : d.startTest}
            </button>
          </form>

          {/* Progress Indicator inside loading block */}
          {running && (
            <div className="mt-4 p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-lg text-center space-y-2">
              <div className="flex justify-between items-center text-[10px] text-indigo-400 font-medium">
                <span>{d.runningTest}</span>
                <span className="font-mono">{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Dynamic results rendering */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          {!result && !running ? (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500">
              <RefreshCw className="w-10 h-10 text-slate-700 mb-3 animate-spin" style={{ animationDuration: '4s' }} />
              <p className="text-xs font-bold text-slate-400 mb-1">
                {lang === 'ar' ? 'جاهز لمحاكاة الأداء التاريخي' : 'Backtest Sandbox Ready'}
              </p>
              <p className="text-[10px] text-slate-500 max-w-sm">
                {lang === 'ar' 
                  ? 'اضغط على زر تشغيل الاختبار لمحاكاة 60 يوماً من حركة الأسعار وتحليل كفاءة الربوت الشبكي مقارنة بشراء المستهدف والاحتفاظ العادي.' 
                  : 'Compare trading bot configurations against simple asset holding over a custom high-stress mathematical framework.'}
              </p>
            </div>
          ) : result ? (
            <div className="space-y-5" id="backtest-results-view">
              
              {/* Stats Box grids */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-950/80 border border-slate-850 p-3.5 rounded-lg">
                  <span className="text-slate-550 block text-[9px] font-semibold">{d.netProfit}</span>
                  <span className="text-base font-bold text-emerald-400 font-mono mt-0.5 block">
                    +{result.netProfitPercent}%
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono block mt-0.5">
                    +${(result.finalPortfolioValue - result.initialInvestment).toLocaleString()} USDT
                  </span>
                </div>

                <div className="bg-slate-950/80 border border-slate-850 p-3.5 rounded-lg">
                  <span className="text-slate-550 block text-[9px] font-semibold">{d.maxDrawdown}</span>
                  <span className="text-base font-bold text-amber-500 font-mono mt-0.5 block">
                    {result.maxDrawdown}%
                  </span>
                  <span className="text-[9px] text-slate-550 block mt-0.5">{lang === 'ar' ? 'أقصى مخاطرة' : 'Risk metric'}</span>
                </div>

                <div className="bg-slate-950/80 border border-slate-850 p-3.5 rounded-lg">
                  <span className="text-slate-550 block text-[9px] font-semibold">{d.winRate}</span>
                  <span className="text-base font-bold text-slate-100 font-mono mt-0.5 block">
                    {result.winRate}%
                  </span>
                  <span className="text-[9px] text-slate-550 block mt-0.5">{lang === 'ar' ? 'معدل النجاح' : 'Success index'}</span>
                </div>

                <div className="bg-slate-950/80 border border-slate-850 p-3.5 rounded-lg">
                  <span className="text-slate-550 block text-[9px] font-semibold">{d.totalTrades}</span>
                  <span className="text-base font-bold text-slate-150 font-mono mt-0.5 block">
                    {result.totalTrades}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono block mt-0.5">صفقة تداول</span>
                </div>
              </div>

              {/* HODL comparative banner */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex items-center justify-between text-xs gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                  <span className="text-slate-400 font-sans">{d.hodlBenchmark}:</span>
                  <span className={`font-mono font-bold ${result.buyAndHoldProfitPercent >= 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
                    {result.buyAndHoldProfitPercent >= 0 ? '+' : ''}{result.buyAndHoldProfitPercent}%
                  </span>
                </div>
                
                {result.netProfitPercent > result.buyAndHoldProfitPercent ? (
                  <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">
                    <Star className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'أداء أفضل من السوق بكثير!' : 'Outperformed HODL!'}</span>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 font-medium">
                    {lang === 'ar' ? 'فارق متوسط مع الاحتفاظ' : 'Under extreme uptrend, general HODL can excel'}
                  </div>
                )}
              </div>

              {/* Comparative SVG Line Charts */}
              <div className="bg-slate-950 rounded-xl border border-slate-850 p-4" ref={chartWrapperRef}>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-3 uppercase">
                  <span>{d.winComparison}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-mono">
                      <span className="w-2 h-0.5 bg-indigo-500 inline-block" /> {lang === 'ar' ? 'أداء بوت التداول' : 'Bot Strategy'}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <span className="w-2 h-0.5 bg-slate-500 inline-block" /> {lang === 'ar' ? 'الاحتفاظ HODL' : 'HODL Buy'}
                    </span>
                  </div>
                </div>

                <div className="h-56 relative w-full overflow-hidden">
                  {result.chartData.length > 0 && (
                    <svg width={chartWidth} height={chartHeight} className="absolute inset-x-0 top-0">
                      
                      {/* Grid Lines */}
                      {[0.25, 0.5, 0.75].map((fract, idx) => {
                        const yVal = paddingY + fract * plotHeight;
                        return (
                          <line
                            key={idx}
                            x1={paddingX}
                            y1={yVal}
                            x2={chartWidth - paddingX}
                            y2={yVal}
                            stroke="#0f172a"
                            strokeWidth={1}
                            strokeDasharray="2 3"
                          />
                        );
                      })}

                      {/* Draw HODL Path */}
                      <path
                        d={result.chartData.map((dItem, idx) => {
                          const x = getSvgX(idx, result.chartData.length);
                          const y = getSvgY(dItem.hodlValue);
                          return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#64748b" // slate-500 (HODL)
                        strokeWidth={1.5}
                        strokeDasharray="4 2"
                      />

                      {/* Draw BOT Strategy Path */}
                      <path
                        d={result.chartData.map((dItem, idx) => {
                          const x = getSvgX(idx, result.chartData.length);
                          const y = getSvgY(dItem.botValue);
                          return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#6366f1" // indigo-500 (Bot)
                        strokeWidth={2.2}
                      />

                      {/* Labels */}
                      <text x={paddingX - 6} y={paddingY + 4} fill="#475569" fontSize={9} textAnchor="end" fontFamily="monospace">
                        ${maxVal.toFixed(0)}
                      </text>
                      <text x={paddingX - 6} y={paddingY + plotHeight} fill="#475569" fontSize={9} textAnchor="end" fontFamily="monospace">
                        ${minVal.toFixed(0)}
                      </text>
                    </svg>
                  )}
                </div>
              </div>

            </div>
          ) : null}

          {/* Tip Footer */}
          <div className="text-[10px] text-slate-500 leading-normal bg-slate-950/20 p-2.5 rounded-lg border border-slate-850/65 mt-5">
            {lang === 'ar' ? (
              'تنبيه: اختبارات المحاكاة لا تضمن نفس العائد في المستقبل. الرسوم وصلاحيات اتصال التداول يجب برمجتها بحيطة ودقة تامة.'
            ) : (
              'Note: Historical sandbox valuations bypass gas limits and spot fees. Real yield may vary with market order depths.'
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
