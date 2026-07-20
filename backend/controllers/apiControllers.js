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
    { studentRegisterNo: '953621104001', studentName: 'Aarav Kumar', department: 'AI & DS', semester: 'Semester V', section: 'A', date: new Date().toISOString().split('T')[0], session: 'Full Day', morningStatus: 'Present', afternoonStatus: 'Present', status: 'Present', percentage: 96, remarks: 'On Time' },
    { studentRegisterNo: '953621104002', studentName: 'Bhavna Sharma', department: 'AI & DS', semester: 'Semester V', section: 'A', date: new Date().toISOString().split('T')[0], session: 'Full Day', morningStatus: 'Present', afternoonStatus: 'Present', status: 'Present', percentage: 98, remarks: 'On Time' }
  ],
  semesterMarks: [
    { studentRegisterNo: '953621104001', studentName: 'Aarav Kumar', department: 'AI & DS', semester: 'Semester V', subjectCode: 'AD3501', subjectName: 'Deep Learning', grade: 'O', cgpa: 9.2, arrears: 0, result: 'PASS' }
  ],
  internalMarks: [
    { studentRegisterNo: '953621104001', studentName: 'Aarav Kumar', department: 'AI & DS', semester: 'Semester V', subjectCode: 'AD3501', subjectName: 'Deep Learning', internal1: 48, internal2: 46, modelExam: 92, assignment: 10, totalInternal: 98 }
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
  notifications: [
    { title: 'Welcome to JP College ERP', message: 'System updated with White Mode UI and Super Admin Registration Approval System.', type: 'system', recipientRole: 'all' }
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
      { email: 'aarav.21ad@jpcoe.ac.in', password: studentPass, role: 'student', name: 'Aarav Kumar', status: 'Approved', isApproved: true, isActive: true, department: 'AI & DS', registerNo: '953621104001', rollNumber: '21AD01' },
      { email: 'bhavna.21ad@jpcoe.ac.in', password: studentPass, role: 'student', name: 'Bhavna Sharma', status: 'Approved', isApproved: true, isActive: true, department: 'AI & DS', registerNo: '953621104002', rollNumber: '21AD02' }
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
      await Notification.insertMany(SEED_DATA.notifications);
      console.log('✅ Initial Collections Seeded Successfully!');
    }
  } catch (err) {
    console.error('Error auto-seeding database:', err);
  }
};

