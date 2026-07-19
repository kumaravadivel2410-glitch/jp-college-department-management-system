const mongoose = require('mongoose');

const InternalMarkSchema = new mongoose.Schema(
  {
    studentRegisterNo: { type: String, default: '' },
    studentName: { type: String, default: '' },
    department: { type: String, default: '' },
    semester: { type: String, default: '' },
    subjectCode: { type: String, default: '' },
    subjectName: { type: String, default: '' },
    internal1: { type: Number, default: 0 },
    internal2: { type: Number, default: 0 },
    modelExam: { type: Number, default: 0 },
    assignment: { type: Number, default: 0 },
    totalInternal: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('InternalMark', InternalMarkSchema);
