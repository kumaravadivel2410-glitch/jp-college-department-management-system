import Department from '../models/Department.js';

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({}).sort({ code: 1 });
    return res.json({ success: true, data: departments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const newDept = await Department.create(req.body);
    return res.status(201).json({ success: true, message: 'Department created successfully', data: newDept });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const updated = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json({ success: true, message: 'Department updated', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Department deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
