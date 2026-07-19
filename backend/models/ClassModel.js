const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema(
  {
    className: { type: String, default: '' },
    department: { type: String, default: '' },
    year: { type: String, default: '' },
    semester: { type: String, default: '' },
    section: { type: String, default: 'A' },
    classAdvisor: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ClassModel', ClassSchema);
