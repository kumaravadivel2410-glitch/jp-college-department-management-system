import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    collegeName: {
      type: String,
      default: 'J.P. COLLEGE OF ENGINEERING'
    },
    collegeCode: {
      type: String,
      default: 'JPC-9511'
    },
    academicYear: {
      type: String,
      default: '2025-2026'
    },
    currentSemesterType: {
      type: String,
      enum: ['Odd', 'Even'],
      default: 'Odd'
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    systemMaintenance: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.models.Setting || mongoose.model('Setting', settingSchema);
