import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signInWithCredential, RecaptchaVerifier, signInWithPhoneNumber as webSignInWithPhoneNumber } from 'firebase/auth';
import { initializeFirestore, doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

declare global {
  interface Window {
    recaptchaVerifier: any;
    confirmationResult: any;
  }
}

export const setupRecaptcha = (containerId: string) => {
  if (!Capacitor.isNativePlatform()) {
    if (!window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
          size: 'invisible'
        });
        console.log("RecaptchaVerifier initialized successfully");
      } catch (err) {
        console.error("Error initializing RecaptchaVerifier:", err);
      }
    }
  }
};

export const sendPhoneCode = async (phoneNumber: string): Promise<string> => {
  if (Capacitor.isNativePlatform()) {
    return new Promise(async (resolve, reject) => {
      let resolved = false;

      const sentSub = await FirebaseAuthentication.addListener('phoneCodeSent', (event) => {
        if (!resolved) {
          resolved = true;
          resolve(event.verificationId);
          sentSub.remove();
        }
      });

      const compSub = await FirebaseAuthentication.addListener('phoneVerificationCompleted', async (event) => {
        if (!resolved) {
          resolved = true;
          resolve("completed");
          compSub.remove();
        }
      });

      const failSub = await FirebaseAuthentication.addListener('phoneVerificationFailed', (event) => {
        if (!resolved) {
          resolved = true;
          reject(new Error(event.message));
          failSub.remove();
        }
      });

      try {
        await FirebaseAuthentication.signInWithPhoneNumber({ phoneNumber });
      } catch (err: any) {
        if (!resolved) {
          resolved = true;
          reject(err);
        }
      }
    });
  } else {
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } catch (e) {
      console.warn("Error clearing old recaptcha", e);
      window.recaptchaVerifier = null;
    }
    setupRecaptcha("recaptcha-container");
    const appVerifier = window.recaptchaVerifier;
    if (!appVerifier) {
      throw new Error("Recaptcha failed to initialize. Please check your connection and try again.");
    }
    const confirmationResult = await webSignInWithPhoneNumber(auth, phoneNumber, appVerifier);
    window.confirmationResult = confirmationResult;
    return "web";
  }
};

export const confirmPhoneCode = async (verificationId: string, code: string) => {
  if (Capacitor.isNativePlatform()) {
    const result = await FirebaseAuthentication.confirmVerificationCode({
      verificationId,
      verificationCode: code
    });
    if (result.user) await initUserProfile(result.user);
    return result;
  } else {
    const result = await window.confirmationResult.confirm(code);
    if (result.user) await initUserProfile(result.user);
    return result;
  }
};

export const loginWithGoogle = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      const result = await FirebaseAuthentication.signInWithGoogle();
      const credential = GoogleAuthProvider.credential(result.credential?.idToken);
      const res = await signInWithCredential(auth, credential);
      await initUserProfile(res.user);
      return res;
    } else {
      const res = await signInWithPopup(auth, googleProvider);
      await initUserProfile(res.user);
      return res;
    }
  } catch (error: any) {
    console.warn("Login failed:", error);
    throw error;
  }
};

export const handleRedirectResult = async () => {
  try {
    const res = await getRedirectResult(auth);
    if (res?.user) {
      await initUserProfile(res.user);
    }
    return res;
  } catch (err) {
    console.warn("Redirect login result failed:", err);
  }
};

export const registerWithEmail = async (email: string, pass: string) => {
  const res = await createUserWithEmailAndPassword(auth, email, pass);
  await initUserProfile(res.user);
  await sendEmailVerification(res.user);
  return res;
};

export const loginWithEmailProvider = async (email: string, pass: string) => {
  return await signInWithEmailAndPassword(auth, email, pass);
};

export const resetPassword = async (email: string) => {
  return await sendPasswordResetEmail(auth, email);
};

const initUserProfile = async (user: any) => {
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  if (!userDoc.exists()) {
    const isOwner = user.email === 'alamryhmzh7@gmail.com';
    await setDoc(userDocRef, {
      email: user.email,
      role: isOwner ? 'OWNER' : 'USER',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      walletUsdt: 0,
      config: {}
    });
  }
};

export const logout = async () => {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('almoharif_')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
  await signOut(auth);
  window.location.reload();
};
