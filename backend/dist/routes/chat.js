"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_js_1 = require("../services/ai.js");
const router = (0, express_1.Router)();
// POST /api/chat - Conversational AI agent endpoint
router.post('/', async (req, res) => {
    try {
        const { message, history, lang } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required.' });
        }
        const chatHistory = Array.isArray(history) ? history : [];
        const language = lang || 'en';
        const result = await (0, ai_js_1.getChatResponse)(message, chatHistory, language);
        res.json({
            reply: result.text,
            toolCalled: result.toolCalled,
            toolResult: result.toolResult
        });
    }
    catch (error) {
        console.error('Error in chat route:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
