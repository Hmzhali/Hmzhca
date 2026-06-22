import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signInWithCredential } from 'firebase/auth';
import { initializeFirestore, doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

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
