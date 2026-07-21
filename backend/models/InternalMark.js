const mongoose = require('mongoose');

const EditHistorySchema = new mongoose.Schema(
  {
    markType: { type: String, required: true }, // internal1, internal2, internal3, modelExam, assignmentMark
    oldValue: { type: Number, default: 0 },
    newValue: { type: Number, default: 0 },
    editedBy: { type: String, default: 'System/Faculty' },
    editedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const InternalMarkSchema = new mongoose.Schema(
  {
    studentRegisterNo: { type: String, required: true, index: true },
    studentName: { type: String, default: '' },
    department: { type: String, default: '', index: true },
    year: { type: String, default: 'III Year' },
    semester: { type: String, default: '', index: true },
    section: { type: String, default: 'A' },
    subjectCode: { type: String, default: '', index: true },
    subjectName: { type: String, default: '' },
    facultyName: { type: String, default: 'Faculty Advisor' },
    internal1: { type: Number, default: 0 },
    internal2: { type: Number, default: 0 },
    internal3: { type: Number, default: 0 },
    average: { type: Number, default: 0 },
    maxMark: { type: Number, default: 50 },
    status: { type: String, enum: ['PASS', 'FAIL'], default: 'PASS' },
    modelExam: { type: Number, default: 0 },
    assignmentMark: { type: Number, default: 0 },
    totalInternal: { type: Number, default: 0 },
    editHistory: [EditHistorySchema],
    lastUpdated: { type: String, default: () => new Date().toISOString().split('T')[0] }
  },
  { timestamps: true }
);

InternalMarkSchema.pre('save', function (next) {
  const i1 = Number(this.internal1) || 0;
  const i2 = Number(this.internal2) || 0;
  const i3 = Number(this.internal3) || 0;
  this.average = Number(((i1 + i2 + i3) / 3).toFixed(2));

  const max = Number(this.maxMark) || 50;
  const passMark = max * 0.4; // 40% pass criteria
  this.status = this.average >= passMark ? 'PASS' : 'FAIL';
  next();
});

module.exports = mongoose.model('InternalMark', InternalMarkSchema);
