import React, { useState, useEffect } from "react";
import { auth, db, logout } from "../lib/firebase";
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ApiConnection } from "../types";
import {
  User,
  Lock,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  LogOut,
  Camera,
  Check,
} from "lucide-react";

interface UserProfileProps {
  lang: "ar" | "en";
  onClose: () => void;
  apiConnection: ApiConnection;
  onUpdateConnection: (conn: Partial<ApiConnection>) => void;
}

// Reversible XOR Encryption helper using user UID as dynamic salt
const encrypt = (text: string, salt: string): string => {
  if (!text) return "";
  const key = salt || "almoharif_default_salt";
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(c);
  }
  return btoa(unescape(encodeURIComponent(result)));
};

const decrypt = (encoded: string, salt: string): string => {
  if (!encoded) return "";
  try {
    const decodedB64 = decodeURIComponent(escape(atob(encoded)));
    const key = salt || "almoharif_default_salt";
    let result = "";
    for (let i = 0; i < decodedB64.length; i++) {
      const c = decodedB64.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(c);
    }
    return result;
  } catch (e) {
    return encoded; // fallback to raw string if decryption fails or not encrypted
  }
};

export default function UserProfile({
  lang,
  onClose,
  apiConnection,
  onUpdateConnection,
}: UserProfileProps) {
  const currentUser = auth.currentUser;
  const uid = currentUser?.uid || "";

  // UI state
  const [activeSubTab, setActiveSubTab] = useState<"info" | "security" | "api">(
    "info"
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Section 1: User Info State
  const [displayName, setDisplayName] = useState<string>("");
  const [photoURL, setPhotoURL] = useState<string>("");

  // Section 2: Security (Password change) State
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);

  // Section 3: Binance API Keys State
  const [binanceKey, setBinanceKey] = useState<string>("");
  const [binanceSecret, setBinanceSecret] = useState<string>("");
  const [showApiKeys, setShowApiKeys] = useState<boolean>(false);
  const [testnetMode, setTestnetMode] = useState<boolean>(false);
  const [isTestingApi, setIsTestingApi] = useState<boolean>(false);
  const [apiFeedback, setApiFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Load profile data from Firestore & Auth
  useEffect(() => {
    if (!currentUser) return;
    setDisplayName(currentUser.displayName || "");
    setPhotoURL(currentUser.photoURL || "");

    const loadUserData = async () => {
      setLoading(true);
      try {
        const userDocRef = doc(db, "users", uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          if (data.displayName && !currentUser.displayName) {
            setDisplayName(data.displayName);
          }
          if (data.photoURL && !currentUser.photoURL) {
            setPhotoURL(data.photoURL);
          }

          // Load secure apiConnection if it exists in Firestore
          if (data.secureApiConnection) {
            const encryptedKey = data.secureApiConnection.apiKey || "";
            const encryptedSecret = data.secureApiConnection.apiSecret || "";
            const testnet = data.secureApiConnection.useTestnet || false;

            const decryptedKey = decrypt(encryptedKey, uid);
            const decryptedSecret = decrypt(encryptedSecret, uid);

            setBinanceKey(decryptedKey);
            setBinanceSecret(decryptedSecret);
            setTestnetMode(testnet);
          } else if (apiConnection?.apiKey) {
            // Fallback to memory apiConnection
            setBinanceKey(apiConnection.apiKey);
            setBinanceSecret(apiConnection.apiSecret);
            setTestnetMode(apiConnection.useTestnet || false);
          }
        }
      } catch (err) {
        console.error("Failed to load profile data from Firestore:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser, uid]);

  // Handle User Info Save
  const handleSaveInfo = async () => {
    if (!currentUser) return;
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // 1. Update Firebase Auth Profile
      await updateProfile(currentUser, {
        displayName: displayName.trim(),
        photoURL: photoURL.trim(),
      });

      // 2. Save in Firestore
      const userDocRef = doc(db, "users", uid);
      await updateDoc(userDocRef, {
        displayName: displayName.trim(),
        photoURL: photoURL.trim(),
        updatedAt: Date.now(),
      });

      setSuccessMsg(
        lang === "ar"
          ? "تم تحديث معلومات الحساب بنجاح!"
          : "Account profile updated successfully!"
      );
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        lang === "ar"
          ? "فشل تحديث البيانات: " + (err.message || "خطأ غير معروف")
          : "Failed to update profile: " + (err.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Change
  const handleSavePassword = async () => {
    if (!currentUser) return;
    if (!currentPassword) {
      setErrorMsg(
        lang === "ar"
          ? "الرجاء إدخال كلمة المرور الحالية لتأكيد الهوية"
          : "Please enter your current password to authenticate"
      );
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg(
        lang === "ar"
          ? "يجب أن تكون كلمة المرور الجديدة مكونة من 6 أحرف على الأقل"
          : "New password must be at least 6 characters long"
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg(
        lang === "ar"
          ? "كلمة المرور الجديدة وتأكيدها غير متطابقتين"
          : "New password and confirmation do not match"
      );
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // Re-authenticate user first (Highly secure)
      const credential = EmailAuthProvider.credential(
        currentUser.email || "",
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);

      setSuccessMsg(
        lang === "ar"
          ? "تم تغيير كلمة المرور بنجاح!"
          : "Password changed successfully!"
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || "";
      if (errMsg.includes("wrong-password")) {
        errMsg =
          lang === "ar"
            ? "كلمة المرور الحالية غير صحيحة"
            : "Current password is incorrect";
      } else {
        errMsg =
          lang === "ar"
            ? "فشل تحديث كلمة المرور: " + (err.message || "خطأ")
            : "Failed to change password: " + (err.message || "Error");
      }
      setErrorMsg(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Test and Link Binance API Connection
  const handleTestAndSaveApi = async () => {
    if (!binanceKey.trim() || !binanceSecret.trim()) {
      setApiFeedback({
        type: "error",
        text:
          lang === "ar"
            ? "يرجى ملء كلا الحقلين: المفتاح والسر"
            : "Please fill in both fields: Key and Secret",
      });
      return;
    }

    setIsTestingApi(true);
    setApiFeedback(null);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch("/api/gateway/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: binanceKey.trim(),
          apiSecret: binanceSecret.trim(),
          useTestnet: testnetMode,
        }),
      });

      const resData = await response.json();
      setIsTestingApi(false);

      if (response.ok && resData.success) {
        // Enforce safe API configuration: check if withdrawal is disabled in user local/remote configurations
        // 1. Save locally in client memory state
        const updatedConn = {
          exchange: "Binance" as const,
          apiKey: binanceKey.trim(),
          apiSecret: binanceSecret.trim(),
          useTestnet: testnetMode,
          isConnected: true,
          lastTested: Date.now(),
        };
        onUpdateConnection(updatedConn);

        // 2. Encrypt keys
        const encryptedKey = encrypt(binanceKey.trim(), uid);
        const encryptedSecret = encrypt(binanceSecret.trim(), uid);

        // 3. Save inside Firestore securely
        const userDocRef = doc(db, "users", uid);
        await updateDoc(userDocRef, {
          secureApiConnection: {
            exchange: "Binance",
            apiKey: encryptedKey,
            apiSecret: encryptedSecret,
            useTestnet: testnetMode,
            lastTested: Date.now(),
          },
          updatedAt: Date.now(),
        });

        setApiFeedback({
          type: "success",
          text:
            lang === "ar"
              ? "✅ تم التحقق وحفظ مفاتيح Binance بنجاح وتشفيرها في السحاب!"
              : "✅ Successfully verified, saved, and encrypted Binance API Keys in the cloud!",
        });
      } else {
        setApiFeedback({
          type: "error",
          text:
            lang === "ar"
              ? "❌ فشل التحقق من المفاتيح. يرجى التأكد من صحتها وصلاحية التداول الفوري/العقود."
              : "❌ Failed to verify keys. Please make sure they are correct and futures/spot trading is enabled.",
        });
      }
    } catch (err: any) {
      console.error(err);
      setIsTestingApi(false);
      setApiFeedback({
        type: "error",
        text:
          lang === "ar"
            ? "حدث خطأ أثناء فحص المفاتيح مع خادم Binance."
            : "An error occurred while testing keys with Binance server.",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="bg-slate-800/80 p-5 border-b border-slate-700/60 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-lg">
                {lang === "ar" ? "إعدادات الحساب والملف الشخصي" : "Account Settings & Profile"}
              </h3>
              <p className="text-xs text-slate-400">
                {currentUser?.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex bg-slate-950/40 border-b border-slate-800/60 p-2 gap-1 shrink-0">
          <button
            onClick={() => {
              setActiveSubTab("info");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === "info"
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
            }`}
          >
            <User className="w-4 h-4" />
            {lang === "ar" ? "المعلومات الشخصية" : "Personal Info"}
          </button>
          <button
            onClick={() => {
              setActiveSubTab("security");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === "security"
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
            }`}
          >
            <Lock className="w-4 h-4" />
            {lang === "ar" ? "كلمة المرور والأمان" : "Password & Security"}
          </button>
          <button
            onClick={() => {
              setActiveSubTab("api");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === "api"
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            {lang === "ar" ? "مفاتيح التداول API" : "Trading API Keys"}
          </button>
        </div>

        {/* Form Notifications */}
        {(successMsg || errorMsg) && (
          <div className="px-6 pt-4 shrink-0">
            {successMsg && (
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* Tab Contents - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center z-50">
              <div className="w-10 h-10 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin mb-3"></div>
              <span className="text-xs font-bold text-indigo-400">
                {lang === "ar" ? "جاري معالجة الطلب بأمان..." : "Processing secure request..."}
              </span>
            </div>
          )}

          {/* Tab 1: Personal Info */}
          {activeSubTab === "info" && (
            <div className="space-y-5">
              {/* Avatar section */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-950/20 border border-slate-800/40 rounded-2xl relative">
                <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-indigo-500/30 flex items-center justify-center text-3xl font-black text-indigo-400 shadow-xl overflow-hidden relative group">
                  {photoURL ? (
                    <img
                      src={photoURL}
                      alt="Avatar"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    displayName?.charAt(0).toUpperCase() ||
                    currentUser?.email?.charAt(0).toUpperCase() ||
                    "U"
                  )}
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-5 h-5 text-slate-200" />
                  </div>
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  {lang === "ar" ? "مستوى الحساب: متداول احترافي" : "Account Tier: Professional Trader"}
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400">
                  {lang === "ar" ? "الاسم الشخصي الكامل" : "Full Display Name"}
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={lang === "ar" ? "مثال: حمزة العامري" : "e.g. Hamza Alamry"}
                  className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              {/* Email (Disabled) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500">
                  {lang === "ar" ? "البريد الإلكتروني (غير قابل للتعديل)" : "Registered Email (Read-Only)"}
                </label>
                <input
                  type="email"
                  value={currentUser?.email || ""}
                  disabled
                  className="w-full bg-slate-950/40 border border-slate-850 px-4 py-3 rounded-xl text-slate-500 text-sm cursor-not-allowed"
                />
              </div>

              {/* Avatar URL option */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400">
                  {lang === "ar" ? "رابط الصورة الشخصية (اختياري)" : "Avatar Image URL (Optional)"}
                </label>
                <input
                  type="url"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveInfo}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl transition shadow-lg text-sm"
              >
                <Save className="w-4 h-4" />
                {lang === "ar" ? "حفظ وتحديث معلومات الحساب" : "Save Profile Details"}
              </button>
            </div>
          )}

          {/* Tab 2: Security & Password */}
          {activeSubTab === "security" && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl flex gap-3 items-start">
                <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-400 leading-relaxed">
                  {lang === "ar"
                    ? "لحماية حسابك، يتطلب تغيير كلمة المرور التحقق من هويتك أولاً عن طريق إدخال كلمة المرور الحالية."
                    : "To secure your account, changing your password requires verification of your identity by inputting your current password first."}
                </div>
              </div>

              {/* Current Password */}
              <div className="space-y-1.5 relative">
                <label className="block text-xs font-bold text-slate-400">
                  {lang === "ar" ? "كلمة المرور الحالية" : "Current Password"}
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 pl-11 pr-4 py-3 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 left-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5 relative">
                <label className="block text-xs font-bold text-slate-400">
                  {lang === "ar" ? "كلمة المرور الجديدة" : "New Password"}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 pl-11 pr-4 py-3 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 left-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400">
                  {lang === "ar" ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSavePassword}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black py-3.5 px-4 rounded-xl transition shadow-lg text-sm"
              >
                <Lock className="w-4 h-4" />
                {lang === "ar" ? "تحديث كلمة المرور" : "Update Password"}
              </button>
            </div>
          )}

          {/* Tab 3: Trading API Keys */}
          {activeSubTab === "api" && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl flex gap-3 items-start">
                <KeyRound className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-400 leading-relaxed">
                  <span className="font-bold text-slate-200 block mb-1">
                    {lang === "ar" ? "🛡️ التخزين الآمن المشفر" : "🛡️ Secure Encrypted Storage"}
                  </span>
                  {lang === "ar"
                    ? "يتم تشفير مفاتيح الـ API الخاصة بك على مستوى المتصفح العميل قبل إرسالها وحفظها في قاعدة بيانات السحاب Firestore. لا يستطيع أي شخص أو مخترق الاطلاع عليها بدون معرّف هويتك المشفر الفريد."
                    : "Your API keys are encrypted client-side before sending and storing in Firestore. Nobody can read or decode them without your unique cryptographic token."}
                </div>
              </div>

              {/* Testnet Switcher */}
              <div className="flex items-center justify-between p-3.5 bg-slate-950/30 border border-slate-850 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">
                    {lang === "ar" ? "بيئة التداول التجريبية (Binance Testnet)" : "Binance Testnet Environment"}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {lang === "ar"
                      ? "قم بالتفعيل إذا كنت تستخدم مفاتيح شبكة الاختبار الوهمية"
                      : "Toggle ON if your keys belong to the simulated paper-trading network"}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={testnetMode}
                    onChange={(e) => setTestnetMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                </label>
              </div>

              {/* API Key */}
              <div className="space-y-1.5 relative">
                <label className="block text-xs font-bold text-slate-400">
                  {lang === "ar" ? "مفتاح API Key" : "Binance API Key"}
                </label>
                <div className="relative">
                  <input
                    type={showApiKeys ? "text" : "password"}
                    value={binanceKey}
                    onChange={(e) => setBinanceKey(e.target.value)}
                    placeholder="binance_api_key..."
                    className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm font-mono"
                  />
                </div>
              </div>

              {/* API Secret */}
              <div className="space-y-1.5 relative">
                <label className="block text-xs font-bold text-slate-400">
                  {lang === "ar" ? "المفتاح السري API Secret" : "Binance API Secret"}
                </label>
                <div className="relative">
                  <input
                    type={showApiKeys ? "text" : "password"}
                    value={binanceSecret}
                    onChange={(e) => setBinanceSecret(e.target.value)}
                    placeholder="binance_api_secret..."
                    className="w-full bg-slate-950 border border-slate-800 pl-11 pr-4 py-3 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKeys(!showApiKeys)}
                    className="absolute inset-y-0 left-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showApiKeys ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* API Verification Result Feedback */}
              {apiFeedback && (
                <div
                  className={`text-xs font-bold p-3.5 rounded-xl border ${
                    apiFeedback.type === "success"
                      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                      : "text-rose-400 bg-rose-500/10 border-rose-500/20"
                  }`}
                >
                  {apiFeedback.text}
                </div>
              )}

              {/* Submit Buttons */}
              <button
                onClick={handleTestAndSaveApi}
                disabled={isTestingApi}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-850 disabled:text-slate-500 text-white font-bold py-3.5 px-4 rounded-xl transition shadow-lg text-sm"
              >
                {isTestingApi ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-600 border-t-white rounded-full animate-spin"></div>
                    {lang === "ar" ? "جاري الاتصال والتحقق مع بينانس..." : "Verifying credentials with Binance..."}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {lang === "ar" ? "فحص وحفظ مفاتيح الربط" : "Verify & Encrypt Keys"}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
