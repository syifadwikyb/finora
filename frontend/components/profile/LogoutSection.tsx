"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useSettings } from "@/lib/settingsContext";

interface LogoutSectionProps {
  onLogout: () => Promise<void>;
}

export default function LogoutSection({ onLogout }: LogoutSectionProps) {
  const { t } = useSettings();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  return (
    <>
      <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 shadow-xs">
        <h3 className="font-semibold text-sm text-rose-800 dark:text-rose-300 mb-1">{t("prf.sessionTitle")}</h3>
        <p className="text-xs text-rose-600/80 dark:text-rose-400 mb-4">{t("prf.sessionDesc")}</p>

        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          {t("prf.signOut")}
        </button>
      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        title={t("prf.signOut")}
        description={t("prf.signOutConfirm")}
        confirmLabel={t("prf.signOut")}
        variant="danger"
        loading={loggingOut}
      />
    </>
  );
}