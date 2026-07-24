import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Subject Code is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Subject Name is required'],
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required']
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8
    },
    credits: {
      type: Number,
      required: [true, 'Credits are required'],
      min: 1,
      max: 6
    },
    type: {
      type: String,
      enum: ['Theory', 'Practical', 'Project', 'Elective'],
      default: 'Theory'
    }
  },
  { timestamps: true }
);

export default mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
