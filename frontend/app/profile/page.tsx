"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import {
  updateUserProfile,
  changePassword,
  getAuthErrorMessage
} from "@/lib/firebase";
import {
  User,
  Mail,
  Phone,
  AtSign,
  Fingerprint,
  KeyRound,
  Sun,
  Moon,
  Laptop,
  Info,
  LogOut,
  Camera,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles
} from "lucide-react";

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  // Profile Form States
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Security & Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Biometrics State
  const [fingerprintEnabled, setFingerprintEnabled] = useState(false);
  const [testingFingerprint, setTestingFingerprint] = useState(false);
  const [fingerprintMsg, setFingerprintMsg] = useState<string | null>(null);

  // Theme State
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  // Logout Modal State
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setPhotoURL(user.photoURL || "");

      // Muat data profil lokal jika ada
      const savedProfile = localStorage.getItem(`finora_profile_${user.uid}`);
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          if (parsed.username) setUsername(parsed.username);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.photoURL && !user.photoURL) setPhotoURL(parsed.photoURL);
        } catch (e) {
          console.error("Failed to parse saved profile", e);
        }
      } else {
        // Fallback username dari email
        if (user.email) {
          setUsername(user.email.split("@")[0]);
        }
      }

      // Muat preferensi biometrik
      const bio = localStorage.getItem(`finora_biometric_${user.uid}`);
      setFingerprintEnabled(bio === "true");

      // Muat preferensi tema
      const savedTheme = (localStorage.getItem("finora_theme") as "light" | "dark" | "system") || "system";
      setTheme(savedTheme);
    }
  }, [user]);

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setProfileSaving(true);

    try {
      if (user) {
        // Update Firebase Auth Profile
        await updateUserProfile({
          displayName: displayName.trim(),
          photoURL: photoURL.trim() || undefined,
        });

        // Simpan username & phone ke penyimpanan profil
        const profileData = {
          username: username.trim(),
          phone: phone.trim(),
          photoURL: photoURL.trim(),
        };
        localStorage.setItem(`finora_profile_${user.uid}`, JSON.stringify(profileData));

        setProfileSuccess("Profil berhasil diperbarui!");
        setTimeout(() => setProfileSuccess(null), 3500);
      }
    } catch (err: any) {
      setProfileError(getAuthErrorMessage(err));
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError("Silakan masukkan password saat ini untuk verifikasi keamanan.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password baru harus minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi password baru tidak cocok.");
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess("Password berhasil diubah!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(null), 3500);
    } catch (err: any) {
      setPasswordError(getAuthErrorMessage(err));
    } finally {
      setPasswordSaving(false);
    }
  };

  // Handle Fingerprint / WebAuthn Biometrics
  const handleToggleFingerprint = async () => {
    setFingerprintMsg(null);
    const nextState = !fingerprintEnabled;

    if (nextState) {
      if (typeof window !== "undefined" && window.PublicKeyCredential && navigator.credentials) {
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          if (!available) {
            setFingerprintMsg("Perangkat ini belum mendukung sensor biometrik platform (Windows Hello / Touch ID).");
            return;
          }

          // Picu autentikator biometrik perangkat (Windows Hello, Touch ID, Android Biometric)
          const challenge = new Uint8Array(32);
          window.crypto.getRandomValues(challenge);

          const credential = await navigator.credentials.create({
            publicKey: {
              challenge,
              rp: { name: "Finora Finance Tracker" },
              user: {
                id: new TextEncoder().encode(user?.uid || "user_id"),
                name: user?.email || "user@finora.local",
                displayName: displayName || user?.displayName || "User Finora",
              },
              pubKeyCredParams: [
                { alg: -7, type: "public-key" },  // ES256
                { alg: -257, type: "public-key" } // RS256
              ],
              authenticatorSelection: {
                authenticatorAttachment: "platform",
                userVerification: "preferred",
              },
              timeout: 60000,
            }
          });

          if (credential) {
            setFingerprintEnabled(true);
            if (user) {
              localStorage.setItem(`finora_biometric_${user.uid}`, "true");
              localStorage.setItem(`finora_biometric_id_${user.uid}`, credential.id);
            }
            setFingerprintMsg("✅ Sidik jari / Biometrik berhasil didaftarkan dan aktif!");
          }
        } catch (e: any) {
          console.error("Biometric registration error:", e);
          if (e.name === "NotAllowedError") {
            setFingerprintMsg("Pendaftaran sidik jari dibatalkan oleh pengguna.");
          } else {
            setFingerprintMsg("Pendaftaran sidik jari belum selesai atau tidak didukung di browser ini.");
          }
        }
      } else {
        setFingerprintMsg("Browser Anda tidak mendukung Web Authentication API.");
      }
    } else {
      setFingerprintEnabled(false);
      if (user) {
        localStorage.removeItem(`finora_biometric_${user.uid}`);
        localStorage.removeItem(`finora_biometric_id_${user.uid}`);
      }
      setFingerprintMsg("Sidik jari dinonaktifkan.");
    }

    setTimeout(() => setFingerprintMsg(null), 4000);
  };

  // Uji / Tes Sensor Sidik Jari Langsung
  const handleTestBiometric = async () => {
    setTestingFingerprint(true);
    setFingerprintMsg(null);
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          rpId: window.location.hostname,
          userVerification: "required",
          timeout: 60000,
        }
      });

      if (assertion) {
        setFingerprintMsg("✅ Sensor sidik jari berhasil diverifikasi! Identitas terkonfirmasi.");
      }
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setFingerprintMsg("Verifikasi sidik jari dibatalkan.");
      } else {
        setFingerprintMsg("Sensor sidik jari belum merespons: " + (err.message || "Silakan coba lagi."));
      }
    } finally {
      setTestingFingerprint(false);
      setTimeout(() => setFingerprintMsg(null), 4000);
    }
  };

  // Handle Theme Change
  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    localStorage.setItem("finora_theme", newTheme);

    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else if (newTheme === "light") {
      root.classList.remove("dark");
    } else {
      // System
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (systemDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  };

  const handleAvatarPreset = (url: string) => {
    setPhotoURL(url);
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading profile...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex-1 flex flex-col min-h-screen relative pb-24 md:pb-12">
      <Navbar title="Profile & Settings" subtitle="Manage your account, security, and app preferences." />

      <main className="flex-1 p-4 md:p-8 max-w-5xl w-full mx-auto space-y-8">
        {/* Profile Card Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-emerald-700/20 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/40 overflow-hidden flex items-center justify-center shadow-lg">
                {photoURL ? (
                  <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-white/80" />
                )}
              </div>
            </div>

            <div className="text-center sm:text-left space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {displayName || "Finora User"}
                </h2>
                {user.emailVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-100 border border-emerald-300/30">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
              </div>
              <p className="text-emerald-100/80 text-sm flex items-center justify-center sm:justify-start gap-1">
                <span>@{username || "username"}</span>
                <span>•</span>
                <span>{user.email}</span>
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-[11px] px-3 py-1 rounded-full bg-black/20 text-emerald-100">
                  Member since {user.metadata.creationTime ? new Date(user.metadata.creationTime).getFullYear() : "2026"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Kolom Kiri & Tengah: Form Profil & Keamanan */}
          <div className="lg:col-span-2 space-y-8">
            {/* Form Informasi Profil */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Edit Profile</h3>
                  <p className="text-xs text-slate-500">Update your personal information</p>
                </div>
              </div>

              {profileSuccess && (
                <div className="mb-4 bg-emerald-50 dark:bg-emerald-900/30 border-l-4 border-emerald-500 p-3.5 rounded-r-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">{profileSuccess}</p>
                </div>
              )}

              {profileError && (
                <div className="mb-4 bg-rose-50 dark:bg-rose-900/30 border-l-4 border-rose-500 p-3.5 rounded-r-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">{profileError}</p>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Profile Picture URL
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      value={photoURL}
                      onChange={(e) => setPhotoURL(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                    />
                  </div>
                  {/* Preset Avatars */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] text-slate-400">Pilih avatar cepat:</span>
                    {[
                      "https://api.dicebear.com/7.x/bottts/svg?seed=Finora1",
                      "https://api.dicebear.com/7.x/avataaars/svg?seed=Finora2",
                      "https://api.dicebear.com/7.x/lorelei/svg?seed=Finora3",
                    ].map((avatar, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAvatarPreset(avatar)}
                        className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-600 overflow-hidden hover:scale-110 transition-transform"
                      >
                        <img src={avatar} alt="Preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Nama Lengkap"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Username
                    </label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Email Address (Akun)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        disabled
                        value={user.email || ""}
                        className="w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 cursor-not-allowed text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>

                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />

                      <input
                        type="tel"
                        placeholder="+62 812 ++++ ++++"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all hover:scale-102 disabled:opacity-50"
                  >
                    {profileSaving ? "Saving..." : "Save Profile Changes"}
                  </button>
                </div>
              </form>
            </div>

            {/* Keamanan & Password & Sidik Jari */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Security & Biometrics</h3>
                  <p className="text-xs text-slate-500">Manage your credentials and device authentication</p>
                </div>
              </div>

              {/* Fingerprint / Biometric Section */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${fingerprintEnabled ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                      }`}>
                      <Fingerprint className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                        Fingerprint / Biometric Login
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {fingerprintEnabled
                          ? "Biometrik aktif. Perangkat ini terdaftar untuk autentikasi sensor sidik jari."
                          : "Aktifkan autentikasi sidik jari untuk login cepat di perangkat ini."}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleFingerprint}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${fingerprintEnabled ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${fingerprintEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                    />
                  </button>
                </div>

                {fingerprintEnabled && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Sensor siap digunakan
                    </span>
                    <button
                      type="button"
                      disabled={testingFingerprint}
                      onClick={handleTestBiometric}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-[11px] font-semibold transition-all disabled:opacity-50"
                    >
                      {testingFingerprint ? "Mendeteksi Sidik Jari..." : "Uji Sensor Sekarang"}
                    </button>
                  </div>
                )}
              </div>

              {fingerprintMsg && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-100 dark:border-emerald-900">
                  {fingerprintMsg}
                </div>
              )}

              {/* Change Password Form (Hanya untuk pengguna Email & Password) */}
              <div className="pt-2">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-3">
                  Change Password
                </h4>

                {user?.providerData?.some((p) => p.providerId === "password") ? (
                  <>
                    {passwordSuccess && (
                      <div className="mb-4 bg-emerald-50 dark:bg-emerald-900/30 border-l-4 border-emerald-500 p-3 rounded-r-lg flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">{passwordSuccess}</p>
                      </div>
                    )}

                    {passwordError && (
                      <div className="mb-4 bg-rose-50 dark:bg-rose-900/30 border-l-4 border-rose-500 p-3 rounded-r-lg flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">{passwordError}</p>
                      </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                      <div>
                        <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Current Password (Password Saat Ini)
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="Masukkan password saat ini untuk verifikasi"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                            New Password (Password Baru)
                          </label>
                          <input
                            type="password"
                            required
                            placeholder="Minimal 6 karakter"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            required
                            placeholder="Ulangi password baru"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={passwordSaving}
                          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
                        >
                          {passwordSaving ? "Updating..." : "Update Password"}
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 shadow-xs border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                        Akun Terhubung dengan Google
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Anda masuk menggunakan autentikasi Google (Single Sign-On). Manajemen kata sandi dan keamanan akun Anda dikelola secara langsung dan aman oleh Google.
                      </p>
                      <div className="pt-1">
                        <a
                          href="https://myaccount.google.com/security"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          Kelola Keamanan di Google Account &rarr;
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Appearance, About Me & Logout */}
          <div className="space-y-8">
            {/* Ganti Mode / Theme */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Theme & Display</h3>
                  <p className="text-xs text-slate-500">Pilih mode tampilan</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: "light", label: "Light", icon: Sun },
                  { id: "dark", label: "Dark", icon: Moon },
                  { id: "system", label: "System", icon: Laptop },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = theme === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleThemeChange(item.id as any)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${isSelected
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 shadow-xs ring-1 ring-emerald-500"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                    >
                      <Icon className="w-5 h-5 mb-1.5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* About Me & Application Info */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">About Me & App</h3>
                  <p className="text-xs text-slate-500">Application details</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500">App Name</span>
                  <span className="font-bold text-slate-900 dark:text-white">Finora Finance Tracker</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500">Version</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <Sparkles className="w-3 h-3" /> v1.2.0 (Stable)
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500">Multi-User Database</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Isolated per User</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500">Cloud Sync</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Supabase & Firebase</span>
                </div>

                <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                  Finora dirancang untuk membantu Anda memantau seluruh catatan finansial, pemasukan, pengeluaran, dan kategori secara mandiri, rapi, dan aman.
                </p>
              </div>
            </div>

            {/* Logout Action */}
            <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 shadow-xs">
              <h3 className="font-bold text-sm text-rose-800 dark:text-rose-300 mb-1">Session & Account</h3>
              <p className="text-xs text-rose-600/80 dark:text-rose-400 mb-4">
                Keluar dari sesi akun Anda di perangkat ini.
              </p>

              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all hover:scale-102"
              >
                <LogOut className="w-4 h-4" />
                Sign Out from Finora
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal Logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 mx-auto flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Konfirmasi Logout</h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin keluar dari akun ini?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 px-4 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={logout}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
