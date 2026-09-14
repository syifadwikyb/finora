const pool = require("../config/db");

const getTotalsAndCount = async (userId) => {
  const query = `
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0)::numeric as total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)::numeric as total_expense,
      COUNT(*)::int as total_transactions
    FROM transactions
    WHERE user_id = $1
  `;
  // Eksekusi query dengan parameter userId
  const { rows } = await pool.query(query, [userId]);
  return rows[0] || { total_income: 0, total_expense: 0, total_transactions: 0 };
};

const getExpenseOverviewGrouped = async (userId) => {
  const query = `
    SELECT 
      COALESCE(c.name, 'Uncategorized') as "categoryName",
      SUM(t.amount)::numeric as "totalAmount"
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.type = 'expense' AND t.user_id = $1
    GROUP BY c.name
    ORDER BY "totalAmount" DESC
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
};

const getRecentTransactions = async (userId, limit = 5) => {
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
    WHERE t.user_id = $1
    ORDER BY t.transaction_date DESC, t.id DESC
    LIMIT $2
  `;
  // Parameter $1 adalah userId, parameter $2 adalah limit
  const { rows } = await pool.query(query, [userId, limit]);
  return rows;
};

module.exports = {
  getTotalsAndCount,
  getExpenseOverviewGrouped,
  getRecentTransactions,
};