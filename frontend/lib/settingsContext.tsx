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
    "dashboard.subtitle": "Overview of your accounts, envelopes, and rapid actions.",
    "dashboard.totalBalance": "Total Saldo Bersih",
    "dashboard.totalIncome": "Total Pemasukan",
    "dashboard.totalExpense": "Total Pengeluaran",
    "dashboard.expenseCount": "Jumlah Transaksi",
    "dashboard.recentTransactions": "Transaksi Terkini",
    "dashboard.recentSubtitle": "Aktivitas transaksi finansial terbaru",
    "dashboard.expenseOverview": "Ikhtisar Pengeluaran",
    "dashboard.expenseSubtitle": "Distribusi pengeluaran berdasarkan kategori",
    "dashboard.accountsSummary": "Rekening & Pos Anggaran",
    "dashboard.accountsSummaryFlexible": "Daftar Rekening & Saldo",
    "dashboard.accountsSubtitle": "Rekening bank fisik dan pos alokasi kategori",
    "dashboard.accountsSubtitleFlexible": "Saldo riil tersimpan di masing-masing rekening dan dompet",
    "dashboard.viewAll": "Lihat Semua",
    "dashboard.noTransactions": "Belum ada riwayat transaksi.",
    "dashboard.quickAddIncome": "Pemasukan",
    "dashboard.quickAddExpense": "Pengeluaran",
    "dashboard.quickMoveMoney": "Pindah Dana",
    "dashboard.quickActions": "Aksi Cepat",
    "dashboard.noCategoriesLinked": "Kategori universal (tidak terikat)",
    "dashboard.noExpenses": "Belum ada catatan pengeluaran.",
    "dashboard.noExpensesDesc": "Pengeluaran Anda akan dikelompokkan secara otomatis di sini.",
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
    "accounts.addNewTitle": "Tambah Akun Baru",
    "accounts.modalSubtitle": "Rekening bank, e-wallet, atau dompet tunai",
    "accounts.accountType.bank": "Bank",
    "accounts.accountType.cash": "Tunai",
    "accounts.accountType.digital": "E-Wallet",

    // Categories
    "categories.title": "Kategori Anggaran",
    "categories.subtitle": "Pos pengeluaran dan alokasi dana Anda.",
    "categories.addCategory": "Tambah Kategori",
    "categories.noCategories": "Belum ada kategori.",
    "categories.linkedAccount": "Terhubung ke Akun",
    "categories.unlinked": "Bebas / Tanpa Akun",
    "categories.newTitle": "Kategori Baru",
    "categories.editTitle": "Ubah Kategori",
    "categories.formSubtitleEnvelope": "Hubungkan ke akun agar saldo terpotong otomatis",
    "categories.formSubtitleFlexible": "Kategori bebas, akun dipilih saat mencatat transaksi",
    "categories.name": "Nama Kategori",
    "categories.namePlaceholder": "mis. Belanja, Sewa, Gaji, Hiburan",
    "categories.linkedAccountLabel": "Akun Terikat (Opsional / Mode Amplop)",
    "categories.linkedAccountHint": "Bisa dikosongkan untuk kategori universal",
    "categories.universalOption": "Kategori Universal (Bisa dipakai di semua akun)",
    "categories.universalDesc": "Jika dikosongkan, kategori ini bisa digunakan bebas dengan rekening/dompet mana saja (misal: SeaBank, BCA, BRI, Tunai).",
    "categories.update": "Perbarui Kategori",
    "categories.save": "Simpan Kategori",
    "categories.errNameRequired": "Nama kategori wajib diisi",
    "categories.errSave": "Gagal menyimpan kategori",
    "categories.universalBadge": "Universal (Semua Akun)",
    "categories.emptyDescFlexible": "Buat kategori universal yang dapat digunakan di semua akun pembayaran.",
    "categories.emptyDescEnvelope": "Buat kategori dan hubungkan ke akun untuk sistem amplop.",
    "categories.editTooltip": "Ubah kategori",
    "categories.deleteTooltip": "Hapus kategori",

    // Halaman Transaksi
    "txp.title": "Transaksi",
    "txp.subtitle": "Pantau pemasukan, pengeluaran, dan perpindahan dana Anda.",
    "txp.historyTitle": "Riwayat Transaksi",
    "txp.historySubtitle": "Filter atau catat pemasukan, pengeluaran, dan perpindahan dana",
    "txp.addIncome": "Tambah Pemasukan",
    "txp.addExpense": "Tambah Pengeluaran",
    "txp.moveMoney": "Pindah Dana",
    "txp.loadingHistory": "Memuat riwayat...",
    "txp.failedLoad": "Gagal Memuat",
    "txp.moveWarning": "Riwayat Pindah Dana tidak dapat dimuat.",
    "txp.errLoadTx": "Gagal memuat transaksi.",
    "txp.errLoadMove": "Gagal memuat riwayat pindah dana.",
    "txp.errDeleteTx": "Gagal menghapus transaksi",
    "txp.errDeleteMove": "Gagal menghapus perpindahan dana",
    "txp.toastUpdated": "Transaksi diperbarui.",
    "txp.toastRecorded": "Transaksi tercatat.",
    "txp.toastTxDeleted": "Transaksi dihapus.",
    "txp.toastMoved": "Dana berhasil dipindahkan.",
    "txp.toastMoveUpdated": "Perpindahan dana diperbarui.",
    "txp.toastMoveDeleted": "Perpindahan dana dihapus.",
    "txp.deleteTxTitle": "Hapus Transaksi",
    "txp.deleteTxDescPre": "Yakin ingin menghapus",
    "txp.deleteTxDescPost": "? Saldo terkait akan menyesuaikan secara otomatis.",
    "txp.deleteMoveTitle": "Hapus Perpindahan",
    "txp.deleteMoveDescPre": "Hapus perpindahan dari",
    "txp.deleteMoveDescTo": "ke",
    "txp.deleteMoveDescPost": "? Dana akan dikembalikan ke kategori asal.",

    // Filter transaksi
    "flt.income": "Masuk",
    "flt.expense": "Keluar",
    "flt.move": "Pindah",
    "flt.searchPlaceholder": "Cari transaksi...",
    "flt.filter": "Filter:",
    "flt.allCategories": "Semua Kategori",
    "flt.from": "Dari",
    "flt.to": "Sampai",
    "flt.until": "s/d",
    "flt.reset": "Reset",

    // Tabel transaksi
    "tbl.emptyTitle": "Transaksi tidak ditemukan.",
    "tbl.emptyDesc": "Ubah filter atau catat transaksi baru.",
    "tbl.colTitle": "Judul",
    "tbl.colCategoryAccount": "Kategori & Akun",
    "tbl.typeIncome": "Pemasukan",
    "tbl.typeExpense": "Pengeluaran",
    "tbl.general": "Umum",
    "tbl.unknown": "Tidak diketahui",
    "tbl.within": "Di dalam",
    "tbl.editTx": "Ubah transaksi",
    "tbl.deleteTx": "Hapus transaksi",
    "tbl.editMove": "Ubah perpindahan",
    "tbl.deleteMove": "Hapus perpindahan",

    // Profile
    "profile.title": "Profil & Pengaturan",
    "profile.subtitle": "Kelola akun, keamanan, tema tampilan, mode aplikasi, dan bahasa.",
    "profile.editProfile": "Ubah Profil",
    "profile.security": "Keamanan & PIN",
    "profile.theme": "Tema Tampilan",
    "profile.about": "Tentang Finora",
    "profile.logout": "Keluar dari Akun",

    // Chat AI
    "chat.title": "Finora AI Assistant",
    "chat.subtitle": "Catat pemasukan, pengeluaran, transfer, dan kategori",
    "chat.greeting": "Halo! Ada yang bisa saya bantu catat hari ini?",
    "chat.placeholder": "Ketik pesan (contoh: Makan siang 50rb pakai BRI)...",
    "chat.typing": "Sedang mengetik...",
    "chat.saved": "Tersimpan ✅",
    "chat.deleteWarning": "Aksi ini akan menghapus data dan menyesuaikan saldo Anda.",
    "chat.save": "Simpan",
    "chat.delete": "Hapus",
    "chat.saving": "Menyimpan...",
    "chat.deleting": "Menghapus...",
    "chat.cancelled": "Dibatalkan",
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
    "dashboard.subtitle": "Overview of your accounts, budgets, and rapid actions.",
    "dashboard.totalBalance": "Total Net Balance",
    "dashboard.totalIncome": "Total Income",
    "dashboard.totalExpense": "Total Expense",
    "dashboard.expenseCount": "Total Transactions",
    "dashboard.recentTransactions": "Recent Transactions",
    "dashboard.recentSubtitle": "Latest financial transactions & activities",
    "dashboard.expenseOverview": "Expense Overview",
    "dashboard.expenseSubtitle": "Expense distribution by category",
    "dashboard.accountsSummary": "Accounts & Envelopes",
    "dashboard.accountsSummaryFlexible": "Bank Accounts & Wallets",
    "dashboard.accountsSubtitle": "Physical bank accounts and category allocations",
    "dashboard.accountsSubtitleFlexible": "Real balance stored across each account and wallet",
    "dashboard.viewAll": "View All",
    "dashboard.noTransactions": "No transaction history yet.",
    "dashboard.quickAddIncome": "Income",
    "dashboard.quickAddExpense": "Expense",
    "dashboard.quickMoveMoney": "Move Money",
    "dashboard.quickActions": "Quick Actions",
    "dashboard.noCategoriesLinked": "Universal categories (unlinked)",
    "dashboard.noExpenses": "No expense records yet.",
    "dashboard.noExpensesDesc": "Your expenses will be grouped automatically here.",
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
    "accounts.addNewTitle": "Add New Account",
    "accounts.modalSubtitle": "Bank account, e-wallet, or cash wallet",
    "accounts.accountType.bank": "Bank",
    "accounts.accountType.cash": "Cash",
    "accounts.accountType.digital": "E-Wallet",

    // Categories
    "categories.title": "Budget Categories",
    "categories.subtitle": "Your spending envelopes and budget buckets.",
    "categories.addCategory": "Add Category",
    "categories.noCategories": "No categories yet.",
    "categories.linkedAccount": "Linked to Account",
    "categories.unlinked": "Flexible / Unlinked",
    "categories.newTitle": "New Category",
    "categories.editTitle": "Edit Category",
    "categories.formSubtitleEnvelope": "Link to an account for automatic balance deduction",
    "categories.formSubtitleFlexible": "Flexible category, the account is chosen when recording a transaction",
    "categories.name": "Category Name",
    "categories.namePlaceholder": "e.g. Groceries, Rent, Salary, Entertainment",
    "categories.linkedAccountLabel": "Linked Account (Optional / Envelope Mode)",
    "categories.linkedAccountHint": "Can be left empty for a universal category",
    "categories.universalOption": "Universal Category (Usable with any account)",
    "categories.universalDesc": "If left empty, this category can be used freely with any bank account or wallet (e.g. SeaBank, BCA, BRI, Cash).",
    "categories.update": "Update Category",
    "categories.save": "Save Category",
    "categories.errNameRequired": "Category name is required",
    "categories.errSave": "Failed to save category",
    "categories.universalBadge": "Universal (All Accounts)",
    "categories.emptyDescFlexible": "Create universal categories to use across any payment account.",
    "categories.emptyDescEnvelope": "Create categories and link them to accounts for envelope budgeting.",
    "categories.editTooltip": "Edit category",
    "categories.deleteTooltip": "Delete category",

    // Transactions page
    "txp.title": "Transactions",
    "txp.subtitle": "Track your income, expenses, and money moves.",
    "txp.historyTitle": "Transaction History",
    "txp.historySubtitle": "Filter or record income, expenses, and money moves",
    "txp.addIncome": "Add Income",
    "txp.addExpense": "Add Expense",
    "txp.moveMoney": "Move Money",
    "txp.loadingHistory": "Loading history...",
    "txp.failedLoad": "Failed to Load",
    "txp.moveWarning": "Move Money history could not be loaded.",
    "txp.errLoadTx": "Failed to load transactions.",
    "txp.errLoadMove": "Failed to load move history.",
    "txp.errDeleteTx": "Failed to delete transaction",
    "txp.errDeleteMove": "Failed to delete move",
    "txp.toastUpdated": "Transaction updated.",
    "txp.toastRecorded": "Transaction recorded.",
    "txp.toastTxDeleted": "Transaction deleted.",
    "txp.toastMoved": "Money moved successfully.",
    "txp.toastMoveUpdated": "Move updated.",
    "txp.toastMoveDeleted": "Move deleted.",
    "txp.deleteTxTitle": "Delete Transaction",
    "txp.deleteTxDescPre": "Are you sure you want to delete",
    "txp.deleteTxDescPost": "? The related account balance will automatically adjust.",
    "txp.deleteMoveTitle": "Delete Move",
    "txp.deleteMoveDescPre": "Delete the move from",
    "txp.deleteMoveDescTo": "to",
    "txp.deleteMoveDescPost": "? The money will be returned to the source category.",

    // Transaction filter
    "flt.income": "Income",
    "flt.expense": "Expense",
    "flt.move": "Move",
    "flt.searchPlaceholder": "Search transactions...",
    "flt.filter": "Filter:",
    "flt.allCategories": "All Categories",
    "flt.from": "From",
    "flt.to": "To",
    "flt.until": "to",
    "flt.reset": "Reset",

    // Transaction table
    "tbl.emptyTitle": "No transactions found.",
    "tbl.emptyDesc": "Adjust filters or record a new transaction.",
    "tbl.colTitle": "Title",
    "tbl.colCategoryAccount": "Category & Account",
    "tbl.typeIncome": "Income",
    "tbl.typeExpense": "Expense",
    "tbl.general": "General",
    "tbl.unknown": "Unknown",
    "tbl.within": "Within",
    "tbl.editTx": "Edit transaction",
    "tbl.deleteTx": "Delete transaction",
    "tbl.editMove": "Edit move",
    "tbl.deleteMove": "Delete move",

    // Profile
    "profile.title": "Profile & Settings",
    "profile.subtitle": "Manage your profile, security, appearance theme, application mode, and language.",
    "profile.editProfile": "Edit Profile",
    "profile.security": "Security & PIN",
    "profile.theme": "Theme & Appearance",
    "profile.about": "About Finora",
    "profile.logout": "Log Out",

    // Chat AI
    "chat.title": "Finora AI Assistant",
    "chat.subtitle": "Record income, expenses, moves, and categories",
    "chat.greeting": "Hi! How can I help you today?",
    "chat.placeholder": "Type a message (e.g. Lunch 50k with BRI)...",
    "chat.typing": "Typing...",
    "chat.saved": "Saved ✅",
    "chat.deleteWarning": "This will permanently delete the item and adjust your balances.",
    "chat.save": "Save",
    "chat.delete": "Delete",
    "chat.saving": "Saving...",
    "chat.deleting": "Deleting...",
    "chat.cancelled": "Cancelled",
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
    } catch (e) { }
  };

  const setAppMode = (mode: AppMode) => {
    setAppModeState(mode);
    try {
      localStorage.setItem("finora_app_mode", mode);
    } catch (e) { }
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
      setLanguage: () => { },
      appMode: "envelope" as AppMode,
      setAppMode: () => { },
      t: (key: string) => translations["id"]?.[key] || key,
    };
  }
  return context;
}

