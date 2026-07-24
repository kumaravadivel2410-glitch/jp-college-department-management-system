import Assignment from '../models/Assignment.js';
import Note from '../models/Note.js';

// Assignments
export const getAssignments = async (req, res) => {
  try {
    const { department, subjectCode } = req.query;
    let query = {};
    if (department && department !== 'All') query.department = department;
    if (subjectCode && subjectCode !== 'All') query.subjectCode = subjectCode;

    const list = await Assignment.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, data: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createAssignment = async (req, res) => {
  try {
    const record = await Assignment.create(req.body);
    return res.status(201).json({ success: true, message: 'Assignment created', data: record });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Assignment deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Notes
export const getNotes = async (req, res) => {
  try {
    const { department, subjectCode } = req.query;
    let query = {};
    if (department && department !== 'All') query.department = department;
    if (subjectCode && subjectCode !== 'All') query.subjectCode = subjectCode;

    const list = await Note.find(query).sort({ unitNumber: 1 });
    return res.json({ success: true, data: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createNote = async (req, res) => {
  try {
    const record = await Note.create(req.body);
    return res.status(201).json({ success: true, message: 'Subject Note added', data: record });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Subject Note deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
