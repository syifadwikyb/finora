"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "id" | "en";
export type AppMode = "envelope" | "flexible";

interface SettingsContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  id: {
    // Nav Items
    "nav.dashboard": "Dashboard",
    "nav.accounts": "Akun",
    "nav.categories": "Kategori",
    "nav.transactions": "Transaksi",
    "nav.profile": "Profil",

    // Common
    "common.appTitle": "Finora",
    "common.save": "Simpan",
    "common.cancel": "Batal",
    "common.delete": "Hapus",
    "common.edit": "Ubah",
    "common.add": "Tambah",
    "common.loading": "Memuat...",
    "common.tryAgain": "Coba Lagi",
    "common.success": "Berhasil",
    "common.error": "Terjadi kesalahan",
    "common.all": "Semua",
    "common.search": "Cari...",
    "common.date": "Tanggal",
    "common.notes": "Catatan",
    "common.amount": "Nominal",
    "common.type": "Tipe",
    "common.actions": "Aksi",
    "common.income": "Uang Masuk",
    "common.expense": "Uang Keluar",
    "common.transfer": "Transfer Antar Akun",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.subtitle": "Kelola keuangan Anda secara rapi dan terukur.",
    "dashboard.totalBalance": "Total Saldo Bersih",
    "dashboard.totalIncome": "Total Pemasukan",
    "dashboard.totalExpense": "Total Pengeluaran",
    "dashboard.expenseCount": "Jumlah Transaksi",
    "dashboard.recentTransactions": "Transaksi Terkini",
    "dashboard.expenseOverview": "Ikhtisar Pengeluaran",
    "dashboard.accountsSummary": "Ringkasan Akun",
    "dashboard.viewAll": "Lihat Semua",
    "dashboard.noTransactions": "Belum ada riwayat transaksi.",
    "dashboard.quickAddIncome": "Pemasukan",
    "dashboard.quickAddExpense": "Pengeluaran",
    "dashboard.quickAddAccount": "Tambah Akun",
    "dashboard.quickAddCategory": "Tambah Kategori",

    // Mode Setting
    "settings.modeTitle": "Mode Anggaran & Pencatatan",
    "settings.modeDesc": "Pilih bagaimana Anda ingin mengelola transaksi dan saldo akun.",
    "settings.modeEnvelope": "Mode Alokasi (Amplop)",
    "settings.modeEnvelopeDesc": "Kategori terikat ke akun tertentu. Pemasukan dialokasikan ke kategori amplop untuk penganggaran yang disiplin.",
    "settings.modeFlexible": "Mode Bebas (Pencatatan)",
    "settings.modeFlexibleDesc": "Kategori bebas (contoh: Jajan). Anda bisa bebas memilih sumber pembayaran seperti BRI, BCA, atau Tunai.",
    "settings.modeChanged": "Mode berhasil diperbarui!",

    // Language Setting
    "settings.langTitle": "Bahasa / Language",
    "settings.langDesc": "Pilih bahasa tampilan aplikasi Finora.",
    "settings.langIndonesian": "Bahasa Indonesia",
    "settings.langEnglish": "English",

    // Accounts
    "accounts.title": "Akun & Dompet",
    "accounts.subtitle": "Tempat penyimpanan uang fisik Anda (Bank, E-Wallet, Tunai).",
    "accounts.addAccount": "Tambah Akun",
    "accounts.noAccounts": "Belum ada akun.",
    "accounts.addFirst": "Tambahkan rekening bank atau dompet tunai pertama Anda.",
    "accounts.accountName": "Nama Akun",
    "accounts.accountType": "Jenis Akun",
    "accounts.accountNumber": "Nomor Rekening / Catatan",
    "accounts.categoriesCount": "kategori amplop",

    // Categories
    "categories.title": "Kategori Anggaran",
    "categories.subtitle": "Pos pengeluaran dan alokasi dana Anda.",
    "categories.addCategory": "Tambah Kategori",
    "categories.noCategories": "Belum ada kategori.",
    "categories.linkedAccount": "Terhubung ke Akun",
    "categories.unlinked": "Bebas / Tanpa Akun",

    // Transactions Form
    "tx.title": "Tambah Transaksi",
    "tx.editTitle": "Ubah Transaksi",
    "tx.formTitle": "Judul Transaksi *",
    "tx.titlePlaceholder": "Contoh: Makan siang, Gaji, Belanja",
    "tx.depositCategory": "Kategori Simpanan / Masuk *",
    "tx.expenseCategory": "Kategori Pengeluaran *",
    "tx.paymentAccount": "Akun Pembayaran / Sumber Dana *",
    "tx.destinationAccount": "Akun Penerima Uang *",
    "tx.allocateLabel": "Alokasikan ke kategori lain",
    "tx.addSplit": "Tambah Alokasi",
    "tx.distributeDesc": "Bagi uang masuk ke pos-pos kategori. Sisa dana akan tetap tersimpan di kategori utama.",
    "tx.allocated": "Teralokasi",
    "tx.remaining": "Sisa Dana",
    "tx.saveTx": "Simpan Transaksi",
    "tx.updateTx": "Perbarui Transaksi",
    "tx.autoAccount": "Akun Terdeteksi Otomatis",

