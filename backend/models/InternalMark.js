const mongoose = require('mongoose');

const InternalMarkSchema = new mongoose.Schema(
  {
    studentRegisterNo: { type: String, required: true },
    studentName: { type: String, default: '' },
    department: { type: String, default: '' },
    year: { type: String, default: 'III Year' },
    semester: { type: String, default: '' },
    section: { type: String, default: 'A' },
    subjectCode: { type: String, default: '' },
    subjectName: { type: String, default: '' },
    facultyName: { type: String, default: 'Faculty Advisor' },
    internal1: { type: Number, default: 0 },
    internal2: { type: Number, default: 0 },
    internal3: { type: Number, default: 0 },
    average: { type: Number, default: 0 },
    modelExam: { type: Number, default: 0 },
    assignmentMark: { type: Number, default: 0 },
    totalInternal: { type: Number, default: 0 },
    lastUpdated: { type: String, default: () => new Date().toISOString().split('T')[0] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('InternalMark', InternalMarkSchema);
