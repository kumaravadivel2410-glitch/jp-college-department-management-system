const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const Subject = require('../models/Subject');
const ClassModel = require('../models/ClassModel');
const Attendance = require('../models/Attendance');
const SemesterMark = require('../models/SemesterMark');
const InternalMark = require('../models/InternalMark');
const History = require('../models/History');
const Setting = require('../models/Setting');
const User = require('../models/User');
const Note = require('../models/Note');
const Notification = require('../models/Notification');
const Report = require('../models/Report');
const Assignment = require('../models/Assignment');
const Timetable = require('../models/Timetable');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// Initial MongoDB Atlas Seed Data
const SEED_DATA = {
  departments: [
    { code: 'AI&DS', name: 'Artificial Intelligence & Data Science', hodName: 'Dr. M. Senthil Kumar', description: 'Cutting-edge AI, Machine Learning, and Big Data technologies.', establishedYear: '2021' },
    { code: 'CSE', name: 'Computer Science & Engineering', hodName: 'Dr. K. Ramanathan', description: 'Core software development, algorithms, and cybersecurity.', establishedYear: '2010' },
    { code: 'ECE', name: 'Electronics & Communication Engineering', hodName: 'Dr. R. Meenakshi', description: 'VLSI, embedded systems, signal processing, and robotics.', establishedYear: '2010' },
    { code: 'EEE', name: 'Electrical & Electronics Engineering', hodName: 'Prof. A. Vijay', description: 'Power systems, renewable energy, and smart grids.', establishedYear: '2012' },
    { code: 'MECH', name: 'Mechanical Engineering', hodName: 'Dr. S. Karthik', description: 'Thermal, CAD/CAM, automotive engineering, and mechatronics.', establishedYear: '2010' },
    { code: 'CIVIL', name: 'Civil Engineering', hodName: 'Prof. P. Lakshmi', description: 'Structural engineering, surveying, and green construction.', establishedYear: '2014' }
  ],
  faculty: [
    { facultyId: 'JPC-FAC-101', facultyName: 'Dr. M. Senthil Kumar', department: 'AI & DS', subject: 'Machine Learning', qualification: 'Ph.D. in AI', phone: '9876543210', email: 'senthil@jpcoe.ac.in', experience: '12 Years', designation: 'Professor & HOD', approvalStatus: 'approved' },
    { facultyId: 'JPC-FAC-102', facultyName: 'Prof. Anitha Raj', department: 'CSE', subject: 'Data Structures', qualification: 'M.E. Computer Science', phone: '9876543211', email: 'anitha@jpcoe.ac.in', experience: '8 Years', designation: 'Associate Professor', approvalStatus: 'approved' }
  ],
  students: [
    { registerNo: '953621104001', studentName: 'Aarav Kumar', rollNumber: '21AD01', department: 'AI & DS', year: 'III Year', semester: 'Semester V', section: 'A', phone: '9123456780', email: 'aarav.21ad@jpcoe.ac.in', address: 'Tenkasi, Tamil Nadu', parentName: 'R. Kumar', parentPhone: '9443322110', bloodGroup: 'O+', dateOfBirth: '2003-05-14', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', approvalStatus: 'approved' },
    { registerNo: '953621104002', studentName: 'Bhavna Sharma', rollNumber: '21AD02', department: 'AI & DS', year: 'III Year', semester: 'Semester V', section: 'A', phone: '9123456781', email: 'bhavna.21ad@jpcoe.ac.in', address: 'Tirunelveli, Tamil Nadu', parentName: 'S. Sharma', parentPhone: '9443322111', bloodGroup: 'A+', dateOfBirth: '2003-08-22', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', approvalStatus: 'approved' }
  ],
  subjects: [
    { subjectCode: 'AD3501', subjectName: 'Deep Learning', credits: 4, facultyName: 'Dr. M. Senthil Kumar', department: 'AI & DS', semester: 'Semester V' },
    { subjectCode: 'CS3401', subjectName: 'Algorithms & Data Structures', credits: 3, facultyName: 'Prof. Anitha Raj', department: 'CSE', semester: 'Semester V' }
  ],
  classes: [
    { className: 'III AI&DS A', department: 'AI & DS', year: 'III Year', semester: 'Semester V', section: 'A', classAdvisor: 'Dr. M. Senthil Kumar' },
    { className: 'III CSE B', department: 'CSE', year: 'III Year', semester: 'Semester V', section: 'B', classAdvisor: 'Prof. Anitha Raj' }
  ],
  attendance: [
    { studentRegisterNo: '953621104001', studentName: 'Aarav Kumar', department: 'AI & DS', year: 'III Year', semester: 'Semester V', section: 'A', date: new Date().toISOString().split('T')[0], session: 'Full Day', morningStatus: 'Present', afternoonStatus: 'Present', status: 'Present', percentage: 96, remarks: 'On Time' },
    { studentRegisterNo: '953621104002', studentName: 'Bhavna Sharma', department: 'AI & DS', year: 'III Year', semester: 'Semester V', section: 'A', date: new Date().toISOString().split('T')[0], session: 'Full Day', morningStatus: 'Present', afternoonStatus: 'Present', status: 'Present', percentage: 98, remarks: 'On Time' }
  ],
  semesterMarks: [
    { studentRegisterNo: '953621104001', studentName: 'Aarav Kumar', department: 'AI & DS', year: 'III Year', semester: 'Semester V', section: 'A', subjectCode: 'AD3501', subjectName: 'Deep Learning', grade: 'O', marks: 95, credits: 4, gpa: 9.5, cgpa: 9.2, arrears: 0, result: 'PASS' },
    { studentRegisterNo: '953621104002', studentName: 'Bhavna Sharma', department: 'AI & DS', year: 'III Year', semester: 'Semester V', section: 'A', subjectCode: 'AD3501', subjectName: 'Deep Learning', grade: 'A+', marks: 89, credits: 4, gpa: 8.9, cgpa: 8.8, arrears: 0, result: 'PASS' }
  ],
  internalMarks: [
    { studentRegisterNo: '953621104001', studentName: 'Aarav Kumar', department: 'AI & DS', year: 'III Year', semester: 'Semester V', section: 'A', subjectCode: 'AD3501', subjectName: 'Deep Learning', facultyName: 'Dr. M. Senthil Kumar', internal1: 48, internal2: 46, internal3: 49, average: 47.6, modelExam: 92, assignmentMark: 10, totalInternal: 98, lastUpdated: '2026-07-20' },
    { studentRegisterNo: '953621104002', studentName: 'Bhavna Sharma', department: 'AI & DS', year: 'III Year', semester: 'Semester V', section: 'A', subjectCode: 'AD3501', subjectName: 'Deep Learning', facultyName: 'Dr. M. Senthil Kumar', internal1: 45, internal2: 47, internal3: 46, average: 46.0, modelExam: 89, assignmentMark: 10, totalInternal: 94, lastUpdated: '2026-07-20' }
  ],
  notes: [
    {
      title: 'Deep Learning Module 1 - Neural Networks Overview',
      department: 'AI & DS',
      semester: 'Semester V',
      section: 'A',
      subjectCode: 'AD3501',
      subjectName: 'Deep Learning',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: 'pdf',
      fileName: 'DL_Module1_Notes.pdf',
      fileSize: '2.4 MB',
      uploadedBy: 'Dr. M. Senthil Kumar',
      uploaderEmail: 'senthil@jpcoe.ac.in'
    }
  ],
  assignments: [
    {
      title: 'Assignment 1: Convolutional Neural Networks (CNN) Architecture',
      description: 'Implement a ResNet model for image classification using PyTorch/TensorFlow.',
      department: 'AI & DS',
      year: 'III Year',
      semester: 'Semester V',
      section: 'A',
      subjectCode: 'AD3501',
      subjectName: 'Deep Learning',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      dueDate: '2026-07-28',
      uploadedBy: 'Dr. M. Senthil Kumar',
      uploaderEmail: 'senthil@jpcoe.ac.in',
      submissions: [
        { studentRegisterNo: '953621104001', studentName: 'Aarav Kumar', submissionUrl: 'https://github.com/example/cnn-assignment', submittedAt: new Date(), grade: 'A+', status: 'Graded' }
      ]
    }
  ],
  timetables: [
    {
      department: 'AI & DS',
      year: 'III Year',
      semester: 'Semester V',
      section: 'A',
      day: 'Monday',
      schedule: [
        { period: '09:00 - 10:00 AM', subjectCode: 'AD3501', subjectName: 'Deep Learning', facultyName: 'Dr. M. Senthil Kumar', roomNo: 'LH-301' },
        { period: '10:00 - 11:00 AM', subjectCode: 'AD3502', subjectName: 'Big Data Analytics', facultyName: 'Prof. Anitha Raj', roomNo: 'LH-301' },
        { period: '11:15 - 12:15 PM', subjectCode: 'AD3503', subjectName: 'Computer Vision', facultyName: 'Dr. R. Meenakshi', roomNo: 'AI Lab' }
      ]
    }
  ],
  notifications: [
    { title: 'Welcome to JP College ERP', message: 'System updated with Black & Gold Theme and Multi-Portal ERP System.', type: 'system', recipientRole: 'all' }
  ]
};

// Ensure permanent Super Admin account exists during startup
const ensureSuperAdminAccount = async () => {
  try {
    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'Adminjpcoe@gmail.com').toLowerCase().trim();
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Adminhod123';

    let superAdmin = await User.findOne({ email: superAdminEmail });

    if (!superAdmin) {
      const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
      superAdmin = new User({
        email: superAdminEmail,
        password: hashedPassword,
        role: 'super_admin',
        name: 'Super Admin',
        status: 'Approved',
        isApproved: true,
        isActive: true,
        isProtected: true,
        department: 'General'
      });
      await superAdmin.save();
    } else {
      let modified = false;
      if (superAdmin.role !== 'super_admin') { superAdmin.role = 'super_admin'; modified = true; }
      if (superAdmin.status !== 'Approved') { superAdmin.status = 'Approved'; modified = true; }
      if (!superAdmin.isApproved) { superAdmin.isApproved = true; modified = true; }
      if (!superAdmin.isActive) { superAdmin.isActive = true; modified = true; }
      if (!superAdmin.isProtected) { superAdmin.isProtected = true; modified = true; }

      if (modified) {
        await superAdmin.save();
      }
    }

    console.log('Default Super Admin account verified successfully.');
  } catch (err) {
    console.error('Error verifying Super Admin account:', err.message);
  }
};

// Seed MongoDB Atlas automatically
const autoSeedDatabase = async () => {
  try {
    await ensureSuperAdminAccount();

    const facultyPass = await bcrypt.hash('faculty123', 10);
    const studentPass = await bcrypt.hash('student123', 10);

    const initialUsers = [
      { email: 'senthil@jpcoe.ac.in', password: facultyPass, role: 'faculty', name: 'Dr. M. Senthil Kumar', status: 'Approved', isApproved: true, isActive: true, department: 'AI & DS', facultyId: 'JPC-FAC-101' },
      { email: 'anitha@jpcoe.ac.in', password: facultyPass, role: 'faculty', name: 'Prof. Anitha Raj', status: 'Approved', isApproved: true, isActive: true, department: 'CSE', facultyId: 'JPC-FAC-102' },
      { email: 'aarav.21ad@jpcoe.ac.in', password: studentPass, role: 'student', name: 'Aarav Kumar', status: 'Approved', isApproved: true, isActive: true, department: 'AI & DS', registerNo: '953621104001', rollNumber: '21AD01', year: 'III Year', semester: 'Semester V', section: 'A' },
      { email: 'bhavna.21ad@jpcoe.ac.in', password: studentPass, role: 'student', name: 'Bhavna Sharma', status: 'Approved', isApproved: true, isActive: true, department: 'AI & DS', registerNo: '953621104002', rollNumber: '21AD02', year: 'III Year', semester: 'Semester V', section: 'A' }
    ];

    for (const u of initialUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
      }
    }

    const deptCount = await Department.countDocuments();
    if (deptCount === 0) {
      await Department.insertMany(SEED_DATA.departments);
      await Faculty.insertMany(SEED_DATA.faculty);
      await Student.insertMany(SEED_DATA.students);
      await Subject.insertMany(SEED_DATA.subjects);
      await ClassModel.insertMany(SEED_DATA.classes);
      await Attendance.insertMany(SEED_DATA.attendance);
      await SemesterMark.insertMany(SEED_DATA.semesterMarks);
      await InternalMark.insertMany(SEED_DATA.internalMarks);
      await Note.insertMany(SEED_DATA.notes);
      await Assignment.insertMany(SEED_DATA.assignments);
      await Timetable.insertMany(SEED_DATA.timetables);
      await Notification.insertMany(SEED_DATA.notifications);
      console.log('✅ Initial Multi-Portal Collections Seeded Successfully!');
    }
  } catch (err) {
    console.error('Error auto-seeding database:', err);
  }
};

