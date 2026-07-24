import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Department Code is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Department Name is required'],
      trim: true
    },
    hod: {
      type: String,
      default: 'To be assigned'
    },
    totalFaculty: {
      type: Number,
      default: 0
    },
    totalStudents: {
      type: Number,
      default: 0
    },
    establishedYear: {
      type: Number,
      default: 2011
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    }
  },
  { timestamps: true }
);

export default mongoose.models.Department || mongoose.model('Department', departmentSchema);
