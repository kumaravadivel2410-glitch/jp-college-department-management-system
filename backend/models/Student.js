const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
  {
    registerNo: { type: String, required: true, unique: true, trim: true },
    rollNumber: { type: String, default: '' },
    studentName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    dateOfBirth: { type: String, default: '' },
    department: { type: String, default: 'AI & DS' },
    year: { type: String, default: 'III Year' },
    semester: { type: String, default: 'Semester V' },
    section: { type: String, default: 'A' },
    batch: { type: String, default: '2021 - 2025' },
    parentName: { type: String, default: '' },
    parentPhone: { type: String, default: '' },
    address: { type: String, default: '' },
    bloodGroup: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },
    photo: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', StudentSchema);
