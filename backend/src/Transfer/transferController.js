const transferService = require("./transferService");

const createTransfer = async (req, res) => {
    try {
        const transfer = await transferService.createTransfer(req.body);

        res.status(201).json({
            success: true,
            message: "Money moved successfully",
            data: transfer,
        });
    } catch (error) {
        console.error("[ERROR]", error.message);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to move money",
        });
    }
};

const getTransfers = async (req, res) => {
    try {
        const transfers = await transferService.getAllTransfers(req.query.userId);

        res.status(200).json({
            success: true,
            message: "Transfers fetched successfully",
            data: transfers,
        });
    } catch (error) {
        console.error("[ERROR]", error.message);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch transfers",
        });
    }
};

const updateTransfer = async (req, res) => {
    try {
        const userId = req.query.userId || req.body.user_id;
        const transfer = await transferService.updateTransfer(req.params.id, userId, req.body);

        res.status(200).json({
            success: true,
            message: "Transfer updated successfully",
            data: transfer,
        });
    } catch (error) {
        console.error("[ERROR]", error.message);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to update transfer",
        });
    }
};

const deleteTransfer = async (req, res) => {
    try {
        await transferService.deleteTransfer(req.params.id, req.query.userId);

        res.status(200).json({
            success: true,
            message: "Transfer deleted successfully",
        });
    } catch (error) {
        console.error("[ERROR]", error.message);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to delete transfer",
        });
    }
};

module.exports = {
    createTransfer,
    getTransfers,
    updateTransfer,
    deleteTransfer,
};