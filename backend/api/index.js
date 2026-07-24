import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import apiRoutes from '../routes/index.js';
import { seedDatabase } from '../utils/seedData.js';
import { errorHandler } from '../middleware/errorHandler.js';

dotenv.config();

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

// Lazily connect DB on serverless invocation
app.use(async (req, res, next) => {
  try {
    const isConnected = await connectDB();
    if (isConnected) {
      // Auto-seed if database is empty
      seedDatabase();
    }
  } catch (err) {
    console.error('Serverless DB connection error:', err.message);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'Healthy', college: 'J.P. COLLEGE OF ENGINEERING ERP' });
});

// Main API Routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
