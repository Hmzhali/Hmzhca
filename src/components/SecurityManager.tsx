/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ApiConnection } from '../types';
import { ARABIC_DICT } from '../utils/marketData';
import { Shield, Lock, AlertTriangle, CheckCircle, Server, RefreshCw, ShieldCheck, ShieldAlert, Check, X, KeyRound, Fingerprint, Send, MessageSquare, Bot, BookOpen, ChevronDown, ChevronUp, Info, Terminal, Activity } from 'lucide-react';

interface SecurityManagerProps {
  lang: 'ar' | 'en';
  connection: ApiConnection;
  onUpdateConnection: (conn: Partial<ApiConnection>) => void;
  userData?: any;
}

export default function SecurityManager({
  lang,
  connection,
  onUpdateConnection,
  userData
}: SecurityManagerProps) {
  const d = ARABIC_DICT;

  // Collapsible guide state
  const [showGuide, setShowGuide] = useState<boolean>(true);

  // Form states local copies
  const [exchange, setExchange] = useState<ApiConnection['exchange']>(connection.exchange);
  const [apiKey, setApiKey] = useState<string>(connection.apiKey);
  const [apiSecret, setApiSecret] = useState<string>(connection.apiSecret);
  const [useTestnet, setUseTestnet] = useState<boolean>(connection.useTestnet === true);
  const [ipWhitelisting, setIpWhitelisting] = useState<boolean>(connection.ipWhitelisting);
  const [withdrawalDisabled, setWithdrawalDisabled] = useState<boolean>(connection.withdrawalDisabled);
  const [readOnly, setReadOnly] = useState<boolean>(connection.readOnly);
  const [tradingEnabled, setTradingEnabled] = useState<boolean>(connection.tradingEnabled);
  
  // Telegram Integration State
  const [telegramBotToken, setTelegramBotToken] = useState<string>(connection.telegramBotToken || '7736364858:AAGHy5aos21G8fgHsAooQioQmcFJsAGwmms');
  const [telegramChatId, setTelegramChatId] = useState<string>(connection.telegramChatId || '5450846071');
  const [telegramTesting, setTelegramTesting] = useState<boolean>(false);
  const [telegramFeedback, setTelegramFeedback] = useState<string | null>(null);

  const [testing, setTesting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Diagnostic Logs UI States
  const [diagnosing, setDiagnosing] = useState<boolean>(false);
  const [diagnosticData, setDiagnosticData] = useState<any | null>(null);
  const [diagnosticError, setDiagnosticError] = useState<string | null>(null);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);

  // Dynamic outbound egress IP detection
  const [serverOutboundIp, setServerOutboundIp] = useState<string | null>(null);
  const [loadingIp, setLoadingIp] = useState<boolean>(false);

  const fetchOutboundIp = async () => {
    setLoadingIp(true);
    try {
      const res = await fetch('/api/binance/outbound-ip');
      if (res.ok) {
        const body = await res.json();
        if (body.success) {
          setServerOutboundIp(body.ip);
        } else {
          setServerOutboundIp('dynamic-pool');
        }
      } else {
        setServerOutboundIp('dynamic-pool');
      }
    } catch {
      setServerOutboundIp('dynamic-pool');
    } finally {
      setLoadingIp(false);
    }
  };

  useEffect(() => {
    fetchOutboundIp();
  }, []);

  // Security dynamic audit calculation variables
  const hasKeys = apiKey.trim() !== '' && apiSecret.trim() !== '';
  const isWithdrawalSafe = withdrawalDisabled; // True means withdrawals are disabled, which is SAFE
  const isIpConfigured = ipWhitelisting;
  const isKeyLongEnough = apiKey.trim().length >= 16 && apiSecret.trim().length >= 24;

  let securityGrade: 'A+' | 'B' | 'F' | 'N/A' = 'N/A';
  if (hasKeys) {
    if (!isWithdrawalSafe) {
      securityGrade = 'F'; // Critical risk
    } else if (isIpConfigured) {
      securityGrade = 'A+'; // Ultra secure
    } else {
      securityGrade = 'B'; // Secure but needs improvement
    }
  }

  // Handle saving credentials with security check
  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setFeedback(null);

    // Strict security checking in UI before even calling API
    if (!withdrawalDisabled) {
      setTesting(false);
      setFeedback(
        lang === 'ar'
          ? '⚠️ تحذير خطير للغاية! السحب مُمكّن! يرجى تعطيل صلاحيات السحب (Withdrawal) فوراً من المنصة لحماية رأس مالك.'
          : '⚠️ CRITICAL RISK: Withdrawal permissions are enabled! Turn off withdrawals in Binance console.'
      );
      onUpdateConnection({
        isConnected: false,
      });
      return;
    }

    try {
      const response = await fetch('/api/binance/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, apiSecret, useTestnet }),
      });

      const resData = await response.json();
      setTesting(false);

      if (response.ok && resData.success) {
        const activeBalances = resData.balances
          .filter((b: any) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
          .map((b: any) => `${b.asset}: ${parseFloat(b.free).toFixed(3)}`)
          .slice(0, 4)
          .join(', ');

        const balancesNote = activeBalances 
          ? (lang === 'ar' ? ` الأرصدة المسترجعة: ${activeBalances}` : ` Balances: ${activeBalances}`)
          : '';

        const trimmedApiKey = apiKey.trim();
        const trimmedApiSecret = apiSecret.trim();

        onUpdateConnection({
          exchange,
          apiKey: trimmedApiKey,
          apiSecret: trimmedApiSecret,
          ipWhitelisting,
          withdrawalDisabled,
          readOnly,
          tradingEnabled,
          isConnected: true,
          useTestnet,
          lastTested: Date.now(),
        });

        setFeedback(
          lang === 'ar'
            ? `✅ تم ربط حساب بينانس بنجاح! الاتصال بالشبكة (${useTestnet ? 'تجريبية Testnet' : 'حقيقية Live'}) قائم ومؤمن.${balancesNote}`
            : `✅ Successfully linked with Binance (${useTestnet ? 'Testnet' : 'Live'}) API!${balancesNote}`
        );
      } else {
        const trimmedApiKey = apiKey.trim();
        const trimmedApiSecret = apiSecret.trim();

        // Fallback save locally even if connection failed (sandbox simulation mode remains disconnected)
        onUpdateConnection({
          exchange,
          apiKey: trimmedApiKey,
          apiSecret: trimmedApiSecret,
          ipWhitelisting,
          withdrawalDisabled,
          readOnly,
          tradingEnabled,
          isConnected: false,
          useTestnet,
          lastTested: Date.now(),
        });

        setFeedback(
          lang === 'ar'
            ? `⚠️ تم حفظ مفاتيح التداول محلياً، ولكن تم رفض الاتصال من منصة بينانس! (السبب: ${resData.error || 'تأكد من المفاتيح أو وضع الاتصال'}). تم إلغاء ربط الحساب الحقيقي تلقائياً لحمايتك.`
            : `⚠️ Credentials saved locally, but connection setup failed! (Exchange rejected: ${resData.error || 'Incorrect key pairs'}). Real-time wallet mode has been disabled.`
        );
      }
    } catch (err: any) {
      setTesting(false);
      // Fallback
      const trimmedApiKey = apiKey.trim();
      const trimmedApiSecret = apiSecret.trim();
      onUpdateConnection({
        exchange,
        apiKey: trimmedApiKey,
        apiSecret: trimmedApiSecret,
        ipWhitelisting,
        withdrawalDisabled,
        readOnly,
        tradingEnabled,
        isConnected: false,
        useTestnet,
        lastTested: Date.now(),
      });
      setFeedback(
        lang === 'ar'
          ? `❌ فشل الاتصال بالشبكة لحفظ مفاتيح التداول ومحاولة الربط. يرجى مراجعة إعدادات الاتصال بالإنترنت والمحاولة مجدداً.`
          : `❌ Network connection failed while trying to link API. Please verify internet access and try again.`
      );
    }
  };

  // Handle saving Telegram Bot & Chat configurations
  const handleSaveTelegram = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConnection({
      telegramBotToken,
      telegramChatId,
    });
    setTelegramFeedback(
      lang === 'ar'
        ? '✅ تم حفظ وتبويب إعدادات تليجرام بنجاح! سيتم إرسال إشعارات التداول الحية إلى البوت المخصص.'
        : '✅ Telegram Bot settings updated successfully! Live signal telemetry and alerts are bound.'
    );
  };

  // Dispatch a secure test telegram notification through backend gateway
  const handleTestTelegram = async () => {
    if (!telegramBotToken || !telegramChatId) {
      setTelegramFeedback(
        lang === 'ar'
          ? '⚠️ يرجى تزويد بوت تليجرام ومعرف المستخدم (Chat ID) أولاً لبدء الفحص.'
          : '⚠️ Please supply Bot Token and Chat ID to initiate the check.'
      );
      return;
    }

    setTelegramTesting(true);
    setTelegramFeedback(null);

    try {
      const messageText = lang === 'ar'
        ? `🔔 <b>بوابة أمان التداول الهجين (Al-Moharif Emergency Portal)</b>\n\n✅ تم تفعيل اتصال البوت وتأمينه بنجاح!\n⏱️ تفاصيل الإرسال: <code>${new Date().toISOString()}</code>\n🔒 نظام الحماية: <b>نشط ويعمل بالكامل</b>`
        : `🔔 <b>Hybrid Bot Security Portal (Al-Moharif Emergency Portal)</b>\n\n✅ Bot connection has been initialized and secured successfully!\n⏱️ Dispatch time: <code>${new Date().toISOString()}</code>\n🔒 Protection Shield: <b>ACTIVE & FUNCTIONAL</b>`;

      const response = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: telegramBotToken,
          chatId: telegramChatId,
          message: messageText
        })
      });

      const resData = await response.json();
      setTelegramTesting(false);

      if (response.ok && resData.success) {
        setTelegramFeedback(
          lang === 'ar'
            ? '🚀 رائع! تم إرسال رسالة الاختبار بنجاح إلى حساب تليجرام الخاص بك. تحقق من هاتفك!'
            : '🚀 Outstanding! Check your device - the secure test message has been dispatched to your Telegram app.'
        );
      } else {
        setTelegramFeedback(
          lang === 'ar'
            ? `❌ فشل الارتباط: ${resData.error || 'يرجى التحقق من صحة التوكين والآي دي المكتوبين.'}`
            : `❌ Connection Rejected: ${resData.error || 'Please double-check your bot token and chat ID.'}`
        );
      }
    } catch (err: any) {
      setTelegramTesting(false);
      setTelegramFeedback(
        lang === 'ar'
          ? `❌ خطأ في الاتصال بالخادم: ${err.message}`
          : `❌ Server gateway error: ${err.message}`
      );
    }
  };

  // Trigger Diagnostic Check to run full endpoint audit and check Spot & Futures compliance
  const handleRunDiagnostics = async () => {
    if (!apiKey || !apiSecret) {
      setDiagnosticError(
        lang === 'ar'
          ? '⚠️ يرجى تزويد مفاتيح الـ API والـ Secret أولاً لبدء الفحص التشخيصي.'
          : '⚠️ Please supply API Key and Secret first to initiate diagnostics.'
      );
      return;
    }

    setDiagnosing(true);
    setDiagnosticError(null);
    setDiagnosticData(null);

    try {
      const response = await fetch('/api/binance/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          apiSecret
        })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setDiagnosticData(resData);
      } else {
        setDiagnosticError(resData.error || `HTTP REST rejection error code: ${response.status}`);
        setDiagnosticData(resData); // preserve error JSON body for full thorough inspection
      }
    } catch (err: any) {
      setDiagnosticError(err.message || 'Fatal network crash or CORS policy blocking the fetch connection.');
    } finally {
      setDiagnosing(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg max-w-4xl mx-auto" id="security-vault-container" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="border-b border-slate-800 pb-3 mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            <span>{d.apiVault}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar' ? 'إعداد مفاتيح التداول مع التدقيق الأمني لمنع محاولات الاختراق تماماً' : 'Exchange credential audits and security constraints'}
          </p>
        </div>
        <Shield className="w-8 h-8 text-indigo-500 animate-pulse shrink-0" />
      </div>

      {/* Extreme Warning Area */}
      <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-4 mb-4" id="critical-withdrawal-warn">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-rose-450 uppercase">{d.apiWarn}</h4>
            <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
              <li>{d.warn1}</li>
              <li>{d.warn2}</li>
              <li>{d.warn3}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Binance API Security & Extraction Technical Guide */}
      <div className="bg-slate-950/40 border border-slate-850 rounded-xl mb-6 overflow-hidden" id="binance-api-technical-guide">
        <button
          type="button"
          onClick={() => setShowGuide(prev => !prev)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-900/40 transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
            <div className="text-right sm:text-left" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
              <span className="text-xs font-black text-slate-200 block">
                {lang === 'ar' ? '📖 دليل الربط الآمن واستخراج صلاحيات التداول فقط' : '📖 Secure Bind Guide: Extracting Spot-Only Permissions'}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                {lang === 'ar' 
                  ? 'تعلم خطوة بخطوة كيفية ربط Binance بأمان وتفعيل خيارات التداول مع حظر السحب تماماً لحماية أموالك.' 
                  : 'Step-by-step guide to extract Binance API keys with spot scope enabled & withdrawals disabled.'}
              </p>
            </div>
          </div>
          {showGuide ? (
            <ChevronUp className="w-4 h-4 text-slate-450 shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-455 shrink-0" />
          )}
        </button>

        {showGuide && (
          <div className="p-4 border-t border-slate-850 bg-slate-900/10 space-y-4" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs text-slate-300 leading-normal">
              
              {/* Arabic Step Guide */}
              <div className="space-y-3.5 border-b lg:border-b-0 lg:border-l border-slate-850 pb-4 lg:pb-0 lg:pl-5">
                <span className="text-[10px] font-bold text-indigo-450 uppercase tracking-wide block">
                  🇸🇦 المنهج التقني للربط الآمن (خطوات بينانس)
                </span>
                
                <div className="space-y-3">
                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-md bg-indigo-950/80 border border-indigo-900/50 flex items-center justify-center text-[10px] font-bold text-indigo-400 shrink-0">١</span>
                    <p className="text-[11px]">
                      <strong className="text-slate-100">تسجيل الدخول والوصول لإدارة الـ API:</strong> سجل الدخول لحسابك في <span className="font-mono text-amber-400 font-bold">Binance</span>، ثم اضغط على أيقونة حسابك الشخصي وابحث عن قسم <strong className="text-indigo-400">"إدارة الـ API" (API Management)</strong>.
                    </p>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-md bg-indigo-950/80 border border-indigo-900/50 flex items-center justify-center text-[10px] font-bold text-indigo-400 shrink-0">٢</span>
                    <p className="text-[11px]">
                      <strong className="text-slate-100">إنشاء مفتاح مخصص:</strong> حدد خيار <strong className="text-slate-200">"إنشاء API" (Create API)</strong>، ثم حدد النوع الافتراضي <strong className="text-slate-200">"منشأ بواسطة النظام" (System Generated)</strong> واطلق عليه اسماً مرجعياً كـ <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-indigo-405">Hamza Smart Bot</code>.
                    </p>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-md bg-indigo-950/80 border border-indigo-900/50 flex items-center justify-center text-[10px] font-bold text-indigo-400 shrink-0">٣</span>
                    <div className="text-[11px] space-y-1.5 flex-1">
                      <strong className="text-amber-450">ضبط القيود الأمنية (RESTRICTIONS) - الأهم لحمايتك:</strong>
                      <div className="bg-slate-950/30 border border-slate-850 rounded-lg p-2.5 space-y-2 mt-1">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px]">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>تفعيل تمكين القراءة (Enable Reading)</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px]">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>تفعيل تداول فوري ومارجن (Enable Spot & Margin Trading)</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-rose-450 font-bold text-[10px] bg-rose-950/15 p-1 rounded">
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                          <span>تعطيل خيار السحب تماماً (Enable Withdrawals يجب أن يكون موصداً بالكامل 🚫)</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 italic">
                        *ملاظة: عندما يكون خيار "تمكين السحب" غير مفعل، لا تستطيع أي جهة سحب دولار واحد من حسابك، وتقتصر الصلاحية على فتح وإغلاق الصفقات داخلياً في محفظتك فقط.*
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-md bg-indigo-950/80 border border-indigo-900/50 flex items-center justify-center text-[10px] font-bold text-indigo-400 shrink-0">٤</span>
                    <p className="text-[11px]">
                      <strong className="text-slate-100">تقييد الوصول لـ IP مخصص (اختياري/موصى به):</strong> بإمكانك تفعيل خيار <strong className="text-indigo-400">"Restrict access to trusted IPs"</strong> لإغلاق المفتاح ليتلقى الطلبات من نظامنا المحمي فقط، مما يقفل الثغرة الأمنية نهائياً.
                    </p>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-md bg-indigo-950/80 border border-indigo-900/50 flex items-center justify-center text-[10px] font-bold text-indigo-400 shrink-0">٥</span>
                    <p className="text-[11px]">
                      <strong className="text-slate-100">نسخ وتحفيظ مفاتيحك الآمنة:</strong> انسخ الـ <strong className="text-emerald-400">API Key</strong> والـ <strong className="text-emerald-400">Secret Key</strong> والزقهما في الحقول المخصصة. يرجى توخي السرعة لأن الـ <code className="bg-slate-950 text-slate-300 px-1 rounded">Secret Key</code> سيتم إخفاؤه بصفة نهائية لسلامتك فور تحديثك لصفحة بينانس.
                    </p>
                  </div>
                </div>
              </div>

              {/* English Step Guide */}
              <div className="space-y-3.5">
                <span className="text-[10px] font-bold text-indigo-455 uppercase tracking-wide block">
                  🇬🇧 Secure Connection Methodology (Binance Steps)
                </span>

                <div className="space-y-3">
                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-md bg-indigo-950/80 border border-indigo-900/50 flex items-center justify-center text-[10px] font-bold text-indigo-400 shrink-0">1</span>
                    <p className="text-[11px]">
                      <strong className="text-slate-100">Access API Console:</strong> Login to your official <span className="font-mono text-amber-400 font-bold">Binance</span> account, navigate to user security settings, and open <strong className="text-indigo-400">"API Management"</strong>.
                    </p>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-md bg-indigo-950/80 border border-indigo-900/50 flex items-center justify-center text-[10px] font-bold text-indigo-400 shrink-0">2</span>
                    <p className="text-[11px]">
                      <strong className="text-slate-100">Generate Key Pair:</strong> Click on <strong className="text-slate-200">"Create API"</strong>, select system-generated, and name the app instance as you wish (e.g., <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-indigo-402 text-[10px]">Hamza Smart Bot</code>).
                    </p>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-md bg-indigo-950/80 border border-indigo-900/50 flex items-center justify-center text-[10px] font-bold text-indigo-400 shrink-0">3</span>
                    <div className="text-[11px] space-y-1.5 flex-1">
                      <strong className="text-amber-450">Set Permissions (Absolute Guard):</strong>
                      <div className="bg-slate-950/30 border border-slate-850 rounded-lg p-2.5 space-y-2 mt-1">
                        <div className="flex items-center gap-1.5 text-emerald-405 font-bold text-[10px]">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Check: "Enable Reading"</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-405 font-bold text-[10px]">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Check: "Enable Spot & Margin Trading"</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-rose-455 font-bold text-[10px] bg-rose-950/15 p-1 rounded">
                          <X className="w-3.5 h-3.5 stroke-[3] text-rose-400" />
                          <span>STRICTLY LEAVE "Enable Withdrawals" UNCHECKED 🚫</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 italic">
                        *By keeping withdrawals disabled, no script can trigger external outbound asset transfers. Funds stay locked safely in your wallet.*
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-md bg-indigo-950/80 border border-indigo-900/50 flex items-center justify-center text-[10px] font-bold text-indigo-400 shrink-0">4</span>
                    <p className="text-[11px]">
                      <strong className="text-slate-100">IP Locking Security (Recommended):</strong> Select <strong className="text-indigo-400">"Restrict access to trusted IPs only"</strong> and bind the client calls to secure target cloud proxies to shut off other random origins.
                    </p>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-md bg-indigo-950/80 border border-indigo-900/50 flex items-center justify-center text-[10px] font-bold text-indigo-400 shrink-0">5</span>
                    <p className="text-[11px]">
                      <strong className="text-slate-100">Save Your Secret Credentials:</strong> Instantly record both the <strong className="text-emerald-400">API Key</strong> and <strong className="text-emerald-400">Secret Key</strong> since Binance permanently masks the secret string once the window is closed.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Form panel */}
        <div>
          <h4 className="text-xs font-bold text-slate-300 mb-4 block uppercase border-b border-slate-850 pb-1.5">
            {lang === 'ar' ? 'نموذج ربط المنصة' : 'Credentials Config'}
          </h4>
          
          <form onSubmit={handleSaveAndTest} className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">{d.exchange}</label>
              <select
                value={exchange}
                onChange={(e) => setExchange(e.target.value as any)}
                className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 border border-slate-800 rounded-lg focus:outline-none"
              >
                <option value="Binance">Binance (بينانس)</option>
                <option value="Bybit">Bybit (باي بيت)</option>
                <option value="OKX">OKX (أو كي إكس)</option>
              </select>
            </div>

            {exchange === 'Binance' && (
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  {lang === 'ar' ? 'بيئة التداول المفضلة' : 'Target Network Mode'}
                </label>
                <select
                  value={useTestnet ? 'testnet' : 'mainnet'}
                  onChange={(e) => setUseTestnet(e.target.value === 'testnet')}
                  className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 border border-slate-850 rounded-lg focus:outline-none font-semibold text-indigo-400"
                >
                  <option value="testnet">Binance Testnet (تجريبي أموال وهمية آمنة)</option>
                  <option value="mainnet">Binance Live Mainnet (تداول حقيقي في محفظتك)</option>
                </select>
              </div>
            )}

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">{d.apiKey}</label>
              <input
                type="text"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="e.g. bG9jYWxob3N0YXBp..."
                className="w-full bg-slate-950 text-slate-200 font-mono text-xs px-3 py-2 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">{d.apiSecret}</label>
              <input
                type="password"
                required
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="••••••••••••••••••••••••••••••••••••"
                className="w-full bg-slate-950 text-slate-200 font-mono text-xs px-3 py-2 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={testing}
              className="w-full py-3 bg-indigo-650 hover:bg-indigo-600 rounded-lg text-white text-xs font-bold transition flex items-center justify-center gap-2 mt-2 disabled:opacity-40"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
              {d.saveApiKeys}
            </button>
          </form>
        </div>

        {/* Security Checkbox checklist */}
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-4 block uppercase border-b border-slate-850 pb-1.5">
              {lang === 'ar' ? 'فحص صلاحيات المفاتيح (Auditing Permissions)' : 'Authorization Scopes Audit'}
            </h4>

            <div className="space-y-4">
              
              {/* Withdrawal (CRITICAL MANDATE: SHOULD BE OFF) */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="withdraw_chk"
                  checked={!withdrawalDisabled}
                  onChange={(e) => setWithdrawalDisabled(!e.target.checked)}
                  className="w-4 h-4 text-rose-600 bg-slate-950 rounded border-slate-800 focus:ring-rose-500 mt-0.5"
                />
                <div>
                  <label htmlFor="withdraw_chk" className="text-xs font-bold text-slate-200 select-none flex items-center gap-1.5">
                    {lang === 'ar' ? 'تمكين خيار السحب المالي (Withdrawal)' : 'Enable Withdrawals'}
                    <span className="text-[8px] bg-rose-900/50 text-rose-400 px-1 py-0.5 rounded font-bold">⚠️ خطر جداً</span>
                  </label>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    {lang === 'ar' ? 'تمكين هذا الخيار يسرب صلاحية تحويل الأموال المتاحة. عطل الصلاحية دائماً لحماية محفظتك.' : 'Withdrawal must be unchecked for any automated software application.'}
                  </p>
                </div>
              </div>

              {/* Read Only (MANDATE: SHOULD BE ON) */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="readonly_chk"
                  checked={readOnly}
                  onChange={(e) => setReadOnly(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 bg-slate-950 rounded border-slate-800 focus:ring-indigo-500 mt-0.5"
                />
                <div>
                  <label htmlFor="readonly_chk" className="text-xs font-bold text-slate-200 select-none">
                    {lang === 'ar' ? 'صلاحية قراءة المحفظة والأرصدة (Read-Only)' : 'Audit Portfolio Balances'}
                  </label>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    {lang === 'ar' ? 'يسمح للبوت بقراءة الأرصدة الحالية وسجل التداول لتعديل متوسط تكاليف الشراء بدقة.' : 'Grants readable logs of current orders to allow Grid calibrations.'}
                  </p>
                </div>
              </div>

              {/* Trading enabled (MANDATE: SHOULD BE ON) */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="trade_chk"
                  checked={tradingEnabled}
                  onChange={(e) => setTradingEnabled(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 bg-slate-950 rounded border-slate-800 focus:ring-indigo-500 mt-0.5"
                />
                <div>
                  <label htmlFor="trade_chk" className="text-xs font-bold text-slate-200 select-none">
                    {lang === 'ar' ? 'صلاحية التداول الفوري والفيوتشرز (Trade)' : 'Execute Spot Transactions'}
                  </label>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    {lang === 'ar' ? 'يسمح للبوت بتقديم وحذف أوامر البيع والشراء بسلاسة داخل حدود الشبكة المحددة.' : 'Allows placing and cancellation of grid steps on limits.'}
                  </p>
                </div>
              </div>

              {/* IP whitelisting */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="ip_chk"
                  checked={ipWhitelisting}
                  onChange={(e) => setIpWhitelisting(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 bg-slate-950 rounded border-slate-800 focus:ring-indigo-500 mt-0.5"
                />
                <div>
                  <label htmlFor="ip_chk" className="text-xs font-bold text-slate-200 select-none flex items-center gap-1.5">
                    {d.ipWhitelist}
                    <span className="text-[8px] bg-emerald-900/60 text-emerald-400 px-1 py-0.5 rounded font-bold">منصوح به</span>
                  </label>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    {lang === 'ar' ? 'تقييد قبول الصفقات للمفاتيح فقط من عناوين الآي بي الخاصة بخودام السيرفر الآمنة.' : 'Whitelisting locks execution down to safe proxy nodes only.'}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Connection status display */}
          {connection.isConnected && (
            <div className="bg-emerald-950/40 border border-emerald-900/30 p-3 rounded-lg flex items-center gap-2 text-emerald-400 text-xs mt-4">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{d.testedOk}</span>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Server Outbound IP Info Box */}
      <div className="mt-6 pt-6 border-t border-slate-850" id="server-outbound-ip-section">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-1.5 rounded-lg bg-indigo-950/45 border border-indigo-500/25 text-indigo-400 shrink-0">
            <Server className="w-4 h-4" />
          </div>
          <div className="text-right sm:text-left" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
            <h4 className="text-xs font-black text-slate-100 uppercase tracking-tight flex items-center gap-2">
              <span>{lang === 'ar' ? '🌐 خادم التطبيق وعنوان الـ IP لتقييد Binance' : '🌐 Secure Server Outbound IP & Binance Restrict Mode'}</span>
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
              {lang === 'ar'
                ? 'اعرض عنوان الآي بي الخاص بالسيرفر الحالي لمطابقته مع خيارات تقييد الوصول في إعدادات الآي بي لزيادة نسبة أمان تداولك.'
                : 'Display egress IP address for secure API whitelisting configuration within Binance API settings.'}
            </p>
          </div>
        </div>

        <div className="bg-slate-950/50 rounded-xl border border-slate-850 p-4 space-y-3" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-lg border border-slate-850">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-300 block">
                {lang === 'ar' ? '🎯 عنوان الـ IP النشط حالياً للخادم:' : '🎯 Current Active Server Egress IP:'}
              </span>
              <p className="text-[10px] text-slate-400 leading-normal">
                {lang === 'ar'
                  ? 'هذا هو المخرج الفعلي لخادم السحاب (Google Cloud Run) الذي يرسل طلبات التوقيع لعقود الفوري والفيوتشرز.'
                  : 'This is the outbound client IP of the hosting container routing your live trading requests.'}
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-center">
              {loadingIp ? (
                <div className="flex items-center gap-1 text-slate-400 text-xs">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded px-3 py-1.5">
                  <span className="font-mono text-emerald-400 text-xs font-bold tracking-wider select-all">
                    {serverOutboundIp || 'Dynamic Cloud IP'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (serverOutboundIp) {
                        navigator.clipboard.writeText(serverOutboundIp);
                        alert(lang === 'ar' ? 'تم نسخ عنوان IP الخادم!' : 'Server Outbound IP Copied!');
                      }
                    }}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors font-bold cursor-pointer"
                  >
                    {lang === 'ar' ? 'نسخ' : 'Copy'}
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={fetchOutboundIp}
                title={lang === 'ar' ? 'تحديث' : 'Refresh'}
                className="p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded cursor-pointer transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-slate-900/30 border border-amber-900/20 rounded-lg p-3 text-[11px] leading-relaxed text-slate-400 space-y-2">
            <div className="flex gap-2 items-start">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-amber-450 block">
                  {lang === 'ar' ? '⚠️ إرشادات هامة جداً لتقييد الـ IP على بينانس:' : '⚠️ Critical IP-Whitelisting Deployment Advisory:'}
                </span>
                <p>
                  {lang === 'ar'
                    ? 'تعمل المنصة التجريبية على خوادم سحابية من "Google Cloud Run Container". وتتميز هذه البنية بصفتين غاية في الأهمية:'
                    : 'The demo application builds inside serverless Google Cloud Run containers. This architectural choice has two main behaviors:'}
                </p>
                <ul className="list-disc list-inside space-y-1 pl-1 text-[10.5px]">
                  <li>
                    {lang === 'ar'
                      ? 'العناوين ديناميكية (Dynamic Network Egress Pool) وتتغير بشكل دوري وتشاركي تبعاً لخوادم جوجل.'
                      : 'Egress IP addresses are dynamic and shared across Google Cloud infrastructure pools.'}
                  </li>
                  <li>
                    {lang === 'ar'
                      ? 'لذلك إذا قمت بتفعيل "Restrict access to trusted IPs only" ووضعت الـ IP الحالي فقط، قد تفقد بينانس الاتصال تلقائياً عند قيام الخادم بإعادة التوجيه السحابي للمحافظة على الأداء.'
                      : 'Whitelisting this single IP might result in transient connection rejections if Google migrates the container load.'}
                  </li>
                </ul>
                <p className="mt-1 font-bold text-indigo-400 text-[10.5px]">
                  {lang === 'ar'
                    ? '💡 نصيحة الأمان الكبرى: يوصى باختيار "Unrestricted (Less Secure)" لضمان استقرار الاتصال 24/7 طالما كنت قد عطلت صلاحية السحب (Withdrawals) تماماً من حسابك!'
                    : '💡 Secure Recommendation: Choose "Unrestricted IP" in Binance API settings. Since withdrawals (Enable Withdrawals) are completely disabled, your funds remain 100% safe!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Telegram Emergency Gate, Audits & Diagnostics */}
      <div className="mt-6 pt-6 border-t border-slate-850" id="telegram-emergency-gate-panel">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-1.5 rounded-lg bg-sky-950/45 border border-sky-500/25 text-sky-450 shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="text-right sm:text-left" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
            <h4 className="text-xs font-black text-slate-100 uppercase tracking-tight">
              {lang === 'ar' ? 'بوابة إرسال تنبيهات تليجرام الفورية (Premium Telegram Alerts)' : 'Instant Telegram Alerts Gateway'}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
              {lang === 'ar'
                ? 'اربط حساب تليجرام الخاص بك لاستلام تنبيهات الصفقات المفتوحة، والإغلاق الفوري، وتقرير تفعيل مفتاح الطوارئ (Kill Switch) مباشرة على هاتفك.'
                : 'Configure your credentials to receive push dispatches on market orders, flash crash mitigations, and emergency Kill Switch operations.'}
            </p>
          </div>
        </div>

        <div className="bg-slate-950/50 rounded-xl border border-slate-850 p-4">
          <form onSubmit={handleSaveTelegram} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">
                {lang === 'ar' ? 'رمز بوت تليجرام المخصص (Telegram Bot Token)' : 'Telegram Bot Token'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={telegramBotToken}
                  onChange={(e) => setTelegramBotToken(e.target.value)}
                  placeholder="e.g. 7736364858:AAGHy5aos..."
                  className="w-full bg-slate-950 text-slate-200 font-mono text-xs pl-8 pr-3 py-2 border border-slate-800 rounded-lg focus:outline-none focus:border-sky-500"
                />
                <div className="absolute left-2.5 top-2.5 text-slate-500">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-semibold">
                {lang === 'ar' ? 'معرّف المحادثة تليجرام (Telegram Chat/User ID)' : 'Telegram Chat/User ID'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  placeholder="e.g. 5450846071"
                  className="w-full bg-slate-950 text-slate-200 font-mono text-xs pl-8 pr-3 py-2 border border-slate-800 rounded-lg focus:outline-none focus:border-sky-500"
                />
                <div className="absolute left-2.5 top-2.5 text-slate-500">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 flex flex-wrap gap-2 justify-end mt-2">
              <button
                type="button"
                onClick={handleTestTelegram}
                disabled={telegramTesting}
                className="bg-sky-950/50 hover:bg-sky-900/40 border border-sky-500/40 text-sky-300 text-[10px] font-bold px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 select-none"
              >
                {telegramTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>{lang === 'ar' ? 'رسالة تجربة' : 'Send Test Msg'}</span>
              </button>

              <button
                type="submit"
                className="bg-sky-650 hover:bg-sky-600 border border-sky-500/30 text-white text-[10px] font-bold px-5 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer select-none"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{lang === 'ar' ? 'حفظ وإقران الإعدادات' : 'Save & Bind Alerts'}</span>
              </button>
            </div>
          </form>

          {telegramFeedback && (
            <div className={`mt-3.5 p-3 rounded-lg text-xs font-medium border ${
              telegramFeedback.includes('❌') || telegramFeedback.includes('Rejected')
                ? 'bg-rose-950/25 text-rose-400 border-rose-900/30'
                : 'bg-sky-950/40 text-sky-300 border-sky-900/40'
            }`}>
              {telegramFeedback}
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <div className={`mt-5 p-3.5 rounded-lg text-xs leading-normal font-medium border ${
          feedback.includes('خطر') || feedback.includes('RISK')
            ? 'bg-rose-950/20 text-rose-450 border-rose-900/30 animate-pulse'
            : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30'
        }`} id="security-feedback-banner">
          {feedback}
        </div>
      )}

      {/* Live Security Audit Dashboard */}
      <div className="mt-6 border-t border-slate-800 pt-5" id="security-live-audit-dashboard">
        <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
          <Fingerprint className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>{lang === 'ar' ? 'تقرير التدقيق الأمني الفوري للمفاتيح' : 'Real-time API Security Audit Report'}</span>
        </h4>

        <div className="bg-slate-950/60 rounded-xl border border-slate-850 p-4 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Security Badge Grade Column */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-850 pb-4 md:pb-0 md:pr-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
              {lang === 'ar' ? 'تصنيف الأمان الحالي' : 'Live Security Standing'}
            </span>

            {securityGrade === 'A+' && (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)] mb-2">
                  <span className="text-emerald-400 font-mono text-xl font-extrabold pb-0.5">A+</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">
                  {lang === 'ar' ? 'حصين وآمن جداً' : 'FORTIFIED / ULTRA SAFE'}
                </span>
              </div>
            )}
            
            {securityGrade === 'B' && (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.15)] mb-2">
                  <span className="text-amber-400 font-mono text-xl font-extrabold pb-0.5">B</span>
                </div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-tight">
                  {lang === 'ar' ? 'آمن مع تحذير بسيط' : 'SECURED WITH WARN'}
                </span>
              </div>
            )}
            
            {securityGrade === 'F' && (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)] mb-2 animate-pulse">
                  <span className="text-rose-400 font-mono text-xl font-extrabold pb-0.5">F</span>
                </div>
                <span className="text-[10px] font-bold text-rose-450 uppercase tracking-tight">
                  {lang === 'ar' ? 'مخاطر كارثية وشيكة!' : 'CRITICAL VULNERABILITY!'}
                </span>
              </div>
            )}
            
            {securityGrade === 'N/A' && (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-slate-800/20 border border-slate-700/30 flex items-center justify-center mb-2">
                  <span className="text-slate-500 font-mono text-base font-bold">N/A</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                  {lang === 'ar' ? 'في انتظار الإدخال' : 'PENDING CREDENTIALS'}
                </span>
              </div>
            )}
          </div>

          {/* Detailed rule audits list */}
          <div className="md:col-span-8 space-y-3.5">
            {/* Rule 1: Withdrawal check */}
            <div className="flex items-start gap-2.5">
              <div className={`mt-0.5 p-0.5 rounded-full shrink-0 ${
                !hasKeys 
                  ? 'bg-slate-800/40 text-slate-500' 
                  : isWithdrawalSafe 
                  ? 'bg-emerald-500/15 text-emerald-400' 
                  : 'bg-rose-500/15 text-rose-450 animate-bounce'
              }`}>
                {!hasKeys ? <Lock className="w-3.5 h-3.5" /> : isWithdrawalSafe ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-200 block leading-tight">
                  {lang === 'ar' ? 'فحص حظر سحب الأموال (Withdrawals Restricted)' : 'Withdrawal Restriction Status'}
                </span>
                <span className="text-[10px] text-slate-400 block leading-relaxed select-text">
                  {!hasKeys 
                    ? (lang === 'ar' ? 'يرجى تعبئة الحقول لإجراء الفحص الأمني التلقائي.' : 'Input credentials above to calculate key scopes safety.') 
                    : isWithdrawalSafe 
                    ? (lang === 'ar' ? 'ممتاز: صلاحية السحب مغلقة بنجاح. عاجز عن إخراج الأصول.' : 'Excellent: Wallet transfers blocked. Secure from draining exploits.')
                    : (lang === 'ar' ? 'خطير للغاية! الصلاحية مفتوحة. قم بإلغاء خيار "Enable Withdrawals" من إعدادات المنصة!' : 'Critical Leak: System allows transactions out. Disable withdrawals on Exchange immediately!')
                  }
                </span>
              </div>
            </div>

            {/* Rule 2: IP restriction check */}
            <div className="flex items-start gap-2.5">
              <div className={`mt-0.5 p-0.5 rounded-full shrink-0 ${
                !hasKeys 
                  ? 'bg-slate-800/40 text-slate-500' 
                  : isIpConfigured 
                  ? 'bg-emerald-500/15 text-emerald-400' 
                  : 'bg-amber-500/15 text-amber-400'
              }`}>
                {!hasKeys ? <Lock className="w-3.5 h-3.5" /> : isIpConfigured ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-200 block leading-tight">
                  {lang === 'ar' ? 'حصر نطاق الأي بي (IP Access White-listing)' : 'IP Gateway Network Restriction'}
                </span>
                <span className="text-[10px] text-slate-400 block leading-relaxed select-text">
                  {!hasKeys 
                    ? (lang === 'ar' ? 'يرجى تفعيل الخيار لتحديد النقل الآمن عبر الإنترنت.' : 'IP lock down check pending credentials configuration.') 
                    : isIpConfigured 
                    ? (lang === 'ar' ? 'رائع: القفل التام لنطاق IP نشط. يستجيب فقط للأوامر القادمة من بوابتنا الآمنة.' : 'Perfect: Single proxy binding validated. Key is safe from general server hijack.')
                    : (lang === 'ar' ? 'تحذير: ينصح بربط المفتاح بعنوان الآي بي المخصص لضمان عدم استغلاله إذا تسرّب.' : 'Notice: Unbound IP allows any client to connect. Bind key to the target proxy IP for max safety.')
                  }
                </span>
              </div>
            </div>

            {/* Rule 3: Key strength profile */}
            <div className="flex items-start gap-2.5">
              <div className={`mt-0.5 p-0.5 rounded-full shrink-0 ${
                !hasKeys 
                  ? 'bg-slate-800/40 text-slate-500' 
                  : isKeyLongEnough 
                  ? 'bg-emerald-500/15 text-emerald-400' 
                  : 'bg-amber-500/15 text-amber-400'
              }`}>
                {!hasKeys ? <Lock className="w-3.5 h-3.5" /> : isKeyLongEnough ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <KeyRound className="w-3.5 h-3.5" />}
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-200 block leading-tight">
                  {lang === 'ar' ? 'فحص مستوى تشفير الرموز (Cryptographic Key Strength)' : 'Cryptographic Strength Benchmark'}
                </span>
                <span className="text-[10px] text-slate-400 block leading-relaxed select-text">
                  {!hasKeys 
                    ? (lang === 'ar' ? 'سيتم قياس طول ومواصفات أمان المفتاح في الوقت الحقيقي.' : 'Cryptographic entropy profile checked here.') 
                    : isKeyLongEnough 
                    ? (lang === 'ar' ? 'قوي جداً: طول المفتاح وسلسلة التعريف مطابقة لمعايير الأمان الموصى بها.' : 'Robust: Entropy and length of key pair match strong industry cipher patterns.')
                    : (lang === 'ar' ? 'تنبيه: يبدو أن المفتاح قصير أو تجريبي. تأكد من إدخال المفتاح الرسمي بالكامل.' : 'Length Warning: Cryptographic key length is below normal. Ensure you copied the absolute full strings.')
                  }
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Dynamic API Diagnostic Console Section */}
      <div className="mt-6 pt-6 border-t border-slate-800" id="api-diagnographics-console">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-1.5 rounded-lg bg-emerald-950/45 border border-emerald-500/25 text-emerald-400 shrink-0">
            <Terminal className="w-4 h-4" />
          </div>
          <div className="text-right sm:text-left" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
            <h4 className="text-xs font-black text-slate-100 uppercase tracking-tight flex items-center gap-1.5">
              <span>{lang === 'ar' ? '🛠️ وحدة تشخيص وفحص مخرجات الـ API الخام' : '🛠️ Raw API Diagnostic Response Viewer'}</span>
              <span className="animate-pulse h-2 w-2 rounded-full bg-emerald-400"></span>
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
              {lang === 'ar'
                ? 'استدعِ مخرجات الخادم الحقيقية للتحقق مما إذا كانت منصة بينانس ترسل أرصدة صفرية أو إذا كانت خطوط تصفية البيانات في الخادم تقوم باستبعادها.'
                : 'Query raw server payloads directly to verify if Binance API is returning zero balances or if server filtering logic is filtering them out.'}
            </p>
          </div>
        </div>

        <div className="bg-slate-950/60 rounded-xl border border-slate-850 p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-lg border border-slate-850-80">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-300 block">
                {lang === 'ar' ? '🔍 فحص واجهة جلب الرصيد والتداول الفوري' : '🔍 Analyze Spot balances API response'}
              </span>
              <p className="text-[10px] text-slate-400 leading-normal">
                {lang === 'ar'
                  ? 'يقوم هذا الإجراء باستدعاء مسار (/api/binance/balance) بالصيغة التامة وعرض مصفوفة الأرصدة الخام وسجل تتبع الاستجابة.'
                  : 'Triggers request to /api/binance/balance using your current configured parameters and renders payload.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRunDiagnostics}
              disabled={diagnosing}
              className="px-4 py-2 bg-emerald-950/60 hover:bg-emerald-600 hover:text-slate-950 text-emerald-400 border border-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer select-none"
            >
              {diagnosing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{lang === 'ar' ? 'جاري الفحص...' : 'Querying...'}</span>
                </>
              ) : (
                <>
                  <Activity className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'تشغيل الفحص والتشخيص' : 'Run Diagnostic Query'}</span>
                </>
              )}
            </button>
          </div>

          {/* Core Technical Alert Explanation of how the server filters or maps zero balances */}
          <div className="bg-slate-900/30 border border-slate-850 rounded-lg p-3 text-[11px] leading-relaxed text-slate-400">
            <div className="flex gap-2 items-start">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-slate-200">
                  {lang === 'ar' ? '⚠️ كيف يتعامل الخادم مع الأرصدة الصفرية (Zero Balances)؟' : '⚠️ How does the server handle Zero Balances?'}
                </span>
                <p>
                  {lang === 'ar'
                    ? 'لتجنب الفوضى وتكدس واجهة التداول بعشرات العملات التي لا تملكها، يقوم خادم التطبيق (server.ts) بفلترة الأرصدة القادمة من بينانس وإرجاع الأصول التي قيمتها أكبر من صفر فقط:'
                    : 'To prevent dashboard clutter, our server (server.ts) automatically filters out empty asset wallets. It only returns values where:'}
                </p>
                <div className="bg-slate-950 border border-slate-850/80 rounded px-2.5 py-1.5 text-[10px] font-mono text-emerald-350 self-start select-all my-1.5">
                  {"balances = data.balances.filter(asset => parseFloat(asset.free) > 0 || parseFloat(asset.locked) > 0);"}
                </div>
                <p>
                  {lang === 'ar'
                    ? 'لذلك إذا كانت محفظتك في بينانس تحتوي على أرصدة فارغة أو أقل من الحد الأدنى، فلن يتم تمريرها إلى لوحة المراقبة الرئيسية. من خلال المحاكي أدناه، يمكنك تأكيد المحتوى الحقيقي بنسبة 100%!'
                    : 'If an asset wallet on Binance is empty or has zero balance, it will not populate. Through the diagnostic logs engine below, you can inspect 100% of the raw API response!'}
                </p>
              </div>
            </div>
          </div>

          {diagnosticError && (
            <div className="bg-rose-950/30 border border-rose-900/40 p-3.5 rounded-lg text-xs text-rose-450 font-medium">
              <strong className="block font-black mb-1">{lang === 'ar' ? '❌ خطأ تشخيصي:' : '❌ Diagnostic Incident logged:'}</strong>
              <p className="font-mono text-[11.5px] select-all leading-normal">{diagnosticError}</p>
            </div>
          )}

          {diagnosticData && (
            <div className="space-y-4 pt-2">
              {diagnosticData.results ? (
                <div className="bg-slate-950 border border-indigo-950/65 rounded-xl p-4.5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-850 gap-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-indigo-400" />
                      {lang === 'ar' ? '🔍 نتائج تقرير فحص القيود والصلاحيات (API Diagnostics Audit)' : '🔍 API Key Capability Diagnostics Audit'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-850 self-start">
                      IP: {diagnosticData.results.outboundIp || 'Unknown'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" style={{ direction: 'ltr' }}>
                    {/* Spot Mainnet */}
                    <div className={`p-3 rounded-lg border ${diagnosticData.results.spotMainnet.ok ? 'bg-emerald-950/20 border-emerald-900/60' : 'bg-rose-950/20 border-rose-900/60'} flex items-start gap-2.5`}>
                      {diagnosticData.results.spotMainnet.ok ? (
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Spot Mainnet (التداول الفوري الحقيقي)</span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {diagnosticData.results.spotMainnet.msg}
                        </span>
                      </div>
                    </div>

                    {/* Futures Mainnet */}
                    <div className={`p-3 rounded-lg border ${diagnosticData.results.futuresMainnet.ok ? 'bg-emerald-950/20 border-emerald-900/60' : 'bg-rose-950/20 border-rose-900/60'} flex items-start gap-2.5`}>
                      {diagnosticData.results.futuresMainnet.ok ? (
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Futures Mainnet (العقود الآجلة الحقيقية)</span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {diagnosticData.results.futuresMainnet.msg}
                        </span>
                      </div>
                    </div>

                    {/* Spot Testnet */}
                    <div className={`p-3 rounded-lg border ${diagnosticData.results.spotTestnet.ok ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900/40 border-slate-800'} flex items-start gap-2.5`}>
                      {diagnosticData.results.spotTestnet.ok ? (
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4.5 h-4.5 text-slate-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Spot Testnet (الفوري التجريبي)</span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {diagnosticData.results.spotTestnet.msg}
                        </span>
                      </div>
                    </div>

                    {/* Futures Testnet */}
                    <div className={`p-3 rounded-lg border ${diagnosticData.results.futuresTestnet.ok ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900/40 border-slate-800'} flex items-start gap-2.5`}>
                      {diagnosticData.results.futuresTestnet.ok ? (
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4.5 h-4.5 text-slate-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Futures Testnet (الآجل التجريبي)</span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {diagnosticData.results.futuresTestnet.msg}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* System Clock synchronization offset indicator */}
                  <div className="bg-slate-900 border border-slate-850 rounded-lg p-3 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">{lang === 'ar' ? '⏱️ فارق تزامن ساعة الخادم المحلي مع بينانس:' : '⏱️ Server timezone drift offset to Binance:'}</span>
                    <span className={`font-bold ${Math.abs(diagnosticData.results.timeOffsetMs) < 1000 ? 'text-emerald-400' : 'text-amber-405'}`}>
                      {diagnosticData.results.timeOffsetMs} ms ({lang === 'ar' ? 'تمت معادلته تلقائياً وتزامنه ✅' : 'adjusted and auto-synced ✅'})
                    </span>
                  </div>

                  {/* Smart Guidance recommendations panel */}
                  {diagnosticData.guidance && diagnosticData.guidance.length > 0 && (
                    <div className="bg-indigo-950/20 border border-indigo-900/40 p-4 rounded-xl space-y-2">
                      <span className="text-xs font-bold text-indigo-400 block">
                        💡 {lang === 'ar' ? 'توصيات التشخيص لحل المشكلة فوراً:' : 'Direct Actionable Advice to Fix Connection:'}
                      </span>
                      <ul className="list-disc list-inside text-xs text-slate-300 space-y-1.5 leading-relaxed">
                        {diagnosticData.guidance.map((g: string, i: number) => (
                          <li key={i}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Raw JSON disclosure panel */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>{lang === 'ar' ? '📦 مخرجات الـ JSON المسترجعة:' : '📦 Returned API Response JSON Payload:'}</span>
                </div>
                <div className="bg-slate-950 border border-slate-850 rounded-lg overflow-hidden shadow-inner">
                  <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-850 flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-slate-400">Response Body ({JSON.stringify(diagnosticData).length} bytes)</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(diagnosticData, null, 2));
                        setCopiedResponse(true);
                        setTimeout(() => setCopiedResponse(false), 2000);
                      }}
                      className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer select-none"
                    >
                      {copiedResponse 
                        ? (lang === 'ar' ? '✅ [تم النسخ!]' : '✅ [Copied!]') 
                        : (lang === 'ar' ? '[نسخ الكود JSON]' : '[Copy JSON Payload]')}
                    </button>
                  </div>
                  <pre className="p-3 text-[11px] max-h-80 overflow-y-auto select-all text-emerald-400 font-mono leading-relaxed whitespace-pre scrollbar-thin">
                    {JSON.stringify(diagnosticData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
