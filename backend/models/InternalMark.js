import mongoose from 'mongoose';

const internalMarkSchema = new mongoose.Schema(
  {
    registerNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    studentName: {
      type: String,
      required: true
    },
    department: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      default: 3
    },
    semester: {
      type: Number,
      required: true
    },
    section: {
      type: String,
      default: 'A'
    },
    subjectCode: {
      type: String,
      required: true,
      uppercase: true
    },
    subjectName: {
      type: String,
      default: ''
    },
    examType: {
      type: String,
      enum: ['Internal 1', 'Internal 2', 'Model Exam', 'Assignment Grade'],
      required: true
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    maxMarks: {
      type: Number,
      default: 100
    }
  },
  { timestamps: true }
);

export default mongoose.models.InternalMark || mongoose.model('InternalMark', internalMarkSchema);
