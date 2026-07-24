import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import apiRoutes from './routes/index.js';
import { seedDatabase } from './utils/seedData.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.github.io') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role', 'x-user-name']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'Healthy', college: 'J.P. COLLEGE OF ENGINEERING ERP' });
});

// API Routes
app.use('/api', apiRoutes);

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect DB & Launch Local Express Server
connectDB().then((isConnected) => {
  if (isConnected) {
    seedDatabase();
  }
  app.listen(PORT, () => {
    console.log(`🚀 JP College ERP Backend Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  app.listen(PORT, () => {
    console.log(`🚀 JP College ERP Server running (Offline DB mode) on port ${PORT}`);
  });
});

export default app;
