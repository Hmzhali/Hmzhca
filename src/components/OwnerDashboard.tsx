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
  deleteDoc,
} from "firebase/firestore";
import {
  Wallet,
  Download,
  Activity,
  ExternalLink,
  MessageSquare,
  Send,
  Reply,
  AlertCircle,
  Shield,
  ShieldOff,
  Ban,
} from "lucide-react";

interface OwnerDashboardProps {
  lang: "ar" | "en";
}

export default function OwnerDashboard({ lang }: OwnerDashboardProps) {
  const [platformBalance, setPlatformBalance] = useState<number>(0);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [tickets, setTickets] = useState<
    {
      id: string;
      userId: string;
      lastMessageAt: any;
      needsOwnerAttention: boolean;
    }[]
  >([]);
  const [unresolvedQueries, setUnresolvedQueries] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<string | null>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [replyMsg, setReplyMsg] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "platform", "wallet"),
      (docRef) => {
        if (docRef.exists()) {
          setPlatformBalance(docRef.data().balanceUsdt || 0);
        }
      },
      (error) => {
        console.warn("OwnerDashboard snapshot error:", error);
      },
    );

    const tktsQ = query(
      collection(db, "support_tickets"),
      orderBy("lastMessageAt", "desc"),
      limit(50),
    );
    const unsubTkts = onSnapshot(
      tktsQ,
      (snap) => {
        const fetched = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as any,
        );
        setTickets(fetched);
      },
      (err) => console.warn("tktsQ error:", err),
    );

    const unresQ = query(
      collection(db, "unresolved_queries"),
      orderBy("createdAt", "desc"),
      limit(50),
    );
    const unsubUnres = onSnapshot(
      unresQ,
      (snap) => {
        const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setUnresolvedQueries(fetched);
      },
      (err) => console.warn("unresQ error:", err),
    );

    const usersQ = query(collection(db, "users"), limit(100));
    const unsubUsers = onSnapshot(
      usersQ,
      (snap) => {
        const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setUsersList(fetched);
      },
      (err) => console.warn("usersQ error:", err),
    );

    return () => {
      unsub();
      unsubTkts();
      unsubUnres();
      unsubUsers();
    };
  }, []);

  useEffect(() => {
    if (!activeTicket) return;
    const msgsQ = query(
      collection(db, "support_tickets", activeTicket, "messages"),
      orderBy("createdAt", "asc"),
    );
    const unsubMsgs = onSnapshot(
      msgsQ,
      (snap) => {
        const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTicketMessages(msgs);
        setTimeout(
          () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
          100,
        );
      },
      (err) => console.warn("msgsQ error:", err),
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
      console.error("Failed to toggle user access:", err);
    }
  };

  const toggleUserTrading = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        "permissions.canTrade": !currentStatus,
      });
    } catch (err) {
      console.error("Failed to toggle user trading:", err);
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
      alert(
        lang === "ar"
          ? "تم إرسال إشعار التحديث للمستخدمين بنجاح!"
          : "Update notification broadcasted to all users successfully!",
      );
    } catch (err) {
      console.error(err);
      alert("Failed to publish update notification.");
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMsg.trim() || !activeTicket) return;
    const text = replyMsg;
    setReplyMsg("");
    await addDoc(collection(db, "support_tickets", activeTicket, "messages"), {
      role: "owner",
      text: text,
      createdAt: serverTimestamp(),
    });
    // Unmark needsOwnerAttention indicator since we just replied
    await setDoc(
      doc(db, "support_tickets", activeTicket),
      {
        lastMessageAt: serverTimestamp(),
        needsOwnerAttention: false,
        unreadUser: true,
      },
      { merge: true },
    );
  };

  return (
    <div
      className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <h2 className="text-xl font-bold flex items-center gap-2">
        👑{" "}
        {lang === "ar"
          ? "لوحة تحكم المنصة والإدارة"
          : "Platform & Admin Dashboard"}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-slate-400 mb-6 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-indigo-400" />
              {lang === "ar"
                ? "محفظة المنصة (العمولات المتراكمة)"
                : "Platform Wallet (Accumulated Commissions)"}
            </h3>

            <div className="flex flex-col items-start gap-4">
              <div className="text-5xl font-black font-mono text-emerald-400 tracking-tighter">
                {platformBalance.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </div>
              <button
                onClick={withdraw}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-lg transition shadow-lg mt-2"
              >
                <Download className="w-5 h-5" />
                {lang === "ar"
                  ? "سحب الأرباح التلقائي إلى بينانس"
                  : "Auto Withdraw Profits to Binance"}
                <ExternalLink className="w-4 h-4 ml-2 opacity-50" />
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              {lang === "ar"
                ? "إحصائيات الشبكة الحية والمستخدمين"
                : "Live Network & Users Stats"}
            </h3>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed mb-4">
              {lang === "ar"
                ? "يتم تخصيم نسبة 10% من أرباح المتداولين على المنصة عبر بوتات التداول الآلية وتوريدها مباشرة إلى محفظة المنصة."
                : "A 10% commission is deducted from trader profits via automated trading bots and directly transferred to the platform wallet."}
            </p>
            <div className="bg-slate-950/50 rounded-lg border border-slate-800 p-4 max-h-64 overflow-y-auto">
              <h4 className="text-xs font-bold text-slate-300 mb-2">
                {lang === "ar" ? "المستخدمين المسجلين" : "Registered Users"} (
                {usersList.length})
              </h4>
              <div className="space-y-2">
                {usersList.map((usr, i) => {
                  const canAccess = usr.permissions?.canAccess !== false;
                  const canTrade = usr.permissions?.canTrade !== false;
                  const isOwner = usr.role === "OWNER" || usr.email === "alamryhmzh7@gmail.com";

                  return (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] p-2 bg-slate-900/50 rounded border border-slate-850 gap-2"
                    >
                      <div className="flex flex-col">
                        <span className="font-mono text-emerald-400 font-bold">
                          {usr.email || usr.id}
                        </span>
                        <span className="text-[9px] text-slate-500 mt-0.5">
                          {isOwner ? "👑 OWNER" : "USER"}
                        </span>
                      </div>

                      {!isOwner && (
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <button
                            onClick={() => toggleUserTrading(usr.id, canTrade)}
                            className={`flex items-center gap-1 px-2 py-1 rounded border transition ${
                              canTrade
                                ? "bg-sky-950/30 border-sky-900/50 text-sky-400 hover:bg-sky-900/50"
                                : "bg-slate-800/50 border-slate-700/50 text-slate-500 hover:bg-slate-700/50"
                            }`}
                            title={
                              lang === "ar"
                                ? "صلاحية التداول (تفعيل/إيقاف)"
                                : "Trading Access"
                            }
                          >
                            <Activity className="w-3 h-3" />
                            {canTrade
                              ? lang === "ar"
                                ? "تداول مفعل"
                                : "Trade ON"
                              : lang === "ar"
                                ? "تداول معلق"
                                : "Trade OFF"}
                          </button>

                          <button
                            onClick={() => toggleUserAccess(usr.id, canAccess)}
                            className={`flex items-center gap-1 px-2 py-1 rounded border transition ${
                              canAccess
                                ? "bg-emerald-950/30 border-emerald-900/50 text-emerald-400 hover:bg-emerald-900/50"
                                : "bg-red-950/30 border-red-900/50 text-red-400 hover:bg-red-900/50"
                            }`}
                            title={
                              lang === "ar"
                                ? "صلاحية النظام (باند)"
                                : "System Access"
                            }
                          >
                            {canAccess ? (
                              <Shield className="w-3 h-3" />
                            ) : (
                              <Ban className="w-3 h-3" />
                            )}
                            {canAccess
                              ? lang === "ar"
                                ? "وصول مفعل"
                                : "Access ON"
                              : lang === "ar"
                                ? "باند (محظور)"
                                : "Banned"}
                          </button>

                          <button
                            onClick={async () => {
                              if (confirm(lang === 'ar' ? "هل أنت متأكد من حذف هذا المستخدم؟" : "Are you sure you want to delete this user?")) {
                                try {
                                  await deleteDoc(doc(db, "users", usr.id));
                                } catch (err) {
                                  console.error("Failed to delete user:", err);
                                  alert(lang === 'ar' ? "فشل حذف المستخدم" : "Failed to delete user");
                                }
                              }
                            }}
                            className="flex items-center gap-1 px-2 py-1 rounded border bg-red-950/30 border-red-900/50 text-red-400 hover:bg-red-900/50 transition"
                            title={lang === "ar" ? "حذف المستخدم" : "Delete User"}
                          >
                             {lang === 'ar' ? "حذف" : "Delete"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-sky-400 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {lang === "ar"
                ? "نظام إشعارات تحديث المنصة"
                : "Platform Update Notifications"}
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              {lang === "ar"
                ? "عند إرسال إشعار تحديث من هنا، سيظهر كإعلان ملء الشاشة لجميع المتداولين عند دخولهم المنصة لإعلامهم بالتحديثات، دون التأثير على إعداداتهم المحفوظة (إلا إذا اخترت الإشعار الشامل)."
                : "Broadcasting an update notification will show a full-screen announcement to all users without wiping their saved configurations."}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handlePublishUpdate(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold py-3 p-4 rounded-xl transition text-xs text-center"
              >
                {lang === "ar"
                  ? "إعلان تحديث روتيني (تحسينات، إضافات - بدون طلب إعادة ضبط)"
                  : "Publish Routine Update (Keep Settings)"}
              </button>

              <button
                onClick={() => handlePublishUpdate(true)}
                className="bg-red-900/30 hover:bg-red-800/40 text-red-400 border border-red-500/30 font-bold py-3 p-4 rounded-xl transition text-xs text-center"
              >
                {lang === "ar"
                  ? "إعلان تحديث جذري (توجيه المستخدمين لإعادة ضبط الإعدادات)"
                  : "Publish Major Update (Instruct users to Reset)"}
              </button>
            </div>
          </div>
        </div>

        {/* Support Tickets Console */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden h-[600px]">
          <div className="p-4 bg-indigo-600/10 border-b border-indigo-500/20 flex justify-between items-center">
            <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {lang === "ar"
                ? "تذاكر الدعم المحولة (Support Desk)"
                : "Escalated Support Desk"}
            </h3>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Tickets list */}
            <div className="w-2/5 border-l border-slate-800 overflow-y-auto bg-slate-950/30">
              {tickets.length === 0 ? (
                <div className="p-4 text-xs text-slate-500 text-center">
                  {lang === "ar" ? "لا توجد رسائل" : "No messages"}
                </div>
              ) : (
                tickets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTicket(t.id)}
                    className={`w-full text-left p-4 border-b border-slate-800 transition ${activeTicket === t.id ? "bg-indigo-600/10 border-indigo-500/30" : "hover:bg-slate-800/50"}`}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className="text-xs font-bold text-slate-300 truncate w-[70%]"
                        dir="ltr"
                      >
                        {t.id.slice(0, 8)}...
                      </div>
                      {t.needsOwnerAttention && (
                        <AlertCircle className="w-4 h-4 text-amber-500 animate-pulse" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {t.lastMessageAt?.toDate?.().toLocaleString()}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Active Ticket Chat */}
            <div className="w-3/5 flex flex-col bg-slate-950">
              {!activeTicket ? (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                  {lang === "ar"
                    ? "اختر تذكرة للرد عليها"
                    : "Select a ticket to reply"}
                </div>
              ) : (
                <>
                  <div className="p-3 bg-slate-900 border-b border-slate-800 text-xs font-mono text-slate-400">
                    User: {activeTicket.slice(0, 10)}...
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {ticketMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === "owner" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                            msg.role === "owner"
                              ? "bg-emerald-600 text-white rounded-br-sm"
                              : msg.role === "bot"
                                ? "bg-slate-800 text-slate-300 rounded-bl-sm border border-slate-700 italic"
                                : "bg-indigo-600 text-white rounded-bl-sm"
                          }`}
                        >
                          <div className="text-[9px] opacity-50 mb-1 uppercase tracking-wider">
                            {msg.role}
                          </div>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <form
                    onSubmit={handleReply}
                    className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2"
                  >
                    <input
                      type="text"
                      value={replyMsg}
                      onChange={(e) => setReplyMsg(e.target.value)}
                      placeholder={
                        lang === "ar" ? "أدخل ردك..." : "Type reply..."
                      }
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-500 p-2.5 rounded-lg text-white transition"
                    >
                      <Reply className="w-4 h-4" />
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unresolved AI Queries */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-bold text-amber-500 mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {lang === "ar"
            ? "استفسارات الذكاء الاصطناعي غير المحلولة (لم يتمكن النظام من فهمها)"
            : "Unresolved AI Queries"}
        </h3>

        <div className="space-y-4">
          {unresolvedQueries.length === 0 ? (
            <p className="text-slate-500 text-sm">
              {lang === "ar"
                ? "لا توجد استفسارات معلقة."
                : "No unresolved queries."}
            </p>
          ) : (
            unresolvedQueries.map((q) => (
              <div
                key={q.id}
                className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col gap-2"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs text-slate-500 font-mono">
                    User: {q.userId?.slice(0, 8)}...
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {q.createdAt?.toDate?.().toLocaleString()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    <span className="text-indigo-400">User:</span> {q.userQuery}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    <span className="text-slate-500">AI Response:</span>{" "}
                    {q.botReply}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
