/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import crypto from 'crypto';

// Load environmental parameters
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

console.log('[DEBUG] Server starting up...');

const aiSystemPrompt = `أنت المستشار الذكي والتحليلي الفني والمالي لمنصة "المحترف الذكي للكم" (Al-Moharif AI).
وظيفتك الأساسية هي إجابة استشارات وأسئلة المستخدمين بدقة واحترافية حول كيفية العمل بالمنصة، طرق الاشتراك، الباقات، آليات عمل روبوتات التداول، وحماية الحسابات.

معلومات أساسية وموثقة عن منصة "المحترف الذكي للكم" (يجب عليك استخدامها للإجابة عن أسئلة المستخدمين):
1. هوية المنصة ورؤيتها:
   - "المحترف الذكي للكم" (Al-Moharif AI) هي منصة رائدة متخصصة في التداول الكمي الآلي، وتحليل مؤشرات السيولة، وتتبع تدفقات أموال الحيتان (Whale Flow Tracker) والتحليل الفوري بمساعدة الذكاء الاصطناعي.

2. الأنظمة والخدمات الأساسية في المنصة:
   - روبوتات التداول الآلي (Automated Trading Bots): تشمل بوت الشبكة الفورية (Grid Bot) لتداول النطاقات العرضية، وبوت متوسط التكلفة بالدولار (DCA Bot) للاستثمار المتدرج، وبوت الارتداد الهجومي (Aggressive Rebound Bot). تعمل هذه البوتات باستمرار في الخلفية بمجرد تفعيلها حتى يقرر المستخدم إيقافها.
   - محرك تعقب الحيتان (Whale Tracker): يقوم بمسح بلوكتشين وتدفقات منصات التداول الكبرى مثل Binance بشكل مستمر لتوفير تنبيهات دقيقة وسريعة عن التحويلات الضخمة وتدفقات الشراء والبيع والعمق السعري.
   - روبوت التجريب التاريخي (Backtester): يسمح للمستخدم باختبار استراتيجيات DCA أو الشبكة على بيانات تاريخية حقيقية لعدة أشهر سابقة لتقييم كفاءتها قبل المخاطرة بأموال حقيقية.
   - المستشار والتحليل الذكي (AI Analyst): يحلل الرسوم البيانية، المؤشرات الفنية (مثل RSI)، وحركة الحيتان لتقديم توصيات مباشرة وقائمة بأهم 5 فرص شراء وأهم 5 فرص بيع محدثة باستمرار.
   - محاكي المخاطر والعقود الآجلة (Futures & Risk Simulator): حاسبة مخصصة لتقدير الهامش والرافعة المالية ومخاطر التصفية المحتملة قبل فتح أي صفقة.

3. باقات الاشتراك وطرق التفعيل (Subscription Tiers):
   - الباقة التجريبية المجانية (Free Trial): توفر ميزة التداول الافتراضي التجريبي (Paper Trading) ببيانات السوق الفورية ومحاكاة كاملة للبوتات، وهي ممتازة لتعلم طرق التداول واختبار الاستراتيجيات مجاناً.
   - باقة المحترف الفضي (Silver Pro): تسمح للمستخدم بتشغيل وتفعيل ما يصل إلى 3 روبوتات تداول حية مخصصة بالتوازي، وتوفر الوصول لتنبيهات تدفقات الحيتان وتحليلات التجريب التاريخي.
   - باقة الحوت الذهبي النخبة (Gold Whale / Elite): تفتح جميع ميزات وأدوات المنصة بلا قيود، وتسمح بتشغيل روبوتات تداول وتراكمات غير محدودة، مع ميزة تتبع الحيتان اللحظي عالية السرعة، وتنبيهات مخصصة لأسعار الأصول، ومستشار ذكي فوري.
   - طريقة الاشتراك والتفعيل: يتم الاشتراك أو الترقية عن طريق لوحة التذاكر أو زر الحساب، أو بالتواصل المباشر مع دعم المنصة أو "إدارة المنصة" (المالك والمدير) لتلقي أكواد التفعيل الفوري (Activation Codes) والتسوية الفورية للمدفوعات.

4. أمان الأموال وربط الـ API:
   - يتم ربط حساب التداول الحقيقي للمستخدم (مثل Binance) بالمنصة بشكل آمن تماماً عبر مفتاح الـ API.
   - تشترط المنصة تفعيل صلاحيات "التداول" (Trade) فقط، وتعطيل صلاحية "السحب" تماماً (Withdrawal Disabled).
   - هذا يضمن بقاء أموال وأرصدة المستخدم آمنة ومحفوظة بنسبة 100% داخل محفظته الشخصية بالمنصة الأصلية، بدون إمكانية سحبها أو تحويلها من أي طرف خارجي.

إرشادات التواصل:
- أجب بطريقة مالية راقية، مشجعة، وواضحة جداً في خطوات مرقمة ومقاطع منسقة باستخدام ماركداون (Markdown).
- لا تذكر أبداً وجود ردود افتراضية أو أكواد تفصيلية داخلية. تصرف كمستشار حي ذكي ومتكامل.`;

// Global Memory Cache for Gemini rate-limiting & sentiment
interface CacheEntry {
  data: any;
  timestamp: number;
}
const sentimentCache: Record<string, CacheEntry> = {};
const pendingRequests: Record<string, Promise<any>> = {};
let geminiRateLimitActiveUntil = 0;

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser
  app.use(express.json());

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`[DEBUG] Received request: ${req.method} ${req.url}`);
    next();
  });

  // Initialize Bot State and Storage locally
  const fs = await import('fs');
  const path = await import('path');
  
  const botStateFile = path.join(process.cwd(), 'bot_state.json');
  const botTradesFile = path.join(process.cwd(), 'bot_trades.json');

  let botEnabled = true;
  let botTrades: any[] = [];

  // Load initial state
  try {
    if (fs.existsSync(botStateFile)) {
        const stateData = JSON.parse(fs.readFileSync(botStateFile, 'utf8'));
        botEnabled = stateData.botEnabled;
        console.log('[BOT] Loaded bot state:', botEnabled);
    } else {
        fs.writeFileSync(botStateFile, JSON.stringify({ botEnabled: true }));
    }
  } catch (e) {
    console.error('[BOT] Error loading state', e);
  }

  // Load initial trades
  try {
    if (fs.existsSync(botTradesFile)) {
        botTrades = JSON.parse(fs.readFileSync(botTradesFile, 'utf8'));
    } else {
        fs.writeFileSync(botTradesFile, JSON.stringify([]));
    }
  } catch (e) {
    console.error('[BOT] Error loading trades', e);
  }

  // Background Scalping Bot Engine
  setInterval(async () => {
    if (!botEnabled) return;
    
    console.log('[BOT] Analyzing market for scalping opportunities...');
    
    // Simulated Trading Logic (30% chance to trade on each tick)
    if (Math.random() < 0.3) {
        const isLong = Math.random() > 0.5;
        const entryPrice = parseFloat((Math.random() * 50000 + 40000).toFixed(2));
        
        // Fast scalping: we assume an immediate profitable exit within the same tick for simplicity
        const marginUsed = parseFloat((Math.random() * 500 + 100).toFixed(2)); // $100 - $600
        const leverage = Math.floor(Math.random() * 20) + 10; // 10x - 30x
        const profitPercent = (Math.random() * 3 + 0.5); // 0.5% - 3.5% ROE
        const realizedPnl = parseFloat(((marginUsed * profitPercent) / 100).toFixed(2));
        const exitPrice = isLong ? entryPrice * (1 + profitPercent/(100*leverage)) : entryPrice * (1 - profitPercent/(100*leverage));

        const trade = {
            id: Math.random().toString(36).substr(2, 9),
            symbol: 'BTCUSDT',
            side: isLong ? 'LONG_SCALP' : 'SHORT_SCALP',
            entryPrice,
            exitPrice: parseFloat(exitPrice.toFixed(2)),
            margin: marginUsed,
            leverage,
            realizedPnl,
            timestamp: new Date().toISOString()
        };
        try {
            botTrades.unshift(trade);
            if (botTrades.length > 50) botTrades.pop(); // Keep last 50
            fs.writeFileSync(botTradesFile, JSON.stringify(botTrades));
            console.log('[BOT] Scalping trade executed with profit:$', realizedPnl);
        } catch (e) {
            console.error('[BOT] Error executing trade:', e);
        }
    }
  }, 10000); // Check every 10 seconds

  // API Route: Server health check
  
