const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema(
  {
    collegeName: { type: String, default: 'JP College of Engineering' },
    academicYear: { type: String, default: '2025-2026' },
    activeSemester: { type: String, default: 'Even Semester' },
    theme: { type: String, default: 'golden-dark' },
    autoRefreshInterval: { type: Number, default: 30 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', SettingSchema);
