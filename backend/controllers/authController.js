import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import generateToken from '../utils/generateToken.js';

// POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { identifier, email, password } = req.body;
    const loginId = (identifier || email || '').trim();

    if (!loginId || !password) {
      return res.status(400).json({ success: false, message: 'Please provide Login ID / Register No / Faculty ID and password' });
    }

    const cleanId = loginId.toUpperCase();

    // 1. Check Student by Register Number
    const student = await Student.findOne({ registerNumber: cleanId });
    if (student) {
      let user = await User.findOne({ registerNumber: cleanId });
      let isDefaultPass = (password === cleanId || password === 'student123');
      let isMatch = false;

      if (user) {
        isMatch = await bcrypt.compare(password, user.password);
      } else {
        isMatch = isDefaultPass;
      }

      if (isMatch) {
        // If logging in with default password or user.isFirstLogin is true, trigger mandatory password change
        if (isDefaultPass || (user && user.isFirstLogin)) {
          return res.json({
            success: true,
            mustChangePassword: true,
            message: 'First login detected! Please change your default password.',
            user: {
              id: student._id,
              registerNumber: student.registerNumber,
              name: student.name,
              role: 'Student'
            }
          });
        }

        const token = generateToken(student._id, 'Student');
        return res.json({
          success: true,
          mustChangePassword: false,
          message: 'Student authentication successful',
          token,
          user: {
            id: student._id,
            name: student.name,
            email: student.email,
            registerNumber: student.registerNumber,
            role: 'Student',
            department: student.department,
            year: student.year,
            semester: student.semester,
            section: student.section,
            cgpa: student.cgpa,
            photoUrl: student.photoUrl
          }
        });
      }
    }

    // 2. Check Faculty by Faculty ID
    const faculty = await Faculty.findOne({ facultyId: cleanId });
    if (faculty) {
      let user = await User.findOne({ facultyId: cleanId });
      let isDefaultPass = (password === 'faculty123');
      let isMatch = false;

      if (user) {
        isMatch = await bcrypt.compare(password, user.password);
      } else {
        isMatch = isDefaultPass;
      }

      if (isMatch) {
        if (isDefaultPass || (user && user.isFirstLogin)) {
          return res.json({
            success: true,
            mustChangePassword: true,
            message: 'First login detected! Please change your default faculty password.',
            user: {
              id: faculty._id,
              facultyId: faculty.facultyId,
              name: faculty.name,
              role: 'Faculty'
            }
          });
        }

        const token = generateToken(faculty._id, 'Faculty');
        return res.json({
          success: true,
          mustChangePassword: false,
          message: 'Faculty authentication successful',
          token,
          user: {
            id: faculty._id,
            name: faculty.name,
            email: faculty.email,
            facultyId: faculty.facultyId,
            role: 'Faculty',
            department: faculty.department,
            designation: faculty.designation,
            assignedSubjects: faculty.assignedSubjects,
            assignedClasses: faculty.assignedClasses,
            photoUrl: faculty.photoUrl
          }
        });
      }
    }

    // 3. Check Admin / General User by Email
    const user = await User.findOne({ email: loginId.toLowerCase() });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user._id, user.role);
      return res.json({
        success: true,
        mustChangePassword: false,
        message: 'Authentication successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department
        }
      });
    }

    // Fallback Demo Login for Admin/Faculty/Student preview
    if (password === 'admin123' || password === 'faculty123' || password === 'student123' || password === cleanId) {
      let role = 'Admin';
      if (cleanId.includes('FAC') || loginId.includes('faculty') || password === 'faculty123') role = 'Faculty';
      if (cleanId.startsWith('9511') || loginId.includes('student') || password === 'student123' || password === cleanId) role = 'Student';

      // Check default pass force change trigger for demo
      if ((role === 'Faculty' && password === 'faculty123') || (role === 'Student' && (password === 'student123' || password === cleanId))) {
        return res.json({
          success: true,
          mustChangePassword: true,
          message: 'First login detected! Please change your default password.',
          user: {
            id: 'demo_' + Date.now(),
            registerNumber: role === 'Student' ? cleanId : '',
            facultyId: role === 'Faculty' ? cleanId : '',
            name: cleanId + ` (${role})`,
            role
          }
        });
      }

      const demoUser = {
        id: 'demo_' + Date.now(),
        name: cleanId + ` (${role})`,
        email: loginId.includes('@') ? loginId : `${cleanId.toLowerCase()}@jpcollege.edu`,
        registerNumber: role === 'Student' ? cleanId : '',
        facultyId: role === 'Faculty' ? cleanId : '',
        role,
        department: 'Computer Science',
        year: 3,
        semester: 6,
        section: 'A',
        cgpa: 8.75
      };

      const token = generateToken(demoUser.id, role);
      return res.json({
        success: true,
        mustChangePassword: false,
        message: 'Demo Authentication successful',
        token,
        user: demoUser
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid Credentials (Register Number / Faculty ID / Email or Password)' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/change-password
export const changePassword = async (req, res) => {
  try {
    const { identifier, newPassword } = req.body;
    if (!identifier || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    const cleanId = identifier.toUpperCase().trim();

    // Update User record if exists or create
    await User.updateOne(
      { $or: [{ registerNumber: cleanId }, { facultyId: cleanId }, { email: identifier.toLowerCase() }] },
      { $set: { password: hashedPassword, isFirstLogin: false } },
      { upsert: true }
    );

    // Return token
    const token = generateToken(cleanId, 'User');
    return res.json({
      success: true,
      message: 'Password updated successfully! You may now sign in with your new password.',
      token
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/logout
export const logoutUser = async (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully' });
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    if (req.user) {
      return res.json({ success: true, user: req.user });
    }
    return res.status(404).json({ success: false, message: 'User profile not found' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role = 'student', department, registerNo, facultyId, designation } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let createdUser;
    let formattedRole = 'Admin';
    if (role.toLowerCase() === 'student') formattedRole = 'Student';
    if (role.toLowerCase() === 'faculty') formattedRole = 'Faculty';

    createdUser = await User.create({
      name,
      email: cleanEmail,
      password: hashedPassword,
      role: formattedRole,
      department: department || 'Computer Science',
      registerNumber: registerNo || '',
      facultyId: facultyId || '',
      isFirstLogin: false
    });

    if (formattedRole === 'Student' && registerNo) {
      await Student.updateOne(
        { registerNumber: registerNo.toUpperCase().trim() },
        {
          $set: {
            name,
            email: cleanEmail,
            registerNumber: registerNo.toUpperCase().trim(),
            department: department || 'Computer Science'
          }
        },
        { upsert: true }
      );
    } else if (formattedRole === 'Faculty' && facultyId) {
      await Faculty.updateOne(
        { facultyId: facultyId.toUpperCase().trim() },
        {
          $set: {
            name,
            email: cleanEmail,
            facultyId: facultyId.toUpperCase().trim(),
            department: department || 'Computer Science',
            designation: designation || 'Assistant Professor'
          }
        },
        { upsert: true }
      );
    }

    const token = generateToken(createdUser._id, formattedRole);

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
        department: createdUser.department
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
