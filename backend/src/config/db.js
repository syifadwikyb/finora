const { Pool } = require("pg");
require("dotenv").config();

const isLocalhost = process.env.DATABASE_URL && process.env.DATABASE_URL.includes("localhost");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocalhost ? false : { rejectUnauthorized: false },
});

pool.connect((err, client, release) => {
  if (err) {
    console.error("[DB ERROR] Gagal terhubung ke database:", err.message);
  } else {
    console.log("[DB SUCCESS] Berhasil terhubung ke Supabase PostgreSQL via pg!");
  }
  if (client) release();
});

module.exports = pool;