    // Profile
    "profile.title": "Profil & Pengaturan",
    "profile.subtitle": "Kelola akun, keamanan, tema tampilan, mode aplikasi, dan bahasa.",
    "profile.editProfile": "Ubah Profil",
    "profile.security": "Keamanan & PIN",
    "profile.theme": "Tema Tampilan",
    "profile.about": "Tentang Finora",
    "profile.logout": "Keluar dari Akun",
  },
  en: {
    // Nav Items
    "nav.dashboard": "Dashboard",
    "nav.accounts": "Accounts",
    "nav.categories": "Categories",
    "nav.transactions": "Transactions",
    "nav.profile": "Profile",

    // Common
    "common.appTitle": "Finora",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.add": "Add",
    "common.loading": "Loading...",
    "common.tryAgain": "Try Again",
    "common.success": "Success",
    "common.error": "An error occurred",
    "common.all": "All",
    "common.search": "Search...",
    "common.date": "Date",
    "common.notes": "Notes",
    "common.amount": "Amount",
    "common.type": "Type",
    "common.actions": "Actions",
    "common.income": "Income",
    "common.expense": "Expense",
    "common.transfer": "Account Transfer",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.subtitle": "Manage your money, simply and track every penny.",
    "dashboard.totalBalance": "Total Net Balance",
    "dashboard.totalIncome": "Total Income",
    "dashboard.totalExpense": "Total Expense",
    "dashboard.expenseCount": "Total Transactions",
    "dashboard.recentTransactions": "Recent Transactions",
    "dashboard.expenseOverview": "Expense Overview",
    "dashboard.accountsSummary": "Accounts Summary",
    "dashboard.viewAll": "View All",
    "dashboard.noTransactions": "No transaction history yet.",
    "dashboard.quickAddIncome": "Income",
    "dashboard.quickAddExpense": "Expense",
    "dashboard.quickAddAccount": "Add Account",
    "dashboard.quickAddCategory": "Add Category",

    // Mode Setting
    "settings.modeTitle": "Budgeting & Recording Mode",
    "settings.modeDesc": "Choose how you want to record transactions and track account balances.",
    "settings.modeEnvelope": "Allocation Mode (Envelope)",
    "settings.modeEnvelopeDesc": "Categories are strictly linked to specific accounts. Income is allocated across envelopes for disciplined budgeting.",
    "settings.modeFlexible": "Flexible Mode (Multi-Account)",
    "settings.modeFlexibleDesc": "Categories are versatile (e.g. Snacks). When spending, you can freely pick any account like BRI, BCA, or Cash.",
    "settings.modeChanged": "Mode updated successfully!",

    // Language Setting
    "settings.langTitle": "Language / Bahasa",
    "settings.langDesc": "Choose your preferred application language.",
    "settings.langIndonesian": "Bahasa Indonesia",
    "settings.langEnglish": "English",

    // Accounts
    "accounts.title": "Accounts & Wallets",
    "accounts.subtitle": "Physical storage for your money (Banks, E-Wallets, Cash).",
    "accounts.addAccount": "Add Account",
    "accounts.noAccounts": "No accounts yet.",
    "accounts.addFirst": "Add your first bank account or cash wallet.",
    "accounts.accountName": "Account Name",
    "accounts.accountType": "Account Type",
    "accounts.accountNumber": "Account Number / Notes",
    "accounts.categoriesCount": "envelope categories",

    // Categories
    "categories.title": "Budget Categories",
    "categories.subtitle": "Your spending envelopes and budget buckets.",
    "categories.addCategory": "Add Category",
    "categories.noCategories": "No categories yet.",
    "categories.linkedAccount": "Linked to Account",
    "categories.unlinked": "Flexible / Unlinked",

    // Transactions Form
    "tx.title": "Add Transaction",
    "tx.editTitle": "Edit Transaction",
    "tx.formTitle": "Transaction Title *",
    "tx.titlePlaceholder": "e.g. Lunch, Salary, Groceries",
    "tx.depositCategory": "Deposit / Target Category *",
    "tx.expenseCategory": "Expense Category *",
    "tx.paymentAccount": "Payment Account / Source *",
    "tx.destinationAccount": "Recipient Account *",
    "tx.allocateLabel": "Allocate to other categories",
    "tx.addSplit": "Add Split",
    "tx.distributeDesc": "Distribute funds to spending categories. Remaining balance stays in the main category.",
    "tx.allocated": "Allocated",
    "tx.remaining": "Remaining",
    "tx.saveTx": "Save Transaction",
    "tx.updateTx": "Update Transaction",
    "tx.autoAccount": "Account Automatically Detected",

    // Profile
    "profile.title": "Profile & Settings",
    "profile.subtitle": "Manage your profile, security, appearance theme, application mode, and language.",
    "profile.editProfile": "Edit Profile",
    "profile.security": "Security & PIN",
    "profile.theme": "Theme & Appearance",
    "profile.about": "About Finora",
    "profile.logout": "Log Out",
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("id");
  const [appMode, setAppModeState] = useState<AppMode>("envelope");

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("finora_language") as Language;
      if (savedLang === "en" || savedLang === "id") {
        setLanguageState(savedLang);
      }

      const savedMode = localStorage.getItem("finora_app_mode") as AppMode;
      if (savedMode === "envelope" || savedMode === "flexible") {
        setAppModeState(savedMode);
      }
    } catch (e) {
      console.warn("Failed to load settings from localStorage", e);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("finora_language", lang);
    } catch (e) {}
  };

  const setAppMode = (mode: AppMode) => {
    setAppModeState(mode);
    try {
      localStorage.setItem("finora_app_mode", mode);
    } catch (e) {}
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations["id"]?.[key] || key;
  };

  return (
    <SettingsContext.Provider value={{ language, setLanguage, appMode, setAppMode, t }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    // Fallback aman jika komponen di-render sebelum SettingsProvider siap
    return {
      language: "id" as Language,
      setLanguage: () => {},
      appMode: "envelope" as AppMode,
      setAppMode: () => {},
      t: (key: string) => translations["id"]?.[key] || key,
    };
  }
  return context;
}

