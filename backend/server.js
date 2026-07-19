const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const apiRoutes = require('./routes/apiRoutes');

const app = express();

// Security & Optimization Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*' }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
  { path: '/', file: 'dashboard.html' },
  { path: '/dashboard', file: 'dashboard.html' },
  { path: '/students', file: 'students.html' },
  { path: '/faculty', file: 'faculty.html' },
  { path: '/departments', file: 'departments.html' },
  { path: '/subjects', file: 'subjects.html' },
  { path: '/classes', file: 'classes.html' },
  { path: '/attendance', file: 'attendance.html' },
  { path: '/semester-marks', file: 'semester-marks.html' },
  { path: '/internal-marks', file: 'internal-marks.html' },
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
  res.sendFile(path.join(frontendPath, 'dashboard.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 JP College DMS Server running on port ${PORT}`);
});
