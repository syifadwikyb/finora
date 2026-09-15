"use client";

import { useState } from "react";
import { User as UserIcon, Mail, Phone, AtSign, CheckCircle2, AlertCircle } from "lucide-react";
import { User } from "firebase/auth";
import { updateUserProfile, getAuthErrorMessage } from "@/lib/firebase";

interface EditProfileFormProps {
  user: User;
  displayName: string;
  setDisplayName: (v: string) => void;
  username: string;
  setUsername: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  photoURL: string;
  setPhotoURL: (v: string) => void;
}

export default function EditProfileForm({
  user,
  displayName,
  setDisplayName,
  username,
  setUsername,
  phone,
  setPhone,
  photoURL,
  setPhotoURL,
}: EditProfileFormProps) {
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setProfileSaving(true);

    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        photoURL: photoURL.trim() || undefined,
      });

      const profileData = {
        username: username.trim(),
        phone: phone.trim(),
        photoURL: photoURL.trim(),
      };
      localStorage.setItem(`finora_profile_${user.uid}`, JSON.stringify(profileData));

      setProfileSuccess("Profil berhasil diperbarui!");
      setTimeout(() => setProfileSuccess(null), 3500);
    } catch (err: any) {
      setProfileError(getAuthErrorMessage(err));
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarPreset = (url: string) => {
    setPhotoURL(url);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
          <UserIcon className="w-5 h-5" />
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
              <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
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
                placeholder="+62 812 **** ****"
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
  );
}
