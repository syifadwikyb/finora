const chatService = require("./chatService");

const sendError = (res, error, fallback) => {
    console.error("[ERROR CHAT]", error.message);
    res.status(error.statusCode || 500).json({ success: false, message: error.message || fallback });
};

const getLanguage = (req) => (req.body.language === "en" ? "en" : "id");
const getMode = (req) => (req.body.app_mode === "flexible" ? "flexible" : "envelope");

const chat = async (req, res) => {
    try {
        const userId = req.body.user_id;
        if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });

        const data = await chatService.proposeActions(userId, req.body.message, req.body.history, getLanguage(req), getMode(req));
        res.status(200).json({ success: true, data });
    } catch (error) {
        sendError(res, error, "Failed to process chat");
    }
};

const execute = async (req, res) => {
    try {
        const userId = req.body.user_id;
        if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });

        const results = await chatService.executeActions(userId, req.body.actions, getLanguage(req), getMode(req));
        res.status(200).json({ success: true, data: { results } });
    } catch (error) {
        sendError(res, error, "Failed to execute actions");
    }
};

const health = async (req, res) => {
    try {
        const data = await chatService.checkAi();
        res.status(200).json({ success: true, data });
    } catch (error) {
        sendError(res, error, "AI check failed");
    }
};

module.exports = { chat, execute, health };