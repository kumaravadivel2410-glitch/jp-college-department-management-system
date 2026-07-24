import ClassModel from '../models/ClassModel.js';

export const getClasses = async (req, res) => {
  try {
    const classes = await ClassModel.find({}).sort({ className: 1 });
    return res.json({ success: true, data: classes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createClass = async (req, res) => {
  try {
    const newClass = await ClassModel.create(req.body);
    return res.status(201).json({ success: true, message: 'Class created', data: newClass });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateClass = async (req, res) => {
  try {
    const updated = await ClassModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json({ success: true, message: 'Class updated', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteClass = async (req, res) => {
  try {
    await ClassModel.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Class deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
