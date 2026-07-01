/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Candlestick, MarketPair } from '../types';
import { generateHistoricalData } from '../utils/marketData';
import { TrendingUp, TrendingDown, Layers, ChartBar, Contrast } from 'lucide-react';

interface InteractiveChartProps {
  lang: 'ar' | 'en';
  activePair: MarketPair;
}

export default function InteractiveChart({ lang, activePair }: InteractiveChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 350 });
  const [interval, setInterval] = useState<string>('1h');
  const [candles, setCandles] = useState<Candlestick[]>([]);
  const [hoveredCandle, setHoveredCandle] = useState<Candlestick | null>(null);
  const [showEma, setShowEma] = useState<boolean>(true);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [showSrLevels, setShowSrLevels] = useState<boolean>(true);

  const [isLoadingCandles, setIsLoadingCandles] = useState<boolean>(false);

  // Load candlesticks on pair symbol or interval change
  useEffect(() => {
    let days = 30;
    if (interval === '1m') days = 100; // minutes
    else if (interval === '15m') days = 80;
    else if (interval === '1h') days = 60;
    else if (interval === '4h') days = 40;

    let isCurrent = true;
    const fetchLiveKlines = async () => {
      setIsLoadingCandles(true);
      try {
        const querySymbol = activePair.symbol;
        const response = await fetch(`/api/binance/klines?symbol=${encodeURIComponent(querySymbol)}&interval=${interval}&limit=${days}`);
        if (!response.ok) {
          throw new Error('Local fallback cascade.');
        }
        const data = await response.json();
        if (isCurrent && Array.isArray(data) && data.length > 0) {
          setCandles(data);
          setHoveredCandle(null);
          setIsLoadingCandles(false);
          return;
        }
      } catch (err) {
        console.log('[Klines Sync] Fetching live Binance candles failed, using mock generator:', err);
      }
      
      // Fallback
      if (isCurrent) {
        const data = generateHistoricalData(activePair.symbol, days, interval, activePair.currentPrice);
        setCandles(data);
        setHoveredCandle(null);
        setIsLoadingCandles(false);
      }
    };

    fetchLiveKlines();

    return () => {
      isCurrent = false;
    };
  }, [activePair.symbol, interval]);

  // Sync the last candle with the real-time live price from activePair (without refetching all historical data)
  useEffect(() => {
    if (candles.length === 0) return;
    setCandles((prevCandles) => {
      const updated = [...prevCandles];
      const lastIdx = updated.length - 1;
      const last = { ...updated[lastIdx] };
      last.close = activePair.currentPrice;
      if (activePair.currentPrice > last.high) last.high = activePair.currentPrice;
      if (activePair.currentPrice < last.low) last.low = activePair.currentPrice;
      updated[lastIdx] = last;
      return updated;
    });
  }, [activePair.currentPrice]);

  // Handle fully dynamic container resize
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({
        width: Math.max(300, width),
        height: Math.max(250, height || 350),
      });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Compute Exponential Moving Average (EMA 9)
  const computeEma = (data: Candlestick[], period: number = 9): number[] => {
    const k = 2 / (period + 1);
    const ema: number[] = [];
    if (data.length === 0) return ema;

    let previousEma = data[0].close;
    ema.push(previousEma);

    for (let i = 1; i < data.length; i++) {
      const currentEma = data[i].close * k + previousEma * (1 - k);
      ema.push(currentEma);
      previousEma = currentEma;
    }
    return ema;
  };

  const emaData = showEma ? computeEma(candles) : [];

  // SVG parameters
  const paddingX = 60;
  const paddingY = 30;
  const chartWidth = dimensions.width - paddingX * 2;
  const chartHeight = dimensions.height - paddingY * 2;

  // Find min and max prices
  const closingPrices = candles.map(c => c.close);
  const highPrices = candles.map(c => c.high);
  const lowPrices = candles.map(c => c.low);
  const minPrice = Math.min(...lowPrices) * 0.995;
  const maxPrice = Math.max(...highPrices) * 1.005;

  const maxVolume = Math.max(...candles.map(c => c.volume), 1000);

  interface SRLevel {
    price: number;
    type: 'support' | 'resistance';
    source: 'pivot' | 'volume';
    score: number;
  }

  // Automatically compute key support & resistance levels based on local extrema pivots and volume profile nodes
  const srLevels = useMemo<SRLevel[]>(() => {
    if (candles.length < 12) return [];

    const currentPrice = activePair.currentPrice;
    const priceRange = maxPrice - minPrice;
    if (priceRange <= 0) return [];

    const candidates: SRLevel[] = [];

    // Approach A: Historical Pivot points (local maxima / minima with window of ±4 candles)
    const win = 4;
    for (let i = win; i < candles.length - win; i++) {
      const currentCandle = candles[i];
      const neighbors = candles.slice(i - win, i + win + 1);
      const neighborHighs = neighbors.map(c => c.high);
      const neighborLows = neighbors.map(c => c.low);

      if (currentCandle.high === Math.max(...neighborHighs)) {
        candidates.push({
          price: currentCandle.high,
          type: currentCandle.high > currentPrice ? 'resistance' : 'support',
          source: 'pivot',
          score: currentCandle.volume,
        });
      }
      if (currentCandle.low === Math.min(...neighborLows)) {
        candidates.push({
          price: currentCandle.low,
          type: currentCandle.low > currentPrice ? 'resistance' : 'support',
          source: 'pivot',
          score: currentCandle.volume,
        });
      }
    }

    // Approach B: Volume Profile Nodes (Volume-at-price accumulation)
    const binsCount = 10;
    const binHeight = priceRange / binsCount;
    const volumeBins = Array.from({ length: binsCount }, (_, idx) => ({
      index: idx,
      start: minPrice + idx * binHeight,
      end: minPrice + (idx + 1) * binHeight,
      volume: 0,
    }));

    candles.forEach((c) => {
      const idx = Math.min(binsCount - 1, Math.floor((c.close - minPrice) / binHeight));
      if (idx >= 0 && idx < binsCount) {
        volumeBins[idx].volume += c.volume;
      }
    });

    // Find peaks of the volume profile
    for (let k = 0; k < binsCount; k++) {
      const currV = volumeBins[k].volume;
      const prevV = k > 0 ? volumeBins[k - 1].volume : 0;
      const nextV = k < binsCount - 1 ? volumeBins[k + 1].volume : 0;

      if (currV > prevV && currV > nextV && currV > 0) {
        const midPrice = volumeBins[k].start + binHeight / 2;
        candidates.push({
          price: midPrice,
          type: midPrice > currentPrice ? 'resistance' : 'support',
          source: 'volume',
          score: currV * 0.95, // Prioritize heavy concentrated volume nodes
        });
      }
    }

    // Segregate candidates into supports and resistances
    const supports = candidates
      .filter((l) => l.price < currentPrice)
      .sort((a, b) => b.score - a.score);

    const resistances = candidates
      .filter((l) => l.price > currentPrice)
      .sort((a, b) => b.score - a.score);

    // Dynamic clean consolidation - merge values that are closer than 3.5% of total price range
    const mergeThreshold = priceRange * 0.035;

    const consolidateLevels = (levelsList: SRLevel[], labelType: 'support' | 'resistance') => {
      const finalGroup: SRLevel[] = [];
      for (const item of levelsList) {
        const isTooClose = finalGroup.some(
          (existing) => Math.abs(existing.price - item.price) < mergeThreshold
        );
        if (!isTooClose) {
          finalGroup.push({
            ...item,
            type: labelType, // ensure correct labeled type
          });
        }
        if (finalGroup.length >= 2) break; // Maximum 2 levels per type for visual simplicity and clean layout
      }
      return finalGroup;
    };

    const finalSupports = consolidateLevels(supports, 'support');
    const finalResistances = consolidateLevels(resistances, 'resistance');

    return [...finalSupports, ...finalResistances];
  }, [candles, activePair.currentPrice, minPrice, maxPrice]);

  // Coordinate conversion functions
  const getX = (index: number) => {
    if (candles.length <= 1) return paddingX + chartWidth / 2;
    // Stretch from left to right
    return paddingX + (index * chartWidth) / (candles.length - 1);
  };

  const getY = (price: number) => {
    const range = maxPrice - minPrice;
    if (range === 0) return paddingY + chartHeight / 2;
    // Invert Y because SVG coordinates go down
    return paddingY + chartHeight - ((price - minPrice) * chartHeight) / range;
  };

  const getVolHeight = (volume: number) => {
    // Vol takes up bottom 25% of grid
    const targetHeight = chartHeight * 0.22;
    return (volume / maxVolume) * targetHeight;
  };

  // Build grid price markers
  const gridLinesCount = 5;
  const gridLinePrices: number[] = [];
  for (let s = 0; s < gridLinesCount; s++) {
    gridLinePrices.push(minPrice + (s * (maxPrice - minPrice)) / (gridLinesCount - 1));
  }

  // Active hover calculations
  const [crosshair, setCrosshair] = useState<{ x: number; y: number } | null>(null);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xCoord = e.clientX - rect.left;
    const yCoord = e.clientY - rect.top;

    if (xCoord >= paddingX && xCoord <= dimensions.width - paddingX) {
      setCrosshair({ x: xCoord, y: yCoord });

      // Find closest candle index
      const fraction = (xCoord - paddingX) / chartWidth;
      const index = Math.round(fraction * (candles.length - 1));
      if (index >= 0 && index < candles.length) {
        setHoveredCandle(candles[index]);
      }
    } else {
      setCrosshair(null);
    }
  };

  const handleMouseLeave = () => {
    setCrosshair(null);
  };

  const activeCandle = hoveredCandle || candles[candles.length - 1];

  // High contrast color mappings optimized for low-light trading
  const gridLineColor = isHighContrast ? '#334155' : '#1e293b'; 
  const vertLineColor = isHighContrast ? '#111827' : '#0f172a';
  const labelColor = isHighContrast ? '#e2e8f0' : '#64748b'; // slate-200 (much higher contrast) vs slate-500
  const labelSize = isHighContrast ? 11 : 10;
  const labelWeight = isHighContrast ? 'bold' : 'normal';

  // Neon vivid green & magenta for absolute low-light extreme precision
  const bullColor = isHighContrast ? '#00ff88' : '#10b981'; 
  const bearColor = isHighContrast ? '#ff0055' : '#f43f5e';
  
  // Volume bar fills
  const volBullColor = isHighContrast ? '#00ff88' : '#059669';
  const volBearColor = isHighContrast ? '#ff0055' : '#e11d48';
  const volOpacity = isHighContrast ? 0.4 : 0.25;

  // Custom moving average
  const emaStroke = isHighContrast ? '#00e5ff' : '#6366f1'; // electric cyan vs indigo-500
  const emaWidth = isHighContrast ? 2.2 : 1.8;

  // Crosshairs
  const crosshairColor = isHighContrast ? '#cbd5e1' : '#475569';
  const crosshairDotFill = isHighContrast ? '#00ff88' : '#10b981';

  return (
    <div className={`border rounded-xl p-5 shadow-lg relative flex flex-col h-full transition-all duration-300 ${
      isHighContrast ? 'bg-black border-slate-700' : 'bg-slate-900 border-slate-800'
    }`} id="trading-chart-wrapper">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <ChartBar className={`w-5 h-5 transition-colors ${isHighContrast ? 'text-amber-400' : 'text-emerald-400'}`} />
          <div>
            <h3 className="text-sm font-semibold text-slate-200 font-mono flex items-center gap-2">
              <span>{activePair.symbol} {lang === 'ar' ? 'الرسم البياني المباشر' : 'Interactive Chart'}<span></span></span>
              <span className="text-[9.5px] bg-emerald-950/80 text-emerald-400 font-mono px-1.5 py-0.5 rounded border border-emerald-900/40 font-black animate-pulse flex items-center gap-1 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shrink-0" />
                <span>{lang === 'ar' ? 'بينانس مباشر' : 'BINANCE LIVE'}</span>
              </span>
              {isHighContrast && (
                <span className="text-[9px] bg-amber-950 text-amber-400 font-mono px-1.5 py-0.5 rounded border border-amber-900 font-extrabold tracking-tight">
                  {lang === 'ar' ? 'سطوع مخصص' : 'HIGH CONTRAST'}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'ar' 
                ? 'مؤشر EMA وشموع يابانية تفاعلية بحجم التداول' 
                : 'Bespoke high-fidelity professional charting engine'}
            </p>
          </div>
        </div>

        {/* Floating EMA Toggle & Period Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsHighContrast(!isHighContrast)}
            className={`px-2.5 py-1 text-xs rounded-md border font-medium transition flex items-center gap-1 cursor-pointer select-none ${
              isHighContrast 
                ? 'bg-amber-950/50 text-amber-400 border-amber-800 shadow-[0_0_10px_rgba(245,158,11,0.25)] font-bold' 
                : 'bg-slate-850 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title={lang === 'ar' ? 'تباين عالي للإضاءة المنخفضة' : 'High Contrast low-light mode'}
          >
            <Contrast className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'تباين عالي' : 'High Contrast'}</span>
          </button>

          <button
            onClick={() => setShowEma(!showEma)}
            className={`px-2.5 py-1 text-xs rounded-md border font-medium transition cursor-pointer select-none ${
              showEma 
                ? 'bg-indigo-950/50 text-indigo-400 border-indigo-800' 
                : 'bg-slate-850 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {lang === 'ar' ? 'مؤشر EMA (9)' : 'EMA (9) Overlay'}
          </button>

          <button
            onClick={() => setShowSrLevels(!showSrLevels)}
            className={`px-2.5 py-1 text-xs rounded-md border font-medium transition flex items-center gap-1 cursor-pointer select-none ${
              showSrLevels 
                ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800 shadow-[0_0_8px_rgba(16,185,129,0.15)] font-bold' 
                : 'bg-slate-850 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'مستويات الدعم والمقاومة' : 'Support/Resistance'}</span>
          </button>
          
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            {['1m', '15m', '1h', '4h', '1D'].map((t) => (
              <button
                key={t}
                onClick={() => setInterval(t)}
                className={`px-3 py-1 text-xs rounded-md font-mono font-bold transition-all cursor-pointer ${
                  interval === t
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic OHLC Bar */}
      {activeCandle && (
        <div className={`grid grid-cols-2 sm:grid-cols-5 gap-y-2 gap-x-4 border rounded-lg px-4 py-2 text-xs font-mono mb-4 transition-colors duration-300 ${
          isHighContrast 
            ? 'bg-black border-slate-700 text-slate-100' 
            : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
        } ${
          lang === 'ar' ? 'text-right' : 'text-left'
        }`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div>
            <span className="text-slate-500 font-sans block text-[10px]">{lang === 'ar' ? 'تاريخ الشمعة' : 'Candle Date'}</span>
            <span className="text-slate-200 font-semibold">{activeCandle.time}</span>
          </div>
          <div>
            <span className="text-slate-500 font-sans block text-[10px]">{lang === 'ar' ? 'الافتتاح (Open)' : 'Open Point'}</span>
            <span className="text-slate-100 font-semibold">${activeCandle.open.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500 font-sans block text-[10px]">{lang === 'ar' ? 'الأعلى (High)' : 'High Point'}</span>
            <span className={`${isHighContrast ? 'text-[#00ff88]' : 'text-emerald-400'} font-semibold`}>${activeCandle.high.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500 font-sans block text-[10px]">{lang === 'ar' ? 'الأدنى (Low)' : 'Low Point'}</span>
            <span className={`${isHighContrast ? 'text-[#ff0055]' : 'text-rose-450'} font-semibold`}>${activeCandle.low.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500 font-sans block text-[10px]">{lang === 'ar' ? 'الإغلاق (Close)' : 'Close Point'}</span>
            <span className={`font-semibold ${activeCandle.close >= activeCandle.open ? (isHighContrast ? 'text-[#00ff88]' : 'text-emerald-400') : (isHighContrast ? 'text-[#ff0055]' : 'text-rose-405')}`}>
              ${activeCandle.close.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Main SVG Plotting Area */}
      <div 
        ref={containerRef} 
        className={`flex-1 w-full min-h-[300px] rounded-lg relative overflow-hidden border transition-colors duration-300 ${
          isHighContrast ? 'bg-black border-slate-700' : 'bg-slate-950 border-slate-850'
        }`}
      >
        {candles.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs font-medium">
            {lang === 'ar' ? 'جاري تحميل بيانات الشموع...' : 'Simulating exchange candle feed...'}
          </div>
        ) : (
          <svg
            width={dimensions.width}
            height={dimensions.height}
            className="absolute inset-0 cursor-crosshair select-none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            id="candlestick-svg"
          >
            {/* Draw Horizontal Grid Lines */}
            {gridLinePrices.map((price, idx) => {
              const yVal = getY(price);
              return (
                <g key={idx}>
                  <line
                    x1={paddingX}
                    y1={yVal}
                    x2={dimensions.width - paddingX}
                    y2={yVal}
                    stroke={gridLineColor}
                    strokeWidth={1}
                    strokeDasharray={isHighContrast ? "1 2" : "2 3"}
                  />
                  {/* Price Axis Labels on the Left side or Right based on Language */}
                  <text
                    x={lang === 'ar' ? dimensions.width - paddingX + 8 : paddingX - 8}
                    y={yVal + 4}
                    fill={labelColor}
                    fontSize={labelSize}
                    fontWeight={labelWeight}
                    fontFamily="monospace"
                    textAnchor={lang === 'ar' ? 'start' : 'end'}
                  >
                    ${price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  </text>
                </g>
              );
            })}

            {/* Vertical Time Delineators */}
            {candles.map((candle, idx) => {
              if (idx % Math.ceil(candles.length / 5) === 0) {
                const xVal = getX(idx);
                return (
                  <g key={idx}>
                    <line
                      x1={xVal}
                      y1={paddingY}
                      x2={xVal}
                      y2={dimensions.height - paddingY}
                      stroke={vertLineColor}
                      strokeWidth={1}
                    />
                    <text
                      x={xVal}
                      y={dimensions.height - paddingY + 16}
                      fill={labelColor}
                      fontSize={labelSize}
                      fontWeight={labelWeight}
                      textAnchor="middle"
                    >
                      {candle.time}
                    </text>
                  </g>
                );
              }
              return null;
            })}

            {/* Draw Simulated Volumes */}
            {candles.map((candle, idx) => {
              const xVal = getX(idx);
              const volH = getVolHeight(candle.volume);
              const barW = Math.max(1, (chartWidth / candles.length) * 0.75);
              const color = candle.close >= candle.open ? volBullColor : volBearColor;
              return (
                <rect
                  key={`vol-${idx}`}
                  x={xVal - barW / 2}
                  y={dimensions.height - paddingY - volH}
                  width={barW}
                  height={volH}
                  fill={color}
                  fillOpacity={volOpacity}
                />
              );
            })}

            {/* Draw Candlesticks */}
            {candles.map((candle, idx) => {
              const xVal = getX(idx);
              const yOpen = getY(candle.open);
              const yClose = getY(candle.close);
              const yHigh = getY(candle.high);
              const yLow = getY(candle.low);
              const candleW = Math.max(2, (chartWidth / candles.length) * 0.65);
              const isBullish = candle.close >= candle.open;
              const color = isBullish ? bullColor : bearColor;

              return (
                <g key={`candle-${idx}`}>
                  {/* Candlestick shadow wick line */}
                  <line
                    x1={xVal}
                    y1={yHigh}
                    x2={xVal}
                    y2={yLow}
                    stroke={color}
                    strokeWidth={isHighContrast ? 1.8 : 1.5}
                  />
                  {/* Candlestick fat main body rect */}
                  <rect
                    x={xVal - candleW / 2}
                    y={Math.min(yOpen, yClose)}
                    width={candleW}
                    height={Math.max(1, Math.abs(yOpen - yClose))}
                    fill={color}
                    rx={0.5}
                  />
                </g>
              );
            })}

            {/* Support & Resistance Levels Overlay Lines */}
            {showSrLevels && srLevels.map((level, idx) => {
              const yVal = getY(level.price);
              // Avoid rendering out-of-range lines
              if (yVal < paddingY || yVal > dimensions.height - paddingY) return null;

              const isResist = level.type === 'resistance';
              const color = isResist ? bearColor : bullColor;

              // Text translation content
              let labelText = '';
              if (lang === 'ar') {
                const srcName = level.source === 'volume' ? 'حجم' : 'محوري';
                labelText = `${isResist ? 'مقاومة' : 'دعم'} (${srcName}): $${level.price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
              } else {
                const srcName = level.source === 'volume' ? 'Vol Node' : 'Pivot';
                labelText = `${isResist ? 'R' : 'S'} (${srcName}): $${level.price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
              }

              // Inside grid padding of 8px
              const textX = lang === 'ar' ? paddingX + 8 : dimensions.width - paddingX - 8;
              const anchor = lang === 'ar' ? 'start' : 'end';

              return (
                <g key={`sr-level-${idx}`} className="transition-opacity duration-300">
                  {/* Glowing background line under high contrast */}
                  {isHighContrast && (
                    <line
                      x1={paddingX}
                      y1={yVal}
                      x2={dimensions.width - paddingX}
                      y2={yVal}
                      stroke={color}
                      strokeWidth={3}
                      strokeOpacity={0.15}
                    />
                  )}
                  {/* Clean Dashed Level Trace */}
                  <line
                    x1={paddingX}
                    y1={yVal}
                    x2={dimensions.width - paddingX}
                    y2={yVal}
                    stroke={color}
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                    strokeOpacity={0.85}
                  />
                  
                  {/* Text Badge background rectangle for professional look */}
                  <rect
                    x={lang === 'ar' ? paddingX + 4 : dimensions.width - paddingX - 164}
                    y={yVal - 8}
                    width={160}
                    height={16}
                    fill={isResist ? 'rgba(30, 15, 15, 0.85)' : 'rgba(15, 30, 20, 0.85)'}
                    stroke={color}
                    strokeWidth={0.5}
                    strokeOpacity={0.5}
                    rx={3}
                  />

                  {/* Text Label Badge */}
                  <text
                    x={textX}
                    y={yVal + 3}
                    fill={color}
                    fontSize={10}
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor={anchor}
                  >
                    {labelText}
                  </text>
                </g>
              );
            })}

            {/* EMA Indicator Curve Line Overlay */}
            {showEma && emaData.length > 0 && (
              <path
                d={candles.map((_, idx) => {
                  const xVal = getX(idx);
                  const yVal = getY(emaData[idx]);
                  return `${idx === 0 ? 'M' : 'L'} ${xVal} ${yVal}`;
                }).join(' ')}
                fill="none"
                stroke={emaStroke} 
                strokeWidth={emaWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Coordinates Crosshair Lines */}
            {crosshair && (
              <g>
                {/* Horizontal hover tracking line */}
                <line
                  x1={paddingX}
                  y1={crosshair.y}
                  x2={dimensions.width - paddingX}
                  y2={crosshair.y}
                  stroke={crosshairColor}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
                {/* Vertical hover tracking line */}
                <line
                  x1={crosshair.x}
                  y1={paddingY}
                  x2={crosshair.x}
                  y2={dimensions.height - paddingY}
                  stroke={crosshairColor}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
                {/* Active circle marker */}
                <circle
                  cx={crosshair.x}
                  cy={crosshair.y}
                  r={isHighContrast ? 5 : 4}
                  fill={crosshairDotFill}
                  stroke={isHighContrast ? '#000000' : '#ffffff'}
                  strokeWidth={1.5}
                />
              </g>
            )}
          </svg>
        )}
      </div>
    </div>
  );
}
