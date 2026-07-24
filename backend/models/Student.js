import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    registerNumber: {
      type: String,
      required: [true, 'Register Number is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Student Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email Address is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required']
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: 1,
      max: 4
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      default: 'A'
    },
    phone: {
      type: String,
      default: ''
    },
    cgpa: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    photoUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Alumni'],
      default: 'Active'
    }
  },
  { timestamps: true }
);

export default mongoose.models.Student || mongoose.model('Student', studentSchema);
