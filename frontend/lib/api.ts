const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
import { auth } from "@/lib/firebase";
import { User } from "firebase/auth";

export interface Account {
  id: number;
  name: string;
  type: string;
  account_number?: string | null;
  current_balance: number;
  created_at?: string;
  updated_at?: string;
  categories?: { id: number; name: string; current_balance?: number }[];
}

export interface Category {
  id: number;
  name: string;
  account_id?: number | null;
  current_balance?: number;
  account?: {
    id: number;
    name: string;
    type: string;
    current_balance: number;
  };
  created_at?: string;
}

export interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: "income" | "expense";
  category_id?: number | null;
  account_id?: number | null;
  description?: string | null;
  transaction_date: string;
  created_at?: string;
  categories?: {
    id: number;
    name: string;
  };
  account?: {
    id: number;
    name: string;
    type: string;
  };
}

export interface TransactionFilters {
  type?: string;
  category_id?: string | number;
  account_id?: string | number;
  date?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface DashboardData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  totalTransactions: number;
  recentTransactions: Transaction[];
  expenseOverview: {
    categoryName: string;
    totalAmount: number;
    percentage: number;
  }[];
  accountsSummary?: Account[];
}

// Health checks
export async function getHealth() {
  const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
  if (!res.ok) throw new Error("API is not healthy");
  return res.json();
}

export async function getDatabaseHealth() {
  const res = await fetch(`${API_URL}/health/database`, { cache: "no-store" });
  if (!res.ok) throw new Error("Database is not connected");
  return res.json();
}

