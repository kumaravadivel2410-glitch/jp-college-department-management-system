import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema(
  {
    facultyId: {
      type: String,
      required: [true, 'Faculty ID is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Faculty Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required']
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      default: 'Assistant Professor'
    },
    qualification: {
      type: String,
      default: 'M.E. / M.Tech'
    },
    phone: {
      type: String,
      default: ''
    },
    experienceYears: {
      type: Number,
      default: 0
    },
    assignedSubjects: [{
      type: String
    }],
    assignedClasses: [{
      type: String
    }],
    photoUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Resigned'],
      default: 'Active'
    }
  },
  { timestamps: true }
);

export default mongoose.models.Faculty || mongoose.model('Faculty', facultySchema);
