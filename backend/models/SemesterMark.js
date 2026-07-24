import mongoose from 'mongoose';

const semesterMarkSchema = new mongoose.Schema(
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
    semester: {
      type: Number,
      required: true
    },
    gpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    },
    status: {
      type: String,
      enum: ['Pass', 'Fail', 'Arrear', 'Withheld'],
      default: 'Pass'
    },
    subjectsCount: {
      type: Number,
      default: 6
    },
    arrearsCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.models.SemesterMark || mongoose.model('SemesterMark', semesterMarkSchema);
