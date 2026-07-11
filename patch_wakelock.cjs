const fs = require('fs');
let content = fs.readFileSync('src/components/WakeLockToggle.tsx', 'utf8');

// Replace the invalid MP3 with a valid silent WAV
content = content.replace(
  /const silentAudioSrc = "data:audio\/mp3;base64,[^"]+";/,
  'const silentAudioSrc = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";'
);

// Better error handling for the alert
content = content.replace(
  "alert(lang === 'ar' ? 'تعذر تفعيل وضع البقاء متيقظاً. يرجى فتح التطبيق في نافذة مستقلة وتجربة النقر مرة أخرى.' : 'Could not activate keep-alive mode. Please open the app in a new tab.');",
  "alert(lang === 'ar' ? '⚠️ المنصة تعمل في وضع المعاينة (نافذة مضمنة) الذي يمنع خاصية إبقاء الشاشة مضاءة.\\n\\nيرجى النقر على زر (فتح في علامة تبويب جديدة ↗️) أعلى يمين الشاشة، ثم تفعيل الخاصية من هناك لتعمل بكفاءة.' : '⚠️ The platform is running in preview mode (iframe) which blocks the screen wake lock feature.\\n\\nPlease click the (Open in new tab ↗️) button at the top right of the screen, and activate the feature from there to work properly.');"
);

fs.writeFileSync('src/components/WakeLockToggle.tsx', content);
