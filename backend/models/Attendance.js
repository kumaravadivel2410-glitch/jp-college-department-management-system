const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
  {
    studentRegisterNo: { type: String, default: '' },
    studentName: { type: String, default: '' },
    department: { type: String, default: '' },
    semester: { type: String, default: '' },
    date: { type: String, default: '' },
    status: { type: String, enum: ['Present', 'Absent', 'Leave', 'Medical Leave', 'OD', 'Late Entry'], default: 'Present' },
    percentage: { type: Number, default: 100 },
    remarks: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attendance', AttendanceSchema);
