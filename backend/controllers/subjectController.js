import Subject from '../models/Subject.js';

export const getSubjects = async (req, res) => {
  try {
    const { department, semester } = req.query;
    let query = {};
    if (department && department !== 'All') query.department = department;
    if (semester && semester !== 'All') query.semester = Number(semester);

    const subjects = await Subject.find(query).sort({ code: 1 });
    return res.json({ success: true, data: subjects });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createSubject = async (req, res) => {
  try {
    const newSubject = await Subject.create(req.body);
    return res.status(201).json({ success: true, message: 'Subject created', data: newSubject });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const updated = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json({ success: true, message: 'Subject updated', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Subject deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
