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
      t.account_id,
      t.description,
      t.transaction_date,
      t.created_at,
      CASE 
        WHEN c.id IS NOT NULL THEN json_build_object('id', c.id, 'name', c.name)
        ELSE NULL
      END as categories,
      CASE 
        WHEN a.id IS NOT NULL THEN json_build_object('id', a.id, 'name', a.name, 'type', a.type)
        ELSE NULL
      END as account
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN accounts a ON t.account_id = a.id
    WHERE t.user_id = $1
    ORDER BY t.transaction_date DESC, t.id DESC
    LIMIT $2
  `;
  const { rows } = await pool.query(query, [userId, limit]);
  return rows;
};

const getAccountsSummary = async (userId) => {
  const query = `
    SELECT 
      a.id,
      a.name,
      a.type,
      a.current_balance::numeric,
      COALESCE(
        (SELECT json_agg(
          json_build_object(
            'id', c.id,
            'name', c.name,
            'current_balance', c.current_balance::numeric
          )
        ) FROM categories c WHERE c.account_id = a.id),
        '[]'::json
      ) as categories
    FROM accounts a
    WHERE a.user_id = $1
    ORDER BY a.id ASC
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
};

module.exports = {
  getTotalsAndCount,
  getExpenseOverviewGrouped,
  getRecentTransactions,
  getAccountsSummary,
};
