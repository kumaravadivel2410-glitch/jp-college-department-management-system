const mongoose = require('mongoose');

const ScheduleSlotSchema = new mongoose.Schema({
  period: { type: String, required: true }, // e.g. "09:00 - 10:00 AM"
  subjectCode: { type: String, default: '' },
  subjectName: { type: String, default: '' },
  facultyName: { type: String, default: '' },
  roomNo: { type: String, default: 'Lab 1' }
});

const TimetableSchema = new mongoose.Schema(
  {
    department: { type: String, required: true },
    year: { type: String, required: true },
    semester: { type: String, required: true },
    section: { type: String, required: true },
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], required: true },
    schedule: [ScheduleSlotSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Timetable', TimetableSchema);
