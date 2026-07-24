import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: [true, 'Class Name is required'],
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required']
    },
    year: {
      type: Number,
      required: [true, 'Year is required']
    },
    section: {
      type: String,
      required: [true, 'Section is required']
    },
    classIncharge: {
      type: String,
      default: 'Unassigned'
    },
    roomNumber: {
      type: String,
      default: 'LH-101'
    },
    totalStudents: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.models.ClassModel || mongoose.model('ClassModel', classSchema);
