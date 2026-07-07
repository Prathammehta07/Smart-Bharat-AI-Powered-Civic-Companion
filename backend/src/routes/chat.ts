import { Router, Request, Response } from 'express';
import { getChatResponse } from '../services/ai.js';

const router = Router();

// POST /api/chat - Conversational AI agent endpoint
router.post('/', async (req: Request, res: Response) => {
  try {
    const { message, history, lang } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const chatHistory = Array.isArray(history) ? history : [];
    const language = lang || 'en';

    const result = await getChatResponse(message, chatHistory, language);

    res.json({
      reply: result.text,
      toolCalled: result.toolCalled,
      toolResult: result.toolResult
    });
  } catch (error) {
    console.error('Error in chat route:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
