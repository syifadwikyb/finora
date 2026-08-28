const dashboardService = require("./dashboardService");

const getDashboard = async (req, res) => {
  try {
    const dashboardData = await dashboardService.getDashboardData();
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
