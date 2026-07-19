const mongoose = require('mongoose');

const SemesterMarkSchema = new mongoose.Schema(
  {
    studentRegisterNo: { type: String, default: '' },
    studentName: { type: String, default: '' },
    department: { type: String, default: '' },
    semester: { type: String, default: '' },
    subjectCode: { type: String, default: '' },
    subjectName: { type: String, default: '' },
    grade: { type: String, default: 'A+' },
    cgpa: { type: Number, default: 8.5 },
    arrears: { type: Number, default: 0 },
    result: { type: String, enum: ['PASS', 'FAIL', 'ARREAR'], default: 'PASS' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SemesterMark', SemesterMarkSchema);
