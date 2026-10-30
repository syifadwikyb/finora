const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const pool = require("./config/db");
const categoryRoutes = require("./Categories/categoryRoute");
const transactionRoutes = require("./Transactions/transactionRoute");
const dashboardRoutes = require("./Dashboard/dashboardRoute");
const authRoutes = require("./Auth/authRoute");
const accountRoutes = require("./Accounts/accountRoute");
const allocationRoutes = require("./Allocations/allocationRoute");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Finora API is running",
  });
});

// Database Health Check Endpoint
app.get("/health/database", async (req, res) => {
  try {
    await pool.query("SELECT 1 FROM categories LIMIT 1");
    return res.status(200).json({
      success: true,
      message: "Database connection is working",
    });
  } catch (error) {
    console.error("[DB ERROR]", error.message);
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// Routes
app.use("/auth", authRoutes);
app.use("/accounts", accountRoutes);
app.use("/allocations", allocationRoutes);
app.use("/categories", categoryRoutes);
app.use("/transactions", transactionRoutes);
app.use("/dashboard", dashboardRoutes);

// Export for serverless (e.g. Vercel)
module.exports = app;

// Listen only when run directly (local development)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
