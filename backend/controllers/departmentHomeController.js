import DepartmentHome from '../models/DepartmentHome.js';

// GET /api/department-home/:deptCode
export const getDepartmentHome = async (req, res) => {
  try {
    const code = req.params.deptCode.toUpperCase();
    let deptHome = await DepartmentHome.findOne({ departmentCode: code });

    if (!deptHome) {
      deptHome = await DepartmentHome.create({
        departmentCode: code,
        departmentName: code === 'CSE' ? 'Computer Science & Engineering' :
                        code === 'ECE' ? 'Electronics & Communication Engineering' :
                        code === 'EEE' ? 'Electrical & Electronics Engineering' :
                        code === 'MECH' ? 'Mechanical Engineering' :
                        code === 'CIVIL' ? 'Civil Engineering' :
                        'Artificial Intelligence & Data Science'
      });
    }

    return res.json({ success: true, data: deptHome });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/department-home/:deptCode (HOD Admin Updates)
export const updateDepartmentHome = async (req, res) => {
  try {
    const code = req.params.deptCode.toUpperCase();
    let updated = await DepartmentHome.findOneAndUpdate(
      { departmentCode: code },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );

    return res.json({
      success: true,
      message: `Department Home for ${code} updated successfully!`,
      data: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
