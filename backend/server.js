const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/db');
const apiRoutes = require('./routes/apiRoutes');

const app = express();

// Ensure Uploads Folder Exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Enable CORS for Netlify Production & Localhost Development
const allowedOrigins = [
  'http://localhost:5000',
  'http://localhost:5173',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:5173'
];

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.netlify.app') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role']
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static directory for uploaded files
app.use('/uploads', express.static(uploadsDir));

// Connect DB & Auto-Seed MongoDB Atlas if empty
connectDB().then(() => {
  const { autoSeedDatabase } = require('./controllers/apiControllers');
  autoSeedDatabase();
});

// API Routes
app.use('/api', apiRoutes);

// Static frontend serving
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Clean URL Route Mappings for Multi-Page Navigation
const pageRoutes = [
  { path: '/', file: 'login.html' },
  { path: '/login', file: 'login.html' },
  { path: '/register', file: 'register.html' },
  { path: '/approvals', file: 'approvals.html' },
  { path: '/dashboard', file: 'dashboard.html' },
  { path: '/students', file: 'students.html' },
  { path: '/faculty', file: 'faculty.html' },
  { path: '/departments', file: 'departments.html' },
  { path: '/subjects', file: 'subjects.html' },
  { path: '/classes', file: 'classes.html' },
  { path: '/attendance', file: 'attendance.html' },
  { path: '/semester-marks', file: 'semester-marks.html' },
  { path: '/internal-marks', file: 'internal-marks.html' },
  { path: '/subject-notes', file: 'subject-notes.html' },
  { path: '/assignments', file: 'assignments.html' },
  { path: '/timetable', file: 'timetable.html' },
  { path: '/reports', file: 'reports.html' },
  { path: '/downloads', file: 'downloads.html' },
  { path: '/history', file: 'history.html' },
  { path: '/settings', file: 'settings.html' },
  { path: '/about', file: 'about.html' }
];

pageRoutes.forEach(r => {
  app.get(r.path, (req, res) => {
    res.sendFile(path.join(frontendPath, r.file));
  });
});

// Fallback Route
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API Endpoint Not Found' });
  }
  res.sendFile(path.join(frontendPath, 'login.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 JP College ERP Server running on port ${PORT}`);
});
