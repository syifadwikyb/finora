const path = require("path");
require("./src/node_modules/dotenv" in {} ? "./src/node_modules/dotenv" : "dotenv").config({
  path: path.resolve(__dirname, ".env"),
});
const pool = require("./src/config/db");

async function migrate() {
  console.log("Running migration...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS accounts (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL DEFAULT 'bank',
      account_number VARCHAR(100),
      current_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS allocations (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      account_id INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      target_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      current_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    ALTER TABLE transactions ADD COLUMN IF NOT EXISTS account_id INT REFERENCES accounts(id) ON DELETE SET NULL;
    ALTER TABLE transactions ADD COLUMN IF NOT EXISTS allocation_id INT REFERENCES allocations(id) ON DELETE SET NULL;
  `);

  console.log("Migration executed successfully!");
  const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
  console.log("Public tables:", tables.rows.map(r => r.table_name));
  await pool.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  pool.end();
  process.exit(1);
});

