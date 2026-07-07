import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDb } from './db.js';
import { seedDatabase } from './seed.js';

// Route Imports
import servicesRouter from './routes/services.js';
import schemesRouter from './routes/schemes.js';
import complaintsRouter from './routes/complaints.js';
import chatRouter from './routes/chat.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/services', servicesRouter);
app.use('/api/schemes', schemesRouter);
app.use('/api/complaints', complaintsRouter);
app.use('/api/chat', chatRouter);

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('Connecting to SQLite database...');
    await getDb();
    console.log('Database connected successfully.');

    console.log('Running database seeders...');
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`Smart Bharat Backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Fatal: Server startup failed:', error);
    process.exit(1);
  }
}

startServer();
