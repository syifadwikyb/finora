// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
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
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const registerWithEmail = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const actionCodeSettings = typeof window !== "undefined" ? {
    url: `${window.location.origin}/login?verified=true`,
    handleCodeInApp: true,
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
  // Re-autentikasi akun terlebih dahulu agar tidak memicu auth/requires-recent-login
  const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
  await reauthenticateWithCredential(auth.currentUser, credential);
  return updatePassword(auth.currentUser, newPassword);
};

export const onAuthStateChangedListener = (callback: (user: any) => void) =>
  onAuthStateChanged(auth, callback);

export const getAuthErrorMessage = (error: any): string => {
  const code = error?.code || "";
  switch (code) {
    case "auth/requires-recent-login":
      return "Sesi Anda sudah lama. Silakan masukkan password saat ini untuk konfirmasi.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Password saat ini salah atau credential tidak valid.";
    case "auth/user-not-found":
      return "Email atau password salah.";
    case "auth/email-already-in-use":
      return "Email sudah terdaftar. Silakan gunakan email lain atau masuk.";
    case "auth/weak-password":
      return "Password terlalu lemah. Gunakan minimal 6 karakter.";
    case "auth/invalid-email":
      return "Format email tidak valid.";
    case "auth/too-many-requests":
      return "Terlalu banyak percobaan. Silakan coba lagi nanti.";
    case "auth/network-request-failed":
      return "Gagal terhubung ke server. Periksa koneksi internet Anda.";
    default:
      if (error?.message) return error.message;
      return "Terjadi kesalahan yang tidak terduga. Silakan coba lagi.";
  }
};
