const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema(
  {
    facultyId: { type: String, required: true, unique: true, trim: true, index: true },
    facultyName: { type: String, required: true, trim: true },
    department: { type: String, default: '', index: true },
    subject: { type: String, default: '' },
    qualification: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    experience: { type: String, default: '' },
    designation: { type: String, default: 'Assistant Professor' },
    photo: { type: String, default: '' },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' }
  },
  { timestamps: true }
);

FacultySchema.index({ facultyName: 'text', facultyId: 'text' });

module.exports = mongoose.model('Faculty', FacultySchema);
