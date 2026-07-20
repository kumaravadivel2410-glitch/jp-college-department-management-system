const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['super_admin', 'admin', 'faculty', 'student'], default: 'student' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isProtected: { type: Boolean, default: false },
    
    // Common profile details
    department: { type: String, default: 'General' },
    mobileNumber: { type: String, default: '' },
    address: { type: String, default: '' },
    photo: { type: String, default: '' },

    // Admin Request specific fields
    employeeId: { type: String, default: '' },
    reasonForAdmin: { type: String, default: '' },

    // Student specific fields
    registerNo: { type: String, default: '' },
    rollNumber: { type: String, default: '' },
    year: { type: String, default: '' },
    semester: { type: String, default: '' },
    section: { type: String, default: '' },

    // Faculty specific fields
    facultyId: { type: String, default: '' },
    designation: { type: String, default: '' },
    subjectsAssigned: { type: String, default: '' },
    qualification: { type: String, default: '' },

    // Audit tracking
    approvedBy: { type: String, default: '' },
    approvedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
