import mongoose from 'mongoose';

const historySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true
    },
    performedBy: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: 'Admin'
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    },
    details: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

export default mongoose.models.History || mongoose.model('History', historySchema);
