import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    registerNumber: {
      type: String,
      uppercase: true,
      trim: true,
      default: ''
    },
    facultyId: {
      type: String,
      uppercase: true,
      trim: true,
      default: ''
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6
    },
    role: {
      type: String,
      enum: ['Admin', 'Faculty', 'Student'],
      default: 'Student'
    },
    department: {
      type: String,
      default: 'General'
    },
    profileImage: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Active', 'Pending', 'Inactive'],
      default: 'Active'
    }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', userSchema);
