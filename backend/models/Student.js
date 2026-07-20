const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
  {
    registerNo: { type: String, required: true, unique: true, trim: true, index: true },
    rollNumber: { type: String, default: '', index: true },
    studentName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, default: '' },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    dateOfBirth: { type: String, default: '' },
    department: { type: String, default: 'AI & DS', index: true },
    year: { type: String, default: 'III Year', index: true },
    semester: { type: String, default: 'Semester V', index: true },
    section: { type: String, default: 'A', index: true },
    batch: { type: String, default: '2021 - 2025' },
    parentName: { type: String, default: '' },
    parentPhone: { type: String, default: '' },
    address: { type: String, default: '' },
    bloodGroup: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },
    photo: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active', index: true },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' }
  },
  { timestamps: true }
);

StudentSchema.index({ department: 1, year: 1, semester: 1, section: 1 });
StudentSchema.index({ studentName: 'text', registerNo: 'text' });

module.exports = mongoose.model('Student', StudentSchema);
