"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import EditProfileForm from "@/components/profile/EditProfileForm";
import SecuritySection from "@/components/profile/SecuritySection";
import ThemeSelector from "@/components/profile/ThemeSelector";
import AboutSection from "@/components/profile/AboutSection";
import LogoutSection from "@/components/profile/LogoutSection";

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  // Profile Form States
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [photoURL, setPhotoURL] = useState("");

  // Theme State
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

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

      // Muat preferensi tema
      const savedTheme = (localStorage.getItem("finora_theme") as "light" | "dark" | "system") || "system";
      setTheme(savedTheme);
    }
  }, [user]);

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
        <ProfileHeader
          user={user}
          displayName={displayName}
          username={username}
          photoURL={photoURL}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Kolom Kiri & Tengah: Form Profil & Keamanan */}
          <div className="lg:col-span-2 space-y-8">
            <EditProfileForm
              user={user}
              displayName={displayName}
              setDisplayName={setDisplayName}
              username={username}
              setUsername={setUsername}
              phone={phone}
              setPhone={setPhone}
              photoURL={photoURL}
              setPhotoURL={setPhotoURL}
            />

            <SecuritySection user={user} displayName={displayName} />
          </div>

          {/* Kolom Kanan: Appearance, Lock Screen, About & Logout */}
          <div className="space-y-8">
            <ThemeSelector theme={theme} onThemeChange={handleThemeChange} />
            <AboutSection />
            <LogoutSection onLogout={logout} />
          </div>
        </div>
      </main>
    </div>
  );
}
