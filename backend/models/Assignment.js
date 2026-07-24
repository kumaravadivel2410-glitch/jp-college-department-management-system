import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    subjectCode: {
      type: String,
      required: true
    },
    department: {
      type: String,
      required: true
    },
    facultyName: {
      type: String,
      default: 'Faculty'
    },
    dueDate: {
      type: Date,
      required: true
    },
    maxMarks: {
      type: Number,
      default: 100
    },
    description: {
      type: String,
      default: ''
    },
    submissionsCount: {
      type: Number,
      default: 0
    },
    fileUrl: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

export default mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema);
