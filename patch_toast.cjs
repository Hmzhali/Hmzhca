const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  `  const sendTelegramNotification = useCallback(
    async (toast: ToastNotification) => {`,
  `  const sendTelegramNotification = useCallback(
    async (toast: ToastNotification) => {
      // Don't send telegram notifications for simple UI feedback like adding/removing coins
      if (toast.botId === "system" || toast.symbol === "SYSTEM") return;`
);

content = content.replace(
  `      body = isAr
        ? \`🤖 تم معالجة صفقة تداول ومطابقتها خوارزمياً!\\n📊 زوج الأصول: <b>\${toast.symbol}</b>\\n🦾 الأداة المشغلة: <b>\${toast.botType || "GRID"} Automatic</b>\\n💵 أرباح الصفقة الفورية: <b>+$\${profitVal} USDT</b>\\n\\n📌 <b>تأكيد وتوضيح الذكاء الاصطناعي:</b>\\n\${toast.aiExplanationAr || ""}\`
        : \`🤖 Algorithmic order successfully matched on target gateways!\\n📊 Market Pair: <b>\${toast.symbol}</b>\\n🦾 Execution Module: <b>\${toast.botType || "GRID"} Automatic</b>\\n💵 Instant captured return: <b>+$\${profitVal} USDT</b>\\n\\n📌 <b>AI Verdict & Analytics:</b>\\n\${toast.aiExplanationEn || ""}\`;`,
  `      body = isAr
        ? \`🤖 تم معالجة صفقة تداول ومطابقتها خوارزمياً!\\n📊 زوج الأصول: <b>\${toast.symbol}</b>\\n🦾 الأداة المشغلة: <b>\${toast.botType || "GRID"} Automatic</b>\\n💵 أرباح الصفقة الفورية: <b>+$\${profitVal} USDT</b>\` + (toast.aiExplanationAr ? \`\\n\\n📌 <b>تأكيد وتوضيح الذكاء الاصطناعي:</b>\\n\${toast.aiExplanationAr}\` : '')
        : \`🤖 Algorithmic order successfully matched on target gateways!\\n📊 Market Pair: <b>\${toast.symbol}</b>\\n🦾 Execution Module: <b>\${toast.botType || "GRID"} Automatic</b>\\n💵 Instant captured return: <b>+$\${profitVal} USDT</b>\` + (toast.aiExplanationEn ? \`\\n\\n📌 <b>AI Verdict & Analytics:</b>\\n\${toast.aiExplanationEn}\` : '');`
);

fs.writeFileSync('src/App.tsx', content);
