import Timetable from '../models/Timetable.js';

export const getTimetable = async (req, res) => {
  try {
    const { department, year, day } = req.query;
    let query = {};
    if (department && department !== 'All') query.department = department;
    if (year && year !== 'All') query.year = Number(year);
    if (day && day !== 'All') query.day = day;

    const timetable = await Timetable.find(query).sort({ day: 1, period: 1 });
    return res.json({ success: true, data: timetable });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createTimetableSlot = async (req, res) => {
  try {
    const record = await Timetable.create(req.body);
    return res.status(201).json({ success: true, message: 'Timetable entry added', data: record });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTimetableSlot = async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Timetable entry deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
