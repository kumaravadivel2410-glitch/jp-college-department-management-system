import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['Academic', 'Attendance', 'Marks', 'Faculty', 'Financial'],
      default: 'Academic'
    },
    generatedBy: {
      type: String,
      default: 'System Admin'
    },
    downloadUrl: {
      type: String,
      default: '#'
    },
    format: {
      type: String,
      default: 'PDF'
    }
  },
  { timestamps: true }
);

export default mongoose.models.Report || mongoose.model('Report', reportSchema);
