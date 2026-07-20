const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
  {
    reportTitle: { type: String, required: true },
    reportType: { type: String, required: true }, // Attendance, Internal Marks, Semester Marks, Faculty, Student, Department
    generatedBy: { type: String, default: '' },
    department: { type: String, default: 'All' },
    semester: { type: String, default: 'All' },
    format: { type: String, default: 'PDF' },
    summary: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', ReportSchema);
