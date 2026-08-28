const pool = require("../config/db");

const getTotalsAndCount = async () => {
  const query = `
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0)::numeric as total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)::numeric as total_expense,
      COUNT(*)::int as total_transactions
    FROM transactions
  `;
  const { rows } = await pool.query(query);
  return rows[0] || { total_income: 0, total_expense: 0, total_transactions: 0 };
};

const getExpenseOverviewGrouped = async () => {
  const query = `
    SELECT 
      COALESCE(c.name, 'Uncategorized') as "categoryName",
      SUM(t.amount)::numeric as "totalAmount"
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.type = 'expense'
    GROUP BY c.name
    ORDER BY "totalAmount" DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const getRecentTransactions = async (limit = 5) => {
  const query = `
    SELECT 
      t.id,
      t.title,
      t.amount::numeric as amount,
      t.type,
      t.category_id,
      t.description,
      t.transaction_date,
      t.created_at,
      CASE 
        WHEN c.id IS NOT NULL THEN json_build_object('id', c.id, 'name', c.name)
        ELSE NULL
      END as categories
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    ORDER BY t.transaction_date DESC, t.id DESC
    LIMIT $1
  `;
  const { rows } = await pool.query(query, [limit]);
  return rows;
};

module.exports = {
  getTotalsAndCount,
  getExpenseOverviewGrouped,
  getRecentTransactions,
};
