import Faculty from '../models/Faculty.js';

// GET /api/faculty
export const getFaculty = async (req, res) => {
  try {
    const { search, department, page = 1, limit = 10 } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { facultyId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    const total = await Faculty.countDocuments(query);
    const faculty = await Faculty.find(query)
      .sort({ facultyId: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.json({
      success: true,
      data: faculty,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/faculty
export const createFaculty = async (req, res) => {
  try {
    const { facultyId, name, email, department, designation, qualification, phone, experienceYears } = req.body;
    
    const existing = await Faculty.findOne({ facultyId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Faculty ID already exists' });
    }

    const newFaculty = await Faculty.create({
      facultyId,
      name,
      email,
      department,
      designation: designation || 'Assistant Professor',
      qualification: qualification || 'M.E. / M.Tech',
      phone: phone || '',
      experienceYears: experienceYears || 0
    });

    return res.status(201).json({ success: true, message: 'Faculty created successfully', data: newFaculty });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/faculty/:id
export const updateFaculty = async (req, res) => {
  try {
    const updated = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Faculty record not found' });
    }
    return res.json({ success: true, message: 'Faculty updated successfully', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/faculty/:id
export const deleteFaculty = async (req, res) => {
  try {
    const deleted = await Faculty.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Faculty record not found' });
    }
    return res.json({ success: true, message: 'Faculty record deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