// Generic CRUD helper generator
const createCrudControllers = (Model, modelName) => ({
  getAll: async (req, res) => {
    try {
      let filter = {};
      if (req.query.department) filter.department = req.query.department;
      if (req.query.semester) filter.semester = req.query.semester;
      if (req.query.section) filter.section = req.query.section;
      if (req.query.registerNo) filter.registerNo = req.query.registerNo;
      if (req.query.email) filter.email = req.query.email;

      const items = await Model.find(filter).sort({ createdAt: -1 });
      res.json({ success: true, count: items.length, data: items });
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
        user: req.user ? req.user.email : 'System',
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

      const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

      await History.create({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        action: `Update ${modelName}`,
        user: req.user ? req.user.email : 'System',
        department: item.department || 'General',
        details: `Updated ${modelName} record (ID: ${req.params.id})`
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
        user: req.user ? req.user.email : 'System',
        department: existing.department || 'General',
        details: `Deleted ${modelName} record (ID: ${req.params.id})`
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

      // LOGIN RULES FOR PENDING AND REJECTED STATUSES
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
      
      // 1. Email uniqueness validation
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email address is already registered. Please use another email.' });
      }

      // 2. Register Number uniqueness validation for Student
      if (role === 'student' && registerNo) {
        const existingRegNo = await User.findOne({ registerNo: registerNo.trim() });
        if (existingRegNo) {
          return res.status(400).json({ success: false, message: 'Register Number already exists in system. Please check your Register Number.' });
        }
      }

      // 3. Faculty ID uniqueness validation for Faculty
      if (role === 'faculty' && facultyId) {
        const existingFacId = await User.findOne({ facultyId: facultyId.trim() });
        if (existingFacId) {
          return res.status(400).json({ success: false, message: 'Faculty ID already exists in system. Please check your Faculty ID.' });
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
        year: year || '',
        semester: semester || '',
        section: section || '',
        facultyId: facultyId || '',
        designation: designation || '',
        subjectsAssigned: subjectsAssigned || '',
        qualification: qualification || ''
      });

      await user.save();

      // Create Admin notification for Pending approval
      await Notification.create({
        title: `New ${targetRole.toUpperCase()} Registration: ${name}`,
        message: `${name} (${cleanEmail}) submitted registration for ${department || 'General'}. Status: Pending Approval.`,
        type: 'approval',
        recipientRole: 'super_admin'
      });

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
      
      const students = pendingUsers.filter(u => u.role === 'student');
      const faculty = pendingUsers.filter(u => u.role === 'faculty');
      const adminRequests = pendingUsers.filter(u => u.role === 'admin');

      res.json({
        success: true,
        counts: {
          total: pendingUsers.length,
          students: students.length,
          faculty: faculty.length,
          adminRequests: adminRequests.length
        },
        data: {
          students,
          faculty,
          adminRequests
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

      // Create linked record in Student or Faculty collection
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

      await Notification.create({
        title: 'Account Registration Approved',
        message: `Your JP College ERP account (${user.email}) has been approved by Super Admin. You can log in now!`,
        type: 'approval',
        recipientEmail: user.email
      });

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

      await Notification.create({
        title: 'Account Registration Rejected',
        message: `Your JP College ERP registration request (${user.email}) was rejected. Please contact administrator.`,
        type: 'approval',
        recipientEmail: user.email
      });

      res.json({ success: true, message: `Registration for ${user.name} has been rejected.` });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
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
      if (req.query.search) {
        filter.$or = [
          { title: { $regex: req.query.search, $options: 'i' } },
          { subjectName: { $regex: req.query.search, $options: 'i' } },
          { subjectCode: { $regex: req.query.search, $options: 'i' } }
        ];
      }

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

      await Notification.create({
        title: 'New Subject Note Uploaded',
        message: `${newNote.uploadedBy} uploaded notes for ${newNote.subjectName} (${newNote.department}).`,
        type: 'notes',
        recipientRole: 'all'
      });

      res.status(201).json({ success: true, message: 'Notes uploaded successfully!', data: newNote });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      await Note.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'Note deleted successfully.' });
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
const importExport = {
  importData: async (req, res) => {
    try {
      const { target, records } = req.body;
      if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ success: false, message: 'No records provided for import.' });
      }

      let insertedCount = 0;
      if (target === 'students') {
        const result = await Student.insertMany(records, { ordered: false });
        insertedCount = result.length;
      } else if (target === 'faculty') {
        const result = await Faculty.insertMany(records, { ordered: false });
        insertedCount = result.length;
      } else if (target === 'departments') {
        const result = await Department.insertMany(records, { ordered: false });
        insertedCount = result.length;
      } else if (target === 'subjects') {
        const result = await Subject.insertMany(records, { ordered: false });
        insertedCount = result.length;
      } else if (target === 'classes') {
        const result = await ClassModel.insertMany(records, { ordered: false });
        insertedCount = result.length;
      } else if (target === 'attendance') {
        const result = await Attendance.insertMany(records, { ordered: false });
        insertedCount = result.length;
      } else if (target === 'internalMarks') {
        const result = await InternalMark.insertMany(records, { ordered: false });
        insertedCount = result.length;
      } else if (target === 'semesterMarks') {
        const result = await SemesterMark.insertMany(records, { ordered: false });
        insertedCount = result.length;
      } else {
        return res.status(400).json({ success: false, message: `Invalid import target: ${target}` });
      }

      await Notification.create({
        title: `Data Import Completed`,
        message: `Successfully imported ${insertedCount} ${target} records into system.`,
        type: 'import',
        recipientRole: 'super_admin'
      });

      res.json({ success: true, message: `Imported ${insertedCount} records into ${target} successfully!` });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
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

module.exports = {
  students: createCrudControllers(Student, 'Student'),
  faculty: createCrudControllers(Faculty, 'Faculty'),
  departments: createCrudControllers(Department, 'Department'),
  subjects: createCrudControllers(Subject, 'Subject'),
  classes: createCrudControllers(ClassModel, 'Class'),
  attendance: createCrudControllers(Attendance, 'Attendance'),
  semesterMarks: createCrudControllers(SemesterMark, 'SemesterMark'),
  internalMarks: createCrudControllers(InternalMark, 'InternalMark'),
  history: createCrudControllers(History, 'History'),
  settings: createCrudControllers(Setting, 'Setting'),
  users: createCrudControllers(User, 'User'),
  auth,
  notes,
  reports,
  notifications,
  importExport,
  getStats,
  autoSeedDatabase
};
