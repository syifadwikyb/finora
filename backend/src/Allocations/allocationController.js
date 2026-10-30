const allocationService = require("./allocationService");

const getAllocations = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const allocations = await allocationService.getAllAllocations(userId, req.query);
    res.status(200).json({
      success: true,
      message: "Allocations fetched successfully",
      data: allocations,
    });
  } catch (error) {
    console.error("[ERROR]", error.message);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch allocations",
    });
  }
};

const getAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const allocation = await allocationService.getAllocationById(id, userId);
    res.status(200).json({
      success: true,
      message: "Allocation fetched successfully",
      data: allocation,
    });
  } catch (error) {
    console.error("[ERROR]", error.message);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch allocation",
    });
  }
};

const createAllocation = async (req, res) => {
  try {
    const newAllocation = await allocationService.createAllocation(req.body);
    res.status(201).json({
      success: true,
      message: "Allocation created successfully",
      data: newAllocation,
    });
  } catch (error) {
    console.error("[ERROR]", error.message);
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to create allocation",
    });
  }
};

const updateAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.user_id || req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const updated = await allocationService.updateAllocation(id, userId, req.body);
    res.status(200).json({
      success: true,
      message: "Allocation updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("[ERROR]", error.message);
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to update allocation",
    });
  }
};

const deleteAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId || req.body.user_id;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const deleted = await allocationService.deleteAllocation(id, userId);
    res.status(200).json({
      success: true,
      message: "Allocation deleted successfully",
      data: deleted,
    });
  } catch (error) {
    console.error("[ERROR]", error.message);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete allocation",
    });
  }
};

module.exports = {
  getAllocations,
  getAllocation,
  createAllocation,
  updateAllocation,
  deleteAllocation,
};

