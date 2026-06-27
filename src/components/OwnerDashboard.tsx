import React, { useState, useEffect, useRef } from "react";
import { db } from "../lib/firebase";
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  Wallet,
  Download,
  Activity,
  ExternalLink,
  MessageSquare,
  Reply,
  AlertCircle,
  Shield,
  Ban,
  Search,
  Loader2
} from "lucide-react";

interface OwnerDashboardProps {
  lang: "ar" | "en";
}

export default function OwnerDashboard({ lang }: OwnerDashboardProps) {
  const [platformBalance, setPlatformBalance] = useState<number>(0);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // تحسين: حالة البحث
  const [isLoading, setIsLoading] = useState(true); // تحسين: حالة التحميل
  const [tickets, setTickets] = useState<any[]>([]);
  const [unresolvedQueries, setUnresolvedQueries] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<string | null>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [replyMsg, setReplyMsg] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    
    // 1. جلب محفظة المنصة
    const unsub = onSnapshot(
      doc(db, "platform", "wallet"),
      (docRef) => {
        if (docRef.exists()) {
          setPlatformBalance(docRef.data().balanceUsdt || 0);
        }
      },
      (error) => console.warn("OwnerDashboard wallet error:", error)
    );

    // 2. جلب تذاكر الدعم
    const tktsQ = query(
      collection(db, "support_tickets"),
      orderBy("lastMessageAt", "desc"),
      limit(50),
    );
    const unsubTkts = onSnapshot(
      tktsQ,
      (snap) => {
        setTickets(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => console.warn("tktsQ error:", err)
    );

    // 3. جلب الاستفسارات غير المفهومة للذكاء الاصطناعي
    const unresQ = query(
      collection(db, "unresolved_queries"),
      orderBy("createdAt", "desc"),
      limit(50),
    );
    const unsubUnres = onSnapshot(
      unresQ,
      (snap) => {
        setUnresolvedQueries(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => console.warn("unresQ error:", err)
    );

    // 4. جلب المستخدمين بحد أقصى 200 لتوفير التكلفة وسرعة الاستجابة
    const usersQ = query(collection(db, "users"), limit(200));
    const unsubUsers = onSnapshot(
      usersQ,
      (snap) => {
        const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        
        // إصلاح خطأ الترتيب: التحقق من وجود تواريخ بصيغة Timestamp وتحويلها برمجياً
        fetched.sort((a: any, b: any) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (Number(a.createdAt) || 0);
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (Number(b.createdAt) || 0);
          return timeB - timeA;
        });
        
        setUsersList(fetched);
        setIsLoading(false);
      },
      (err) => {
        console.warn("usersQ error:", err);
        setIsLoading(false);
      }
    );

    return () => {
      unsub();
      unsubTkts();
      unsubUnres();
      unsubUsers();
    };
  }, []);

  // جلب رسائل التذكرة النشطة
  useEffect(() => {
    if (!activeTicket) return;
    const msgsQ = query(
      collection(db, "support_tickets", activeTicket, "messages"),
      orderBy("createdAt", "asc"),
    );
    const unsubMsgs = onSnapshot(
      msgsQ,
      (snap) => {
        setTicketMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      },
      (err) => console.warn("msgsQ error:", err)
    );
    return () => unsubMsgs();
  }, [activeTicket]);

  const withdraw = () => {
    alert(
      lang === "ar"
        ? "تم تقديم طلب السحب إلى بينانس بنجاح! سيتم التنفيذ قريباً."
        : "Withdrawal request to Binance submitted successfully! It will be processed soon.",
    );
  };

  const toggleUserAccess = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        "permissions.canAccess": !currentStatus,
      });
    } catch (err) {
      alert(lang === "ar" ? "فشلت العملية، تحقق من الصلاحيات" : "Operation failed");
    }
  };

  const toggleUserTrading = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        "permissions.canTrade": !currentStatus,
      });
    } catch (err) {
      alert(lang === "ar" ? "فشلت العملية" : "Operation failed");
    }
  };

  const handlePublishUpdate = async (resetReq: boolean) => {
    try {
      await setDoc(doc(db, "system", "update_notification"), {
        version: Date.now(),
        message_ar: resetReq
          ? "تم إطلاق تحديث رئيسي للمنصة. بعض الإعدادات تحتاج إلى إعادة ضبط لتتوافق مع الإصدار الجديد."
          : "تم إطلاق تحديث جديد للمنصة يتضمن إضافات وتحسينات! إعداداتك محفوظة.",
        message_en: resetReq
          ? "A major platform update has been deployed. Some settings require a reset to align with the new version."
          : "A new platform update is out with new features and improvements! Your settings are retained.",
        requiresReset: resetReq,
        timestamp: serverTimestamp(),
      });
      alert(lang === "ar" ? "تم إرسال إشعار التحديث بنجاح!" : "Update notification broadcasted!");
    } catch (err) {
      alert("Failed to publish update notification.");
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMsg.trim() || !activeTicket) return;
    const text = replyMsg;
    setReplyMsg("");
    
    try {
      // تحسين: إضافة حماية try/catch للردود
      await addDoc(collection(db, "support_tickets", activeTicket, "messages"), {
        role: "owner",
        text: text,
        createdAt: serverTimestamp(),
      });
      await setDoc(
        doc(db, "support_tickets", activeTicket),
        {
          lastMessageAt: serverTimestamp(),
          needsOwnerAttention: false,
          unreadUser: true,
        },
        { merge: true },
      );
    } catch (err) {
      alert(lang === "ar" ? "فشل إرسال الرد" : "Failed to send reply");
    }
  };

  // تحسين: فلترة المستخدمين بناءً على مربع البحث
  const filteredUsers = usersList.filter(usr => 
    (usr.email || usr.id || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir={lang === "ar" ? "rtl" : "ltr"}>
      <h2 className="text-xl font-bold flex items-center gap-2">
        👑 {lang === "ar" ? "لوحة تحكم المنصة والإدارة" : "Platform & Admin Dashboard"}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* محفظة المنصة */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-slate-400 mb-6 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-indigo-400" />
              {lang === "ar" ? "محفظة المنصة (العمولات المتراكمة)" : "Platform Wallet (Accumulated Commissions)"}
            </h3>
            <div className="flex flex-col items-start gap-4">
              <div className="text-5xl font-black font-mono text-emerald-400 tracking-tighter">
                {platformBalance.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </div>
              <button onClick={withdraw} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-lg transition shadow-lg mt-2">
                <Download className="w-5 h-5" />
                {lang === "ar" ? "سحب الأرباح التلقائي إلى بينانس" : "Auto Withdraw Profits to Binance"}
                <ExternalLink className="w-4 h-4 ml-2 opacity-50" />
              </button>
            </div>
          </div>

          {/* إدارة المستخدمين الفعالة */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                {lang === "ar" ? "إحصائيات الشبكة والمستخدمين" : "Live Network & Users Stats"}
              </h3>
              {isLoading && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
            </div>

            {/* تحسين: شريط البحث لحل مشكلة الأداء */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-slate-500 absolute top-3 left-3" />
              <input
                type="text"
                placeholder={lang === "ar" ? "ابحث عن مستخدم بالبريد أو المعرف..." : "Search user by email or ID..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="bg-slate-950/50 rounded-lg border border-slate-800 p-4 max-h-64 overflow-y-auto">
              <h4 className="text-xs font-bold text-slate-300 mb-2">
                {lang === "ar" ? "المستخدمين" : "Users"} ({filteredUsers.length})
              </h4>
              <div className="space-y-2">
                {filteredUsers.map((usr, i) => {
                  const canAccess = usr.permissions?.canAccess !== false;
                  const canTrade = usr.permissions?.canTrade !== false;
                  // تحسين أمني: فحص الحقل بالكامل والبريد الاحتياطي كخيار أمان
                  const isOwner = usr.role === "OWNER" || usr.email === "alamryhmzh7@gmail.com";

                  return (
                    <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] p-2 bg-slate-900/50 rounded border border-slate-850 gap-2">
                      <div className="flex flex-col">
                        <span className="font-mono text-emerald-400 font-bold truncate max-w-[180px]">{usr.email || usr.id}</span>
                        <span className="text-[9px] text-slate-500 mt-0.5">{isOwner ? "👑 OWNER" : "USER"}</span>
                      </div>

                      {!isOwner && (
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <button onClick={() => toggleUserTrading(usr.id, canTrade)} className={`flex items-center gap-1 px-2 py-1 rounded border transition ${canTrade ? "bg-sky-950/30 border-sky-900/50 text-sky-400 hover:bg-sky-900/50" : "bg-slate-800/50 border-slate-700/50 text-slate-500 hover:bg-slate-700/50"}`}>
                            <Activity className="w-3 h-3" />
                            {canTrade ? (lang === "ar" ? "تداول مفعل" : "Trade ON") : (lang === "ar" ? "تداول معلق" : "Trade OFF")}
                          </button>

                          <button onClick={() => toggleUserAccess(usr.id, canAccess)} className={`flex items-center gap-1 px-2 py-1 rounded border transition ${canAccess ? "bg-emerald-950/30 border-emerald-900/50 text-emerald-400 hover:bg-emerald-900/50" : "bg-red-950/30 border-red-900/50 text-red-400 hover:bg-red-900/50"}`}>
                            {canAccess ? <Shield className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                            {canAccess ? (lang === "ar" ? "وصول مفعل" : "Access ON") : (lang === "ar" ? "باند" : "Banned")}
                          </button>

                          <button onClick={async () => {
                            if (confirm(lang === 'ar' ? "تصفير حساب المستخدم بالكامل؟" : "Reset this account?")) {
                              try {
                                await updateDoc(doc(db, "users", usr.id), {
                                  portfolio: { usdt: 15000, futuresUsdt: 0, btc: 0, eth: 0, sol: 0, bnb: 0 },
                                  orders: [], activeBots: []
                                });
                              } catch (err) { alert("Failed to reset"); }
                            }
                          }} className="px-2 py-1 rounded border bg-amber-950/30 border-amber-900/50 text-amber-400 hover:bg-amber-900/50 transition">
                            {lang === 'ar' ? "تصفير" : "Reset"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* نظام إشعارات تحديث المنصة */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-indigo-400" />
              {lang === "ar" ? "نظام إشعارات تحديث المنصة" : "Platform Update Notifications"}
            </h3>
            <div className="flex flex-col gap-3">
              <button onClick={() => handlePublishUpdate(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold py-3 p-4 rounded-xl transition text-xs text-center">
                {lang === "ar" ? "إعلان تحديث روتيني" : "Publish Routine Update"}
              </button>
              <button onClick={() => handlePublishUpdate(true)} className="bg-red-900/30 hover:bg-red-800/40 text-red-400 border border-red-500/30 font-bold py-3 p-4 rounded-xl transition text-xs text-center">
                {lang === "ar" ? "إعلان تحديث جذري (إعادة ضبط)" : "Publish Major Update"}
              </button>
            </div>
          </div>
        </div>

        {/* الكونسول الخاص بالدعم الفني */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden h-[600px]">
          <div className="p-4 bg-indigo-600/10 border-b border-indigo-500/20 flex justify-between items-center">
            <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {lang === "ar" ? "تذاكر الدعم المحولة (Support Desk)" : "Escalated Support Desk"}
            </h3>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* القائمة الجانبية للتذاكر */}
            <div className="w-2/5 border-l border-slate-800 overflow-y-auto bg-slate-950/30">
              {tickets.length === 0 ? (
                <div className="p-4 text-xs text-slate-500 text-center">{lang === "ar" ? "لا توجد رسائل" : "No messages"}</div>
              ) : (
                tickets.map((t) => (
                  <button key={t.id} onClick={() => setActiveTicket(t.id)} className={`w-full text-left p-4 border-b border-slate-800 transition ${activeTicket === t.id ? "bg-indigo-600/10 border-indigo-500/30" : "hover:bg-slate-800/50"}`}>
                    <div className="flex items-start justify-between">
                      <div className="text-xs font-bold text-slate-300 truncate w-[70%]" dir="ltr">{t.id.slice(0, 8)}...</div>
                      {t.needsOwnerAttention && <AlertCircle className="w-4 h-4 text-amber-500 animate-pulse" />}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">{t.lastMessageAt?.toDate?.().toLocaleString()}</div>
                  </button>
                ))
              )}
            </div>

            {/* شات المحادثة الحية للتذكرة */}
            <div className="w-3/5 flex flex-col bg-slate-950">
              {!activeTicket ? (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                  {lang === "ar" ? "اختر تذكرة للرد عليها" : "Select a ticket to reply"}
                </div>
              ) : (
                <>
                  <div className="p-3 bg-slate-900 border-b border-slate-800 text-xs font-mono text-slate-400">User: {activeTicket.slice(0, 10)}...</div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {ticketMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === "owner" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${msg.role === "owner" ? "bg-emerald-600 text-white rounded-br-sm" : msg.role === "bot" ? "bg-slate-800 text-slate-300 rounded-bl-sm border border-slate-700 italic" : "bg-indigo-600 text-white rounded-bl-sm"}`}>
                          <div className="text-[9px] opacity-50 mb-1 uppercase tracking-wider">{msg.role}</div>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={handleReply} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
                    <input type="text" value={replyMsg} onChange={(e) => setReplyMsg(e.target.value)} placeholder={lang === "ar" ? "أدخل ردك..." : "Type reply..."} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 p-2.5 rounded-lg text-white transition">
                      <Reply className="w-4 h-4" />
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* استفسارات الذكاء الاصطناعي غير المحلولة */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-bold text-amber-500 mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {lang === "ar" ? "استفسارات الذكاء الاصطناعي غير المحلولة" : "Unresolved AI Queries"}
        </h3>
        <div className="space-y-4">
          {unresolvedQueries.length === 0 ? (
            <p className="text-slate-500 text-sm">{lang === "ar" ? "لا توجد استفسارات معلقة." : "No unresolved queries."}</p>
          ) : (
            unresolvedQueries.map((q) => (
              <div key={q.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs text-slate-500 font-mono">User: {q.userId?.slice(0, 8)}...</span>
                  <span className="text-[10px] text-slate-500">{q.createdAt?.toDate?.().toLocaleString()}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white"><span className="text-indigo-400">User:</span> {q.userQuery}</p>
                  <p className="text-sm text-slate-400 mt-1"><span className="text-slate-500">AI Response:</span> {q.botReply}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
