const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema(
  {
    facultyId: { type: String, default: '' },
    facultyName: { type: String, default: '' },
    department: { type: String, default: '' },
    subject: { type: String, default: '' },
    qualification: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    experience: { type: String, default: '' },
    designation: { type: String, default: 'Assistant Professor' },
    photo: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Faculty', FacultySchema);
