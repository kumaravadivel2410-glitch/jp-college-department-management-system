import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Registration', 'Mark Change', 'Leave Request', 'Course Change'],
      required: true
    },
    requestedBy: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true
    },
    details: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    reviewedBy: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

export default mongoose.models.Approval || mongoose.model('Approval', approvalSchema);
