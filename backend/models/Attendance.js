const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
  {
    studentRegisterNo: { type: String, required: true },
    studentName: { type: String, default: '' },
    department: { type: String, default: '' },
    semester: { type: String, default: '' },
    section: { type: String, default: 'A' },
    date: { type: String, required: true },
    session: { type: String, enum: ['Morning', 'Afternoon', 'Full Day'], default: 'Full Day' },
    morningStatus: { type: String, enum: ['Present', 'Absent', 'Leave', 'OD', 'Late'], default: 'Present' },
    afternoonStatus: { type: String, enum: ['Present', 'Absent', 'Leave', 'OD', 'Late'], default: 'Present' },
    status: { type: String, enum: ['Present', 'Absent', 'Leave', 'Medical Leave', 'OD', 'Late Entry', 'Half Day'], default: 'Present' },
    percentage: { type: Number, default: 100 },
    remarks: { type: String, default: '' },
    markedBy: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attendance', AttendanceSchema);
