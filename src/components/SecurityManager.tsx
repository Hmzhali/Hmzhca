/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ApiConnection } from '../types';
import { ARABIC_DICT } from '../utils/marketData';
import { auth, db } from '../lib/firebase';
import { updatePassword, updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { 
  Shield, Lock, AlertTriangle, CheckCircle, Server, RefreshCw, 
  ShieldCheck, ShieldAlert, Check, X, KeyRound, Fingerprint, 
  Send, MessageSquare, Bot, BookOpen, ChevronDown, ChevronUp, 
  Info, Terminal, Activity, User, Mail, Eye, EyeOff, Save,
  Compass, Zap, Award, Coins, Flame, Pocket
} from 'lucide-react';

interface SecurityManagerProps {
  lang: 'ar' | 'en';
  connection: ApiConnection;
  onUpdateConnection: (conn: Partial<ApiConnection>) => void;
  userData?: any;
}

const PRESET_AVATARS = [
  { id: 'sentinel', label: 'Sentinel', color: 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30', icon: Shield },
  { id: 'bull', label: 'Bull Trader', color: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30', icon: Flame },
  { id: 'gold', label: 'Gold Miner', color: 'bg-amber-600/20 text-amber-400 border-amber-500/30', icon: Coins },
  { id: 'grid', label: 'Grid Wizard', color: 'bg-sky-600/20 text-sky-400 border-sky-500/30', icon: Compass },
  { id: 'quantum', label: 'Quantum AI', color: 'bg-violet-600/20 text-violet-400 border-violet-500/30', icon: Zap },
  { id: 'phoenix', label: 'High Yield', color: 'bg-rose-600/20 text-rose-400 border-rose-500/30', icon: Award },
];

export default function SecurityManager({
  lang,
  connection,
  onUpdateConnection,
  userData
}: SecurityManagerProps) {
  const d = ARABIC_DICT;

  // Tabs: profile, security, credentials, telegram
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'security' | 'credentials' | 'telegram'>('profile');

  // Collapsible guide state
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // Profile Settings States
  const [displayName, setDisplayName] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('sentinel');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [updatingProfileState, setUpdatingProfileState] = useState<boolean>(false);

  // Security / Password States
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [updatingPasswordState, setUpdatingPasswordState] = useState<boolean>(false);

  // Form states local copies for Binance
  const [exchange, setExchange] = useState<ApiConnection['exchange']>(connection.exchange);
  const [apiKey, setApiKey] = useState<string>(connection.apiKey);
  const [apiSecret, setApiSecret] = useState<string>(connection.apiSecret);
  const [useTestnet, setUseTestnet] = useState<boolean>(connection.useTestnet === true);
  const [ipWhitelisting, setIpWhitelisting] = useState<boolean>(connection.ipWhitelisting);
  const [withdrawalDisabled, setWithdrawalDisabled] = useState<boolean>(connection.withdrawalDisabled);
  const [readOnly, setReadOnly] = useState<boolean>(connection.readOnly);
  const [tradingEnabled, setTradingEnabled] = useState<boolean>(connection.tradingEnabled);
  
  // Telegram Integration State
  const [telegramBotToken, setTelegramBotToken] = useState<string>(connection.telegramBotToken || '');
  const [telegramChatId, setTelegramChatId] = useState<string>(connection.telegramChatId || '');
  const [telegramTesting, setTelegramTesting] = useState<boolean>(false);
  const [telegramFeedback, setTelegramFeedback] = useState<string | null>(null);

  const [testing, setTesting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Diagnostic Logs UI States
  const [diagnosing, setDiagnosing] = useState<boolean>(false);
  const [diagnosticData, setDiagnosticData] = useState<any | null>(null);
  const [diagnosticError, setDiagnosticError] = useState<string | null>(null);

  // Dynamic outbound egress IP detection
  const [serverOutboundIp, setServerOutboundIp] = useState<string | null>(null);
  const [loadingIp, setLoadingIp] = useState<boolean>(false);

  // Sync profile values when userData arrives
  useEffect(() => {
    if (userData) {
      setDisplayName(userData.displayName || auth.currentUser?.displayName || '');
      setSelectedAvatar(userData.avatarId || 'sentinel');
    }
  }, [userData]);

  const fetchOutboundIp = async () => {
    setLoadingIp(true);
    try {
      const res = await fetch('/api/gateway/outbound-ip');
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
  const isWithdrawalSafe = withdrawalDisabled; 
  const isIpConfigured = ipWhitelisting;

  let securityGrade: 'A+' | 'B' | 'F' | 'N/A' = 'N/A';
  if (hasKeys) {
    if (!isWithdrawalSafe) {
      securityGrade = 'F'; 
    } else if (isIpConfigured) {
      securityGrade = 'A+'; 
    } else {
      securityGrade = 'B'; 
    }
  }

  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);
    setUpdatingProfileState(true);

    const currentUser = auth.currentUser;
    if (!currentUser) {
      setProfileError(lang === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'You must be logged in');
      setUpdatingProfileState(false);
      return;
    }

    try {
      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName: displayName,
      });

      // Update Firestore user document
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        displayName: displayName,
        avatarId: selectedAvatar,
        updatedAt: Date.now()
      });

      setProfileSuccess(
        lang === 'ar' 
          ? '🎉 تم تحديث الملف الشخصي بنجاح!' 
          : '🎉 Profile updated successfully!'
      );
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setProfileError(err.message || 'Error occurred while updating profile');
    } finally {
      setUpdatingProfileState(false);
    }
  };

  // Handle password update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecuritySuccess(null);
    setSecurityError(null);

    if (newPassword !== confirmPassword) {
      setSecurityError(
        lang === 'ar' 
          ? '❌ كلمات المرور غير متطابقة!' 
          : '❌ Passwords do not match!'
      );
      return;
    }

    if (newPassword.length < 6) {
      setSecurityError(
        lang === 'ar' 
          ? '❌ يجب أن تكون كلمة المرور ٦ أحرف على الأقل' 
          : '❌ Password must be at least 6 characters'
      );
      return;
    }

    setUpdatingPasswordState(true);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setSecurityError(lang === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'You must be logged in');
      setUpdatingPasswordState(false);
      return;
    }

    try {
      await updatePassword(currentUser, newPassword);
      setSecuritySuccess(
        lang === 'ar' 
          ? '🔒 تم تغيير كلمة المرور بنجاح! يرجى استخدامها في تسجيل الدخول القادم.' 
          : '🔒 Password changed successfully! Use it for your next sign in.'
      );
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Failed to change password:', err);
      let msg = err.message || 'Error updating password';
      if (err.code === 'auth/requires-recent-login') {
        msg = lang === 'ar'
          ? '🔒 لدواعي الأمان، يتطلب هذا الإجراء تسجيل دخول حديث. يرجى تسجيل الخروج والعودة مجدداً لتغيير كلمة المرور.'
          : '🔒 For security reasons, this action requires a recent login. Please log out and sign in again to update password.';
      }
      setSecurityError(msg);
    } finally {
      setUpdatingPasswordState(false);
    }
  };

  // Handle saving credentials with security check
  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setFeedback(null);

    if (!withdrawalDisabled) {
      setTesting(false);
      setFeedback(
        lang === 'ar'
          ? '⚠️ تحذير خطير للغاية! السحب مُمكّن! يرجى تعطيل صلاحيات السحب (Withdrawal) فوراً من المنصة لحماية رأس مالك.'
          : '⚠️ CRITICAL RISK: Withdrawal permissions are enabled! Turn off withdrawals in Binance console.'
      );
      onUpdateConnection({ isConnected: false });
      return;
    }

    try {
      const response = await fetch('/api/gateway/test', {
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

        onUpdateConnection({
          exchange,
          apiKey: apiKey.trim(),
          apiSecret: apiSecret.trim(),
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
        onUpdateConnection({
          exchange,
          apiKey: apiKey.trim(),
          apiSecret: apiSecret.trim(),
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
      onUpdateConnection({
        exchange,
        apiKey: apiKey.trim(),
        apiSecret: apiSecret.trim(),
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
      const response = await fetch('/api/gateway/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, apiSecret })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setDiagnosticData(resData);
      } else {
        setDiagnosticError(resData.error || `HTTP REST rejection error code: ${response.status}`);
        setDiagnosticData(resData); 
      }
    } catch (err: any) {
      setDiagnosticError(err.message || 'Fatal network crash or CORS policy blocking the fetch connection.');
    } finally {
      setDiagnosing(false);
    }
  };

  const activeAvatarInfo = PRESET_AVATARS.find(a => a.id === selectedAvatar) || PRESET_AVATARS[0];
  const AvatarIcon = activeAvatarInfo.icon;

  return (
    <div className="max-w-6xl mx-auto space-y-6" id="saas-settings-dashboard" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
          <div className={`w-16 h-16 rounded-full border-2 border-indigo-500/30 flex items-center justify-center shrink-0 ${activeAvatarInfo.color}`}>
            <AvatarIcon className="w-8 h-8" />
          </div>
          <div className="text-right sm:text-left">
            <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
              <span>{displayName || (lang === 'ar' ? 'عضو المحترف' : 'Al-Moharif Member')}</span>
              {userData?.role === 'OWNER' && (
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-black">
                  {lang === 'ar' ? '👑 المالك' : '👑 OWNER'}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-mono flex items-center gap-1.5 justify-center sm:justify-start">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>{auth.currentUser?.email || (userData?.email || 'N/A')}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
              {lang === 'ar' ? 'مستوى أمان الربط' : 'API Connection Safety'}
            </span>
            <div className="flex items-center gap-1.5 mt-1 justify-end">
              <span className={`text-xs font-black px-2.5 py-1 rounded ${
                securityGrade === 'A+' ? 'bg-emerald-500/10 text-emerald-400' :
                securityGrade === 'B' ? 'bg-indigo-500/10 text-indigo-400' :
                securityGrade === 'F' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {securityGrade}
              </span>
              <span className="text-xs text-slate-300 font-bold">
                {securityGrade === 'A+' ? (lang === 'ar' ? 'حصين ومثالي' : 'Ultra Secure') :
                 securityGrade === 'B' ? (lang === 'ar' ? 'مؤمن وقابل للتحسين' : 'Secure (Improveable)') :
                 securityGrade === 'F' ? (lang === 'ar' ? 'مخاطرة عالية' : 'High Risk') : (lang === 'ar' ? 'غير مربوط' : 'Not Connected')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main SaaS Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1.5 self-start shadow-md">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-bold transition-all ${
              activeSubTab === 'profile' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' 
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>{lang === 'ar' ? 'الملف الشخصي' : 'Profile Settings'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('security')}
            className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-bold transition-all ${
              activeSubTab === 'security' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' 
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4 shrink-0" />
            <span>{lang === 'ar' ? 'كلمة المرور والأمان' : 'Security & Password'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('credentials')}
            className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-bold transition-all ${
              activeSubTab === 'credentials' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' 
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4 shrink-0" />
            <span>{lang === 'ar' ? 'مفاتيح التداول (Binance)' : 'Binance API Keys'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('telegram')}
            className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-bold transition-all ${
              activeSubTab === 'telegram' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' 
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>{lang === 'ar' ? 'إشعارات تليجرام' : 'Telegram Alerts'}</span>
          </button>
        </div>

        {/* Dynamic Display Panel */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md min-h-[480px] flex flex-col justify-between">
          
          {/* TAB 1: PROFILE SETTINGS */}
          {activeSubTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-800">
                  <User className="w-5 h-5 text-indigo-400" />
                  <span>{lang === 'ar' ? 'تعديل الملف الشخصي' : 'Personal Profile Settings'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'ar' ? 'قم بتعديل اسمك المكتوب واختيار أيقونة مستخدم مخصصة تليق بك.' : 'Manage your displayed identity and visual crypto avatar across the workspace.'}
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Avatar Selection Grid */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-3">
                    {lang === 'ar' ? 'اختر أيقونة المستخدم المخصصة:' : 'Choose Custom Crypto Avatar:'}
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {PRESET_AVATARS.map((av) => {
                      const AvIcon = av.icon;
                      const isSelected = selectedAvatar === av.id;
                      return (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setSelectedAvatar(av.id)}
                          className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition cursor-pointer ${
                            isSelected 
                              ? 'bg-indigo-600/15 border-indigo-500 text-indigo-400 shadow-md ring-1 ring-indigo-500/20' 
                              : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-950/80 hover:text-slate-200'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${av.color}`}>
                            <AvIcon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-bold">{av.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Display Name Input */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      {lang === 'ar' ? 'اسم المستخدم المعروض' : 'Display Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={lang === 'ar' ? 'أدخل اسمك المفضل' : 'e.g. Hamza Al-Amri'}
                      className="w-full bg-slate-950 text-slate-200 text-xs px-3 py-2.5 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      {lang === 'ar' ? 'البريد الإلكتروني (غير قابل للتغيير)' : 'Email Address (Read-only)'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled
                        value={auth.currentUser?.email || userData?.email || 'N/A'}
                        className="w-full bg-slate-950/50 text-slate-500 text-xs px-3 py-2.5 border border-slate-850 rounded-lg focus:outline-none cursor-not-allowed select-none"
                      />
                      <div className="absolute inset-y-0 right-3 flex items-center">
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                          {lang === 'ar' ? '✓ حساب موثق' : '✓ Verified'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {profileSuccess && (
                  <div className="text-emerald-400 text-xs font-bold p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                    {profileSuccess}
                  </div>
                )}

                {profileError && (
                  <div className="text-rose-400 text-xs font-bold p-3 bg-rose-500/5 rounded-xl border border-rose-500/10">
                    {profileError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={updatingProfileState}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 self-start cursor-pointer shadow-lg"
                >
                  {updatingProfileState ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{lang === 'ar' ? 'حفظ التغييرات الشخصية' : 'Save Profile Changes'}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: PLATFORM SECURITY */}
          {activeSubTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Lock className="w-5 h-5 text-indigo-400" />
                  <span>{lang === 'ar' ? 'الأمان وتغيير كلمة المرور' : 'Platform Security & Password'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'ar' ? 'لتغيير كلمة مرور حسابك، أدخل كلمة المرور الجديدة وقم بتأكيدها.' : 'Secure your account by rotating passwords regularly.'}
                </p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
                {/* New Password */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    {lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950 text-slate-200 text-xs px-3 py-2.5 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300 transition"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    {lang === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950 text-slate-200 text-xs px-3 py-2.5 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300 transition"
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {securitySuccess && (
                  <div className="text-emerald-400 text-xs font-bold p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 leading-relaxed">
                    {securitySuccess}
                  </div>
                )}

                {securityError && (
                  <div className="text-rose-400 text-xs font-bold p-3 bg-rose-500/5 rounded-xl border border-rose-500/10 leading-relaxed">
                    {securityError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={updatingPasswordState}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  {updatingPasswordState ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  <span>{lang === 'ar' ? 'تغيير كلمة المرور' : 'Update Security Password'}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: BINANCE API CREDENTIALS */}
          {activeSubTab === 'credentials' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-indigo-400" />
                  <span>{d.apiVault}</span>
                </h3>
                <Shield className="w-5 h-5 text-indigo-500 shrink-0" />
              </div>

              {/* Extreme Warning Area */}
              <div className="bg-rose-950/25 border border-rose-900/40 rounded-xl p-4" id="critical-withdrawal-warn">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-rose-400 uppercase">{d.apiWarn}</h4>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      <li>{d.warn1}</li>
                      <li>{d.warn2}</li>
                      <li>{d.warn3}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Collapsible Connection Guide */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl overflow-hidden" id="binance-api-technical-guide">
                <button
                  type="button"
                  onClick={() => setShowGuide(prev => !prev)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/40 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-200">
                      {lang === 'ar' ? '📖 دليل الربط واستخراج صلاحيات التداول والمود الحقيقي' : '📖 Connection Guide: Spot & Futures API Permission Settings'}
                    </span>
                  </div>
                  {showGuide ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {showGuide && (
                  <div className="p-4 border-t border-slate-850 bg-slate-900/10 space-y-4" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs text-slate-300 leading-normal">
                      <div className="space-y-2 pb-4 border-b lg:border-b-0 lg:border-l border-slate-800 lg:pl-5">
                        <strong className="text-indigo-400 block font-bold">🇸🇦 إرشادات بينانس (بالعربية)</strong>
                        <p className="text-[11px] leading-relaxed">
                          ١. ادخل لحسابك في <strong>Binance</strong> وافتح صفحة <strong>إدارة الـ API</strong>.<br />
                          ٢. أنشئ مفتاحاً جديداً (منشأ بواسطة النظام) باسم <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-indigo-400">Hamza Trade Bot</code>.<br />
                          ٣. اضغط على <strong>تعديل القيود (Edit Restrictions)</strong> ونفذ الآتي:<br />
                          - تفعيل <strong>قراءة الأرصدة (Enable Reading)</strong>.<br />
                          - تفعيل <strong>التداول الفوري والمارجن (Enable Spot & Margin Trading)</strong>.<br />
                          - تفعيل <strong>عقود الفيوتشرز (Enable Futures)</strong> للعمل بالكامل عقود آجلة.<br />
                          - 🚫 <strong>حظر خيار السحب تماماً (Enable Withdrawals يجب أن يكون موصداً بالكامل)</strong>.<br />
                          ٤. انسخ المفتاحين والزقهما في الحقول المخصصة.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <strong className="text-indigo-400 block font-bold">🇬🇧 Binance Steps (English)</strong>
                        <p className="text-[11px] leading-relaxed">
                          1. Login to <strong>Binance</strong>, head to account safety, and open <strong>API Management</strong>.<br />
                          2. Generate a system-generated API key pair named <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-indigo-400">Hamza Trade Bot</code>.<br />
                          3. Set constraints inside Binance console:<br />
                          - Check <strong>"Enable Reading"</strong>.<br />
                          - Check <strong>"Enable Spot & Margin Trading"</strong>.<br />
                          - Check <strong>"Enable Futures"</strong> for futures trading loops.<br />
                          - 🚫 <strong>Do NOT check "Enable Withdrawals" (Withdrawals must stay strictly disabled!)</strong>.<br />
                          4. Copy the API Key and Secret and paste them below.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Config Forms Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form panel */}
                <div>
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
                          {lang === 'ar' ? 'بيئة تداول الحساب' : 'Target Network Mode'}
                        </label>
                        <select
                          value={useTestnet ? 'testnet' : 'mainnet'}
                          onChange={(e) => setUseTestnet(e.target.value === 'testnet')}
                          className="w-full bg-slate-950 text-indigo-400 text-xs px-3 py-2 border border-slate-800 rounded-lg focus:outline-none font-bold"
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
                        className="w-full bg-slate-950 text-slate-200 font-mono text-xs px-3 py-2.5 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
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
                        className="w-full bg-slate-950 text-slate-200 font-mono text-xs px-3 py-2.5 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {feedback && (
                      <div className="text-xs leading-relaxed p-3 rounded-lg border bg-slate-950 border-slate-800 text-indigo-300">
                        {feedback}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={testing}
                      className="w-full py-3 bg-indigo-650 hover:bg-indigo-600 rounded-xl text-white text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer shadow-lg"
                    >
                      {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                      <span>{d.saveApiKeys}</span>
                    </button>
                  </form>
                </div>

                {/* Audit Checkbox panel */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 mb-4 block uppercase border-b border-slate-800 pb-1.5">
                      {lang === 'ar' ? 'فحص صلاحيات القيود (Auditing Permissions)' : 'Authorization Scopes Audit'}
                    </h4>

                    <div className="space-y-4">
                      {/* Withdrawal checkbox */}
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

                      {/* Read-only check */}
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

                      {/* Trading check */}
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

                  {connection.isConnected && (
                    <div className="bg-emerald-950/40 border border-emerald-900/30 p-3 rounded-lg flex items-center gap-2 text-emerald-400 text-xs mt-4">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>{d.testedOk}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Outbound IP section */}
              <div className="border-t border-slate-800 pt-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <Server className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                      {lang === 'ar' ? '🌐 خادم السيرفر وعناوين الـ IP الآمنة لـ Binance' : '🌐 Application Server Outbound IP Whitelisting'}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      {lang === 'ar' ? 'استخدم الـ IP التالي في إعدادات Binance API لتأمين حسابك بالكامل من أي اختراقات خارجية.' : 'White list the current server egress IP inside Binance Management console to lock calls down.'}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-300 block">
                      {lang === 'ar' ? '🎯 الآي بي الخارج من خادم جوجل حالياً:' : '🎯 Current Active Server Egress IP:'}
                    </span>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      {lang === 'ar' ? 'هذا عنوان IP المعتمد الذي ترسل منه العمليات لتأكيد الصفقات الهجينة والفيوتشرز.' : 'Outbound cloud container client network interface address.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {loadingIp ? (
                      <span className="text-xs text-slate-500">{lang === 'ar' ? 'جاري الكشف...' : 'Detecting...'}</span>
                    ) : (
                      <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg">
                        <span className="font-mono text-emerald-400 text-xs font-black select-all tracking-wider">
                          {serverOutboundIp || 'Dynamic Pool IP'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (serverOutboundIp) {
                              navigator.clipboard.writeText(serverOutboundIp);
                              alert(lang === 'ar' ? 'تم نسخ عنوان IP الخادم!' : 'Server Outbound IP Copied!');
                            }
                          }}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
                        >
                          {lang === 'ar' ? 'نسخ' : 'Copy'}
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={fetchOutboundIp}
                      className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 rounded-lg cursor-pointer transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="bg-amber-950/10 border border-amber-900/20 p-3 rounded-xl text-[10px] leading-relaxed text-slate-400">
                  ⚠️ <strong>{lang === 'ar' ? 'تنويه ديناميكي هام:' : 'Dynamic Pool Notice:'}</strong> {lang === 'ar' ? 'نظراً لأن خوادم Google Cloud Run مرنة وتتوزع على مخرجات IP ديناميكية، يوصى دائماً باختيار "Unrestricted IP access" في Binance مع إغلاق صلاحيات السحب تماماً (Withdrawals Off) فهذا أسهل وأكثر استقراراً في الاستجابة الآلية اللحظية.' : 'Google Cloud Run utilizes dynamic shared cloud egress interfaces. Choosing Unrestricted IP setup in Binance with withdrawals disabled completely is recommended for seamless 24/7 background operation.'}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TELEGRAM LIVE ALERTS */}
          {activeSubTab === 'telegram' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-800">
                  <MessageSquare className="w-5 h-5 text-indigo-400" />
                  <span>{lang === 'ar' ? 'ربط إشعارات التداول الفورية بتليجرام' : 'Telegram Alerts Gateway'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'ar' ? 'قم بإدخال بيانات البوت الخاص بك لتلقي تقارير الصفقات وأوامر الطوارئ مباشرة على هاتفك.' : 'Configure custom Telegram push delivery to receive instant trading signal outputs.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Telegram Form */}
                <form onSubmit={handleSaveTelegram} className="space-y-4">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      {lang === 'ar' ? 'رمز توكين البوت (Bot Token)' : 'Telegram Bot Token'}
                    </label>
                    <input
                      type="text"
                      required
                      value={telegramBotToken}
                      onChange={(e) => setTelegramBotToken(e.target.value)}
                      placeholder="7736364858:AAGHy5aos..."
                      className="w-full bg-slate-950 text-slate-200 font-mono text-xs px-3 py-2.5 border border-slate-800 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      {lang === 'ar' ? 'معرف الدردشة الخاص بك (Chat ID)' : 'Your Chat ID'}
                    </label>
                    <input
                      type="text"
                      required
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      placeholder="e.g. 129485739"
                      className="w-full bg-slate-950 text-slate-200 font-mono text-xs px-3 py-2.5 border border-slate-800 rounded-lg focus:outline-none"
                    />
                  </div>

                  {telegramFeedback && (
                    <div className="text-xs p-3 rounded-lg border bg-slate-950 border-slate-800 text-indigo-300 leading-relaxed">
                      {telegramFeedback}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-600 rounded-xl text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <Save className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'حفظ إعدادات تليجرام' : 'Save Config'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleTestTelegram}
                      disabled={telegramTesting}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-45 rounded-xl text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
                    >
                      {telegramTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>{lang === 'ar' ? 'إرسال إشعار فحص' : 'Send Test Notification'}</span>
                    </button>
                  </div>
                </form>

                {/* Technical Diagnostic Audits block */}
                <div className="bg-slate-950/40 p-4 border border-slate-800/60 rounded-xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-1.5 uppercase">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                        <span>{lang === 'ar' ? 'التشخيص الفني والاتصال' : 'Technical Diagnostics Audit'}</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                        {lang === 'ar' ? 'اضغط لفحص الاتصال بـ Binance API والتحقق من حساب عقود الفيوتشرز وقرارات البيع والشراء.' : 'Trigger instant verification request directly against live REST nodes.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleRunDiagnostics}
                      disabled={diagnosing}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {diagnosing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
                      <span>{lang === 'ar' ? 'تشغيل فحص الاتصال ومطابقة الصفقات' : 'Run Diagnostics & Matching Check'}</span>
                    </button>

                    {diagnosticError && (
                      <div className="text-rose-400 text-[10px] leading-relaxed p-2.5 bg-rose-950/20 border border-rose-900/30 rounded-lg">
                        ⚠️ Error: {diagnosticError}
                      </div>
                    )}

                    {diagnosticData && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        <div className="text-[10px] bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono space-y-1">
                          <p className="text-emerald-400">✓ REST API Status: Active</p>
                          <p className="text-slate-400">Symbol Checked: BTCUSDT</p>
                          <p className="text-slate-300">Dual Position Mode: {diagnosticData.dualMode ? 'Hedge Mode' : 'One-Way Mode'}</p>
                          <p className="text-slate-300">Server Time: {new Date(diagnosticData.serverTime).toLocaleTimeString()}</p>
                          <p className="text-slate-500">Latency: {diagnosticData.latencyMs}ms</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
