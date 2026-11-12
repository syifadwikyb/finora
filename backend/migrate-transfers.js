const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const pool = require("./src/config/db");

async function migrate() {
    console.log("Running transfers migration...");

    await pool.query(`
    CREATE TABLE IF NOT EXISTS transfers (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      from_category_id INT REFERENCES categories(id) ON DELETE SET NULL,
      to_category_id INT REFERENCES categories(id) ON DELETE SET NULL,
      from_account_id INT REFERENCES accounts(id) ON DELETE SET NULL,
      to_account_id INT REFERENCES accounts(id) ON DELETE SET NULL,
      amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
      note TEXT,
      transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_transfers_user_date
      ON transfers (user_id, transfer_date DESC);
  `);

    console.log("Migration executed successfully!");
    await pool.end();
}

migrate().catch((err) => {
    console.error("Migration failed:", err);
    pool.end();
    process.exit(1);
});