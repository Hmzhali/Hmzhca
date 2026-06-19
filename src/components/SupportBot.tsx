import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, HelpCircle } from 'lucide-react';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function SupportBot({ lang, userId, owner }: { lang: 'ar'|'en', userId: string, owner: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState<{role: 'user'|'bot'|'owner', text: string}[]>([
    { role: 'bot', text: lang === 'ar' ? 'مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك؟' : 'Hello! I am your AI assistant. How can I help?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // Load old messages from Firestore
  useEffect(() => {
    if (!userId) return;
    const q = query(collection(db, 'support_tickets', userId, 'messages'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const msgs = snap.docs.map(d => ({ role: d.data().role, text: d.data().text }));
        setChat(msgs as any);
      }
    }, (err) => {
      console.warn("SupportBot snapshot error:", err);
    });
    return () => unsub();
  }, [userId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;
    
    const userMsg = msg;
    setMsg('');
    
    // Save to Firestore
    await addDoc(collection(db, 'support_tickets', userId, 'messages'), {
      role: 'user',
      text: userMsg,
      createdAt: serverTimestamp()
    });
    await setDoc(doc(db, 'support_tickets', userId), {
      lastMessageAt: serverTimestamp(),
      unreadAdmin: true,
      userId
    }, { merge: true });

    setIsTyping(true);

    try {
      // Fetch AI response
      const res = await fetch('/api/gemini/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg, lang })
      });
      const data = await res.json();
      
      let botResponse = data.reply || (lang === 'ar' ? 'لم استطع فهمك.' : 'Could not understand.');
      let escalated = data.escalated || false;
      const confidence = data.confidence || 100;

      if (escalated) {
        botResponse += lang === 'ar' 
          ? `\n\n*(تقييم الذكاء الاصطناعي: ثقة ${confidence}% - تم تحويل الاستفسار لمدير المنصة مباشرة)*`
          : `\n\n*(AI Confidence: ${confidence}% - Escalated directly to platform manager)*`;
      }

      await addDoc(collection(db, 'support_tickets', userId, 'messages'), {
        role: 'bot',
        text: botResponse,
        createdAt: serverTimestamp()
      });
      
      if (escalated) {
         await setDoc(doc(db, 'support_tickets', userId), {
            needsOwnerAttention: true
         }, { merge: true });

         await addDoc(collection(db, 'unresolved_queries'), {
           userId: userId,
           userQuery: userMsg,
           botReply: botResponse,
           createdAt: serverTimestamp(),
           status: 'pending'
         });
      }
    } catch (err: any) {
      if (err.name !== 'AbortError' && err.message !== 'Failed to fetch') {
        console.warn(err);
      }
      await addDoc(collection(db, 'support_tickets', userId, 'messages'), {
        role: 'bot',
        text: lang === 'ar' ? 'حدث خطأ في الاتصال. سيقوم المالك بالرد عليك قريباً.' : 'Connection error. The owner will reply soon.',
        createdAt: serverTimestamp()
      });
    } finally {
      setIsTyping(false);
    }
  };

  if (owner) return null; // Owner has their own dashboard for tickets

  return (
    <div className="fixed bottom-6 right-6 z-50" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {isOpen ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-[320px] md:w-[380px] h-[450px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-200" />
              <span className="font-bold text-sm">{lang === 'ar' ? 'الدعم الفني الذكي' : 'Smart Support Desk'}</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-indigo-500 p-1 rounded-lg transition">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950">
            {chat.map((c, i) => (
              <div key={i} className={`flex ${c.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-[12px] leading-relaxed ${
                  c.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-sm' 
                    : c.role === 'owner' 
                      ? 'bg-emerald-600 text-white rounded-bl-sm'
                      : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700'
                }`}>
                  <p className="whitespace-pre-wrap">{c.text}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-slate-700 p-3 rounded-xl rounded-bl-sm text-slate-400">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <input 
              type="text"
              value={msg}
              onChange={e => setMsg(e.target.value)}
              placeholder={lang === 'ar' ? 'اكتب رسالتك...' : 'Type message...'}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <button type="submit" disabled={isTyping} className="bg-indigo-600 hover:bg-indigo-500 p-2.5 rounded-lg text-white transition disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-lg hover:shadow-indigo-500/25 transition-all hover:scale-105"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
