import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    registerNumber: {
      type: String,
      required: [true, 'Register Number is required'],
      uppercase: true,
      trim: true
    },
    studentName: {
      type: String,
      required: [true, 'Student Name is required']
    },
    subjectCode: {
      type: String,
      required: [true, 'Subject Code is required'],
      uppercase: true
    },
    subjectName: {
      type: String,
      default: ''
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
      default: 6
    },
    section: {
      type: String,
      default: 'A'
    },
    facultyId: {
      type: String,
      default: 'JPC-FAC-101'
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Leave', 'OD'],
      required: true,
      default: 'Present'
    },
    remarks: {
      type: String,
      default: 'Regular'
    },
    updatedTime: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
