/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Shield, Coins, Cpu, Wallet, Languages, Activity, Smartphone, X, LogOut, User, Camera, Trash2, Bell, Sparkles, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { ARABIC_DICT } from '../utils/marketData';
import { auth, logout } from '../lib/firebase';
import { updateProfile } from 'firebase/auth';
import { ToastNotification } from '../types';

interface HeaderProps {
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  portfolio: { usdt: number; btc: number };
  isConnected: boolean;
  isLiveTrading: boolean;
  setIsLiveTrading: (val: boolean) => void;
  balanceSyncError?: string | null;
  futuresApiError?: string | null;
  userData?: any;
  notificationsHistory?: ToastNotification[];
  onClearNotifications?: () => void;
}

export default function Header({
  lang,
  setLang,
  activeTab,
  setActiveTab,
  portfolio,
  isConnected,
  isLiveTrading,
  setIsLiveTrading,
  balanceSyncError,
  futuresApiError,
  userData,
  notificationsHistory = [],
  onClearNotifications
}: HeaderProps) {
  const [time, setTime] = useState<string>('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showiOSInstructions, setShowiOSInstructions] = useState(false);
  const [isAlreadyInstalled, setIsAlreadyInstalled] = useState(false);

  // Notifications Log / Center states
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [lastSeenNotificationTime, setLastSeenNotificationTime] = useState<number>(() => {
    const saved = localStorage.getItem('almoharif_last_seen_notification_time');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [expandedNotificationId, setExpandedNotificationId] = useState<string | null>(null);

  const handleToggleNotifications = () => {
    setIsNotificationsOpen((prev) => {
      const nextVal = !prev;
      if (nextVal) {
        // Mark everything as read/seen when opening the drawer
        const now = Date.now();
        localStorage.setItem('almoharif_last_seen_notification_time', String(now));
        setLastSeenNotificationTime(now);
      }
      return nextVal;
    });
  };

  const unreadCount = notificationsHistory.filter((t) => t.timestamp > lastSeenNotificationTime).length;
  
  // Profile Modal States
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editProfileMode, setEditProfileMode] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [photoUrlInput, setPhotoUrlInput] = useState('');

  const openProfile = () => {
    setDisplayNameInput(auth.currentUser?.displayName || '');
    setPhotoUrlInput(auth.currentUser?.photoURL || '');
    setEditProfileMode(false);
    setShowProfileModal(true);
  };

  const handleUpdateProfile = async () => {
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: displayNameInput,
          photoURL: photoUrlInput,
        });
        alert(lang === 'ar' ? 'تم تحديث الملف الشخصي بنجاح' : 'Profile updated successfully');
        setEditProfileMode(false);
        // FORCE the header to re-render by toggling a piece of state or just we rely on Firebase auth observer if it passes down
      }
    } catch (err: any) {
      alert(lang === 'ar' ? 'فشل التحديث: ' + err.message : 'Update failed: ' + err.message);
    }
  };

  useEffect(() => {
    const updateUTC = () => {
      const now = new Date();
      setTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateUTC();
    const interval = setInterval(updateUTC, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check if running inside standalone (installed) app mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    if (isStandalone) {
      setIsAlreadyInstalled(true);
    }

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallApp = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS) {
      setShowiOSInstructions(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('App install accepted');
        setIsAlreadyInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowiOSInstructions(true);
    }
  };

  const d = ARABIC_DICT;

  const tabs = [
    { id: 'dashboard', label_ar: 'أسواق حمزة الحية 🚀', label_en: 'Hamza Live Markets 🚀' },
    { id: 'market', label_ar: d.manualTrading, label_en: 'Manual Trade' },
    { id: 'futures', label_ar: 'العقود الآجلة 📈', label_en: 'Futures Trading 📈' },
    { id: 'binance-ai', label_ar: 'مساعد بينانس الفني 🤖', label_en: 'Binance AI Copilot 🤖' },
    { id: 'hybrid', label_ar: 'التداول الهجين ⚡', label_en: 'Hybrid Algo Trade ⚡' },
    { id: 'bots', label_ar: d.botTrading, label_en: 'Automated Bots' },
    { id: 'whales', label_ar: 'رادار الحيتان 🐋', label_en: 'Whale Radar 🐋' },
    { id: 'backtest', label_ar: d.backtesting, label_en: 'Backtesting' },
    { id: 'history', label_ar: 'سجل الطلبات 📜', label_en: 'Order History 📜' },
    { id: 'notifications', label_ar: 'مركز التنبيهات 🔔', label_en: 'Alert Center 🔔' },
    { id: 'security', label_ar: d.apiSecurity, label_en: 'API Security' },
    { id: 'ai', label_ar: d.aiAdvisor, label_en: 'AI Advisor' },
    { id: 'education', label_ar: 'أكاديمية حمزة 🎓', label_en: 'Education Academy 🎓' },
  ];

  if (userData?.role === 'OWNER' || userData?.email === 'alamryhmzh7@gmail.com') {
    tabs.push({ id: 'owner', label_ar: 'إدارة المنصة (المالك) 👑', label_en: 'Owner Admin 👑' });
  }

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 px-3 py-2 flex flex-col gap-2" id="app-header">
      {/* Top Row: Logo, Stats, Core Controls */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3 flex-wrap md:flex-nowrap">
        
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center font-black text-slate-950 text-base shadow-[0_0_12px_rgba(16,185,129,0.3)] select-none">
            ح
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
              {lang === 'ar' ? 'حمزه كاربيتو' : 'Hamza Crypto'}
              <span className="text-[9px] bg-indigo-950 text-indigo-400 font-mono px-1.5 py-0.5 rounded border border-indigo-900">PRO</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap text-[10px] sm:text-xs shrink-0" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          {/* UTC Clock */}
          <div className="hidden lg:flex font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700 items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {time}
          </div>

          {/* Balances */}
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-2 py-1 rounded font-mono">
            <Wallet className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-bold text-white">{portfolio.usdt.toLocaleString()} USDT</span>
          </div>

          {/* Modes Toggle */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800 shrink-0">
            <button
              onClick={() => setIsLiveTrading(false)}
              className={`px-2 py-1 text-[10px] font-bold rounded-sm transition ${!isLiveTrading ? 'bg-amber-400 text-slate-950 shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 'text-slate-500 hover:text-slate-300'}`}
            >
               {lang === 'ar' ? 'تجريبي' : 'PAPER'}
            </button>
            <button
              onClick={() => {
                setIsLiveTrading(true);
                if (!isConnected) {
                  setActiveTab('security');
                  setTimeout(() => alert(lang === 'ar' ? '⚡ تم التبديل. يرجى إدخال API بينانس.' : '⚡ Switched. Please input Binance API.'), 120);
                }
              }}
              className={`px-2 py-1 text-[10px] font-bold rounded-sm transition flex gap-1 items-center ${isLiveTrading ? 'bg-emerald-400 text-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse' : 'text-slate-500 hover:text-slate-300'}`}
            >
               {isLiveTrading && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
               {lang === 'ar' ? 'حقيقي' : 'LIVE'}
            </button>
          </div>

          {/* Install App */}
          {!isAlreadyInstalled && (
            <button
              onClick={handleInstallApp}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-2 py-1 rounded border border-indigo-500 transition"
              title={lang === 'ar' ? 'تثبيت التطبيق' : 'Install App'}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:block">{lang === 'ar' ? 'تطبيق' : 'App'}</span>
            </button>
          )}

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded border border-slate-700 transition font-bold"
          >
            <Languages className="w-3.5 h-3.5" />
            <span className="hidden sm:block">{lang === 'ar' ? 'EN' : 'AR'}</span>
          </button>

          {/* Notifications Log / Center Button */}
          <div className="relative">
            <button
              onClick={handleToggleNotifications}
              className={`flex items-center justify-center p-1.5 rounded-md border transition cursor-pointer relative h-7 w-8 sm:w-auto sm:px-2 ${
                isNotificationsOpen 
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 font-bold' 
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 font-bold'
              }`}
              title={lang === 'ar' ? 'سجل التنبيهات والعمليات' : 'Alerts & Operations Log'}
            >
              <Bell className="w-3.5 h-3.5 cursor-pointer" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-1 flex items-center justify-center rounded-full bg-red-600 text-[8px] font-black text-white leading-none border border-slate-900 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Floating Dropdown Log Panel */}
            {isNotificationsOpen && (
              <div 
                className={`absolute mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 overflow-hidden ${
                  lang === 'ar' ? '-left-12 sm:left-0' : '-right-12 sm:right-0'
                }`}
                style={{ top: '100%' }}
                id="header-notification-log-panel"
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
              >
                {/* Panel Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
                    <h3 className="text-[10px] font-black text-slate-200 uppercase tracking-wide">
                      {lang === 'ar' ? 'سجل تنبيهات والعمليات' : 'Trading Alerts & Logs'}
                    </h3>
                  </div>
                  {notificationsHistory.length > 0 && (
                    <button
                      onClick={onClearNotifications}
                      className="text-[9px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 transition bg-red-500/5 hover:bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                      {lang === 'ar' ? 'مسح التاريخ' : 'Clear Log'}
                    </button>
                  )}
                </div>

                {/* Notification Items List */}
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1 no-scrollbar font-sans text-xs">
                  {notificationsHistory.length === 0 ? (
                    <div className="py-6 text-center flex flex-col items-center justify-center text-slate-500">
                      <Bell className="w-6 h-6 mb-1.5 opacity-30" />
                      <p className="font-semibold text-[10px]">
                        {lang === 'ar' ? 'لا توجد تنبيهات مسجلة حالياً' : 'No recorded notification history.'}
                      </p>
                      <p className="text-[9px] opacity-60 mt-0.5">
                        {lang === 'ar' ? 'سيتم عرض تنبيهات ومراكز البوتات هنا.' : 'Trading bot operations will accumulate here.'}
                      </p>
                    </div>
                  ) : (
                    notificationsHistory.map((item, index) => {
                      const isUnread = item.timestamp > lastSeenNotificationTime;
                      const dateStr = new Date(item.timestamp).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US', {
                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                      });

                      // Determine colors and labels depending on type
                      let typeLabel = lang === 'ar' ? 'أمر نظام' : 'System';
                      let typeColor = 'text-indigo-400 bg-indigo-500/5 border-indigo-500/10';
                      let itemIcon = <Cpu className="w-3 h-3 text-indigo-400 shrink-0" />;

                      if (item.isVolatilityWarning) {
                        typeLabel = lang === 'ar' ? 'تحذير تذبذب' : 'Volatility';
                        typeColor = 'text-amber-400 bg-amber-500/5 border-amber-500/10';
                        itemIcon = <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />;
                      } else if (item.isMilestone) {
                        typeLabel = lang === 'ar' ? 'هدف أرباح' : 'Milestone';
                        typeColor = 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10';
                        itemIcon = <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />;
                      } else if (item.symbol === 'PORTFOLIO_LIQUIDATION') {
                        typeLabel = lang === 'ar' ? 'طوارئ' : 'Emergency';
                        typeColor = 'text-rose-400 bg-rose-500/5 border-rose-500/10';
                        itemIcon = <AlertCircle className="w-3 h-3 text-rose-400 animate-bounce shrink-0" />;
                      } else if (item.botType) {
                        typeLabel = `${item.botType}`;
                        typeColor = 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10';
                        itemIcon = <Activity className="w-3 h-3 text-emerald-400 shrink-0" />;
                      }

                      // Localized description block
                      let desc = '';
                      if (item.isVolatilityWarning) {
                        const percent = item.volatilityChange || 0;
                        desc = lang === 'ar' 
                          ? `هزة سعرية لزوج ${item.symbol} بنسبة ${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`
                          : `Volatility shock in ${item.symbol} by ${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
                      } else if (item.symbol === 'PORTFOLIO_LIQUIDATION') {
                        desc = lang === 'ar'
                          ? `تم تشغيل الإغلاق والإنقاذ التلقائي وتجميد الصفقات.`
                          : `Emergency system shutdown performed and orders canceled.`;
                      } else if (item.isMilestone) {
                        desc = lang === 'ar'
                          ? `إنجاز زوج ${item.symbol} لأهداف ربح بنسبة ${item.milestonePercentage}% (+${item.profit?.toFixed(2)} USDT)`
                          : `${item.symbol} profit target hit ${item.milestonePercentage}% (+${item.profit?.toFixed(2)} USDT)`;
                      } else {
                        desc = lang === 'ar'
                          ? `صفقة آلية لزوج ${item.symbol}: ربح محقق +${item.profit?.toFixed(2)} USDT`
                          : `Auto trade for ${item.symbol}: captured +$${item.profit?.toFixed(2)} USDT`;
                      }

                      const hasAI = item.aiExplanationAr || item.aiExplanationEn;
                      const isExpanded = expandedNotificationId === item.id;

                      return (
                        <div 
                          key={`${item.id}-${index}`}
                          className={`p-2 rounded-lg border text-left flex flex-col gap-1 transition ${
                            isUnread 
                              ? 'bg-emerald-950/10 border-emerald-500/20' 
                              : 'bg-slate-950/40 border-slate-800'
                          }`}
                        >
                          {/* Alert Item Header Row */}
                          <div className="flex items-center justify-between gap-1 flex-wrap sm:flex-nowrap">
                            <span className="font-bold text-slate-200 flex items-center gap-1 text-[11px] shrink-0">
                              {itemIcon}
                              {item.symbol === 'PORTFOLIO_LIQUIDATION' || item.symbol === 'OFFLINE_PROFIT' ? '' : item.symbol}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className={`text-[8px] px-1 py-0.2 rounded font-black border tracking-wider uppercase shrink-0 ${typeColor}`}>
                                {typeLabel}
                              </span>
                              <span className="text-[8px] text-slate-500 font-mono tracking-tight shrink-0">{dateStr}</span>
                            </div>
                          </div>

                          {/* Description copy */}
                          <p className={`text-slate-350 leading-normal text-[10px] font-medium ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                            {desc}
                          </p>

                          {/* AI expansion button */}
                          {hasAI && (
                            <div className="pt-0.5">
                              <button
                                onClick={() => setExpandedNotificationId(isExpanded ? null : item.id)}
                                className={`w-full py-0.5 px-1 rounded text-[8px] font-bold border transition flex items-center justify-between gap-1 cursor-pointer ${
                                  isExpanded 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                    : 'bg-slate-800/40 text-indigo-400 border-slate-700/50 hover:bg-slate-800'
                                }`}
                              >
                                <span className="flex items-center gap-1 shrink-0">
                                  <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                                  {lang === 'ar' ? 'مراجعة تحليل الذكاء الاصطناعي' : 'Review AI Verdict'}
                                </span>
                                <span className="text-[8px] opacity-85 underline shrink-0">
                                  {isExpanded ? (lang === 'ar' ? 'إغلاق' : 'Close') : (lang === 'ar' ? 'تفاصيل' : 'Details')}
                                </span>
                              </button>

                              {/* AI Analysis Expanded body */}
                              {isExpanded && (
                                <div className="mt-1 bg-slate-950 p-1.5 border border-slate-800 rounded font-sans text-[9px] text-slate-400 leading-normal max-h-24 overflow-y-auto no-scrollbar">
                                  <p className={lang === 'ar' ? 'text-right' : 'text-left'}>
                                    {lang === 'ar' ? item.aiExplanationAr : item.aiExplanationEn}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile & Settings Button */}
          {auth.currentUser && (
            <div>
              <button
                onClick={openProfile}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 sm:px-3 py-1.5 rounded-md border border-slate-700 transition font-bold cursor-pointer"
                title={lang === 'ar' ? 'الملف الشخصي' : 'Profile'}
              >
                {auth.currentUser.photoURL ? (
                  <img src={auth.currentUser.photoURL} alt="User" className="w-5 h-5 rounded-full object-cover border border-emerald-500/50" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs shrink-0">
                    {auth.currentUser.displayName?.charAt(0).toUpperCase() || auth.currentUser.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <span className="hidden sm:block text-[11px] truncate max-w-[100px]">
                  {auth.currentUser.displayName || auth.currentUser.email?.split('@')[0]}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Tabs */}
      <div className="max-w-7xl mx-auto w-full relative">
        <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1" aria-label="Tabs Navigation" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          {tabs.map((tab, index) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={`${tab.id}-${index}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1 text-[10px] sm:text-[11px] font-bold transition-all rounded-full whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                    : 'text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {lang === 'ar' ? tab.label_ar : tab.label_en}
              </button>
            );
          })}
        </nav>
      </div>

      {/* PWA Android & iOS Custom Guided Install Modal */}
      {showiOSInstructions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in" id="pwa-instructions-overlay">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <button 
              onClick={() => setShowiOSInstructions(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-805 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Smartphone className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">
                  {lang === 'ar' ? 'تثبيت تطبيق حمزه كاربيتو على حسابك 📱' : 'Install Hamza Crypto App'}
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-300 border-t border-b border-slate-800/80 py-4 my-3 font-sans">
              <p className="font-semibold text-slate-200">
                {lang === 'ar' ? 'خطوات التثبيت السهلة على الأندرويد أو عبر كروم:' : 'Easy Installation Steps:'}
              </p>
              
              <div className="space-y-3">
                <div className="flex gap-2.5 items-start bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                  <div>
                    <span className="font-bold block text-slate-200">
                      {lang === 'ar' ? 'افتح المتصفح واضغط على خيارات كروم:' : 'Tap Chrome Menu Icon:'}
                    </span>
                    <span className="text-slate-400 block mt-0.5 text-[11px]">
                      {lang === 'ar' 
                        ? 'اضغط على النقاط الثلاث العمودية (⋮) ' 
                        : 'Tap the three vertical dots (⋮)'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                  <div>
                    <span className="font-bold block text-slate-200">
                      {lang === 'ar' ? 'اختر "إضافة إلى الشاشة الرئيسية" أو "تثبيت":' : 'Choose Install/Add to Home Screen:'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => setShowiOSInstructions(false)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black py-2.5 rounded-xl text-xs transition cursor-pointer shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
              >
                {lang === 'ar' ? 'حسناً، فهمت وسأقوم بالتثبيت الآن' : 'I Understand'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {showProfileModal && auth.currentUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in" id="profile-modal-overlay">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full shadow-2xl relative overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            
            <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                {lang === 'ar' ? 'الملف الشخصي' : 'User Profile'}
              </h3>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-emerald-500/50 flex items-center justify-center text-3xl font-bold text-emerald-400 shadow-xl overflow-hidden relative group mb-3">
                  {auth.currentUser.photoURL ? (
                    <img src={auth.currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                     auth.currentUser.displayName?.charAt(0).toUpperCase() || auth.currentUser.email?.charAt(0).toUpperCase() || 'U'
                  )}
                  {editProfileMode && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-normal text-white">
                      <Camera className="w-5 h-5 mb-1" />
                    </div>
                  )}
                </div>
              </div>

              {editProfileMode ? (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">{lang === 'ar' ? 'الاسم' : 'Display Name'}</label>
                    <input 
                      type="text" 
                      value={displayNameInput} 
                      onChange={e => setDisplayNameInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:border-emerald-500 outline-none transition"
                      placeholder={lang === 'ar' ? 'اسم المتداول' : 'Trader Name'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">{lang === 'ar' ? 'رابط الصورة الرمزية (اختياري)' : 'Avatar image URL (optional)'}</label>
                    <input 
                      type="url" 
                      value={photoUrlInput} 
                      onChange={e => setPhotoUrlInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:border-emerald-500 outline-none transition"
                      placeholder="https://example.com/avatar.png"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleUpdateProfile}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2 rounded transition"
                    >
                      {lang === 'ar' ? 'حفظ التغييرات' : 'Save'}
                    </button>
                    <button 
                      onClick={() => setEditProfileMode(false)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 rounded transition"
                    >
                      {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center mb-6">
                  <h4 className="text-lg font-bold text-white mb-1">
                    {auth.currentUser.displayName || (lang === 'ar' ? 'متداول' : 'Trader')}
                  </h4>
                  <p className="text-sm text-slate-400 mb-4">{auth.currentUser.email}</p>
                  
                  <button 
                    onClick={() => setEditProfileMode(true)}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
                  >
                    {lang === 'ar' ? 'تعديل الملف الشخصي' : 'Edit Profile'}
                  </button>
                </div>
              )}

              <div className="border-t border-slate-800 pt-4 space-y-2">
                <button
                  onClick={async () => { setShowProfileModal(false); logout(); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 text-sm font-bold transition"
                >
                  <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Log Out'}</span>
                  <LogOut className="w-4 h-4 text-amber-500" />
                </button>
                
                <button
                  onClick={() => { setShowProfileModal(false); setActiveTab('owner'); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-indigo-950/30 hover:bg-indigo-950/50 border border-indigo-900/50 rounded-lg text-indigo-400 text-sm font-bold transition"
                >
                  <span>{lang === 'ar' ? 'لوحة تحكم المالك' : 'Admin Panel'}</span>
                  <Shield className="w-4 h-4" />
                </button>
                
                <button
                  onClick={async () => {
                    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف الحساب نهائياً؟ سيتم مسح بياناتك.' : 'Are you sure you want to permanently delete your account?')) {
                      try {
                        await auth.currentUser?.delete();
                        await logout();
                      } catch (err: any) {
                        alert(lang === 'ar' ? 'يجب تسجيل الدخول مجدداً لحذف الحساب لأسباب أمنية.' : 'Please log in again to delete your account (security requirement).');
                      }
                    }
                  }}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-rose-950/20 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 rounded-lg text-rose-400 text-sm font-bold transition"
                >
                  <span>{lang === 'ar' ? 'حذف الحساب نهائياً' : 'Delete Account'}</span>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </header>
  );
}

