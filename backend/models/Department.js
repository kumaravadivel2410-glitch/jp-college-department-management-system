const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema(
  {
    departmentCode: { type: String, required: true, unique: true, trim: true },
    code: { type: String, trim: true },
    departmentName: { type: String, required: true, trim: true },
    name: { type: String, trim: true },
    hod: { type: String, default: '' },
    hodName: { type: String, default: '' },
    description: { type: String, default: '' },
    assignedFaculty: [{ type: String }],
    establishedYear: { type: String, default: '2010' }
  },
  { timestamps: true }
);

DepartmentSchema.pre('save', function (next) {
  if (this.departmentCode && !this.code) this.code = this.departmentCode;
  if (this.code && !this.departmentCode) this.departmentCode = this.code;
  if (this.departmentName && !this.name) this.name = this.departmentName;
  if (this.name && !this.departmentName) this.departmentName = this.name;
  if (this.hod && !this.hodName) this.hodName = this.hod;
  if (this.hodName && !this.hod) this.hod = this.hodName;
  next();
});

module.exports = mongoose.model('Department', DepartmentSchema);
