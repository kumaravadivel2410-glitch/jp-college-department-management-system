const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['attendance', 'marks', 'notes', 'import', 'export', 'approval', 'system'], default: 'system' },
    recipientRole: { type: String, default: 'all' }, // all, admin, faculty, student
    recipientEmail: { type: String, default: '' },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
