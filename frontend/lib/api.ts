const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface Category {
  id: number;
  name: string;
  created_at?: string;
}

export interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: "income" | "expense";
  category_id: number;
  description?: string | null;
  transaction_date: string;
  created_at?: string;
  categories?: {
    id: number;
    name: string;
  };
}

export interface TransactionFilters {
  type?: string;
  category_id?: string | number;
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

// Categories API
export async function getCategories(): Promise<{ success: boolean; data: Category[] }> {
  const response = await fetch(`${API_URL}/categories`, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch categories");
  }
  return data;
}

export async function getCategoryById(id: number | string): Promise<{ success: boolean; data: Category }> {
  const response = await fetch(`${API_URL}/categories/${id}`, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch category");
  }
  return data;
}

export async function createCategory(payload: { name: string }): Promise<{ success: boolean; data: Category }> {
  const response = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to create category");
  }
  return data;
}

export async function updateCategory(id: number | string, payload: { name: string }): Promise<{ success: boolean; data: Category }> {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to update category");
  }
  return data;
}

export async function deleteCategory(id: number | string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: "DELETE",
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to delete category");
  }
  return data;
}

// Transactions API
export async function getTransactions(filters: TransactionFilters = {}): Promise<{ success: boolean; data: Transaction[]; total: number }> {
  const params = new URLSearchParams();
  if (filters.type) params.append("type", filters.type);
  if (filters.category_id) params.append("category_id", String(filters.category_id));
  if (filters.date) params.append("date", filters.date);
  if (filters.start_date) params.append("start_date", filters.start_date);
  if (filters.end_date) params.append("end_date", filters.end_date);
  if (filters.search) params.append("search", filters.search);
  if (filters.page) params.append("page", String(filters.page));
  if (filters.limit) params.append("limit", String(filters.limit));

  const url = `${API_URL}/transactions${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await fetch(url, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch transactions");
  }
  return data;
}

export async function getTransactionById(id: number | string): Promise<{ success: boolean; data: Transaction }> {
  const response = await fetch(`${API_URL}/transactions/${id}`, { cache: "no-store" });
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
  category_id: number;
  description?: string;
  transaction_date: string;
}): Promise<{ success: boolean; data: Transaction }> {
  const response = await fetch(`${API_URL}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
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
    category_id: number;
    description?: string;
    transaction_date: string;
  }>
): Promise<{ success: boolean; data: Transaction }> {
  const response = await fetch(`${API_URL}/transactions/${id}`, {
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
  const response = await fetch(`${API_URL}/transactions/${id}`, {
    method: "DELETE",
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to delete transaction");
  }
  return data;
}

// Dashboard API
export async function getDashboard(): Promise<{ success: boolean; data: DashboardData }> {
  const response = await fetch(`${API_URL}/dashboard`, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch dashboard");
  }
  return data;
}
