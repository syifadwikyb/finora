"use client";

import { ReactNode } from "react";
import { AlertTriangle, Trash2, LogOut, CheckCircle2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "primary";
  loading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const iconConfig = {
    danger: {
      bg: "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400",
      btn: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20",
      icon: <Trash2 className="w-5 h-5" />,
    },
    warning: {
      bg: "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400",
      btn: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20",
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    primary: {
      bg: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400",
      btn: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20",
      icon: <CheckCircle2 className="w-5 h-5" />,
    },
  }[variant];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4">
        {/* Icon & Title */}
        <div className="flex items-start gap-3.5">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${iconConfig.bg}`}>
            {iconConfig.icon}
          </div>
          <div>
            <h3 className="font-semibold text-base text-slate-900 dark:text-white leading-tight">
              {title}
            </h3>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              {description}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer ${iconConfig.btn}`}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

