import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    section: {
      type: String,
      default: 'A'
    },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true
    },
    period: {
      type: Number,
      required: true,
      min: 1,
      max: 8
    },
    subjectCode: {
      type: String,
      required: true
    },
    subjectName: {
      type: String,
      default: ''
    },
    facultyName: {
      type: String,
      default: 'Faculty'
    },
    room: {
      type: String,
      default: 'LH-101'
    }
  },
  { timestamps: true }
);

export default mongoose.models.Timetable || mongoose.model('Timetable', timetableSchema);
