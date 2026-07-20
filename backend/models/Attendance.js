const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
  {
    studentRegisterNo: { type: String, required: true, index: true },
    studentName: { type: String, default: '' },
    department: { type: String, default: 'AI & DS', index: true },
    regulation: { type: String, default: '2021' },
    batch: { type: String, default: '2021 - 2025' },
    year: { type: String, default: 'III Year', index: true },
    semester: { type: String, default: 'Semester 5', index: true },
    section: { type: String, default: 'A', index: true },
    subject: { type: String, default: 'AD3501 - Deep Learning', index: true },
    date: { type: String, required: true, index: true },
    session: { type: String, enum: ['Morning', 'Afternoon', 'Full Day'], default: 'Full Day' },
    morningStatus: { type: String, default: 'Present' },
    afternoonStatus: { type: String, default: 'Present' },
    status: { type: String, enum: ['Present', 'Absent', 'Late', 'Permission'], default: 'Present', index: true },
    percentage: { type: Number, default: 100 },
    remarks: { type: String, default: '' },
    markedBy: { type: String, default: 'Faculty Member' },
    scanMethod: { type: String, enum: ['Manual', 'QR_Scan'], default: 'Manual' },
    scanTime: { type: String, default: '' },
    deviceInfo: { type: String, default: '' }
  },
  { timestamps: true }
);

AttendanceSchema.index({ department: 1, year: 1, semester: 1, section: 1, date: 1, subject: 1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);