// Helper function to get current user
export async function getCurrentUser(): Promise<User | null> {
  if (auth.currentUser) return auth.currentUser;

  if (typeof auth.authStateReady === "function") {
    await auth.authStateReady();
    return auth.currentUser;
  }

  return new Promise<User | null>((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

// --- Accounts API ---
export async function getAccounts(): Promise<{ success: boolean; data: Account[] }> {
  let user = auth.currentUser;
  if (!user) user = await getCurrentUser();
  if (!user) throw new Error("Harus login terlebih dahulu");

  const response = await fetch(`${API_URL}/accounts?userId=${user.uid}`, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch accounts");
  }
  return data;
}

export async function createAccount(payload: {
  name: string;
  type?: string;
  account_number?: string;
  current_balance?: number;
}): Promise<{ success: boolean; data: Account }> {
  let user = auth.currentUser;
  if (!user) user = await getCurrentUser();
  if (!user) throw new Error("Harus login terlebih dahulu");

  const response = await fetch(`${API_URL}/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, user_id: user.uid }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to create account");
  }
  return data;
}

export async function updateAccount(
  id: number | string,
  payload: { name?: string; type?: string; account_number?: string }
): Promise<{ success: boolean; data: Account }> {
  let user = auth.currentUser;
  if (!user) user = await getCurrentUser();
  if (!user) throw new Error("Harus login terlebih dahulu");

  const response = await fetch(`${API_URL}/accounts/${id}?userId=${user.uid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, user_id: user.uid }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to update account");
  }
  return data;
}

export async function deleteAccount(id: number | string): Promise<{ success: boolean; message: string }> {
  let user = auth.currentUser;
  if (!user) user = await getCurrentUser();
  if (!user) throw new Error("Harus login terlebih dahulu");

  const response = await fetch(`${API_URL}/accounts/${id}?userId=${user.uid}`, {
    method: "DELETE",
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to delete account");
  }
  return data;
}

// --- Categories API ---
export async function getCategories(): Promise<{ success: boolean; data: Category[] }> {
  let user = auth.currentUser;
  if (!user) user = await getCurrentUser();

  const url = user ? `${API_URL}/categories?userId=${user.uid}` : `${API_URL}/categories`;
  const response = await fetch(url, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch categories");
  }
  return data;
}

export async function getCategoryById(id: number | string): Promise<{ success: boolean; data: Category }> {
  let user = auth.currentUser;
  if (!user) user = await getCurrentUser();

  const url = user ? `${API_URL}/categories/${id}?userId=${user.uid}` : `${API_URL}/categories/${id}`;
  const response = await fetch(url, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch category");
  }
  return data;
}

export async function createCategory(payload: {
  name: string;
  account_id?: number | null;
  current_balance?: number;
}): Promise<{ success: boolean; data: Category }> {
  let user = auth.currentUser;
  if (!user) user = await getCurrentUser();
  if (!user) throw new Error("Harus login terlebih dahulu");

  const response = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, user_id: user.uid }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to create category");
  }
  return data;
}

export async function updateCategory(
  id: number | string,
  payload: { name?: string; account_id?: number | null }
): Promise<{ success: boolean; data: Category }> {
  let user = auth.currentUser;
  if (!user) user = await getCurrentUser();
  if (!user) throw new Error("Harus login terlebih dahulu");

  const response = await fetch(`${API_URL}/categories/${id}?userId=${user.uid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, user_id: user.uid }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to update category");
  }
  return data;
}

export async function deleteCategory(id: number | string): Promise<{ success: boolean; message: string }> {
  let user = auth.currentUser;
  if (!user) user = await getCurrentUser();
  if (!user) throw new Error("Harus login terlebih dahulu");

  const response = await fetch(`${API_URL}/categories/${id}?userId=${user.uid}`, {
    method: "DELETE",
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to delete category");
  }
  return data;
}

// --- Transactions API ---
export async function getTransactions(filters: TransactionFilters = {}): Promise<{ success: boolean; data: Transaction[]; total: number }> {
  let user = auth.currentUser;
  if (!user) {
    user = await getCurrentUser();
  }

  if (!user) {
    throw new Error("Harus login terlebih dahulu");
  }

  const params = new URLSearchParams();
  if (filters.type) params.append("type", filters.type);
  if (filters.category_id) params.append("category_id", String(filters.category_id));
  if (filters.account_id) params.append("account_id", String(filters.account_id));
  if (filters.date) params.append("date", filters.date);
  if (filters.start_date) params.append("start_date", filters.start_date);
  if (filters.end_date) params.append("end_date", filters.end_date);
  if (filters.search) params.append("search", filters.search);
  if (filters.page) params.append("page", String(filters.page));
  if (filters.limit) params.append("limit", String(filters.limit));

  params.append("userId", user.uid);

  const url = `${API_URL}/transactions?${params.toString()}`;
  const response = await fetch(url, { cache: "no-store" });
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch transactions");
  }
  return data;
}

export async function getTransactionById(id: number | string): Promise<{ success: boolean; data: Transaction }> {
  let user = auth.currentUser;
  if (!user) {
    user = await getCurrentUser();
  }

  if (!user) {
    throw new Error("Harus login terlebih dahulu");
  }

  const response = await fetch(`${API_URL}/transactions/${id}?userId=${user.uid}`, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch transaction");
  }
  return data;
}

export async function createTransaction(payload: {
  title: string;
  amount: number;
  type: "income" | "expense";
  category_id?: number | null;
  account_id?: number | null;
  description?: string | null;
  transaction_date: string;
  allocations?: { category_id: number; amount: number }[];
}): Promise<{ success: boolean; data: Transaction }> {
  let user = auth.currentUser;
  if (!user) {
    user = await getCurrentUser();
  }

  if (!user) throw new Error("Harus login terlebih dahulu");
  const response = await fetch(`${API_URL}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, user_id: user.uid }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to create transaction");
  }
  return data;
}

export async function updateTransaction(
  id: number | string,
  payload: Partial<{
    title: string;
    amount: number;
    type: "income" | "expense";
    category_id?: number | null;
    account_id?: number | null;
    description?: string | null;
    transaction_date: string;
  }>
): Promise<{ success: boolean; data: Transaction }> {
  let user = auth.currentUser;
  if (!user) {
    user = await getCurrentUser();
  }

  if (!user) throw new Error("Harus login terlebih dahulu");
  const response = await fetch(`${API_URL}/transactions/${id}?userId=${user.uid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to update transaction");
  }
  return data;
}

export async function deleteTransaction(id: number | string): Promise<{ success: boolean; message: string }> {
  let user = auth.currentUser;
  if (!user) {
    user = await getCurrentUser();
  }
  if (!user) throw new Error("Harus login terlebih dahulu");

  const response = await fetch(`${API_URL}/transactions/${id}?userId=${user.uid}`, {
    method: "DELETE",
  });

  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.message || "Failed to delete transaction");
  return data;
}

// --- Dashboard API ---
export async function getDashboard(): Promise<{ success: boolean; data: DashboardData }> {
  let user = auth.currentUser;
  if (!user) {
    user = await getCurrentUser();
  }

  if (!user) {
    throw new Error("Harus login untuk melihat dashboard");
  }

  const response = await fetch(`${API_URL}/dashboard?userId=${user.uid}`, {
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch dashboard");
  }

  return data;
}
