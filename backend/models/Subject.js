const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema(
  {
    subjectCode: { type: String, default: '' },
    subjectName: { type: String, default: '' },
    credits: { type: Number, default: 3 },
    facultyName: { type: String, default: '' },
    department: { type: String, default: '' },
    semester: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', SubjectSchema);
