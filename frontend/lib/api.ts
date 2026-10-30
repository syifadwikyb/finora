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

export interface TransactionAllocationItem {
  category_id: number | string;
  amount: number | string;
}

export interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: "income" | "expense";
  category_id?: number | null;
  account_id?: number | null;
  description?: string | null;
  allocations?: TransactionAllocationItem[] | null;
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
  accountsSummary: {
    id: number;
    name: string;
    type: string;
    current_balance: number;
    categories?: {
      id: number;
      name: string;
      current_balance?: number;
    }[];
  }[];
}

// Helper untuk menambahkan token auth ke request
const getAuthHeaders = async (): Promise<HeadersInit> => {
  const user = auth.currentUser;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (user) {
    try {
      const token = await user.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    } catch (e) {
      console.error("Gagal mendapatkan Firebase ID token:", e);
    }
  }

  return headers;
};

// ================= ACCOUNTS API =================
export const getAccounts = async () => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/accounts`, { headers, cache: "no-store" });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch accounts");
  }
  return res.json();
};

export const getAccountById = async (id: number) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/accounts/${id}`, { headers, cache: "no-store" });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch account");
  }
  return res.json();
};

export const createAccount = async (data: {
  name: string;
  type?: string;
  account_number?: string;
  current_balance?: number;
}) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/accounts`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create account");
  }
  return res.json();
};

export const updateAccount = async (
  id: number,
  data: { name?: string; type?: string; account_number?: string }
) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/accounts/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update account");
  }
  return res.json();
};

export const deleteAccount = async (id: number) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/accounts/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete account");
  }
  return res.json();
};

// ================= CATEGORIES API =================
export const getCategories = async () => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/categories`, { headers, cache: "no-store" });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch categories");
  }
  return res.json();
};

export const createCategory = async (data: { name: string; account_id?: number | null }) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create category");
  }
  return res.json();
};

export const updateCategory = async (
  id: number,
  data: { name: string; account_id?: number | null }
) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update category");
  }
  return res.json();
};

export const deleteCategory = async (id: number) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete category");
  }
  return res.json();
};

// ================= TRANSACTIONS API =================
export const getTransactions = async (filters: TransactionFilters = {}) => {
  const headers = await getAuthHeaders();
  const query = new URLSearchParams();

  if (filters.type) query.append("type", filters.type);
  if (filters.category_id) query.append("category_id", String(filters.category_id));
  if (filters.account_id) query.append("account_id", String(filters.account_id));
  if (filters.date) query.append("date", filters.date);
  if (filters.start_date) query.append("start_date", filters.start_date);
  if (filters.end_date) query.append("end_date", filters.end_date);
  if (filters.search) query.append("search", filters.search);
  if (filters.page) query.append("page", String(filters.page));
  if (filters.limit) query.append("limit", String(filters.limit));

  const url = `${API_URL}/transactions${query.toString() ? `?${query.toString()}` : ""}`;
  const res = await fetch(url, { headers, cache: "no-store" });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch transactions");
  }
  return res.json();
};

export const createTransaction = async (data: {
  title: string;
  amount: number;
  type: "income" | "expense";
  category_id?: number | null;
  account_id?: number | null;
  description?: string;
  allocations?: { category_id: number; amount: number }[];
  transaction_date: string;
}) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/transactions`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create transaction");
  }
  return res.json();
};

export const updateTransaction = async (
  id: number,
  data: {
    title?: string;
    amount?: number;
    type?: "income" | "expense";
    category_id?: number | null;
    account_id?: number | null;
    description?: string;
    allocations?: { category_id: number; amount: number }[];
    transaction_date?: string;
  }
) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/transactions/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update transaction");
  }
  return res.json();
};

export const deleteTransaction = async (id: number) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/transactions/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete transaction");
  }
  return res.json();
};

// ================= DASHBOARD API =================
export const getDashboard = async () => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/dashboard`, { headers, cache: "no-store" });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch dashboard data");
  }
  return res.json();
};