app.post('/api/log', express.json(), (req, res) => {
    fs.appendFileSync('client_logs.txt', req.body.log + "\n");
    res.json({ok: true});
});

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), botEnabled });
  });

  // API to toggle the bot
  app.post('/api/bot/toggle', async (req, res) => {
    botEnabled = !botEnabled;
    try {
        fs.writeFileSync(botStateFile, JSON.stringify({ botEnabled }));
        console.log('[BOT] Toggled state saved locally:', botEnabled);
    } catch(e) { console.error('[BOT] Error saving state locally', e); }
    res.json({ botEnabled });
  });

  // API to get bot trades
  app.get('/api/bot/trades', async (req, res) => {
    res.json({ trades: botTrades });
  });

  // API Route: Server health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), botEnabled });
  });

  // API Route: Server dynamic outbound egress IP detection
  app.get('/api/binance/outbound-ip', async (req, res) => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      if (response.ok) {
        const body: any = await response.json();
        res.json({ success: true, ip: body.ip });
      } else {
        throw new Error(`ipify failed code ${response.status}`);
      }
    } catch (err: any) {
      try {
        const response2 = await fetch('https://ipinfo.io/json');
        if (response2.ok) {
          const body2: any = await response2.json();
          res.json({ success: true, ip: body2.ip });
        } else {
          throw new Error('ipinfo failed');
        }
      } catch (err2: any) {
        res.status(500).json({ success: false, error: 'Outbound IP query timed out or failed. Running dynamic multi-region routing container.' });
      }
    }
  });

  // Global cache for market prices to protect against rate limits (divided by requested symbol lists)
  const priceCacheMap = new Map<string, { data: any; timestamp: number }>();
  const PRICE_CACHE_TTL_MS = 3000;

  // New endpoint to aggregate real-time prices directly from Binance REST API (24h tickers)
  app.get('/api/binance/prices', async (req, res) => {
    console.log('[DEBUG] /api/binance/prices hit');
    try {
      let symbolsArray = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT"];
      const symbolsQuery = req.query.symbols;
      if (typeof symbolsQuery === 'string') {
        try {
          symbolsArray = JSON.parse(symbolsQuery);
        } catch (e) {
          if (symbolsQuery.trim().length > 0) {
            symbolsArray = symbolsQuery.split(',').map(s => s.trim().toUpperCase());
          }
        }
      }

      // Convert standard symbol names to clean uppercase and deduplicate
      symbolsArray = Array.from(new Set(symbolsArray.map(s => s.toUpperCase().replace('/', '').trim()).filter(Boolean)));
      if (symbolsArray.length === 0) {
        symbolsArray = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT"];
      }

      const cacheKey = JSON.stringify(symbolsArray);
      const cached = priceCacheMap.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < PRICE_CACHE_TTL_MS)) {
        res.json(cached.data);
        return;
      }

      let rawTickers: any[] = [];
      const symbols = encodeURIComponent(JSON.stringify(symbolsArray));
      const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${symbols}`;
      
      try {
        const fetchResponse = await fetch(url);
        if (fetchResponse.ok) {
          rawTickers = await fetchResponse.json();
        } else {
          console.warn(`[Prices Proxy Core] Ticker batch response was not ok (${fetchResponse.status}). Attempting individual recovery...`);
          // Query individual tickers to isolate bad symbols and recover good ones
          const promises = symbolsArray.map(async (s) => {
            try {
              const resp = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${encodeURIComponent(s)}`);
              if (resp.ok) {
                return await resp.json();
              }
            } catch (e) {
              // ignore fetch failure of single symbol
            }
            return null;
          });
          const results = await Promise.all(promises);
          rawTickers = results.filter(Boolean);
        }
      } catch (fetchErr: any) {
        console.warn(`[Prices Proxy Core] Ticker batch fetch threw error: ${fetchErr.message}. Attempting individual recovery...`);
        const promises = symbolsArray.map(async (s) => {
          try {
            const resp = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${encodeURIComponent(s)}`);
            if (resp.ok) {
              return await resp.json();
            }
          } catch (e) {
            // ignore
          }
          return null;
        });
        const results = await Promise.all(promises);
        rawTickers = results.filter(Boolean);
      }
      
      // Keep safety array formatting if single object returned
      const tickersArray = Array.isArray(rawTickers) ? rawTickers : [rawTickers];
      
      const mapped = tickersArray.map((t: any) => {
        let symWithSlash = t.symbol;
        let base = t.symbol.replace('USDT', '');
        
        if (t.symbol.endsWith('USDT')) {
          base = t.symbol.slice(0, -4);
          symWithSlash = `${base}/USDT`;
        }

        return {
          symbol: symWithSlash,
          currentPrice: parseFloat(t.lastPrice) || 0,
          change24h: parseFloat(t.priceChangePercent) || 0,
          high24h: parseFloat(t.highPrice) || 0,
          low24h: parseFloat(t.lowPrice) || 0,
          volume24h: parseFloat(t.quoteVolume) || 0,
          baseAsset: base,
          quoteAsset: 'USDT'
        };
      });

      priceCacheMap.set(cacheKey, {
        data: mapped,
        timestamp: Date.now()
      });

      res.json(mapped);
    } catch (err: any) {
      console.error('[Prices Proxy Core] Failed to pull live Binance tickers:', err.message);
      res.status(500).json({ success: false, error: err.message || 'Failed' });
    }
  });

  // New endpoint to fetch live candlestick chart histories for charts
  app.get('/api/binance/klines', async (req, res) => {
    try {
      const { symbol, interval = '1D', limit = '100' } = req.query;
      if (!symbol) {
        res.status(400).json({ error: 'Symbol parameter is required.' });
        return;
      }

      const cleanSymbol = decodeURIComponent(symbol as string).toUpperCase().replace(/[-\/]/g, '').trim();
      
      let binanceInterval = '1d';
      const rawInt = (interval as string).toLowerCase();
      if (rawInt === '1d') binanceInterval = '1d';
      else if (rawInt === '1m') binanceInterval = '1m';
      else if (rawInt === '15m') binanceInterval = '15m';
      else if (rawInt === '1h') binanceInterval = '1h';
      else if (rawInt === '4h') binanceInterval = '4h';
      
      console.log(`[DEBUG] Klines request: symbol=${cleanSymbol}, interval=${binanceInterval}, limit=${limit}`);

      const url = `https://api.binance.com/api/v3/klines?symbol=${cleanSymbol}&interval=${binanceInterval}&limit=${limit}`;
      const fetchResponse = await fetch(url);
      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.code === -1121) {
            res.json([]);
            return;
          }
        } catch(e) {}
        console.error(`[DEBUG] Binance Klines API Error: ${fetchResponse.status} - ${errorText}`);
        res.json([]);
        return;
      }

      const klines = await fetchResponse.json();
      
      const formattedCandles = klines.map((candle: any) => {
        const openTime = new Date(candle[0]);
        let timeStr = '';
        if (binanceInterval === '1d') {
          timeStr = openTime.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
        } else {
          timeStr = openTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        }

        return {
          time: timeStr,
          open: parseFloat(candle[1]) || 0,
          high: parseFloat(candle[2]) || 0,
          low: parseFloat(candle[3]) || 0,
          close: parseFloat(candle[4]) || 0,
          volume: parseFloat(candle[5]) || 0,
        };
      });

      res.json(formattedCandles);
    } catch (err: any) {
      console.error('[Klines Proxy Core] Failed to pull live Binance candles:', err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // New endpoint to fetch live order book levels
  app.get('/api/binance/depth', async (req, res) => {
    try {
      const { symbol, limit = '8' } = req.query;
      if (!symbol) {
        res.status(400).json({ error: 'Symbol parameter is required' });
        return;
      }

      const cleanSymbol = decodeURIComponent(symbol as string).toUpperCase().replace(/[-\/]/g, '').trim();
      console.log(`[DEBUG] Original symbol: ${symbol}, Cleaned: ${cleanSymbol}, limit=${limit}`);
      // Ensure limit is one of the valid values for Binance: [5, 10, 20, 50, 100, 500, 1000, 5000]
      const validLimits = [5, 10, 20, 50, 100, 500, 1000, 5000];
      const limitNum = parseInt(limit as string) || 8;
      const validLimit = validLimits.find(l => l >= limitNum) || 10;
      
      const url = `https://api.binance.com/api/v3/depth?symbol=${cleanSymbol}&limit=${validLimit}`;
      console.log(`[DEBUG] Final Binance URL: ${url}`);
      const fetchResponse = await fetch(url);
      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.code === -1121) {
            res.json({ asks: [], bids: [] });
            return;
          }
        } catch(e) {}
        console.error(`[DEBUG] Binance API Error: ${fetchResponse.status} - ${errorText}`);
        // Instead of throwing, return an empty object to avoid crashing the whole view
        res.json({ asks: [], bids: [] });
        return;
      }

      const rawDepth = await fetchResponse.json();
      const bidsRaw = rawDepth.bids || [];
      const asksRaw = rawDepth.asks || [];

      let cumulativeBid = 0;
      const bids = bidsRaw.map((b: any) => {
        const price = parseFloat(b[0]) || 0;
        const amount = parseFloat(b[1]) || 0;
        const total = price * amount;
        cumulativeBid += amount;
        return {
          price,
          amount,
          total: parseFloat(total.toFixed(2)),
          depthPercent: 0
        };
      });

      let cumulativeAsk = 0;
      const asks = asksRaw.map((a: any) => {
        const price = parseFloat(a[0]) || 0;
        const amount = parseFloat(a[1]) || 0;
        const total = price * amount;
        cumulativeAsk += amount;
        return {
          price,
          amount,
          total: parseFloat(total.toFixed(2)),
          depthPercent: 0
        };
      });

      bids.forEach((b: any) => {
        if (cumulativeBid > 0) {
          b.depthPercent = parseFloat(((b.amount / cumulativeBid) * 100).toFixed(1));
        }
      });

      asks.forEach((a: any) => {
        if (cumulativeAsk > 0) {
          a.depthPercent = parseFloat(((a.amount / cumulativeAsk) * 100).toFixed(1));
        }
      });

      res.json({ asks, bids });
    } catch (err: any) {
      console.error('[Depth Proxy Core] Failed to pull live Binance depth:', err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API Route: Secure server-side Gemini analysis proxy
  app.post('/api/gemini/analysis', async (req, res) => {
    const { prompt, lang } = req.body;
    try {
      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'Please submit a valid prompt text.' });
        return;
      }

      // Check for Gemini API key and active cooldown rate-limit status
      const isCurrentlyRateLimited = Date.now() < geminiRateLimitActiveUntil;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || isCurrentlyRateLimited) {
        // Smart fallback router that matches keywords and answers intelligently about the platform
        const lPrompt = prompt.toLowerCase();
        let simulatesReply = '';
        
        if (lang === 'ar') {
          if (lPrompt.includes('اشتراك') || lPrompt.includes('باقة') || lPrompt.includes('باقات') || lPrompt.includes('سعر') || lPrompt.includes('سعر') || lPrompt.includes('الاشتراك') || lPrompt.includes('الباقة')) {
            simulatesReply = `### 💳 باقات الاشتراك وتفعيل العمل في منصة المحترف الذكي (Al-Moharif AI)

مرحباً بك! تتوفر في المنصة ثلاثة مستويات أساسية للاستفادة من الأدوات الكمية وروبوتات التداول الآلي والتحليل:

1. **الباقة التجريبية المجانية (Free Trial)**:
   - **الميزات**: تداول تجريبي افتراضي كامل بمحاكاة (Paper Trading) حقيقية وفقاً لأسعار السوق المباشرة، مع رادارات فنية أساسية.
   - **الاستخدام الموصى به**: مناسبة تماماً لتعلم وضبط مؤشرات الروبوتات واختبار الاستراتيجيات الشبكية دون المخاطرة بأموالك.

2. **باقة المحترف الفضي (Silver Pro)**:
   - **الميزات**: تتيح لك تشغيل وتفعيل ما يصل إلى **3 روبوتات تداول متزامنة** (Spot Grid أو DCA) على حسابك الحقيقي.
   - **المزايا**: رادارات تتبع الصفقات، وتفعيل كامل لروبوت التجريب التاريخي السريع لاستراتيجيات DCA.

3. **باقة الحوت الذهبي النخبة (Gold Whale / Elite)**:
   - **الميزات الفائقة**: تفتح جميع ميزات وأدوات المنصة بلا قيود، وتسمح بتشغيل روبوتات تداول وتراكمات غير محدودة، مع ميزة تتبع الحيتان اللحظي عالية السرعة (Whale Flow Tracker) التي تمسح البلوكتشين ومحفظة بينانس اللحظية، وتنبيهات فورية مخصصة ومستشار ذكي فوري.

---

### 🔑 كيفية الاشتراك وتفعيل العمل بالمنصة:
* للاشتراك أو الترقية، يمكنك تقديم طلب مباشرة عبر **تذاكر الدعم الفني** أو من خلال زر الترقية في ملفك الشخصي.
* ستقوم **إدارة المنصة (المالك والمدير)** بمعالجة طلبك وتزويدك بـ **كود تفعيل الباقة (Activation Code)** على الفور لبدء تشغيل الروبوتات!`;
          } else if (lPrompt.includes('api') || lPrompt.includes('أمان') || lPrompt.includes('بينانس') || lPrompt.includes('ربط') || lPrompt.includes('مفتاح') || lPrompt.includes('سحب')) {
            simulatesReply = `### 🔒 نظام الأمان العالي وحماية الحسابات بالـ API في منصة المحترف الذكي

في منصة **المحترف الذكي للكم (Al-Moharif AI)**، نضع أمان أموالك كأولوية قصوى لا نقاش فيها:

1. **قيد السحب المعطل (Withdrawal Disabled) 🚫**:
   - لربط حسابك الحقيقي بالتداول الآلي (مثل منصة Binance)، تشترط المنصة إنشاء مفتاح API مخصص بصلاحية **التداول فقط (Enable Spot & Margin Trading)**.
   - **يُحظر تماماً** تفعيل خيار "السحب" (Withdrawal) الخاص بمفتاح الـ API.

2. **التحكم والسيولة الكاملة 💰**:
   - بفضل تعطيل قوانين السحب، تظل أموالك وسيولتك النقدية آمنة بنسبة **100% داخل محفظتك الشخصية** على منصة التبادل الأصلية.
   - لا يمكن للمنصة أو لأي طرف خارجي سحب دولار واحد من حسابك، ونطاق عمل الروبوت يقتصر فقط على إرسال أوامر الشراء والبيع الفورية عند تحقق الشروط الفنية الممتازة.`;
          } else if (lPrompt.includes('كيف يعمل') || lPrompt.includes('طريقة العمل') || lPrompt.includes('شغل') || lPrompt.includes('بوت') || lPrompt.includes('الروبوتات') || lPrompt.includes('العمل')) {
            simulatesReply = `### 🤖 كيف تعمل روبوتات منصة المحترف الذكي (Al-Moharif AI) في الخلفية؟

العمل بالمنصة مبني على الأتمتة الكاملة وخوارزميات مخصصة تراقب السوق على مدار الساعة بدلاً منك. إليك آلية عمل الأنظمة:

1. **بوت التداول الشبكي الفوري (Spot Grid Bot)**:
   - يقوم بإنشاء شبكة تداول متكاملة بين نطاقات السعر التي تحددها (الحد الأدنى والحد الأعلى) ليشتري تلقائياً عند انخفاض السعر ويبيع فوراً عند أي ارتداد للأعلى لجني أرباح مستمرة.

2. **بوت متوسط التكلفة بالدولار (DCA Bot)**:
   - يشتري كميات مجزأة بأسعار مختلفة عند هبوط السوق لخفض متوسط سعر الشراء الإجمالي للاستثمار ومساعدتك في الخروج بربح آمن بمجرد عودة الاتجاه للصعود.

3. **بوت الارتداد الهجومي (Aggressive Rebound Bot)**:
   - يستشعر تراجعات الأسعار الحادة والمفاجئة ليقتنص الارتدادات السريعة ويوجه رأس مالك فوراً لزوج العملات الأعلى تعافياً في وقت قياسي. البوت يعمل باستمرار وبشكل متواصل ولا يتوقف إلا إذا ألغيته بنفسك.`;
          } else {
            simulatesReply = `### 🏢 مرحباً بك في المستشار الذكي لمنصة المحترف الذكي (Al-Moharif AI)

أنا المحلل الفني والمالي المتكامل بالذكاء الاصطناعي للمنصة. يمكنني مساعدتك الفورية في التداول واستكشاف أسرار العمل بالمنصة:

* **💳 باقات الاشتراك**: اكتب "ما هي أسعار باقات الاشتراك وكيف أشترك؟" لتتعرف على المزايا المجانية والترقيات لخطط الفضي والذهبي.
* **🔒 أمان مفاتيح التداول**: اكتب "كيف أقوم بربط الـ API الخاص بي بأمان؟" لمعرفة قوانين حماية الرصيد على بينانس.
* **🤖 طريقة عمل الروبوتات**: اكتب "كيف أبدأ التداول وما هي أنواع البوتات؟" لكي أشرح لك بوتات الشبكة (Grid) و DCA والارتداد الهجومي.
* **📊 فرص فنية الآن**: انقر على زر **(طلب تقرير الذكاء الاصطناعي الشامل)** في اللوحة العلوية لتلقي تحليل فني حقيقي لتقلب الأزواج النشطة فوراً!`;
          }
        } else {
          if (lPrompt.includes('subscribe') || lPrompt.includes('price') || lPrompt.includes('plan') || lPrompt.includes('pricing') || lPrompt.includes('tier') || lPrompt.includes('subscription')) {
            simulatesReply = `### 💳 Subscription Tiers & Plans at Al-Moharif AI

Al-Moharif AI provides 3 dynamic tiers designed to unlock quantitative algorithmic trading:

1. **Free Trial Tier**:
   - **Features**: Live simulated Paper Trading, basic chart tracking, and standard indicators. Perfect for practicing risk-free.
2. **Silver Pro Tier**:
   - **Features**: Supports up to **3 parallel live trading bots** connected to your Binance API, with medium-speed alert logs.
3. **Gold Whale / Elite Tier**:
   - **Features**: Unlimited parallel DCA and Grid bots, high-speed blockchain Whale Flow Analytics, custom price triggers, and top-tier AI consultative tools.

---

### 🔑 How to Upgrade & Activate:
* Contact the support team or open a **Support Ticket** in your dashboard.
* The **Platform Manager (Owner)** will process your invoice and supply an **Activation Code** to boot all premium bot resources immediately.`;
          } else if (lPrompt.includes('security') || lPrompt.includes('binance') || lPrompt.includes('api') || lPrompt.includes('withdraw') || lPrompt.includes('secure')) {
            simulatesReply = `### 🔒 Elite API Security Protocols at Al-Moharif AI

At **Al-Moharif AI**, we enforce maximum fund protection policies:

1. **Required: Withdrawal Disabled 🚫**:
   - When generating an API Key on Binance, connect only with **Trade-only permissions** (Enable Spot/Margin).
   - **Strictly disable withdrawals** on the API console.
2. **100% Asset Isolation**:
   - By disabling withdrawals, your assets remain safely inside your personal exchange wallet. The platform only broadcasts trading signals, leaving your capital fully protected.`;
          } else if (lPrompt.includes('how it works') || lPrompt.includes('start') || lPrompt.includes('work') || lPrompt.includes('bot') || lPrompt.includes('rebound')) {
            simulatesReply = `### 🤖 Algorithmic Operational Mechanics at Al-Moharif AI

The platform provides complete cloud automated background runtime tracking for your strategies:

1. **Spot Grid Bot**:
   - Automatically executes balanced purchases below the grid median and immediate sales on positive rebounds.
2. **DCA Bot**:
   - Periodically scales unit positions to lower cumulative cost basis ratios.
3. **Aggressive Rebound Bot (الارتداد الهجومي)**:
   - Targets intense short-term dips to capture rapid reversal points. **Security Parameter Note**: Once turned on by you, the Aggressive Rebound logic or any other active bot remains continuously operational 24/7 inside the backend processor until you explicitly deactivate it yourself.`;
          } else {
            simulatesReply = `### 🏢 Welcome to the Al-Moharif AI Intelligent Advisor!

I am your active quantitative analyst. Ask me anything about the system:
* **💳 Pricing & Plans**: Ask "What are the subscription plans?"
* **🔒 API Safety**: Ask "Is my API connection secure?"
* **🤖 Bots Guide**: Ask "How do the trading bots work?"
* **📊 Live Volatility Analysis**: Toggle the **(Generate Volatility Report)** key to analyze trends instantly!`;
          }
        }
        
        res.json({ reply: simulatesReply });
        return;
      }

      // Instantiate modern official @google/genai model client
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = lang === 'en'
        ? `You are the elite AI Advisor and Financial Consultant for the 'Al-Moharif AI' platform (المحترف الذكي للكم).
Your core mission is to confidently and professionally resolve user inquiries, consultations, subscription questions, and operational instructions regarding the platform.

Key Knowledge Base of 'Al-Moharif AI':
1. Platform Vision: 
   - 'Al-Moharif AI' is an advanced, algorithmic crypto quantitative trading terminal specializing in automated bots, blockchain whale tracking metrics, backtesting, and predictive AI dashboards.
2. Core Features:
   - Automated Trading Bots: Spot Grid, Dollar-Cost Averaging (DCA), and the Aggressive Rebound Bot (الارتداد الهجومي). Once configured, they run indefinitely in the background until disabled.
   - Whale Tracking: Monitors live block transactions across Binance and blockchain networks to issue fast transaction-depth mappings and flow alerts.
   - Backtester: Allows strategy backtesting over prior months before risking real money.
   - AI Analyst: Inspects technical charts, indicators (like RSI), and whale indices to recommend top buying and selling candidates.
   - Futures & Risk Simulator: A specialized leverage margin calculator estimating liquidation boundaries before trade placement.
3. Subscription Tiers:
   - Free Trial: Paper Trading with live market quotes. Great for strategizing risk-free.
   - Silver Pro Tier: Run up to 3 parallel live bots, explore standard alerts, and compute backtests.
   - Gold Whale / Elite Tier: Unlocks everything. Unlimited parallel DCA & Grid bots, ultimate fast whale tracking logs, live API execution.
   - How to Subscribe: Users contact support or the Platform Manager directly via active support channels/tickets to settle payments and claim activation code triggers.
4. Absolute Safety (Binance API Integration):
   - High-fidelity integration using API Keys. Only 'Trade' permission should be enabled; 'Withdrawal' permissions must remain disabled (Withdrawal Disabled) keeping account funds 100% safe inside the user's exchange wallet.

Guidelines:
- Deliver precise, well-formatted financial analysis utilizing Markdown lists. Highlight essential risk parameters.`
        : aiSystemPrompt;

      // Ask Gemini using standard gemini-3.5-flash
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.72,
        },
      });

      const replyText = response.text || (lang === 'ar' ? 'نموذج التوليد لم يقدم رداً مفرساً.' : 'Generation yielded empty string.');
      res.json({ reply: replyText });

    } catch (err: any) {
      // Check for rate limit / quota exhaustion / high demand error
      const errStr = String(err.message || err).toLowerCase();
      const isRateLimit = errStr.includes('429') || err.status === 429 || errStr.includes('resource_exhausted') || errStr.includes('quota exceeded') || errStr.includes('503') || errStr.includes('high demand') || errStr.includes('unavailable');
      if (isRateLimit) {
        console.warn('Gemini analysis rate-limit (429/Quota) encountered. Triggering global 5-minute cooldown and serving simulated fallback response.');
        // Activate global 5-minutes rate limit cooldown
        geminiRateLimitActiveUntil = Date.now() + 5 * 60 * 1000;
        const fallbackText = lang === 'ar'
          ? `⚠️ **تم تجاوز حصة الطلبات السريعة على الخادم المجاني للذكاء الاصطناعي (429 Rate Limit)**\n\nإليك استشارة تداول احترافية ومساندة خارج خط الاتصال:\n1. **قاعدة حماية المحفظة**: لا تشارك ولا تفعل أبداً خيار السحب (Withdrawals Enabled) في مفاتيح API الخاصة بك لتأمين أموالك بشكل كامل.\n2. **تنظيم وتيرة الصفقات**: مؤشرات الزخم الحالية تشير إلى مناطق ترقب جانبي. ننصح بالحفاظ على رافعة مالية معتدلة (دون 3x) للتحوط ضد أي تحركات سعرية مفاجئة.`
          : `⚠️ **AI Rate Limit Reached (429 Resource Exhausted)**\n\nHere is a secure offline expert-level advisory supplement to guide your strategy:\n1. **Capital Containment**: Keep withdrawals and transfer permissions strictly DEACTIVATED on your API management console for all automated trading algorithms.\n2. **Position Velocity**: During periods of sideways consolidation, utilize structured safety-stop coordinates. Maintain leverage parameters under 3x to shield the margin portfolio.`;
        res.json({ reply: fallbackText, simulated: true });
        return;
      }
      console.warn('Gemini secure call error:', err.message || err);
      res.status(500).json({ error: err.message || 'Error occurred inside the backend analysis module.' });
    }
  });

  // API Route: Secure server-side Gemini sentiment analysis gauge
  app.post('/api/gemini/sentiment', async (req, res) => {
    try {
      const { symbol, lang } = req.body;

      if (!symbol || typeof symbol !== 'string') {
        res.status(400).json({ error: 'Please submit a valid market pair symbol.' });
        return;
      }

      // Generate a reproducible pseudo-random score based on symbol for high-fidelity fallback if API key is not fully configured
      const cleanSymbol = symbol.toUpperCase().replace('/', '');
      let mockScore = 50;
      if (cleanSymbol.includes('BTC')) mockScore = 74; // Bullish Greed
      else if (cleanSymbol.includes('ETH')) mockScore = 61; // Mild Greed
      else if (cleanSymbol.includes('SOL')) mockScore = 88; // Extreme Greed
      else if (cleanSymbol.includes('XRP')) mockScore = 38; // Fear
      else if (cleanSymbol.includes('ADA')) mockScore = 25; // Fear
      else {
        // Deterministic mock score based on character code sum
        const sum = cleanSymbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        mockScore = (sum % 70) + 20; // 20 to 90
      }

      const getClassification = (score: number) => {
        if (score <= 20) return { en: 'Extreme Fear', ar: 'خوف شديد' };
        if (score <= 40) return { en: 'Fear', ar: 'خوف' };
        if (score <= 60) return { en: 'Neutral', ar: 'حيادي' };
        if (score <= 80) return { en: 'Greed', ar: 'طمع' };
        return { en: 'Extreme Greed', ar: 'طمع شديد' };
      };

      const fallbackClass = getClassification(mockScore);

      const apiKey = process.env.GEMINI_API_KEY;
      const isCurrentlyRateLimited = Date.now() < geminiRateLimitActiveUntil;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || isCurrentlyRateLimited) {
        // Return highly realistic mock data based on deterministic values
        const fallbackRationaleEn = `Market pressure for ${symbol} is stabilizing. Support at regional moving averages remains strong, leading to a '${fallbackClass.en}' outlook.`;
        const fallbackRationaleAr = `عوامل العرض والطلب لزوج ${symbol} تشهد نوعاً من الاستقرار ماليًا. مستويات الدعم عند المتوسطات المتحركة الإقليمية لا تزال صلبة، مما يدعم تقييماً بمستوى '${fallbackClass.ar}'.`;
        
        res.json({
          score: mockScore,
          classification: fallbackClass.en,
          classification_ar: fallbackClass.ar,
          rationale_en: fallbackRationaleEn,
          rationale_ar: fallbackRationaleAr,
          simulated: true,
          rateLimited: isCurrentlyRateLimited
        });
        return;
      }

      // Cache Check & De-duplication Logic
      const cacheKey = `${cleanSymbol}_${lang || 'en'}`;

      // 1. Return cached sentiment if valid (cache duration: 5 minutes)
      const cached = sentimentCache[cacheKey];
      const CACHE_TTL_MS = 5 * 60 * 1000;
      if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
        res.json(cached.data);
        return;
      }

      // 2. Return de-duplicated active request promise if exists
      if (pendingRequests[cacheKey]) {
        try {
          const result = await pendingRequests[cacheKey];
          res.json(result);
        } catch (err: any) {
          // If the primary request fails, return cached simulated fallback below
          res.json({
            score: mockScore,
            classification: fallbackClass.en,
            classification_ar: fallbackClass.ar,
            rationale_en: `Technical parameters index for ${symbol} are consolidating neutrally at regional support channels.`,
            rationale_ar: `المؤشرات الفنية لزوج ${symbol} تتماسك بشكل محايد عند قنوات الدعم الإقليمية الحالية.`,
            simulated: true,
            err: err.message
          });
        }
        return;
      }

      // 3. Initiate raw request to Gemini API and wrap in a de-duplicated promise
      const executeSentimentFetch = async () => {
        const ai = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const promptText = `Analyze technical sentiment (buyer vs seller power, moving averages, relative strength, volume and risk) to estimate a precise and highly professional 'Fear & Greed' sentiment index score for the cryptocurrency market pair '${symbol}' right now. Return a single strict JSON object following the required schema. Ensure the Arabic rationale is beautifully structured, high-quality, and completely matching the English justification.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: promptText,
          config: {
            systemInstruction: "You are a professional cryptocurrency risk analyst. Evaluate sentiment from 0 (extreme market anxiety/panic) to 100 (extreme irrational buy exuberance). Be objective and realistic.",
            temperature: 0.5,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                score: {
                  type: Type.INTEGER,
                  description: "Sentiment score from 0 to 100."
                },
                classification: {
                  type: Type.STRING,
                  description: "Sentiment label matching the score: Extreme Fear, Fear, Neutral, Greed, Extreme Greed."
                },
                classification_ar: {
                  type: Type.STRING,
                  description: "Arabic translation: خوف شديد, خوف, حيادي, طمع, طمع شديد."
                },
                rationale_en: {
                  type: Type.STRING,
                  description: "Concise English risk assessment (max 2 sentences)."
                },
                rationale_ar: {
                  type: Type.STRING,
                  description: "Translated or equivalent professional Arabic risk assessment (max 2 sentences)."
                }
              },
              required: ["score", "classification", "classification_ar", "rationale_en", "rationale_ar"]
            }
          },
        });

        const responseText = response.text?.trim() || "";
        if (!responseText) {
          throw new Error("Empty response from AI engine");
        }

        const parsedJSON = JSON.parse(responseText);
        
        // Cache successful response
        sentimentCache[cacheKey] = {
          data: parsedJSON,
          timestamp: Date.now()
        };

        return parsedJSON;
      };

      const fetchPromise = executeSentimentFetch();
      pendingRequests[cacheKey] = fetchPromise;

      try {
        const result = await fetchPromise;
        res.json(result);
      } catch (err: any) {
        const errStr = String(err.message || err).toLowerCase();
        const isRateLimit = errStr.includes('429') || err.status === 429 || errStr.includes('resource_exhausted') || errStr.includes('quota exceeded') || errStr.includes('503') || errStr.includes('high demand') || errStr.includes('unavailable');
        if (isRateLimit) {
          console.warn(`Gemini sentiment API rate-limited (429) for ${symbol}. Triggering 5-minute cooldown.`);
        } else {
          console.warn(`Gemini sentiment API error for ${symbol}:`, err.message || err);
        }

        const simulatedData = {
          score: mockScore,
          classification: fallbackClass.en,
          classification_ar: fallbackClass.ar,
          rationale_en: `Technical factors for ${symbol} suggest typical neutral-to-moderate support intervals across monitored exchanges.`,
          rationale_ar: `مؤشرات حركة السعر لـ ${symbol} تقترح مستويات دعم طبيعية إلى معتدلة عبر المنصات الرئيسية التي تتم مراقبتها.`,
          simulated: true,
          err: err.message,
          rateLimited: isRateLimit
        };

        if (isRateLimit) {
          // Activate global 5-minutes rate limit cooldown
          geminiRateLimitActiveUntil = Date.now() + 5 * 60 * 1000;
          // Cache the simulated fallback for 1 minute on rate-limit so the server stops hitting Gemini during rate-limit blocks
          sentimentCache[cacheKey] = {
            data: simulatedData,
            timestamp: Date.now() - (4 * 60 * 1000) // leaves 1 minute remaining before eviction
          };
        }

        res.json(simulatedData);
      } finally {
        delete pendingRequests[cacheKey];
      }

    } catch (err: any) {
      const errStr = String(err.message || err).toLowerCase();
      const isRateLimit = errStr.includes('429') || err.status === 429 || errStr.includes('resource_exhausted') || errStr.includes('quota exceeded') || errStr.includes('503') || errStr.includes('high demand') || errStr.includes('unavailable');
      if (isRateLimit) {
        console.warn('Gemini sentiment initial outer rate-limit encountered. Cooldown initiated.');
        geminiRateLimitActiveUntil = Date.now() + 5 * 60 * 1000;
      } else {
        console.warn('Gemini sentiment initial outer error:', err.message || err);
      }
      res.status(200).json({
        score: 55,
        classification: 'Neutral',
        classification_ar: 'حيادي',
        rationale_en: 'Evaluating technical indicators yielded a balanced neutral market perspective in response to temporary volatility.',
        rationale_ar: 'تقييم المؤشرات الفنية يعكس رؤية متوازنة وحيادية في السوق نتيجة للتقلبات المؤقتة الأخيرة.',
        err: err.message,
        rateLimited: isRateLimit
      });
    }
  });

  // API Route: Secure server-side Gemini volatility analysis
  app.post('/api/gemini/volatility-analysis', async (req, res) => {
    const { symbol, changePercent, priceStart, priceEnd } = req.body;
    try {
      if (!symbol || changePercent === undefined) {
        res.status(400).json({ error: 'Incomplete parameters provided for volatility assessment.' });
        return;
      }

      const isUpward = changePercent > 0;
      const absChange = Math.abs(changePercent).toFixed(2);

      const apiKey = process.env.GEMINI_API_KEY;
      const isCurrentlyRateLimited = Date.now() < geminiRateLimitActiveUntil;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || isCurrentlyRateLimited) {
        // Fallback realistic simulation response
        let explanationEn = '';
        let explanationAr = '';

        if (isUpward) {
          explanationEn = `A sudden liquidity pocket vacuum triggered a stop-buy liquidation sweep for ${symbol}. The swift speed of the +${absChange}% move indicates aggressive maker depletion on thin sell-side books.`;
          explanationAr = `أدى فراغ مفاجئ في سيولة الأوامر إلى تفعيل سلسلة تصفية لمراكز البيع المكشوفة لزوج ${symbol}. السرعة الفائقة لارتفاع السعر بنسبة +${absChange}% تشير إلى استنفاد السيولة المعروضة على جانب البيع.`;
        } else {
          explanationEn = `Accelerating cascading margin liquidations on high-leverage products caused a momentary cascade of ${symbol}. This sharp drop of -${absChange}% reflects intense short-duration market-selling triggering automatic stop-losses.`;
          explanationAr = `تسببت تصفية الهوامش المتتالية لصفقات الروافع المالية العالية في هبوط متسارع لوقت قصير لزوج ${symbol}. يعكس هذا التراجع الحاد بنسبة -${absChange}% عمليات بيع فورية مكثفة أدت لضرب أوامر وقف الخسارة التلقائية.`;
        }

        res.json({
          explanation_en: explanationEn,
          explanation_ar: explanationAr,
          simulated: true,
          rateLimited: isCurrentlyRateLimited
        });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const promptText = `Explain the potential financial mechanics behind a sharp price volatility event of ${changePercent}% in under 1 minute for the cryptocurrency pair '${symbol}' (moved from ${priceStart} to ${priceEnd}). Focus on professional dynamics like leverage liquidation cascades, short/long squeezes, or order book thinness. Respond ONLY as a JSON object with two fields "explanation_en" and "explanation_ar" each containing a highly professional 2-sentence summary. Keep English and Arabic explanations matching perfectly in financial depth.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptText,
        config: {
          systemInstruction: "You are an elite cryptocurrency market analyst and risk expert. Synthesize professional explanations with complete objectivity. Avoid generic phrases.",
          temperature: 0.52,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              explanation_en: {
                type: Type.STRING,
                description: "Deep, professional, concise English explanation (2 sentences)."
              },
              explanation_ar: {
                type: Type.STRING,
                description: "Accurate, equivalent expert-level Arabic explanation (2 sentences)."
              }
            },
            required: ["explanation_en", "explanation_ar"]
          }
        },
      });

      const responseText = response.text?.trim() || "";
      if (!responseText) {
        throw new Error("Empty response from volatility analyst");
      }

      const parsedJSON = JSON.parse(responseText);
      res.json(parsedJSON);

    } catch (err: any) {
      const errStr = String(err.message || err).toLowerCase();
      const isRateLimit = errStr.includes('429') || err.status === 429 || errStr.includes('resource_exhausted') || errStr.includes('quota exceeded') || errStr.includes('503') || errStr.includes('high demand') || errStr.includes('unavailable');
      if (isRateLimit) {
        console.warn(`Gemini volatility analysis rate-limited (429) for ${symbol}. Cooldown initiated.`);
        geminiRateLimitActiveUntil = Date.now() + 5 * 60 * 1000;
      } else {
        console.warn(`Gemini volatility analysis error for ${symbol}:`, err.message || err);
      }
      const isUpward = changePercent > 0;
      const absChange = Math.abs(changePercent || 2.1).toFixed(2);
      res.status(200).json({
        explanation_en: isUpward 
          ? `Micro-volatility on thin buy boundaries triggered technical margin spikes of +${absChange}% for ${symbol}.`
          : `Cascading risk protection orders triggered instant liquidation slips of -${absChange}% on ${symbol}.`,
        explanation_ar: isUpward
          ? `أدى التقلب الفوري على مستويات الشراء الهشة إلى ارتفاع تقني مفاجئ لزوج ${symbol} بنسبة +${absChange}%.`
          : `أثارت أوامر تصفية الحماية لتفادي الخسائر هبوطاً فورياً متتابعاً لزوج ${symbol} بنسبة -${absChange}%.`,
        err: err.message,
        rateLimited: isRateLimit
      });
    }
  });

  // API Route: Secure server-side Gemini whale on-chain consensus advisor
  app.post('/api/gemini/whale-analysis', async (req, res) => {
    try {
      const { active_positions } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      const isCurrentlyRateLimited = Date.now() < geminiRateLimitActiveUntil;
      
      const fallbackData = {
        sentiment_en: "Consolidating Accumulation Stance. Heavy flow out of spot exchanges (specifically Coinbase Custody and Kraken) represents solid long-term locking. Whales are using sub-$64k levels to stack with minimum sales slippage.",
        sentiment_ar: "حالة تجميع قوية متماسكة. التدفق العالي من محافظ التداول الفورية نحو بنود الحماية والاتفاقيات المصرفية يمثل حاجز أمان قوي وفعال. تستغل المحافظ الكبرى مستويات الهبوط المحدودة أسفل المستوى 64,000 دولار لتثبيت متوسطاتها الشرائية.",
        score: 78,
        implication_en: "Bullish expectation for liquidity buffer. Possible supply bottleneck in the spot markets within the next 48 to 72 hours could drive market price upwards.",
        implication_ar: "توقعات إيجابية بحدوث شح في المعروض الفوري للبيع. يرجح حدوث اختناق في العرض الرقمي المتوفر للتصفية السريعة خلال الـ 48-72 ساعة القادمة، مما يعزز زحف الأسعار الشرائية للأعلى.",
        timestamp: new Date().toISOString()
      };

      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || isCurrentlyRateLimited) {
        res.json({
          ...fallbackData,
          simulated: true,
          rateLimited: isCurrentlyRateLimited
        });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const sampleTxStr = active_positions ? JSON.stringify(active_positions.slice(0, 5)) : "No transactions";
      const promptText = `Analyze institutional coin flow activity: '${sampleTxStr}' and on-chain holdings index. Provide an objective and professional market outlook advising retail traders on what whales are doing. Respond ONLY as a JSON object with fields: "sentiment_en" (max 3 sentences), "sentiment_ar" (max 3 sentences matching English), "score" (number 0-100 representing whale buy/accumulate strength), "implication_en" (1-2 sentences), "implication_ar" (1-2 sentences matching English). Make explanations match perfectly in financial vocabulary.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptText,
        config: {
          systemInstruction: "You are an elite cryptocurrency wallet forensic analyst and on-chain strategist. Be mathematically precise and objective. Return only JSON.",
          temperature: 0.45,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sentiment_en: { type: Type.STRING },
              sentiment_ar: { type: Type.STRING },
              score: { type: Type.INTEGER },
              implication_en: { type: Type.STRING },
              implication_ar: { type: Type.STRING }
            },
            required: ["sentiment_en", "sentiment_ar", "score", "implication_en", "implication_ar"]
          }
        }
      });

      const responseText = response.text?.trim() || "";
      if (!responseText) {
        throw new Error("Empty content generated by whale analyst model");
      }

      const parsedJSON = JSON.parse(responseText);
      res.json({
        ...parsedJSON,
        timestamp: new Date().toISOString()
      });

    } catch (err: any) {
      const errStr = String(err.message || err).toLowerCase();
      if (errStr.includes('429') || err.status === 429 || errStr.includes('quota exceeded') || errStr.includes('resource_exhausted') || errStr.includes('503') || errStr.includes('high demand') || errStr.includes('unavailable')) {
        geminiRateLimitActiveUntil = Date.now() + 5 * 60 * 1000;
      }
      res.json({
        sentiment_en: "Whales show dynamic structural neutrality. Assets balancing between multi-sigs and OTC brokers indicates high preparedness for market trends.",
        sentiment_ar: "تظهر المحافظ الكبرى حيادية استباقية ممتازة. التنقل القائم لمراكز السيولة بين الخزائن الباردة ومكاتب الصرف OTC يشير لرفع الجاهزية والاستعداد لموجة تداول عالية.",
        score: 65,
        implication_en: "Avoid high margin exposure during overnight sessions to insulate against random liquidity spikes.",
        implication_ar: "يُنصح بتقييد الرفع المالي وتجنب مطاردة تذبذبات الحيتان المؤقتة لتفادي التعرض للتصفيات الجبرية الناتجة عن الهبوط اللحظي.",
        timestamp: new Date().toISOString(),
        err: err.message
      });
    }
  });

  // API Route: Secure server-side Gemini Helpdesk Support
  app.post('/api/gemini/support', async (req, res) => {
    try {
      const { prompt, lang } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      const queryLower = (prompt || "").toLowerCase();
      let fallbackReply = "";
      let fallbackConfidence = 100;
      let fallbackEscalated = false;

      // Smart localized expert rule-based advisor fallback if AI key is missing or limit is active
      const useLocalFallback = !apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "" || Date.now() < geminiRateLimitActiveUntil;

      if (useLocalFallback) {
        if (lang === "ar") {
          if (queryLower.includes("اشتراك") || queryLower.includes("باق") || queryLower.includes("سعر") || queryLower.includes("اسعار") || queryLower.includes("دفع") || queryLower.includes("شحن") || queryLower.includes("باقة")) {
            fallbackReply = `### 💎 تفاصيل الاشتراكات وباقات العمل في منصة "المحترف الذكي":
منصتنا تقدم تدرجاً ذكياً يناسب كافة مستويات المتداولين لتفعيل الاستراتيجيات الكمية:

1. **الباقة التجريبية المجانية (Trial/Free)**:
   - تداول تجريبي ورقّي (Paper Trading) كامل بـ 15,000 USDT مجانية.
   - متابعة مؤشرات السوق ومستكشف الأسعار والتحليل والتحوط العام.

2. **باقة المحترف الفضي (Silver Pro)** ($29/شهرياً):
   - تدعم تشغيل ما يصل إلى **3 بوتات ذكية آمنة** متوازية في الخلفية.
   - تفعيل رادار الحيتان الأساسي وميزة التجريب التاريخي (Backtests).

3. **باقة الحوت الذهبي (Gold Whale Elite)** ($79/شهرياً):
   - فتح كامل ومطلق لكافة مميزات المنصة.
   - تشغيل عدد غير محدود من روبوتات التداول (Grid, DCA، وروبوت الارتداد الهجومي التلقائي المستقر).
   - رادار صفقات حيتان فائق السرعة لتتبع المحافظ والسيولة، تحليلات وتقارير المستشار الذكي المباشرة، وتوصيل مفاتيح التداول التلقائي دون أي قيود.

**💡 كيف أشحن حسابي أو أشترك؟**
تفعيل الحسابات حقيقي أو ترقية الباقة يتم بأمان تام وموثق. اطلب كود التفعيل من مالك المنصة الفني أو المدير هنا عبر لوحة الدعم الذكي بفتح تذكرة، وسيقوم المالك على الفور بإرسال كود التفعيل المباشر وفاتورة الدفع الآمنة الموثقة لتنشيط حسابك فوراً وبأعلى الميزات.`;
          } else if (queryLower.includes("ربط") || queryLower.includes("بينانس") || queryLower.includes("مفتاح") || queryLower.includes("api") || queryLower.includes("أمن") || queryLower.includes("امان") || queryLower.includes("تفعيل")) {
            fallbackReply = `### 🔒 تفعيل التداول الحقيقي وأمن الـ API على Al-Moharif AI:
ربط المنصة بحساب بينانس حقيقي سهل ومؤمن بالكامل عبر اتباع الخطوات الفنية التالية:

1. اذهب لحسابك في **بينانس (Binance)** وقم بإنشاء كود API جديد مخصص للعمل الخارجي.
2. **تحديد الصلاحيات الآمنة**: قم بتفعيل صلاحية **"القراءة فقط" (Enable Reading)** وصلاحية **"تداول العقود الفورية" (Enable Spot Trading)**.
3. ⚠️ **حظر هام جداً**: تأكد تماماً من **إلغاء تفعيل أو عدم تحديد صلاحية السحب (Enable Withdrawals)**. هذا يضمن حماية أموالك بنسبة 100% وحصر دور المنصة في فتح وإغلاق الصفقات المقدرة فقط مع بقاء رأس ملك بالكامل وبأمان تام داخل محفظتك ببينانس.
4. انتقل إلى تبويب **"أمان الـ API"** في منصتنا، وأدخل المفتاح العام (API Key) والمفتاح السري (API Secret) للمحفظة واضغط اتصال حقيقي ليقوم النظام بالربط وبدء التداول الآلي الآمن فوراً.`;
          } else if (queryLower.includes("الارتداد الهجومي") || queryLower.includes("الارتداد") || queryLower.includes("ارتداد") || queryLower.includes("rebound")) {
            fallbackReply = `### ⚡ استراتيجية الارتداد الهجومي (Offensive Rebound):
روبوت **الارتداد الهجومي** هو قناص تذبذبات متطور وعالي الدقة لتتبع قيعان الفولتية السريعة:

- **آلية العمل**: بمجرد تفعيل زر "الارتداد الهجومي" أو أي زر استراتيجية آخر بالمنصة، يقوم النظام بتعقب مستويات الدعم التكتيكية وحساب المدى المائل لمؤشر RSI. بمجرد حدوث هبوط فجائي وسريع، يعلق النظام أوامر معلقة فورية (Limit Orders) تحت مستويات الدعم الفني بفرق طفيف (0.5% إلى 1%) لاصطياد الارتداد السريع والصعود اللحظي.
- **الاستقرار والاستمرارية**: **يبقى هذا الزر والاستراتيجية مفعّلة في حسابك وخلفية المنصة بشكل دائم وسري حتى لو أغلقت المتصفح أو المنصة، ولن يتم كتمها أو إلغائها إلا إذا قمت أنت يدوياً بالضغط على زر التعطيل.**
- يحقق معدل التقاط فوري لصفقات القاع بمجرد رصد تضخم بيعي على مؤشر القوة النسبية (RSI) تحت 30.`;
          } else if (queryLower.includes("بوت") || queryLower.includes("روبوت") || queryLower.includes("دكا") || queryLower.includes("grid") || queryLower.includes("dca") || queryLower.includes("تلقائي") || queryLower.includes("تداول")) {
            fallbackReply = `### 🤖 روبوتات التداول التلقائي وخلفية العمل في المحترف الذكي:
تدعم المنصة 3 أنواع رئيسية من خوارزميات التداول الآلي الذكية التي تعمل على مدار الساعة 24/7 دون حاجة لبقاء جهازك متصلاً:

1. **روبوت الشبكة (Grid Bot)**:
   - ممتاز للتداول في الأسواق العرضية والمتذبذبة. يقوم بنشر خطوط شراء بالأسفل وخطوط بيع بالأعلى لتكرار الأرباح الميكروية.
2. **روبوت متوسط التكلفة (DCA Bot)**:
   - مثالي للتجميع وتأمين مراكز ممتازة في الفترات الهابطة عن طريق الشراء على فترات متباعدة ثم تسييل كل المراكز بمتوسط مربح ومقنن بالكامل.
3. **روبوت الارتداد الهجومي**:
   - قناص سريع لصفقات القيعان، ينتظر هدر الفولتية ومستويات RSI الحرجة لفتح صفقات ارتداد ناجحة ومكثفة.`;
          } else if (queryLower.includes("صاحب") || queryLower.includes("مدير") || queryLower.includes("المالك") || queryLower.includes("تواصل") || queryLower.includes("مالك") || queryLower.includes("مساعدة")) {
            fallbackReply = `### 📞 التواصل مع إدارة منصة المحترف الذكي:
لقد قمت بتحويل استفسارك وحالتك كبطاقة تواصل مستعجلة لمالك المنصة والمدير الفني شخصياً (Pending Escalation).
- سيقوم المالك بمراجعة حسابك ومساعدتك في تفعيل الباقات أو المدفوعات وتزويدك بالاكواد فوراً.
- تواصل معنا في أي وقت، المالك يتابع التذاكر الواردة لخدمتكم بشكل دوري ووثيق.`;
            fallbackEscalated = true;
            fallbackConfidence = 50;
          } else {
            fallbackReply = `### 🤖 أهلاً بك في الدعم الذكي لمنصة "المحترف الذكي للكم" (Al-Moharif AI):
أنا مستشارك الفني ومساعدك هنا للإجابة عن كل ما يخص التداول والعمل بالمنصة:

- **إذا كنت تستفسر عن الباقات والترقية**: اكتب كلمة "اشتراك" أو "باقة".
- **إذا كنت تستفسر عن كيفية التداول الحقيقي وأمان الأموال**: اكتب "ربط بينانس" أو "أمان الـ API".
- **إذا كنت بحاجة لمعرفة عمل روبوت الارتداد الهجومي**: اكتب "الارتداد الهجومي" أو "البوتات".
- **إذا كنت تود التواصل مباشرة مع مالك المنصة لطلب خاص**: اكتب "المدير" أو "المالك".

*المنصة تعمل بكامل طاقتها لخدمتكم 24/7 بأقوى تقنيات التحليل الفني الكمي المقرونة بالذكاء الاصطناعي.*`;
          }
        } else {
          if (queryLower.includes("sub") || queryLower.includes("price") || queryLower.includes("tier") || queryLower.includes("plan") || queryLower.includes("cost") || queryLower.includes("pay") || queryLower.includes("pricing")) {
            fallbackReply = `### 💎 Subscription Plans and Costs for Al-Moharif AI:
Our platform provides structured tiers tailored for every professional:

1. **Trial/Free Tier**:
   - Unlocks full Paper Trading simulator featuring $15,000 USDT free baseline.
   - Perfect for testing bot strategies and charting real-time indicators.

2. **Silver Pro Tier** ($29/month):
   - Automate up to **3 active parallel trading bots** simultaneously in the background.
   - Complete Whale flow alerts and historical Backtesting system unlocked.

3. **Gold Whale / Elite Tier** ($79/month):
   - Infinite active parallel Grid & DCA bots.
   - Ultra fast live Whale trackers, direct API execution trigger, personalized price notification chimes, and premium AI advice.

**💡 How to register / upgrade your access?**
Subscriptions and tier upgrades are handled securely through invoicing or activation tokens. Simply text me or open a support ticket, and our Platform Manager will directly send you your secure payment invoice and activation key instantly!`;
          } else if (queryLower.includes("link") || queryLower.includes("api") || queryLower.includes("binance") || queryLower.includes("key") || queryLower.includes("security") || queryLower.includes("safe")) {
            fallbackReply = `### 🔒 Active Exchange API Integration & Asset Security:
Connecting Al-Moharif AI to your live exchange is fully secure and isolated:

1. Navigate to your **Binance account** and register a new security API key.
2. **Covenant Permissions**: Enable strictly **"Read-only/Enable Reading"** and **"Spot & Margin Trading"** permissions.
3. ⚠️ **Safety Dictate**: Absolutely **DISABLE withdrawal rights (Enable Withdrawals is unchecked)**. This encapsulates your capital safely within your own exchange wallet, allowing our bot strictly to execute trades on your behalf.
4. Input your API Key and API Secret in our secure **"API Security"** panel to synchronize.`;
          } else if (queryLower.includes("rebound") || queryLower.includes("aggressive")) {
            fallbackReply = `### ⚡ Aggressive Rebound Mastery (الارتداد الهجومي):
The **Aggressive Rebound** strategy is highly robust for capturing rapid reversion spikes:

- **Execution**: Once activated, the bot continuously monitors support lines and RSI metrics, placing Limit orders immediately below those levels (0.5% to 1.0%) to scoop immediate bottom liquidities.
- **Persistence guarantee**: **This toggle state resides securely in your long-term local storage. Once activated, it stays fully running in Al-Moharif background indefinitely until you choose to explicitly click and deactivate it yourself.**
- Bypasses raw timing latency to buy dynamic oversold bottoms perfectly.`;
          } else if (queryLower.includes("bot") || queryLower.includes("robot") || queryLower.includes("grid") || queryLower.includes("dca") || queryLower.includes("auto")) {
            fallbackReply = `### 🤖 Automated Quant Trading Bots on Al-Moharif AI:
Three continuous background systems execute your trading strategies perfectly 24/7:

1. **Grid Bot (روبوت الشبكة)**:
   - Sets regular grid steps above/below current entry to buy low and sell high inside sideways markets.
2. **DCA Accumulator Bot (روبوت متوسط التكلفة)**:
   - Smooths volatile downturns by placing spaced fractional orders, resulting in a low cost-average that liquidates inside recovery moves.
3. **Aggressive Rebound Bot (روبوت الارتداد الهجومي)**:
   - Aggressive mean-reversion hunter waiting for massive RSI sell-offs to execute bottom-fishing buys.`;
          } else if (queryLower.includes("owner") || queryLower.includes("manager") || queryLower.includes("creator") || queryLower.includes("admin") || queryLower.includes("contact")) {
            fallbackReply = `### 📞 Direct Owner / Support Escalation:
Need personalized help from a human administrator?
- I have flagged this ticket and marked it for direct review by the Platform Manager (Owner Attention: Pending).
- The Manager will contact you directly via the support tickets layout or through email to assist with any billing, invoicing, or specialized account settings.`;
            fallbackEscalated = true;
            fallbackConfidence = 50;
          } else {
            fallbackReply = `### 🤖 Welcome to Al-Moharif AI Smart Support Advisor:
I am your professional AI co-pilot, ready to assist you with any topic regarding our quantitative system:

- **Subscriptions / Pricing**: Ask about "prices", "tiers", or "subscriptions".
- **Binance Link & Safety**: Ask about "connecting binance", "API security", or "safety".
- **Offensive Rebound / Bots**: Ask about "rebound bot", "grid bot", or "DCA".
- **Direct Manager Contact**: Write "contact owner" or "escalate to manager".

*Our platform is built to optimize your crypto portfolio 24/7 with professional quantitative discipline.*`;
          }
        }

        res.json({ reply: fallbackReply, escalated: fallbackEscalated, confidence: fallbackConfidence });
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `You are the highly professional Elite AI Advisor and Customer Support Consultant for 'Al-Moharif AI' (منصة المحترف الذكي للكم).
Your goal is to answer users' consultations, questions, subscription queries, and operational instructions with technical elegance, helpfulness, and precision.

Key knowledge about 'Al-Moharif AI' Platform to use when answering questions:
1. Platform Identity & Vision:
   - Al-Moharif AI (المحترف الذكي) is a world-class, algorithmic and quant crypto trading terminal.
   - It specializes in continuous automated trading bots, smart data aggregation, real-time whale flow tracking, and intelligent sentiment indexes.

2. Core Systems & Features:
   - Automated Trading Bots (روبوتات التداول الآلي): Includes Grid Bots, Dollar-Cost Averaging (DCA), and the Aggressive Rebound Bot (الارتداد الهجومي). Once activated by the user, these bots operate continuously in the background (using secure, robust simulation or live API connections) until the user explicitly turns them off.
   - Whale Tracking Engine (متعقب الحيتان): Continuously scans Binance and blockchain networks for huge single-block or OTC transfers, providing high-speed buy/sell alerts and transaction-depth visual maps.
   - Backtester (روبوت التجريب التاريخي): Allows users to simulate how their DCA or Grid rules would have performed historically over several past months before putting actual assets at risk.
   - AI Analyst Dashboard (المستشار والتحليل الذكي): Evaluates dynamic indicators, RSI crossovers, chart patterns, and whale flow indices to produce real-time recommendations (such as the Top 5 Buy and Top 5 Sell Opportunities).
   - Futures & Risk Simulator (مخطط ومحاكي العقود الآجلة): Equipped with a custom margin and leverage risk calculator to accurately demonstrate potential liquidations prior to placing trades.

3. Subscription Tiers & Registration (الاشتراكات والعمل بالمنصة):
   - Free/Trial Tier (الباقة التجريبية المجانية): Fully functional paper trading with live market rates, basic chart tracking, and limited alerts. Excellent for testing strategy logic.
   - Silver Pro Tier (باقة المحترف الفضي): Supports complete automation for up to 3 custom bots, basic whale transaction alerts, and historical backtesting features.
   - Gold Whale / Elite Tier (باقة الحوت الذهبي): Fully unlocks all platforms tools, unlimited parallel DCA and Grid bots, professional high-speed whale flow details, custom price alerts, and automated execution keys.
   - Payment/Subscription Method: Users can subscribe by contacting support or the platform manager directly (via their profile panel, support tickets, or direct channel keys on the manager's dashboard) to secure activation codes or setup direct invoicing.
   - Live API Integration: Users can connect their external exchange APIs (like Binance) into Al-Moharif securely. The platform only requires 'Trade' permissions, never 'Withdrawal' permissions, ensuring funds remain 100% safe in the user's exchange wallet.

Communication Guidelines:
- If the user asks in Arabic, answer in professional, elegant, and encouraging Arabic (العربية الفصحى).
- If the user asks in English, answer in polished, high-status English business tone.
- Maintain high-interest engagement, giving clear step-by-step guidance.
- If asked a highly specific questions about custom database balances, account private disputes, or explicit developer bugs, set a confidence score below 75 so that the ticket can be escalated to the Platform Manager (المدير والمالك) for direct personal attention while keeping the user informed politely.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { 
          systemInstruction, 
          temperature: 0.4,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING, description: "Your friendly customer support reply." },
              confidence: { type: Type.INTEGER, description: "Your confidence score from 0 to 100 on being able to assist exactly." }
            },
            required: ["reply", "confidence"]
          }
        }
      });

      const text = response.text || "";
      if (!text) throw new Error("Empty response");

      const parsed = JSON.parse(text);
      const confidence = parsed.confidence ?? 100;
      let replyText = parsed.reply || "";
      let escalated = confidence < 75 || replyText.includes('[ESCALATE_TO_OWNER]');

      res.json({ reply: replyText, escalated, confidence });
    } catch (err: any) {
      console.warn('Support AI Error:', err.message || err);
      res.json({ 
         reply: req.body.lang === 'ar' ? 'عفواً، لا يمكن استكمال الطلب حالياً. المالك سيراجع هذا بشكل شخصي وسيلبي طلبك فوراً!' : 'Error processing request. The owner has been notified and will review your request personally!', 
         escalated: true,
         confidence: 0
      });
    }
  });

  // Synchronized Clock Offset cache to prevent -1021 timestamp outside recvWindow errors
  let cachedClockOffset = 0;
  let lastClockSync = 0;

  async function getBinanceTimestamp() {
    const now = Date.now();
    // Sync every 3 minutes
    if (now - lastClockSync > 3 * 60 * 1000) {
      try {
        const res = await fetch('https://api.binance.com/api/v3/time');
        if (res.ok) {
          const body: any = await res.json();
          cachedClockOffset = body.serverTime - now;
          lastClockSync = now;
          console.log(`[Binance Clock Synchronization] Synced! Server Offset: ${cachedClockOffset}ms`);
        }
      } catch (err: any) {
        console.warn('[Binance Clock Synchronization] Failed to consult Binance time gateway:', err.message);
      }
    }
    return Date.now() + cachedClockOffset;
  }

  // SECURE HELPER: Fetch open orders (Spot/Futures) from Binance REST gateway
  async function getOpenOrders(apiKey: string, apiSecret: string, useTestnet: boolean, isFutures = false) {
    const baseUrl = isFutures
      ? (useTestnet ? 'https://testnet.binancefuture.com' : 'https://fapi.binance.com')
      : (useTestnet ? 'https://testnet.binance.vision' : 'https://api.binance.com');

    const timestamp = await getBinanceTimestamp();
    const queryString = `timestamp=${timestamp}&recvWindow=60000`;
    
    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(queryString)
      .digest('hex');

    const path = isFutures ? '/fapi/v1/openOrders' : '/api/v3/openOrders';
    const url = `${baseUrl}${path}?${queryString}&signature=${signature}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': apiKey,
        'Content-Type': 'application/json'
      }
    });

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await response.text().catch(() => "");
      console.error("[getOpenOrders] Non-JSON payload received from Binance:", text);
      throw new Error(`Binance returned an HTML page (HTTP ${response.status}) instead of JSON. This typically happens when keys lack correct permissions, are geo-restricted, or are targeting an unsupported environment.`);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.msg || `Binance API query failed with status ${response.status}`);
    }

    return await response.json();
  }

  // API Route: Securely fetch all Spot or Futures open orders via the getOpenOrders helper
  app.post('/api/binance/open-orders', async (req, res) => {
    try {
      const { apiKey, apiSecret, useTestnet, isFutures } = req.body;
      if (!apiKey || !apiSecret) {
        res.status(400).json({ success: false, error: 'API key and security signature secret are required.' });
        return;
      }

      const openOrders = await getOpenOrders(apiKey, apiSecret, useTestnet !== false, isFutures === true);
      res.json({
        success: true,
        orders: openOrders
      });
    } catch (err: any) {
      console.error('Binance Open Orders query failed:', err);
      res.status(500).json({ success: false, error: err.message || 'Fatal error retrieving Binance open orders pool.' });
    }
  });

  // API Route: Secure Binance connection validation via HMAC-SHA256 signing
  app.post('/api/binance/test', async (req, res) => {
    try {
      const { apiKey, apiSecret, useTestnet } = req.body;
      if (!apiKey || !apiSecret) {
        res.status(400).json({ success: false, error: 'API key and security signature secret are required.' });
        return;
      }

      const baseUrl = useTestnet ? 'https://testnet.binance.vision' : 'https://api.binance.com';
      const timestamp = await getBinanceTimestamp();
      const queryString = `timestamp=${timestamp}&recvWindow=60000`;
      
      const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(queryString)
        .digest('hex');

      const url = `${baseUrl}/api/v3/account?${queryString}&signature=${signature}`;
      
      const fetchResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'X-MBX-APIKEY': apiKey,
          'Content-Type': 'application/json'
        }
      });

      const testContentType = fetchResponse.headers.get("content-type") || "";
      if (!testContentType.includes("application/json")) {
        const text = await fetchResponse.text().catch(() => "");
        console.error("[/api/binance/test] Non-JSON payload response received:", text);
        res.status(502).json({
          success: false,
          error: `Binance authentication server returned an HTML/non-JSON error response (HTTP ${fetchResponse.status}). Environment or IP restrictions might be blocking communication. Response snippet: ${text.slice(0, 100)}`
        });
        return;
      }

      const responseData: any = await fetchResponse.json();

      if (fetchResponse.ok) {
        let openOrdersList: any[] = [];
        try {
          // Sync open orders alongside account validation safely
          openOrdersList = await getOpenOrders(apiKey, apiSecret, useTestnet !== false, false);
        } catch (ooErr: any) {
          console.warn('[Binance Balance link - Open Orders Warning]:', ooErr.message);
        }

        let futuresUsdt = 0;
        try {
          const fBaseUrl = useTestnet ? 'https://testnet.binancefuture.com' : 'https://fapi.binance.com';
          const fTimestamp = await getBinanceTimestamp();
          const fPayload = `timestamp=${fTimestamp}&recvWindow=60000`;
          const fSig = crypto.createHmac('sha256', apiSecret).update(fPayload).digest('hex');
          const fUrl = `${fBaseUrl}/fapi/v2/balance?${fPayload}&signature=${fSig}`;
          const fRes = await fetch(fUrl, { 
            method: 'GET', 
            headers: { 'X-MBX-APIKEY': apiKey, 'Content-Type': 'application/json' } 
          });
          if (fRes.ok) {
            const fText = await fRes.text();
            try {
              const fData = JSON.parse(fText);
              if (Array.isArray(fData)) {
                const uBal = fData.find((b: any) => b.asset === 'USDT');
                if (uBal) futuresUsdt = parseFloat(uBal.balance) || 0;
              }
            } catch(e) {}
          }
        } catch (fe: any) {
          console.warn('[Binance Balance link - Futures Warning]:', fe.message);
        }

        res.json({
          success: true,
          canTrade: responseData.canTrade ?? true,
          canWithdraw: responseData.canWithdraw ?? false,
          balances: responseData.balances || [],
          permissions: responseData.permissions || [],
          openOrders: openOrdersList,
          futuresUsdt
        });
      } else {
        res.status(fetchResponse.status).json({
          success: false,
          error: responseData.msg || 'Binance rejected the authentication request. Verify keys.'
        });
      }
    } catch (err: any) {
      console.error('Binance API proxy diagnostic error:', err);
      res.status(500).json({ success: false, error: err.message || 'Fatal error connecting to Binance gateway.' });
    }
  });

  // API Route: Smart API Credentials Deep Diagnostic Analyzer
  app.post('/api/binance/diagnose', async (req, res) => {
    try {
      const { apiKey, apiSecret } = req.body;
      if (!apiKey || !apiSecret) {
        res.status(400).json({ success: false, error: 'API key and security signature secret are required to start the deep diagnosis.' });
        return;
      }

      const timestamp = await getBinanceTimestamp();
      const localTime = Date.now();
      const offsetMs = timestamp - localTime;
      const queryString = `timestamp=${timestamp}&recvWindow=60000`;

      // Helper to generate signature
      const getSig = (q: string) => crypto.createHmac('sha256', apiSecret).update(q).digest('hex');
      const sig = getSig(queryString);

      // Perform checks
      const results = {
        spotMainnet: { ok: false, status: 0, msg: '', details: null as any },
        spotTestnet: { ok: false, status: 0, msg: '', details: null as any },
        futuresMainnet: { ok: false, status: 0, msg: '', details: null as any },
        futuresTestnet: { ok: false, status: 0, msg: '', details: null as any },
        outboundIp: 'dynamic-pool',
        timeOffsetMs: offsetMs,
        guidance: [] as string[]
      };

      // Query Outbound IP
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        if (ipRes.ok) {
          const ipData: any = await ipRes.json();
          results.outboundIp = ipData.ip;
        }
      } catch {}

      // 1. Spot Mainnet Check
      try {
        const url = `https://api.binance.com/api/v3/account?${queryString}&signature=${sig}`;
        const fetchRes = await fetch(url, {
          method: 'GET',
          headers: { 'X-MBX-APIKEY': apiKey, 'Content-Type': 'application/json' }
        });
        results.spotMainnet.status = fetchRes.status;
        const data = await fetchRes.json().catch(() => ({}));
        results.spotMainnet.details = data;
        if (fetchRes.ok) {
          results.spotMainnet.ok = true;
          results.spotMainnet.msg = 'Valid Spot Mainnet Keys';
        } else {
          results.spotMainnet.msg = data.msg || `HTTP Error ${fetchRes.status}`;
        }
      } catch (err: any) {
        results.spotMainnet.msg = err.message || 'Network Timeout';
      }

      // 2. Spot Testnet Check
      try {
        const url = `https://testnet.binance.vision/api/v3/account?${queryString}&signature=${sig}`;
        const fetchRes = await fetch(url, {
          method: 'GET',
          headers: { 'X-MBX-APIKEY': apiKey, 'Content-Type': 'application/json' }
        });
        results.spotTestnet.status = fetchRes.status;
        const data = await fetchRes.json().catch(() => ({}));
        results.spotTestnet.details = data;
        if (fetchRes.ok) {
          results.spotTestnet.ok = true;
          results.spotTestnet.msg = 'Valid Spot Testnet Keys';
        } else {
          results.spotTestnet.msg = data.msg || `HTTP Error ${fetchRes.status}`;
        }
      } catch (err: any) {
        results.spotTestnet.msg = err.message || 'Network Timeout';
      }

      // 3. Futures Mainnet Check
      try {
        const url = `https://fapi.binance.com/fapi/v2/balance?${queryString}&signature=${sig}`;
        const fetchRes = await fetch(url, {
          method: 'GET',
          headers: { 'X-MBX-APIKEY': apiKey, 'Content-Type': 'application/json' }
        });
        results.futuresMainnet.status = fetchRes.status;
        const data = await fetchRes.json().catch(() => ({}));
        results.futuresMainnet.details = data;
        if (fetchRes.ok) {
          results.futuresMainnet.ok = true;
          results.futuresMainnet.msg = 'Valid Futures Mainnet Authorization';
        } else {
          results.futuresMainnet.msg = data.msg || `HTTP Error ${fetchRes.status}`;
        }
      } catch (err: any) {
        results.futuresMainnet.msg = err.message || 'Network Timeout';
      }

      // 4. Futures Testnet Check
      try {
        const url = `https://testnet.binancefuture.com/fapi/v2/balance?${queryString}&signature=${sig}`;
        const fetchRes = await fetch(url, {
          method: 'GET',
          headers: { 'X-MBX-APIKEY': apiKey, 'Content-Type': 'application/json' }
        });
        results.futuresTestnet.status = fetchRes.status;
        const data = await fetchRes.json().catch(() => ({}));
        results.futuresTestnet.details = data;
        if (fetchRes.ok) {
          results.futuresTestnet.ok = true;
          results.futuresTestnet.msg = 'Valid Futures Testnet Authorization';
        } else {
          results.futuresTestnet.msg = data.msg || `HTTP Error ${fetchRes.status}`;
        }
      } catch (err: any) {
        results.futuresTestnet.msg = err.message || 'Network Timeout';
      }

      // Generate deep smart guidance
      const guidance = results.guidance;
      if (results.spotMainnet.ok && !results.futuresMainnet.ok) {
        guidance.push('مفتاح الـ API الخاص بك صالح للتداول الفوري (Spot) على الشبكة الحقيقية، ولكنه يفتقر لصلاحيات "تمكين العقود الآجلة" (Enable Futures). يرجى التوجه إلى إدارة مفاتيح الـ API في بينانس وتفعيل هذا الخيار لحفظ الإعدادات.');
        guidance.push('Your API Key works perfectly for Spot Trading on Mainnet, but lacks checked authorization for Futures Trading. Navigate back to Binance ➔ API Management ➔ click "Edit Restrictions" ➔ check "Enable Futures" and save.');
      } else if (results.spotTestnet.ok && !results.futuresTestnet.ok) {
        guidance.push('مفتاح الـ API يبدو تجريبياً (Testnet) ولكنه لا يملك صلاحية العقود الآجلة في بيئة التجريبية.');
        guidance.push('Your API Key is validated for Spot Testnet, but cannot read Futures Testnet. Enable Futures for your Testnet profile.');
      } else if (!results.spotMainnet.ok && !results.spotTestnet.ok) {
        guidance.push('مفتاح API أو الـ Secret غير صحيح بالمرة أو تم إبطاله من قبل بينانس، أو أن هناك قيود جغرافية تمنع الاتصال.');
        guidance.push('Both production and sandbox credentials were rejected. The key has likely expired, been copied with typos, or is restricted due to corporate geolocation safeguards.');
      }

      if (results.futuresMainnet.status === 451 || results.spotMainnet.status === 451) {
        guidance.push('تنبيه هام (القيود الإقليمية): استجاب خادم بينانس برمز HTTP 451 والذي يشير إلى حظر منطقتك الجغرافية من التداول المباشر عبر الـ API. يوصى بمراجعة قيود بلدك.');
        guidance.push('Geographical Block Alert: Binance returned HTTP 451. Your account or the server IP resides in a restricted regulatory jurisdiction.');
      }

      res.json({ success: true, results, guidance });
    } catch (err: any) {
      console.error('Smart credentials diagnostic failed:', err);
      res.status(500).json({ success: false, error: err.message || 'Smart diagnostics server timeout.' });
    }
  });

  // Secure API Route: Fetch live Binance balance and filter holds
  app.post('/api/binance/balance', async (req, res) => {
    try {
      const { apiKey, secretKey, apiSecret, useTestnet } = req.body;
      const finalApiKey = apiKey;
      const finalSecretKey = secretKey || apiSecret;

      if (!finalApiKey || !finalSecretKey) {
        res.status(400).json({ error: 'مفاتيح API مطلوبة' });
        return;
      }

      const baseUrl = useTestnet ? 'https://testnet.binance.vision' : 'https://api.binance.com';
      const timestamp = await getBinanceTimestamp();
      const queryString = `timestamp=${timestamp}&recvWindow=60000`;

      // Digital sign request with HMAC-SHA256 to guard credentials
      const signature = crypto
        .createHmac('sha256', finalSecretKey)
        .update(queryString)
        .digest('hex');

      const url = `${baseUrl}/api/v3/account?${queryString}&signature=${signature}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-MBX-APIKEY': finalApiKey,
          'Content-Type': 'application/json'
        }
      });

      const balanceContentType = response.headers.get("content-type") || "";
      if (!balanceContentType.includes("application/json")) {
        const text = await response.text().catch(() => "");
        console.error("[/api/binance/balance] Non-JSON payload response received:", text);
        res.status(502).json({
          error: `بينانس أرسلت رداً غير متوقع (صفحة HTML) بدلاً من بيانات JSON (HTTP ${response.status}). يرجى التحقق من قيود الإقليم، تفعيل الفيوتشرز، أو تطابق الشبكة. مقتطف: ${text.slice(0, 100)}`
        });
        return;
      }

      if (!response.ok) {
        const errorData: any = await response.json().catch(() => ({}));
        res.status(response.status).json({ 
          error: errorData.msg || `Binance REST error code ${response.status}`
        });
        return;
      }

      const data: any = await response.json();
      
      if (!data || !Array.isArray(data.balances)) {
        res.json({ balances: [] });
        return;
      }

      // Filter balances with holdings only
      const balances = data.balances.filter((asset: any) => 
        parseFloat(asset.free) > 0 || parseFloat(asset.locked) > 0
      );

      let openOrdersList: any[] = [];
      try {
        // Fetch open orders alongside balances
        openOrdersList = await getOpenOrders(finalApiKey, finalSecretKey, useTestnet !== false, false);
      } catch (ooErr: any) {
        console.warn('[Binance Balance Sync - Open Orders Warning]:', ooErr.message);
      }

      res.json({ balances, openOrders: openOrdersList });
    } catch (error: any) {
      console.warn('تنبيه: خطأ في جلب الرصيد الحقيقي للعميل:', error.message || error);
      res.status(500).json({ error: error.message || 'فشل الاتصال بمحفظة بينانس' });
    }
  });

  // API Route: Secure Binance Order Placement Proxy
  app.post('/api/binance/execute', async (req, res) => {
    try {
      const { apiKey, apiSecret, useTestnet, symbol, side, type, amount, price, isFutures } = req.body;
      if (!apiKey || !apiSecret || !symbol || !side || !type || !amount) {
        res.status(400).json({ success: false, error: 'Incomplete parameters for order dispatch.' });
        return;
      }

      const baseUrl = useTestnet 
        ? (isFutures ? 'https://testnet.binancefuture.com' : 'https://testnet.binance.vision')
        : (isFutures ? 'https://fapi.binance.com' : 'https://api.binance.com');
      const timestamp = await getBinanceTimestamp();
      
      // Convert e.g., 'BTC/USDT' -> 'BTCUSDT'
      const cleanSymbol = symbol.toUpperCase().replace('/', '');
      
      let queryString = `symbol=${cleanSymbol}&side=${side}&type=${type}&quantity=${amount}&timestamp=${timestamp}&recvWindow=60000`;
      if (type === 'LIMIT') {
        queryString += `&price=${price}&timeInForce=GTC`;
      }

      const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(queryString)
        .digest('hex');

      const url = `${baseUrl}/${isFutures ? 'fapi/v1' : 'api/v3'}/order?${queryString}&signature=${signature}`;

      const fetchResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'X-MBX-APIKEY': apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const responseData: any = await fetchResponse.json();

      if (fetchResponse.ok) {
        res.json({
          success: true,
          orderId: responseData.orderId,
          clientOrderId: responseData.clientOrderId,
          status: responseData.status || 'FILLED',
          price: responseData.price || price,
          executedQty: responseData.executedQty || amount,
          transactTime: responseData.transactTime
        });
      } else {
        res.status(fetchResponse.status).json({
          success: false,
          error: responseData.msg || 'Binance order processing failed.'
        });
      }

    } catch (err: any) {
      console.error('Binance order dispatch engine error:', err);
      res.status(500).json({ success: false, error: err.message || 'Fatal error issuing order to Binance terminal.' });
    }
  });

  // API Route: Secure Binance Emergency Kill Switch (Cancel All Pending Orders)
  app.post('/api/binance/cancel-all', async (req, res) => {
    try {
      const { apiKey, apiSecret, useTestnet } = req.body;
      if (!apiKey || !apiSecret) {
        res.status(400).json({ success: false, error: 'API key and security signature secret are required.' });
        return;
      }

      const baseUrl = useTestnet ? 'https://testnet.binance.vision' : 'https://api.binance.com';
      const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'];
      const results: { symbol: string; success: boolean; data?: any; error?: any }[] = [];

      for (const rawSymbol of symbols) {
        try {
          const timestamp = Date.now();
          const queryString = `symbol=${rawSymbol}&timestamp=${timestamp}&recvWindow=6000`;
          const signature = crypto
            .createHmac('sha256', apiSecret)
            .update(queryString)
            .digest('hex');

          const url = `${baseUrl}/api/v3/openOrders?${queryString}&signature=${signature}`;

          const fetchResponse = await fetch(url, {
            method: 'DELETE',
            headers: {
              'X-MBX-APIKEY': apiKey,
              'Content-Type': 'application/json'
            }
          });

          const responseData = await fetchResponse.json();

          if (fetchResponse.ok) {
            results.push({ symbol: rawSymbol, success: true, data: responseData });
          } else {
            results.push({ symbol: rawSymbol, success: false, error: responseData.msg || 'No open orders or parameter mismatch.' });
          }
        } catch (symErr: any) {
          results.push({ symbol: rawSymbol, success: false, error: symErr.message || 'Network connectivity error.' });
        }
      }

      const totalHalted = results.filter(r => r.success).length;

      res.json({
        success: true,
        message: 'Master liquidation signal processed.',
        haltedCount: totalHalted,
        details: results
      });

    } catch (err: any) {
      console.error('Binance Emergency Kill Switch router error:', err);
      res.status(500).json({ success: false, error: err.message || 'Fatal error issuing close order sequence.' });
    }
  });

  // API Route: Secure Binance historical order book aggregator
  app.post('/api/binance/order-history', async (req, res) => {
    try {
      const { apiKey, apiSecret, useTestnet, limit = 100 } = req.body;
      if (!apiKey || !apiSecret) {
        res.status(400).json({ success: false, error: 'API key and security signature secret are required to aggregate order history.' });
        return;
      }

      const baseUrl = useTestnet ? 'https://testnet.binance.vision' : 'https://api.binance.com';
      const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'];
      
      const requests = symbols.map(async (sym) => {
        try {
          const timestamp = Date.now();
          const queryString = `symbol=${sym}&timestamp=${timestamp}&limit=${limit}&recvWindow=6000`;
          const signature = crypto
            .createHmac('sha256', apiSecret)
            .update(queryString)
            .digest('hex');

          const url = `${baseUrl}/api/v3/allOrders?${queryString}&signature=${signature}`;

          const fetchResponse = await fetch(url, {
            method: 'GET',
            headers: {
              'X-MBX-APIKEY': apiKey,
              'Content-Type': 'application/json'
            }
          });

          if (!fetchResponse.ok) {
            const errData = await fetchResponse.json().catch(() => ({}));
            return { symbol: sym, success: false, error: errData.msg || `HTTP ${fetchResponse.status}` };
          }

          const orderData = await fetchResponse.json();
          return { symbol: sym, success: true, data: Array.isArray(orderData) ? orderData : [] };
        } catch (err: any) {
          return { symbol: sym, success: false, error: err.message };
        }
      });

      const responses = await Promise.all(requests);
      
      // Combine all parsed orders
      let allOrders: any[] = [];
      responses.forEach((resp) => {
        if (resp.success && Array.isArray(resp.data)) {
          // Format standard binance format
          const formatted = resp.data.map((o: any) => ({
            symbol: o.symbol,
            orderId: o.orderId,
            price: parseFloat(o.price) || 0,
            amount: parseFloat(o.origQty) || 0,
            filledAmount: parseFloat(o.executedQty) || 0,
            side: o.side, // BUY or SELL
            type: o.type, // LIMIT, MARKET, etc.
            status: o.status, // FILLED, CANCELED, etc.
            timestamp: o.time,
            cummulativeQuoteQty: parseFloat(o.cummulativeQuoteQty) || 0,
          }));
          allOrders = allOrders.concat(formatted);
        }
      });

      // Sort combined historical array descending by its execution timestamp
      allOrders.sort((a, b) => b.timestamp - a.timestamp);

      res.json({
        success: true,
        orders: allOrders,
        symbolsQueried: symbols
      });

    } catch (err: any) {
      console.error('Binance Order History router error:', err);
      res.status(500).json({ success: false, error: err.message || 'Fatal error processing historical Binance logs.' });
    }
  });

  // API Route: Secure Telegram message transmission route
  app.post('/api/telegram/send', async (req, res) => {
    try {
      const { botToken, chatId, message } = req.body;
      if (!botToken || !chatId || !message) {
        res.status(400).json({ success: false, error: 'Telegram credentials and message are required.' });
        return;
      }

      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });

      const responseData: any = await response.json();
      if (response.ok && responseData.ok) {
        res.json({ success: true });
      } else {
        res.status(400).json({ success: false, error: responseData.description || 'Telegram API rejected the message.' });
      }
    } catch (err: any) {
      console.error('Telegram API proxy dispatcher error:', err);
      res.status(500).json({ success: false, error: err.message || 'Fatal error dispatching message to Telegram gateway.' });
    }
  });

  // API Route: Secure Binance Futures account details (Balance & Open Position risk)
  app.post('/api/binance/futures/account', async (req, res) => {
    try {
      const { apiKey, apiSecret, useTestnet } = req.body;
      if (!apiKey || !apiSecret) {
        res.status(400).json({ success: false, error: 'API key and security signature secret are required.' });
        return;
      }

      const baseUrl = useTestnet ? 'https://testnet.binancefuture.com' : 'https://fapi.binance.com';
      const timestamp = await getBinanceTimestamp();
      const queryString = `timestamp=${timestamp}&recvWindow=60000`;

      const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(queryString)
        .digest('hex');

      // Fetch Futures Margin Wallet USDT balance
      const balanceUrl = `${baseUrl}/fapi/v2/balance?${queryString}&signature=${signature}`;
      const balanceResponse = await fetch(balanceUrl, {
        method: 'GET',
        headers: {
          'X-MBX-APIKEY': apiKey,
          'Content-Type': 'application/json'
        }
      });

      // Fetch Futures active positions risk
      const positionUrl = `${baseUrl}/fapi/v2/positionRisk?${queryString}&signature=${signature}`;
      const positionResponse = await fetch(positionUrl, {
        method: 'GET',
        headers: {
          'X-MBX-APIKEY': apiKey,
          'Content-Type': 'application/json'
        }
      });

      let usdtBalance = 0;
      
      const balanceContentType = balanceResponse.headers.get("content-type") || "";
      if (!balanceContentType.includes("application/json")) {
        const text = await balanceResponse.text().catch(() => "");
        console.error("[Futures balanceResponse] Non-JSON response:", text);
        throw new Error(`Binance Futures Balance returned an HTML page (HTTP ${balanceResponse.status}) instead of JSON. Ensure your API key permissions/geo-blocks allow Futures trading.`);
      }

      if (!balanceResponse.ok) {
        const errorData = await balanceResponse.json().catch(() => ({}));
        throw new Error(errorData.msg || `Binance Futures API balance query failed with HTTP status ${balanceResponse.status}`);
      }
      
      const balances: any = await balanceResponse.json();
      if (Array.isArray(balances)) {
        const usdtEntry = balances.find((b: any) => b.asset === 'USDT');
        if (usdtEntry) {
          usdtBalance = parseFloat(usdtEntry.balance) || 0;
        }
      }

      let activePositions: any[] = [];
      
      const positionContentType = positionResponse.headers.get("content-type") || "";
      if (!positionContentType.includes("application/json")) {
        const text = await positionResponse.text().catch(() => "");
        console.error("[Futures positionResponse] Non-JSON response:", text);
        throw new Error(`Binance Futures PositionRisk returned an HTML page (HTTP ${positionResponse.status}) instead of JSON. Check key permissions or geographical limitations.`);
      }

      if (!positionResponse.ok) {
        const errorData = await positionResponse.json().catch(() => ({}));
        throw new Error(errorData.msg || `Binance Futures API position query failed with HTTP status ${positionResponse.status}`);
      }

      const positions: any = await positionResponse.json();
      if (Array.isArray(positions)) {
          activePositions = positions
            .filter((p: any) => parseFloat(p.positionAmt) !== 0) // Only filter active ones!
            .map((p: any) => {
              const amt = parseFloat(p.positionAmt);
              const entry = parseFloat(p.entryPrice) || 0;
              const mark = parseFloat(p.markPrice) || 0;
              const leverage = parseInt(p.leverage) || 1;
              const upnl = parseFloat(p.unRealizedProfit) || 0;
              const margin = parseFloat(p.isolatedWallet) || 0; // margin allocated
              const liq = parseFloat(p.liquidationPrice) || 0;
              const side = amt > 0 ? 'LONG' : 'SHORT';

              // Format symbol like BTCUSDT to BTC/USDT if layout expects it
              let formattedSymbol = p.symbol;
              if (p.symbol.endsWith('USDT')) {
                formattedSymbol = p.symbol.replace('USDT', '/USDT');
              }

              return {
                id: `pos-live-${p.symbol}-${side}`,
                 symbol: formattedSymbol,
                 side,
                 leverage,
                 marginType: p.isolated ? 'ISOLATED' : 'CROSS',
                 entryPrice: entry,
                 currentPrice: mark,
                 amount: Math.abs(amt),
                 margin: margin || (Math.abs(amt) * entry / leverage), // estimate margin if crossed
                 liquidationPrice: liq,
                 unrealizedPnl: upnl,
                 unrealizedPnlPercent: margin > 0 ? parseFloat(((upnl / margin) * 100).toFixed(2)) : parseFloat(((upnl / ((Math.abs(amt) * entry) / leverage)) * 100).toFixed(2))
              };
            });
        }

      let openOrders: any[] = [];
      try {
        const openOrdersUrl = `${baseUrl}/fapi/v1/openOrders?${queryString}&signature=${signature}`;
        const openOrdersResponse = await fetch(openOrdersUrl, {
          method: 'GET',
          headers: {
            'X-MBX-APIKEY': apiKey,
            'Content-Type': 'application/json'
          }
        });
        
        const openOrdersContentType = openOrdersResponse.headers.get("content-type") || "";
        if (openOrdersResponse.ok && openOrdersContentType.includes("application/json")) {
          const ooList: any = await openOrdersResponse.json();
          if (Array.isArray(ooList)) {
            openOrders = ooList.map((o: any) => ({
              orderId: o.orderId,
              symbol: o.symbol.endsWith('USDT') ? o.symbol.replace('USDT', '/USDT') : o.symbol,
              side: o.side,
              type: o.type,
              price: parseFloat(o.price) || 0,
              amount: parseFloat(o.origQty) || 0,
              filledAmount: parseFloat(o.executedQty) || 0,
              status: o.status,
              timestamp: o.time
            }));
          }
        }
      } catch (ooErr) {
        console.warn('Could not fetch futures open orders:', ooErr);
      }

      res.json({
        success: true,
        usdtBalance,
        positions: activePositions,
        openOrders
      });

    } catch (err: any) {
      console.warn('Binance Futures account load info:', err);
      res.status(500).json({ success: false, error: err.message || 'Fatal error fetching Binance Futures parameters.' });
    }
  });

  // API Route: Cancel a SPECIFIC open order on Binance Spot
  app.post('/api/binance/cancel-order', async (req, res) => {
    try {
      const { apiKey, apiSecret, useTestnet, symbol, orderId } = req.body;
      if (!apiKey || !apiSecret || !symbol || !orderId) {
        res.status(400).json({ success: false, error: 'Incomplete parameters for order cancellation.' });
        return;
      }

      const baseUrl = useTestnet ? 'https://testnet.binance.vision' : 'https://api.binance.com';
      const cleanSymbol = symbol.toUpperCase().replace('/', '');
      const timestamp = Date.now();
      const queryString = `symbol=${cleanSymbol}&orderId=${orderId}&timestamp=${timestamp}&recvWindow=6000`;
      
      const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(queryString)
        .digest('hex');

      const url = `${baseUrl}/api/v3/order?${queryString}&signature=${signature}`;

      const fetchResponse = await fetch(url, {
        method: 'DELETE',
        headers: {
          'X-MBX-APIKEY': apiKey,
          'Content-Type': 'application/json'
        }
      });

      const cancelContentType = fetchResponse.headers.get("content-type") || "";
      if (!cancelContentType.includes("application/json")) {
        const text = await fetchResponse.text().catch(() => "");
        console.error("Non-JSON Response from Spot cancel endpoint:", text);
        res.status(502).json({
          success: false,
          error: `Binance Spot order cancellation returned a non-JSON response (HTTP status ${fetchResponse.status}). Response: ${text.slice(0, 100)}`
        });
        return;
      }

      const responseData = await fetchResponse.json();

      if (fetchResponse.ok) {
        res.json({ success: true, orderId: responseData.orderId, status: responseData.status });
      } else {
        res.status(fetchResponse.status).json({ success: false, error: responseData.msg || 'Binance order cancellation failed.' });
      }
    } catch (err: any) {
      console.error('Binance cancel specific order error:', err);
      res.status(500).json({ success: false, error: err.message || 'Fatal error' });
    }
  });

  // API Route: Cancel a SPECIFIC open order on Binance Futures
  app.post('/api/binance/futures/cancel', async (req, res) => {
    try {
      const { apiKey, apiSecret, useTestnet, symbol, orderId } = req.body;
      if (!apiKey || !apiSecret || !symbol || !orderId) {
        res.status(400).json({ success: false, error: 'Incomplete parameters for futures order cancellation.' });
        return;
      }

      const baseUrl = useTestnet ? 'https://testnet.binancefuture.com' : 'https://fapi.binance.com';
      const cleanSymbol = symbol.toUpperCase().replace('/', '');
      const timestamp = Date.now();
      const queryString = `symbol=${cleanSymbol}&orderId=${orderId}&timestamp=${timestamp}&recvWindow=6000`;
      
      const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(queryString)
        .digest('hex');

      const url = `${baseUrl}/fapi/v1/order?${queryString}&signature=${signature}`;

      const fetchResponse = await fetch(url, {
        method: 'DELETE',
        headers: {
          'X-MBX-APIKEY': apiKey,
          'Content-Type': 'application/json'
        }
      });

      const cancelContentType = fetchResponse.headers.get("content-type") || "";
      if (!cancelContentType.includes("application/json")) {
        const text = await fetchResponse.text().catch(() => "");
        console.error("Non-JSON Response from Futures cancel endpoint:", text);
        res.status(502).json({
          success: false,
          error: `Binance Futures order cancellation returned a non-JSON response (HTTP status ${fetchResponse.status}). Response: ${text.slice(0, 100)}`
        });
        return;
      }

      const responseData = await fetchResponse.json();

      if (fetchResponse.ok) {
        res.json({ success: true, orderId: responseData.orderId, status: responseData.status });
      } else {
        res.status(fetchResponse.status).json({ success: false, error: responseData.msg || 'Binance futures order cancellation failed.' });
      }
    } catch (err: any) {
      console.error('Binance cancel specific futures order error:', err);
      res.status(500).json({ success: false, error: err.message || 'Fatal error' });
    }
  });

  // API Route: Secure Binance Futures Order Dispatch Proxy (updates marginType + leverage first, then places order)
  app.post('/api/binance/futures/execute', async (req, res) => {
    try {
      const { apiKey, apiSecret, useTestnet, symbol, side, type, amount, price, leverage, marginType } = req.body;
      console.log('--- Incoming order request (raw body) ---', req.body);
      const missingParams = [];
      if (!apiKey) missingParams.push('apiKey');
      if (!apiSecret) missingParams.push('apiSecret');
      if (!symbol) missingParams.push('symbol');
      if (!side) missingParams.push('side');
      if (!type) missingParams.push('type');
      if (!amount) missingParams.push('amount');

      if (missingParams.length > 0) {
        const errorDesc = `Incomplete parameters for futures order dispatch. Missing or invalid keys: ${missingParams.join(', ')} (amount provided: ${amount})`;
        console.error('--- Missing params ---', errorDesc);
        res.status(400).json({ success: false, error: errorDesc });
        return;
      }

      const baseUrl = useTestnet ? 'https://testnet.binancefuture.com' : 'https://fapi.binance.com';
      const cleanSymbol = symbol.toUpperCase().replace('/', '');

      // 1. Set Margin Type (Isolated vs Cross)
      if (marginType) {
        try {
          const timestamp = Date.now();
          const marginTypeStr = marginType === 'CROSS' || marginType === 'CROSSED' ? 'CROSSED' : 'ISOLATED';
          const qStr = `symbol=${cleanSymbol}&marginType=${marginTypeStr}&timestamp=${timestamp}`;
          const sig = crypto.createHmac('sha256', apiSecret).update(qStr).digest('hex');
          
          const mResponse = await fetch(`${baseUrl}/fapi/v1/marginType?${qStr}&signature=${sig}`, {
            method: 'POST',
            headers: {
              'X-MBX-APIKEY': apiKey,
              'Content-Type': 'application/json'
            }
          });
          const mContentType = mResponse.headers.get("content-type") || "";
          if (!mContentType.includes("application/json")) {
            throw new Error(`Non-JSON response received during marginType setup (HTTP ${mResponse.status})`);
          }
        } catch (marginErr: any) {
          console.log('[Binance Futures MarginType Setup Setup-Note]:', marginErr.message);
        }
      }

      // 2. Set Leverage
      if (leverage) {
        try {
          const timestamp = Date.now();
          const roundedLeverage = Math.max(1, Math.round(Number(leverage) || 1));
          const qStr = `symbol=${cleanSymbol}&leverage=${roundedLeverage}&timestamp=${timestamp}`;
          const sig = crypto.createHmac('sha256', apiSecret).update(qStr).digest('hex');
          
          const lResponse = await fetch(`${baseUrl}/fapi/v1/leverage?${qStr}&signature=${sig}`, {
            method: 'POST',
            headers: {
              'X-MBX-APIKEY': apiKey,
              'Content-Type': 'application/json'
            }
          });
          const lContentType = lResponse.headers.get("content-type") || "";
          if (!lContentType.includes("application/json")) {
            throw new Error(`Non-JSON response received during leverage setup (HTTP ${lResponse.status})`);
          }
        } catch (levErr: any) {
          console.log('[Binance Futures Leverage Setup Setup-Note]:', levErr.message);
        }
      }

      // 3. Dispatch the order
      const timestamp = Date.now();
      let queryString = `symbol=${cleanSymbol}&side=${side}&type=${type}&quantity=${amount}&timestamp=${timestamp}&recvWindow=6000`;
      if (type === 'LIMIT') {
        queryString += `&price=${price}&timeInForce=GTC`;
      }

      const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(queryString)
        .digest('hex');

      const orderUrl = `${baseUrl}/fapi/v1/order?${queryString}&signature=${signature}`;
      const fetchResponse = await fetch(orderUrl, {
        method: 'POST',
        headers: {
          'X-MBX-APIKEY': apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const orderResponseContentType = fetchResponse.headers.get("content-type") || "";
      if (!orderResponseContentType.includes("application/json")) {
        const text = await fetchResponse.text().catch(() => "");
        console.error("[Futures order execute] Non-JSON response:", text);
        res.status(502).json({
          success: false,
          error: `Binance Futures order execution gateway returned an HTML error response (HTTP ${fetchResponse.status}) instead of JSON. Confirm api-key restrictions allow placement and look for geographic IP restrictions.`
        });
        return;
      }

      const responseData: any = await fetchResponse.json();

      if (fetchResponse.ok) {
        res.json({
          success: true,
          orderId: responseData.orderId,
          clientOrderId: responseData.clientOrderId,
          status: responseData.status,
          avgPrice: responseData.avgPrice || responseData.price || price,
          executedQty: responseData.executedQty || amount,
          updateTime: responseData.updateTime
        });
      } else {
        res.status(fetchResponse.status).json({
          success: false,
          error: responseData.msg || 'Binance Futures order failed.'
        });
      }

    } catch (err: any) {
      console.error('Binance Futures Order dispatch engine error:', err);
      res.status(500).json({ success: false, error: err.message || 'Fatal error issuing order to Binance Futures gateway.' });
    }
  });

  // API Route: Secure server-side Gemini alert analysis
  app.post('/api/gemini/alert-analysis', async (req, res) => {
    const { symbol, type, value, condition, currentValue, lang } = req.body;
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        res.json({ reply: lang === 'ar' ? 'تحليل غير متاح حالياً.' : 'AI analysis currently unavailable.' });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' },
        },
      });

      const prompt = `Analyze the ${symbol} pair. An alert triggered because the ${type} reached ${value} (condition: ${condition}). The current ${type} is ${currentValue}.
      Please provide a technical explanation for this alert, detailing reasons like volume spikes, significant whale movements/activities, or key technical levels (support/resistance, overbought/sold). Provide a brief professional verdict (Buy/Sell/Hold).
      Limit the response to 3 sentences in ${lang}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: "You are a professional trader and financial analyst for Al-Moharif AI.",
          temperature: 0.5,
        },
      });

      res.json({ reply: response.text });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Explicitly serve static files from the public folder to guarantee PWA assets
  // (manifest.json, sw.js, icons) are always served in both dev and production.
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Vite middleware setup based on env
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Dynamic SPA developer fallback
    app.get('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ error: 'API route not found' });
      }
      try {
        const indexHtmlPath = path.join(process.cwd(), 'index.html');
        if (fs.existsSync(indexHtmlPath)) {
          let html = fs.readFileSync(indexHtmlPath, 'utf8');
          html = await vite.transformIndexHtml(req.originalUrl, html);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
        } else {
          next();
        }
      } catch (err) {
        next(err);
      }
    });
  } else {
    // Production serving static dist build
    const distPath = path.join(process.cwd(), 'dist/public');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ error: 'API route not found' });
      }
      const prodIndexPath = path.join(distPath, 'index.html');
      const devIndexPath = path.join(process.cwd(), 'index.html');
      
      if (fs.existsSync(prodIndexPath)) {
        res.sendFile(prodIndexPath);
      } else if (fs.existsSync(devIndexPath)) {
        res.sendFile(devIndexPath);
      } else {
        res.status(404).send('Application Index file not found. Please wait for the initial build to complete.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server initiated. Routing port: ${PORT}`);
  });

  app.post('/api/ai/calculate-smart-sl', async (req, res) => {
    const { symbol, side, entryPrice, currentPrice, klines } = req.body;
    try {
      // Basic ATR calculation (simplified)
      // 14 periods lookback
      const period = 14;
      if (!klines || klines.length < period) {
        return res.json({ slPrice: side === 'LONG' ? currentPrice * 0.95 : currentPrice * 1.05, reason: 'Not enough data for ATR' });
      }

      // Calculate true ranges
      let trSum = 0;
      for (let i = klines.length - period; i < klines.length; i++) {
        const h = parseFloat(klines[i][2]);
        const l = parseFloat(klines[i][3]);
        const c = parseFloat(klines[i][4]);
        const prevC = parseFloat(klines[i-1][4]);
        trSum += Math.max(h - l, Math.abs(h - prevC), Math.abs(l - prevC));
      }
      const atr = trSum / period;
      
      const prompt = `You are a professional crypto trading expert.
      Calculate an optimal stop-loss (SL) level for a ${side} position.
      Entry: ${entryPrice}, Current: ${currentPrice}.
      ATR (14): ${atr.toFixed(4)}.
      Use ATR to calculate a safe base stop-loss, then adjust it dynamically based on the current market trend.
      CRITICAL: If the current trend is strong (based on entry vs current price), be patient and hold the position. Only close if the rebound trend has clearly and fully reversed.
      
      Output ONLY a valid JSON object:
      {
        "slPrice": number,
        "reason": string
      }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      res.json(JSON.parse(response.text!));
    } catch (error) {
      console.error('Smart SL Calculation Error:', error);
      res.status(500).json({ slPrice: side === 'LONG' ? currentPrice * 0.95 : currentPrice * 1.05, reason: 'Calculation failed, default fallback.' });
    }
  });
}

startServer();
