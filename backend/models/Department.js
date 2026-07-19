const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema(
  {
    code: { type: String, default: '' },
    name: { type: String, default: '' },
    hodName: { type: String, default: '' },
    description: { type: String, default: '' },
    establishedYear: { type: String, default: '2010' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Department', DepartmentSchema);
