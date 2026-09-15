"use client";

import { User as UserIcon, ShieldCheck } from "lucide-react";
import { User } from "firebase/auth";

interface ProfileHeaderProps {
  user: User;
  displayName: string;
  username: string;
  photoURL: string;
}

export default function ProfileHeader({ user, displayName, username, photoURL }: ProfileHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-emerald-700/20 relative overflow-hidden">
      <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
        <div className="relative group">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/40 overflow-hidden flex items-center justify-center shadow-lg">
            {photoURL ? (
              <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-12 h-12 text-white/80" />
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
  );
}