// Generic CRUD helper generator with Dept -> Year -> Sem -> Sec filters, pagination & search
const createCrudControllers = (Model, modelName) => ({
  getAll: async (req, res) => {
    try {
      let filter = {};
      if (req.query.department && req.query.department !== 'All') filter.department = req.query.department;
      if (req.query.year && req.query.year !== 'All') filter.year = req.query.year;
      if (req.query.semester && req.query.semester !== 'All') filter.semester = req.query.semester;
      if (req.query.section && req.query.section !== 'All') filter.section = req.query.section;
      if (req.query.registerNo) filter.registerNo = req.query.registerNo;
      if (req.query.studentRegisterNo) filter.studentRegisterNo = req.query.studentRegisterNo;
      if (req.query.email) filter.email = req.query.email;
      if (req.query.subjectCode) filter.subjectCode = req.query.subjectCode;

      if (req.query.search) {
        const regex = new RegExp(req.query.search, 'i');
        filter.$or = [
          { studentName: regex },
          { registerNo: regex },
          { rollNumber: regex },
          { facultyName: regex },
          { facultyId: regex },
          { subjectName: regex },
          { subjectCode: regex }
        ];
      }

      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 1000;
      const skip = (page - 1) * limit;

      const [totalCount, items] = await Promise.all([
        Model.countDocuments(filter),
        Model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()
      ]);

      res.json({
        success: true,
        count: totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
        data: items
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
  create: async (req, res) => {
    try {
      const item = new Model(req.body);
      await item.save();

      await History.create({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        action: `Create ${modelName}`,
        user: req.user ? req.user.email : 'System User',
        department: req.body.department || 'General',
        details: `Created new ${modelName} record`
      });

      res.status(201).json({ success: true, message: `${modelName} created successfully`, data: item });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
  update: async (req, res) => {
    try {
      const existing = await Model.findById(req.params.id);
      if (!existing) return res.status(404).json({ success: false, error: `${modelName} not found` });

      if (modelName === 'User' && (existing.isProtected || existing.email.toLowerCase() === (process.env.SUPER_ADMIN_EMAIL || 'Adminjpcoe@gmail.com').toLowerCase())) {
        return res.status(403).json({ success: false, message: 'Permanent Super Admin account cannot be modified or deleted.' });
      }

      // Validation for Internal Marks
      if (modelName === 'InternalMark') {
        const int1 = Number(req.body.internal1 !== undefined ? req.body.internal1 : existing.internal1);
        const int2 = Number(req.body.internal2 !== undefined ? req.body.internal2 : existing.internal2);
        const int3 = Number(req.body.internal3 !== undefined ? req.body.internal3 : existing.internal3);
        const modelExam = Number(req.body.modelExam !== undefined ? req.body.modelExam : existing.modelExam);
        const assignment = Number(req.body.assignmentMark !== undefined ? req.body.assignmentMark : existing.assignmentMark);

        if (int1 > 50 || int2 > 50 || int3 > 50) return res.status(400).json({ success: false, message: 'Internal Assessment marks cannot exceed 50.' });
        if (modelExam > 100) return res.status(400).json({ success: false, message: 'Model Exam marks cannot exceed 100.' });
        if (assignment > 10) return res.status(400).json({ success: false, message: 'Assignment mark cannot exceed 10.' });

        req.body.average = Math.round(((int1 + int2 + int3) / 3) * 10) / 10;
        req.body.totalInternal = Math.round((req.body.average / 50) * 40 + assignment);
        req.body.lastUpdated = new Date().toISOString().split('T')[0];
      }

      // Validation for Semester Marks
      if (modelName === 'SemesterMark') {
        const marks = Number(req.body.marks !== undefined ? req.body.marks : existing.marks);
        if (marks > 100) return res.status(400).json({ success: false, message: 'Semester marks cannot exceed 100.' });

        req.body.result = marks >= 45 ? 'PASS' : 'FAIL';
        if (marks >= 90) req.body.grade = 'O';
        else if (marks >= 80) req.body.grade = 'A+';
        else if (marks >= 70) req.body.grade = 'A';
        else if (marks >= 60) req.body.grade = 'B+';
        else if (marks >= 45) req.body.grade = 'B';
        else req.body.grade = 'U';

        req.body.gpa = Math.round((marks / 10) * 10) / 10;
      }

      const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

      // Audit History Logging
      await History.create({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        action: `Update ${modelName}`,
        user: req.user ? req.user.email : 'System User',
        department: existing.department || 'General',
        details: `Updated ${modelName} ID: ${existing._id}`
      });

      res.json({ success: true, message: `${modelName} updated successfully`, data: item });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
  delete: async (req, res) => {
    try {
      const existing = await Model.findById(req.params.id);
      if (!existing) return res.status(404).json({ success: false, error: `${modelName} not found` });

      if (modelName === 'User' && (existing.isProtected || existing.email.toLowerCase() === (process.env.SUPER_ADMIN_EMAIL || 'Adminjpcoe@gmail.com').toLowerCase())) {
        return res.status(403).json({ success: false, message: 'Permanent Super Admin account cannot be modified or deleted.' });
      }

      await Model.findByIdAndDelete(req.params.id);

      await History.create({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        action: `Delete ${modelName}`,
        user: req.user ? req.user.email : 'System User',
        department: existing.department || 'General',
        details: `Deleted ${modelName} ID: ${existing._id}`
      });

      res.json({ success: true, message: `${modelName} deleted successfully` });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
});

// AUTH CONTROLLERS
const auth = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
      }

      const cleanEmail = email.toLowerCase().trim();
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      if (user.status === 'Pending' || (!user.isApproved && user.role !== 'super_admin')) {
        return res.status(403).json({
          success: false,
          status: 'Pending',
          message: 'Your account is waiting for Super Admin approval.'
        });
      }

      if (user.status === 'Rejected') {
        return res.status(403).json({
          success: false,
          status: 'Rejected',
          message: 'Your registration request has been rejected. Please contact the administrator.'
        });
      }

      const payload = {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        department: user.department,
        year: user.year,
        semester: user.semester,
        section: user.section,
        facultyId: user.facultyId,
        registerNo: user.registerNo,
        rollNumber: user.rollNumber,
        photo: user.photo
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: payload
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  register: async (req, res) => {
    try {
      const {
        name, email, password, role, department, mobileNumber, address, photo,
        employeeId, reasonForAdmin, registerNo, rollNumber, year, semester, section,
        facultyId, designation, subjectsAssigned, qualification
      } = req.body;

      if (!name || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'Please fill in all required registration fields.' });
      }

      const cleanEmail = email.toLowerCase().trim();
      
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email address is already registered.' });
      }

      if (role === 'student' && registerNo) {
        const existingRegNo = await User.findOne({ registerNo: registerNo.trim() });
        if (existingRegNo) {
          return res.status(400).json({ success: false, message: 'Register Number already exists.' });
        }
      }

      if (role === 'faculty' && facultyId) {
        const existingFacId = await User.findOne({ facultyId: facultyId.trim() });
        if (existingFacId) {
          return res.status(400).json({ success: false, message: 'Faculty ID already exists.' });
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const targetRole = role === 'admin' ? 'admin' : (role === 'faculty' ? 'faculty' : 'student');

      const user = new User({
        name,
        email: cleanEmail,
        password: hashedPassword,
        role: targetRole,
        status: 'Pending',
        isApproved: false,
        department: department || 'General',
        mobileNumber: mobileNumber || '',
        address: address || '',
        photo: photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        employeeId: employeeId || '',
        reasonForAdmin: reasonForAdmin || '',
        registerNo: registerNo || '',
        rollNumber: rollNumber || '',
        year: year || 'III Year',
        semester: semester || 'Semester V',
        section: section || 'A',
        facultyId: facultyId || '',
        designation: designation || '',
        subjectsAssigned: subjectsAssigned || '',
        qualification: qualification || ''
      });

      await user.save();

      res.status(201).json({
        success: true,
        message: 'Your registration has been submitted successfully. Please wait for Super Admin approval.',
        status: 'Pending'
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  getPendingCategorized: async (req, res) => {
    try {
      const pendingUsers = await User.find({ status: 'Pending' }).select('-password').sort({ createdAt: -1 });
      
      res.json({
        success: true,
        counts: {
          total: pendingUsers.length,
          students: pendingUsers.filter(u => u.role === 'student').length,
          faculty: pendingUsers.filter(u => u.role === 'faculty').length,
          adminRequests: pendingUsers.filter(u => u.role === 'admin').length
        },
        data: {
          students: pendingUsers.filter(u => u.role === 'student'),
          faculty: pendingUsers.filter(u => u.role === 'faculty'),
          adminRequests: pendingUsers.filter(u => u.role === 'admin')
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  approveUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'Registration request not found.' });

      user.status = 'Approved';
      user.isApproved = true;
      user.approvedBy = req.user ? req.user.email : 'Super Admin';
      user.approvedAt = new Date();
      await user.save();

      if (user.role === 'faculty' && user.facultyId) {
        await Faculty.findOneAndUpdate(
          { email: user.email },
          {
            facultyId: user.facultyId,
            facultyName: user.name,
            department: user.department,
            email: user.email,
            phone: user.mobileNumber,
            qualification: user.qualification,
            designation: user.designation,
            subject: user.subjectsAssigned,
            photo: user.photo,
            approvalStatus: 'approved'
          },
          { upsert: true, new: true }
        );
      } else if (user.role === 'student' && user.registerNo) {
        await Student.findOneAndUpdate(
          { email: user.email },
          {
            registerNo: user.registerNo,
            studentName: user.name,
            rollNumber: user.rollNumber,
            department: user.department,
            year: user.year,
            semester: user.semester,
            section: user.section,
            email: user.email,
            phone: user.mobileNumber,
            address: user.address,
            photo: user.photo,
            approvalStatus: 'approved'
          },
          { upsert: true, new: true }
        );
      }

      res.json({ success: true, message: `Account for ${user.name} approved successfully!` });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  rejectUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'Registration request not found.' });

      if (user.isProtected || user.role === 'super_admin') {
        return res.status(403).json({ success: false, message: 'Default Super Admin account cannot be rejected.' });
      }

      user.status = 'Rejected';
      user.isApproved = false;
      user.approvedBy = req.user ? req.user.email : 'Super Admin';
      user.approvedAt = new Date();
      await user.save();

      res.json({ success: true, message: `Registration for ${user.name} has been rejected.` });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

// ASSIGNMENT CONTROLLERS
const assignments = {
  getAll: async (req, res) => {
    try {
      const filter = {};
      if (req.query.department && req.query.department !== 'All') filter.department = req.query.department;
      if (req.query.year && req.query.year !== 'All') filter.year = req.query.year;
      if (req.query.semester && req.query.semester !== 'All') filter.semester = req.query.semester;
      if (req.query.section && req.query.section !== 'All') filter.section = req.query.section;
      if (req.query.subjectCode) filter.subjectCode = req.query.subjectCode;

      const list = await Assignment.find(filter).sort({ createdAt: -1 });
      res.json({ success: true, count: list.length, data: list });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const item = new Assignment(req.body);
      await item.save();
      res.status(201).json({ success: true, message: 'Assignment published successfully', data: item });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  submitAssignment: async (req, res) => {
    try {
      const { id } = req.params;
      const { studentRegisterNo, studentName, submissionUrl } = req.body;

      const assignment = await Assignment.findById(id);
      if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found.' });

      // Update existing or add new submission
      const existingIdx = assignment.submissions.findIndex(s => s.studentRegisterNo === studentRegisterNo);
      if (existingIdx > -1) {
        assignment.submissions[existingIdx].submissionUrl = submissionUrl;
        assignment.submissions[existingIdx].submittedAt = new Date();
      } else {
        assignment.submissions.push({
          studentRegisterNo,
          studentName: studentName || 'Student',
          submissionUrl,
          submittedAt: new Date(),
          status: 'Submitted'
        });
      }

      await assignment.save();
      res.json({ success: true, message: 'Assignment submitted successfully!', data: assignment });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      await Assignment.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'Assignment deleted.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

// TIMETABLE CONTROLLERS
const timetables = {
  getAll: async (req, res) => {
    try {
      const filter = {};
      if (req.query.department && req.query.department !== 'All') filter.department = req.query.department;
      if (req.query.year && req.query.year !== 'All') filter.year = req.query.year;
      if (req.query.semester && req.query.semester !== 'All') filter.semester = req.query.semester;
      if (req.query.section && req.query.section !== 'All') filter.section = req.query.section;
      if (req.query.day && req.query.day !== 'All') filter.day = req.query.day;

      const list = await Timetable.find(filter);
      res.json({ success: true, count: list.length, data: list });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  saveTimetable: async (req, res) => {
    try {
      const { department, year, semester, section, day, schedule } = req.body;
      const item = await Timetable.findOneAndUpdate(
        { department, year, semester, section, day },
        { department, year, semester, section, day, schedule },
        { upsert: true, new: true }
      );
      res.json({ success: true, message: 'Timetable saved successfully!', data: item });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
};

// NOTES CONTROLLERS
const notes = {
  getAll: async (req, res) => {
    try {
      const filter = {};
      if (req.query.department && req.query.department !== 'All') filter.department = req.query.department;
      if (req.query.semester && req.query.semester !== 'All') filter.semester = req.query.semester;
      if (req.query.subjectCode) filter.subjectCode = req.query.subjectCode;

      const list = await Note.find(filter).sort({ createdAt: -1 });
      res.json({ success: true, count: list.length, data: list });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  upload: async (req, res) => {
    try {
      const { title, department, semester, section, subjectCode, subjectName, fileUrl, fileType, fileName, fileSize } = req.body;
      
      const newNote = new Note({
        title: title || 'Untitled Subject Note',
        department: department || 'General',
        semester: semester || 'Semester V',
        section: section || 'A',
        subjectCode: subjectCode || 'GEN001',
        subjectName: subjectName || 'General Subject',
        fileUrl: fileUrl || (req.file ? `/uploads/${req.file.filename}` : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
        fileType: fileType || (req.file ? req.file.originalname.split('.').pop() : 'pdf'),
        fileName: fileName || (req.file ? req.file.originalname : 'Notes.pdf'),
        fileSize: fileSize || (req.file ? `${(req.file.size / 1024 / 1024).toFixed(2)} MB` : '1.5 MB'),
        uploadedBy: req.user ? req.user.name : 'Faculty Member',
        uploaderEmail: req.user ? req.user.email : 'faculty@jpcoe.ac.in'
      });

      await newNote.save();
      res.status(201).json({ success: true, message: 'Notes uploaded successfully!', data: newNote });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      await Note.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'Note deleted.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

// REPORTS CONTROLLERS
const reports = {
  generate: async (req, res) => {
    try {
      const { reportType, department, semester, format } = req.body;
      const reportTitle = `${reportType || 'General'} Report - ${department || 'All Departments'} (${new Date().toLocaleDateString()})`;

      const report = new Report({
        reportTitle,
        reportType: reportType || 'Department',
        generatedBy: req.user ? req.user.name : 'Super Admin',
        department: department || 'All',
        semester: semester || 'All',
        format: format || 'PDF',
        summary: `Generated ${reportType} report containing records for ${department || 'All'} department.`
      });

      await report.save();
      res.json({ success: true, message: 'Report generated successfully!', data: report });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
  getAll: async (req, res) => {
    try {
      const list = await Report.find().sort({ createdAt: -1 });
      res.json({ success: true, count: list.length, data: list });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

// NOTIFICATIONS CONTROLLERS
const notifications = {
  getAll: async (req, res) => {
    try {
      const list = await Notification.find().sort({ createdAt: -1 }).limit(20);
      res.json({ success: true, count: list.length, data: list });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
  markRead: async (req, res) => {
    try {
      await Notification.updateMany({}, { read: true });
      res.json({ success: true, message: 'All notifications marked as read.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

// IMPORT / EXPORT CONTROLLERS
const XLSX = require('xlsx');

const importExport = {
  importFile: async (req, res) => {
    try {
      const target = req.body.target || 'students';
      let records = [];

      if (req.file) {
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        records = XLSX.utils.sheet_to_json(sheet);
      } else if (Array.isArray(req.body.records)) {
        records = req.body.records;
      }

      if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ success: false, message: 'No valid spreadsheet records found for import.' });
      }

      let inserted = 0;
      let updated = 0;
      let skipped = 0;
      let errors = [];

      // Faculty Scope Enforcement
      if (req.user && req.user.role === 'faculty') {
        const allowedTargets = ['attendance', 'internalMarks', 'semesterMarks', 'notes', 'subjectNotes', 'assignments', 'timetables'];
        if (!allowedTargets.includes(target)) {
          return res.status(403).json({ success: false, message: `Faculty members cannot import ${target}.` });
        }
      }

      for (let i = 0; i < records.length; i++) {
        const row = records[i];

        // Faculty department scope check
        if (req.user && req.user.role === 'faculty' && req.user.department) {
          if (row.department && row.department !== req.user.department) {
            skipped++;
            errors.push(`Row ${i + 1}: Skipped record outside assigned department (${row.department})`);
            continue;
          }
          row.department = req.user.department;
        }

        try {
          let filter = null;
          let ModelClass = null;

          if (target === 'students') {
            ModelClass = Student;
            if (row.registerNo) filter = { registerNo: String(row.registerNo).trim() };
            else if (row.email) filter = { email: String(row.email).toLowerCase().trim() };
          } else if (target === 'faculty') {
            ModelClass = Faculty;
            if (row.facultyId) filter = { facultyId: String(row.facultyId).trim() };
            else if (row.email) filter = { email: String(row.email).toLowerCase().trim() };
          } else if (target === 'departments') {
            ModelClass = Department;
            if (row.code) filter = { code: String(row.code).trim() };
          } else if (target === 'subjects') {
            ModelClass = Subject;
            if (row.subjectCode) filter = { subjectCode: String(row.subjectCode).trim() };
          } else if (target === 'classes') {
            ModelClass = ClassModel;
            if (row.className) filter = { className: String(row.className).trim() };
          } else if (target === 'attendance') {
            ModelClass = Attendance;
            if (row.studentRegisterNo && row.date) {
              filter = { studentRegisterNo: String(row.studentRegisterNo).trim(), date: String(row.date).trim(), session: row.session || 'Full Day' };
            }
          } else if (target === 'internalMarks') {
            ModelClass = InternalMark;
            if (row.studentRegisterNo && row.subjectCode) {
              filter = { studentRegisterNo: String(row.studentRegisterNo).trim(), subjectCode: String(row.subjectCode).trim() };
            }
          } else if (target === 'semesterMarks') {
            ModelClass = SemesterMark;
            if (row.studentRegisterNo && row.subjectCode) {
              filter = { studentRegisterNo: String(row.studentRegisterNo).trim(), subjectCode: String(row.subjectCode).trim() };
            }
          } else if (target === 'notes' || target === 'subjectNotes') {
            ModelClass = Note;
            if (row.title && row.subjectCode) {
              filter = { title: String(row.title).trim(), subjectCode: String(row.subjectCode).trim() };
            }
          } else if (target === 'assignments') {
            ModelClass = Assignment;
            if (row.title && row.dueDate) {
              filter = { title: String(row.title).trim(), dueDate: String(row.dueDate).trim() };
            }
          } else if (target === 'timetables') {
            ModelClass = Timetable;
            if (row.department && row.day) {
              filter = { department: String(row.department).trim(), year: row.year || 'III Year', semester: row.semester || 'Semester V', section: row.section || 'A', day: row.day };
            }
          } else if (target === 'notifications') {
            ModelClass = Notification;
            if (row.title) filter = { title: String(row.title).trim() };
          }

          if (!ModelClass) {
            skipped++;
            errors.push(`Row ${i + 1}: Invalid target module ${target}`);
            continue;
          }

          if (filter) {
            const existing = await ModelClass.findOne(filter);
            if (existing) {
              await ModelClass.findOneAndUpdate(filter, row, { runValidators: true });
              updated++;
            } else {
              await ModelClass.create(row);
              inserted++;
            }
          } else {
            await ModelClass.create(row);
            inserted++;
          }
        } catch (rowErr) {
          skipped++;
          errors.push(`Row ${i + 1}: ${rowErr.message}`);
        }
      }

      res.json({
        success: true,
        message: `Import completed: ${inserted} inserted, ${updated} updated, ${skipped} skipped.`,
        summary: { inserted, updated, skipped, errorsCount: errors.length },
        errors
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  importData: async (req, res) => {
    return importExport.importFile(req, res);
  },

  exportData: async (req, res) => {
    try {
      const { target } = req.query;
      let data = [];
      if (target === 'students') data = await Student.find();
      else if (target === 'faculty') data = await Faculty.find();
      else if (target === 'departments') data = await Department.find();
      else if (target === 'subjects') data = await Subject.find();
      else if (target === 'attendance') data = await Attendance.find();
      else if (target === 'internalMarks') data = await InternalMark.find();
      else if (target === 'semesterMarks') data = await SemesterMark.find();

      res.json({ success: true, count: data.length, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

// Overview Stats Controller
const getStats = async (req, res) => {
  try {
    const studentCount = await Student.countDocuments();
    const facultyCount = await Faculty.countDocuments();
    const departmentCount = await Department.countDocuments();
    const subjectCount = await Subject.countDocuments();
    const classCount = await ClassModel.countDocuments();
    const noteCount = await Note.countDocuments();
    const pendingUserCount = await User.countDocuments({ status: 'Pending' });

    res.json({
      success: true,
      stats: {
        totalStudents: studentCount,
        totalFaculty: facultyCount,
        totalDepartments: departmentCount,
        totalSubjects: subjectCount,
        totalClasses: classCount,
        totalNotes: noteCount,
        pendingApprovals: pendingUserCount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// CUSTOM DEPARTMENT CONTROLLERS
const departments = {
  getAll: async (req, res) => {
    try {
      const depts = await Department.find().sort({ createdAt: -1 }).lean();

      const enriched = await Promise.all(depts.map(async (d) => {
        const deptCode = d.departmentCode || d.code || '';
        const deptName = d.departmentName || d.name || '';

        const [facCount, stuCount] = await Promise.all([
          Faculty.countDocuments({ department: { $regex: new RegExp(deptCode || deptName, 'i') } }),
          Student.countDocuments({ department: { $regex: new RegExp(deptCode || deptName, 'i') } })
        ]);

        return {
          ...d,
          departmentCode: d.departmentCode || d.code,
          departmentName: d.departmentName || d.name,
          hod: d.hod || d.hodName || 'Dr. Head of Dept',
          facultyCount: facCount || 8,
          studentCount: stuCount || 120
        };
      }));

      res.json({ success: true, count: enriched.length, data: enriched });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
  create: async (req, res) => {
    try {
      const dept = new Department(req.body);
      await dept.save();
      res.status(201).json({ success: true, message: 'Department created successfully', data: dept });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
  update: async (req, res) => {
    try {
      const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!dept) return res.status(404).json({ success: false, error: 'Department not found' });
      res.json({ success: true, message: 'Department updated successfully', data: dept });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
  delete: async (req, res) => {
    try {
      await Department.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'Department deleted successfully' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};

module.exports = {
  students: createCrudControllers(Student, 'Student'),
  faculty: createCrudControllers(Faculty, 'Faculty'),
  departments,
  subjects: createCrudControllers(Subject, 'Subject'),
  classes: createCrudControllers(ClassModel, 'Class'),
  attendance: createCrudControllers(Attendance, 'Attendance'),
  semesterMarks: createCrudControllers(SemesterMark, 'SemesterMark'),
  internalMarks: createCrudControllers(InternalMark, 'InternalMark'),
  history: createCrudControllers(History, 'History'),
  settings: createCrudControllers(Setting, 'Setting'),
  users: createCrudControllers(User, 'User'),
  assignments,
  timetables,
  auth,
  notes,
  reports,
  notifications,
  importExport,
  getStats,
  autoSeedDatabase
};
