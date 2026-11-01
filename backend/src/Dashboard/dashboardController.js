const dashboardService = require("./dashboardService");

const getDashboard = async (req, res) => {
  try {
    // Ambil userId yang dikirim dari frontend
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Teruskan userId ke layer service
    const dashboardData = await dashboardService.getDashboardData(userId);

    res.status(200).json({
      success: true,
      message: "Dashboard summary fetched successfully",
      data: dashboardData,
    });
  } catch (error) {
    console.error("[ERROR]", error.message);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch dashboard data",
    });
  }
};

module.exports = {
  getDashboard,
};