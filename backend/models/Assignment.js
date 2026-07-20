const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  studentRegisterNo: { type: String, required: true },
  studentName: { type: String, default: '' },
  submissionUrl: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  grade: { type: String, default: 'Pending' },
  status: { type: String, enum: ['Submitted', 'Graded', 'Late'], default: 'Submitted' }
});

const AssignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    department: { type: String, default: '' },
    year: { type: String, default: 'III Year' },
    semester: { type: String, default: 'Semester V' },
    section: { type: String, default: 'A' },
    subjectCode: { type: String, default: '' },
    subjectName: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    dueDate: { type: String, required: true },
    uploadedBy: { type: String, default: 'Faculty' },
    uploaderEmail: { type: String, default: '' },
    submissions: [SubmissionSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', AssignmentSchema);
