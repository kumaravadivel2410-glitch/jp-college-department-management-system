const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema(
  {
    className: { type: String, required: true, trim: true },
    department: { type: String, required: true, default: 'AI & DS', index: true },
    year: { type: String, required: true, default: 'III Year', index: true },
    semester: { type: String, required: true, default: 'Semester V', index: true },
    section: { type: String, required: true, default: 'A', index: true },
    classAdvisor: { type: String, default: '' },
    roomNumber: { type: String, default: 'LH-201' },
    studentCount: { type: Number, default: 60 }
  },
  { timestamps: true }
);

ClassSchema.index({ department: 1, year: 1, semester: 1, section: 1 });

module.exports = mongoose.model('ClassModel', ClassSchema);
