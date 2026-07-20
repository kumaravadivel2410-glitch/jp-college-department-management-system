const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema(
  {
    subjectCode: { type: String, required: true, unique: true, trim: true, index: true },
    subjectName: { type: String, required: true, trim: true },
    department: { type: String, default: 'AI & DS', index: true },
    regulation: { type: String, default: '2021', index: true },
    year: { type: String, default: '3rd Year', index: true },
    semester: { type: String, default: 'Semester V', index: true },
    category: { type: String, enum: ['Theory', 'Practical', 'Laboratory', 'Project'], default: 'Theory' },
    credits: { type: Number, default: 4 },
    hoursPerWeek: { type: Number, default: 4 },
    facultyName: { type: String, default: '' },
    facultyAssigned: { type: String, default: '' }
  },
  { timestamps: true }
);

SubjectSchema.pre('save', function (next) {
  if (this.facultyName && !this.facultyAssigned) this.facultyAssigned = this.facultyName;
  if (this.facultyAssigned && !this.facultyName) this.facultyName = this.facultyAssigned;
  next();
});

module.exports = mongoose.model('Subject', SubjectSchema);
