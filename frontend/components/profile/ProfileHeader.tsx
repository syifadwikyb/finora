"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, Trash2, X, CalendarDays, Mail } from "lucide-react";
import { User } from "firebase/auth";

interface ProfileHeaderProps {
  user: User;
  displayName: string;
  username: string;
  photoURL: string;
  onPhotoChange: (url: string) => void;
}

const resizeImageToDataUrl = (file: File, size = 256): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read the file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("The file is not a valid image"));
      img.onload = () => {
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Your browser does not support image processing"));

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "F";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export default function ProfileHeader({ user, displayName, username, photoURL, onPhotoChange }: ProfileHeaderProps) {
  const [imgError, setImgError] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImgError(false);
  }, [photoURL]);

  useEffect(() => {
    if (!previewOpen && !confirmOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setConfirmOpen(false);
        setPreviewOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewOpen, confirmOpen]);

  const handleRemovePhoto = () => {
    setConfirmOpen(false);
    setPhotoError(null);
    setPreviewOpen(false);
    onPhotoChange("");

    try {
      const key = `finora_profile_${user.uid}`;
      const saved = JSON.parse(localStorage.getItem(key) || "{}");
      localStorage.setItem(key, JSON.stringify({ ...saved, photoURL: "" }));
    } catch {

    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("File must be an image (JPG, PNG, or WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Photo size must be 5 MB or less");
      return;
    }

    try {
      setPhotoError(null);
      const dataUrl = await resizeImageToDataUrl(file);
      onPhotoChange(dataUrl);
      try {
        const key = `finora_profile_${user.uid}`;
        const saved = JSON.parse(localStorage.getItem(key) || "{}");
        localStorage.setItem(key, JSON.stringify({ ...saved, photoURL: dataUrl }));
      } catch {
      }
    } catch (err: any) {
      setPhotoError(err.message);
    }
  };

  const showPhoto = Boolean(photoURL) && !imgError;
  const memberSince = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).getFullYear()
    : new Date().getFullYear();

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-emerald-700/20 border border-white/10 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 dark:from-emerald-800 dark:via-emerald-900 dark:to-slate-900">
        <div className="absolute -right-10 -top-10 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-16 w-48 h-48 bg-emerald-300/15 rounded-full blur-2xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-br from-white/60 to-white/10 shadow-xl shadow-black/20">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                disabled={!showPhoto}
                aria-label="View profile photo"
                className={`w-full h-full rounded-full overflow-hidden bg-emerald-900/40 flex items-center justify-center ${showPhoto ? "cursor-zoom-in" : "cursor-default"
                  }`}
              >
                {showPhoto ? (
                  <img
                    src={photoURL}
                    alt={displayName || "Foto profil"}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl sm:text-4xl font-bold tracking-wide text-white/90">
                    {getInitials(displayName || username || user.email || "")}
                  </span>
                )}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change profile photo"
              title="Change profile photo"
              className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-white text-emerald-700 border-2 border-emerald-600 dark:border-emerald-900 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform"
            >
              <Camera className="w-4 h-4" />
            </button>

            {photoURL && (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                aria-label="Remove profile photo"
                title="Remove profile photo"
                className="absolute bottom-1 left-1 w-8 h-8 rounded-full bg-white text-rose-600 border-2 border-emerald-600 dark:border-emerald-900 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-center sm:text-left space-y-1 flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
              {displayName || "Finora User"}
            </h2>
            <p className="text-emerald-100 text-sm font-medium">
              @{username || "username"}
            </p>
            <p className="text-emerald-100/70 text-sm flex items-center justify-center sm:justify-start gap-1.5 min-w-0">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{user.email}</span>
            </p>
            <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-black/20 border border-white/10 text-emerald-100">
                <CalendarDays className="w-3.5 h-3.5" />
                Member since {memberSince}
              </span>
            </div>
            {photoError && (
              <p className="text-xs text-rose-200 pt-1">{photoError}</p>
            )}
          </div>
        </div>
      </div>

      {previewOpen && showPhoto && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          onClick={() => setPreviewOpen(false)}
        >
          <button
            type="button"
            onClick={() => setPreviewOpen(false)}
            aria-label="Close preview"
            className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={photoURL}
            alt={displayName || "Profile photo"}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[80vh] rounded-3xl object-contain shadow-2xl"
          />
        </div>
      )}

      {confirmOpen && (
        <div
          className="fixed inset-0 z-[310] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="remove-photo-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-center"
          >
            <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3
              id="remove-photo-title"
              className="text-lg font-bold text-slate-900 dark:text-white"
            >
              Remove profile photo?
            </h3>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Your photo will be removed and replaced with your initials. You can upload a new one anytime.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-600/25 transition-colors active:scale-[0.98]"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}