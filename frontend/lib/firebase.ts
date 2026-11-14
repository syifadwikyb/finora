// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  type Auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

if (!hasFirebaseConfig) {
  console.warn("[firebase] NEXT_PUBLIC_FIREBASE_* is not configured, auth is disabled.");
}

const app = hasFirebaseConfig
  ? (!getApps().length ? initializeApp(firebaseConfig) : getApp())
  : null;

export const auth = (app ? getAuth(app) : null) as Auth;
const googleProvider = new GoogleAuthProvider();

export const registerWithEmail = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const actionCodeSettings = typeof window !== "undefined" ? {
    url: `${window.location.origin}/login?verified=true`,
  } : undefined;
  await sendEmailVerification(userCredential.user, actionCodeSettings);
  return userCredential;
};

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const login = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const logout = () => signOut(auth);

export const updateUserProfile = (profile: { displayName?: string; photoURL?: string }) => {
  if (!auth.currentUser) throw new Error("No user logged in");
  return updateProfile(auth.currentUser, profile);
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  if (!auth.currentUser || !auth.currentUser.email) throw new Error("No user logged in");
  // Re-authenticate user first to prevent auth/requires-recent-login errors
  const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
  await reauthenticateWithCredential(auth.currentUser, credential);
  return updatePassword(auth.currentUser, newPassword);
};

export const onAuthStateChangedListener = (callback: (user: any) => void) => {
  if (!auth) {
    callback(null);
    return () => { };
  }
  return onAuthStateChanged(auth, callback);
};

export const getAuthErrorMessage = (error: any): string => {
  const code = error?.code || "";
  switch (code) {
    case "auth/requires-recent-login":
      return "Your session has expired. Please enter your current password to confirm.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Invalid email or password.";
    case "auth/user-not-found":
      return "Invalid email or password.";
    case "auth/email-already-in-use":
      return "Email is already registered. Please use another email or sign in.";
    case "auth/weak-password":
      return "Password is too weak. Please use at least 6 characters.";
    case "auth/invalid-email":
      return "Invalid email format.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Failed to connect to the server. Please check your internet connection.";
    default:
      if (error?.message) return error.message;
      return "An unexpected error occurred. Please try again.";
  }
};