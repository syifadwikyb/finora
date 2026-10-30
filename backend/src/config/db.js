const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const isLocalhost = process.env.DATABASE_URL && process.env.DATABASE_URL.includes("localhost");

// Supabase session/transaction pooler port 6543 / 5432:
// Jika server pooler tidak memerlukan parameter ssl manual atau menolak SSL negotiation tertentu,
// biarkan connectionString mengatur atau disable jika dibutuhkan.
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
};

if (!isLocalhost && process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("pooler.supabase.com")) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

pool.connect((err, client, release) => {
  if (err) {
    console.error("[DB ERROR] Gagal terhubung ke database:", err.message);
  } else {
    console.log("[DB SUCCESS] Berhasil terhubung ke Supabase PostgreSQL via pg!");
  }
  if (client) release();
});

module.exports = pool;
