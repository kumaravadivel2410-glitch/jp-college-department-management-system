const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
  {
    registerNo: { type: String, required: true, unique: true, trim: true },
    studentName: { type: String, required: true, trim: true },
    rollNumber: { type: String, default: '' },
    department: { type: String, default: '' },
    year: { type: String, default: '' },
    semester: { type: String, default: '' },
    section: { type: String, default: 'A' },
    phone: { type: String, default: '' },
    email: { type: String, required: true, lowercase: true, trim: true },
    address: { type: String, default: '' },
    parentName: { type: String, default: '' },
    parentPhone: { type: String, default: '' },
    bloodGroup: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    photo: { type: String, default: '' },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', StudentSchema);
