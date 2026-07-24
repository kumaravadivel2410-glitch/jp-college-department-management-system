import InternalMark from '../models/InternalMark.js';
import SemesterMark from '../models/SemesterMark.js';

// Grade Calculator helper according to Anna University Regulations 2021
const calculateAnnaUnivGrade = (totalMarks) => {
  if (totalMarks >= 90) return { grade: 'O', points: 10, result: 'Pass' };
  if (totalMarks >= 80) return { grade: 'A+', points: 9, result: 'Pass' };
  if (totalMarks >= 70) return { grade: 'A', points: 8, result: 'Pass' };
  if (totalMarks >= 60) return { grade: 'B+', points: 7, result: 'Pass' };
  if (totalMarks >= 50) return { grade: 'B', points: 6, result: 'Pass' };
  if (totalMarks >= 45) return { grade: 'C', points: 5, result: 'Pass' };
  return { grade: 'RA', points: 0, result: 'Re-appear (Arrear)' };
};

// Internal Marks (CIA 1, CIA 2, Model, Assignment)
export const getInternalMarks = async (req, res) => {
  try {
    const { department, examType, subjectCode, registerNumber } = req.query;
    let query = {};
    if (department && department !== 'All') query.department = department;
    if (examType && examType !== 'All') query.examType = examType;
    if (subjectCode && subjectCode !== 'All') query.subjectCode = subjectCode;
    if (registerNumber) query.registerNumber = registerNumber.toUpperCase();

    const marks = await InternalMark.find(query).sort({ registerNumber: 1 });
    return res.json({ success: true, data: marks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createInternalMark = async (req, res) => {
  try {
    const record = await InternalMark.create(req.body);
    return res.status(201).json({ success: true, message: 'Anna University CIA mark saved', data: record });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateInternalMark = async (req, res) => {
  try {
    const updated = await InternalMark.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json({ success: true, message: 'Internal mark updated', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteInternalMark = async (req, res) => {
  try {
    await InternalMark.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Internal mark deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Semester Marks & GPA Calculation
export const getSemesterMarks = async (req, res) => {
  try {
    const { department, semester, registerNumber } = req.query;
    let query = {};
    if (department && department !== 'All') query.department = department;
    if (semester && semester !== 'All') query.semester = Number(semester);
    if (registerNumber) query.registerNumber = registerNumber.toUpperCase();

    const marks = await SemesterMark.find(query).sort({ registerNumber: 1 });
    return res.json({ success: true, data: marks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createSemesterMark = async (req, res) => {
  try {
    const { totalMarks = 85 } = req.body;
    const gradeInfo = calculateAnnaUnivGrade(totalMarks);

    const record = await SemesterMark.create({
      ...req.body,
      gpa: gradeInfo.points,
      status: gradeInfo.result
    });

    return res.status(201).json({ success: true, message: 'Anna University end-semester result saved', data: record });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSemesterMark = async (req, res) => {
  try {
    const updated = await SemesterMark.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json({ success: true, message: 'Semester result updated', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSemesterMark = async (req, res) => {
  try {
    await SemesterMark.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Semester result deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
