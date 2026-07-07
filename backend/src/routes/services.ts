import { Router, Request, Response } from 'express';
import { getDb } from '../db.js';

const router = Router();

// GET /api/services - List or search services
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, query } = req.query;
    const db = await getDb();
    
    let sql = 'SELECT * FROM services';
    const params: any[] = [];
    const conditions: string[] = [];

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    if (query) {
      conditions.push('(title LIKE ? OR description LIKE ? OR category LIKE ?)');
      const match = `%${query}%`;
      params.push(match, match, match);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    const services = await db.all(sql, params);
    
    // Parse JSON columns
    const parsedServices = services.map(s => ({
      ...s,
      eligibility: s.eligibility_json ? JSON.parse(s.eligibility_json) : [],
      documents: s.documents_json ? JSON.parse(s.documents_json) : [],
      steps: s.process_steps_json ? JSON.parse(s.process_steps_json) : []
    }));

    res.json(parsedServices);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/services/:id - Get detailed service info
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    
    const service = await db.get('SELECT * FROM services WHERE id = ?', [id]);
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({
      ...service,
      eligibility: service.eligibility_json ? JSON.parse(service.eligibility_json) : [],
      documents: service.documents_json ? JSON.parse(service.documents_json) : [],
      steps: service.process_steps_json ? JSON.parse(service.process_steps_json) : []
    });
  } catch (error) {
    console.error('Error fetching service detail:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
