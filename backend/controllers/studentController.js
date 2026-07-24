import Student from '../models/Student.js';

// GET /api/students
export const getStudents = async (req, res) => {
  try {
    const { search, department, year, semester, section, status, page = 1, limit = 50 } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { registerNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (department && department !== 'All') query.department = department;
    if (year && year !== 'All') query.year = Number(year);
    if (semester && semester !== 'All') query.semester = Number(semester);
    if (section && section !== 'All') query.section = section;
    if (status && status !== 'All') query.status = status;

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .sort({ registerNumber: 1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return res.json({
      success: true,
      data: students,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/students
export const createStudent = async (req, res) => {
  try {
    const { registerNumber, name, email, department, year, semester, section, phone, cgpa, photoUrl } = req.body;
    
    if (!registerNumber || !name || !email || !department) {
      return res.status(400).json({ success: false, message: 'Register Number, Name, Email and Department are required' });
    }

    const cleanReg = registerNumber.toUpperCase().trim();
    const existing = await Student.findOne({ registerNumber: cleanReg });
    if (existing) {
      return res.status(400).json({ success: false, message: `Register Number ${cleanReg} already exists in database` });
    }

    const newStudent = await Student.create({
      registerNumber: cleanReg,
      name,
      email: email.toLowerCase().trim(),
      department,
      year: year || 1,
      semester: semester || 1,
      section: section || 'A',
      phone: phone || '',
      cgpa: cgpa || 0,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });

    return res.status(201).json({ success: true, message: 'Student created successfully', data: newStudent });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/students/:id
export const updateStudent = async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    return res.json({ success: true, message: 'Student updated successfully', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/students/:id
export const deleteStudent = async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Student record not found or already deleted' });
    }
    return res.json({ success: true, message: 'Student record deleted successfully', id: req.params.id });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Delete operation failed' });
  }
};

// POST /api/students/promote
export const promoteStudents = async (req, res) => {
  try {
    const { studentIds, targetYear, targetSemester } = req.body;
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No students selected for academic promotion' });
    }

    await Student.updateMany(
      { _id: { $in: studentIds } },
      { $set: { year: targetYear, semester: targetSemester } }
    );

    return res.json({ success: true, message: `Successfully promoted ${studentIds.length} students to Year ${targetYear} / Sem ${targetSemester}` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
