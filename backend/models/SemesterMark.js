const mongoose = require('mongoose');

const SemesterMarkSchema = new mongoose.Schema(
  {
    studentRegisterNo: { type: String, required: true },
    studentName: { type: String, default: '' },
    department: { type: String, default: '' },
    year: { type: String, default: 'III Year' },
    semester: { type: String, default: '' },
    section: { type: String, default: 'A' },
    subjectCode: { type: String, default: '' },
    subjectName: { type: String, default: '' },
    grade: { type: String, default: 'O' },
    marks: { type: Number, default: 92 },
    credits: { type: Number, default: 4 },
    gpa: { type: Number, default: 9.2 },
    cgpa: { type: Number, default: 9.0 },
    arrears: { type: Number, default: 0 },
    result: { type: String, enum: ['PASS', 'FAIL', 'ARREAR'], default: 'PASS' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SemesterMark', SemesterMarkSchema);
