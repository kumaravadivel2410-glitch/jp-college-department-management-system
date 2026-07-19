const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
  {
    registerNo: { type: String, default: '' },
    studentName: { type: String, default: '' },
    rollNumber: { type: String, default: '' },
    department: { type: String, default: '' },
    year: { type: String, default: '' },
    semester: { type: String, default: '' },
    section: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    parentName: { type: String, default: '' },
    parentPhone: { type: String, default: '' },
    bloodGroup: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    photo: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', StudentSchema);
