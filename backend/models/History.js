const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    time: { type: String, required: true },
    action: { type: String, required: true },
    user: { type: String, default: 'Faculty/Admin' },
    department: { type: String, default: 'General' },
    details: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('History', HistorySchema);
