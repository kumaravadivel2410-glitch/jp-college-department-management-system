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
const Section = require('../models/Section');
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
    { registerNo: '953621104001', studentName: 'Aarav Kumar', department: 'AI & DS', year: 'III Year', semester: 'Semester 5', section: 'A', phone: '9123456780', email: 'aarav.21ad@jpcoe.ac.in', address: 'Tenkasi, Tamil Nadu', parentName: 'R. Kumar', parentPhone: '9443322110', bloodGroup: 'O+', dateOfBirth: '2003-05-14', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', approvalStatus: 'approved' },
    { registerNo: '953621104002', studentName: 'Bhavna Sharma', department: 'AI & DS', year: 'III Year', semester: 'Semester 5', section: 'A', phone: '9123456781', email: 'bhavna.21ad@jpcoe.ac.in', address: 'Tirunelveli, Tamil Nadu', parentName: 'S. Sharma', parentPhone: '9443322111', bloodGroup: 'A+', dateOfBirth: '2003-08-22', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', approvalStatus: 'approved' }
  ],
  subjects: [
    { subjectCode: 'AD3501', subjectName: 'Deep Learning', credits: 4, facultyName: 'Dr. M. Senthil Kumar', department: 'AI & DS', semester: 'Semester 5' },
    { subjectCode: 'CS3401', subjectName: 'Algorithms & Data Structures', credits: 3, facultyName: 'Prof. Anitha Raj', department: 'CSE', semester: 'Semester 5' }
  ],
  classes: [
    { className: 'III AI&DS A', department: 'AI & DS', year: 'III Year', semester: 'Semester 5', section: 'A', classAdvisor: 'Dr. M. Senthil Kumar' },
    { className: 'III CSE B', department: 'CSE', year: 'III Year', semester: 'Semester 5', section: 'B', classAdvisor: 'Prof. Anitha Raj' }
  ],
  attendance: [
    { studentRegisterNo: '953621104001', studentName: 'Aarav Kumar', department: 'AI & DS', year: 'III Year', semester: 'Semester 5', section: 'A', date: new Date().toISOString().split('T')[0], session: 'Full Day', morningStatus: 'Present', afternoonStatus: 'Present', status: 'Present', percentage: 96, remarks: 'On Time' },
    { studentRegisterNo: '953621104002', studentName: 'Bhavna Sharma', department: 'AI & DS', year: 'III Year', semester: 'Semester 5', section: 'A', date: new Date().toISOString().split('T')[0], session: 'Full Day', morningStatus: 'Present', afternoonStatus: 'Present', status: 'Present', percentage: 98, remarks: 'On Time' }
  ],
  semesterMarks: [
    { studentRegisterNo: '953621104001', studentName: 'Aarav Kumar', department: 'AI & DS', year: 'III Year', semester: 'Semester 5', section: 'A', subjectCode: 'AD3501', subjectName: 'Deep Learning', grade: 'O', marks: 95, credits: 4, gpa: 9.5, cgpa: 9.2, arrears: 0, result: 'PASS' },
    { studentRegisterNo: '953621104002', studentName: 'Bhavna Sharma', department: 'AI & DS', year: 'III Year', semester: 'Semester 5', section: 'A', subjectCode: 'AD3501', subjectName: 'Deep Learning', grade: 'A+', marks: 89, credits: 4, gpa: 8.9, cgpa: 8.8, arrears: 0, result: 'PASS' }
  ],
  internalMarks: [
    { studentRegisterNo: '953621104001', studentName: 'Aarav Kumar', department: 'AI & DS', year: 'III Year', semester: 'Semester 5', section: 'A', subjectCode: 'AD3501', subjectName: 'Deep Learning', facultyName: 'Dr. M. Senthil Kumar', internal1: 48, internal2: 46, internal3: 49, average: 47.6, modelExam: 92, assignmentMark: 10, totalInternal: 98, lastUpdated: '2026-07-20' },
    { studentRegisterNo: '953621104002', studentName: 'Bhavna Sharma', department: 'AI & DS', year: 'III Year', semester: 'Semester 5', section: 'A', subjectCode: 'AD3501', subjectName: 'Deep Learning', facultyName: 'Dr. M. Senthil Kumar', internal1: 45, internal2: 47, internal3: 46, average: 46.0, modelExam: 89, assignmentMark: 10, totalInternal: 94, lastUpdated: '2026-07-20' }
  ],
  notes: [
    {
      title: 'Deep Learning Module 1 - Neural Networks Overview',
      department: 'AI & DS',
      semester: 'Semester 5',
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
      semester: 'Semester 5',
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
      semester: 'Semester 5',
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
      { email: 'aarav.21ad@jpcoe.ac.in', password: studentPass, role: 'student', name: 'Aarav Kumar', status: 'Approved', isApproved: true, isActive: true, department: 'AI & DS', registerNo: '953621104001', year: 'III Year', semester: 'Semester 5', section: 'A' },
      { email: 'bhavna.21ad@jpcoe.ac.in', password: studentPass, role: 'student', name: 'Bhavna Sharma', status: 'Approved', isApproved: true, isActive: true, department: 'AI & DS', registerNo: '953621104002', year: 'III Year', semester: 'Semester 5', section: 'A' }
    ];

    for (const u of initialUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
      }
    }

    const sectionCount = await Section.countDocuments();
    if (sectionCount === 0) {
      await Section.insertMany([{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'D' }, { name: 'E' }]);
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
          { subjectCode: regex },
          { department: regex },
          { phone: regex },
          { email: regex }
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
        data: items || [],
        count: totalCount || 0,
        totalRecords: totalCount || 0,
        page,
        totalPages: Math.ceil(totalCount / limit) || 1,
        message: ''
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message || 'An internal server error occurred.',
        totalRecords: 0,
        data: []
      });
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
        let maxMark = Number(existing.maxMark) || 50;
        try {
          const setting = await Setting.findOne();
          if (setting && setting.maxInternalMarks) maxMark = Number(setting.maxInternalMarks);
        } catch (e) {}

        if (req.body.maxMark) maxMark = Number(req.body.maxMark);

        const int1 = req.body.internal1 !== undefined ? Number(req.body.internal1) : existing.internal1;
        const int2 = req.body.internal2 !== undefined ? Number(req.body.internal2) : existing.internal2;
        const int3 = req.body.internal3 !== undefined ? Number(req.body.internal3) : existing.internal3;
        const modelExam = req.body.modelExam !== undefined ? Number(req.body.modelExam) : existing.modelExam;
        const assignment = req.body.assignmentMark !== undefined ? Number(req.body.assignmentMark) : existing.assignmentMark;

        if (int1 > maxMark || int2 > maxMark || int3 > maxMark) {
          return res.status(400).json({ success: false, message: `Internal Assessment marks cannot exceed configured maximum of ${maxMark}.` });
        }
        if (modelExam > 100) return res.status(400).json({ success: false, message: 'Model Exam marks cannot exceed 100.' });
        if (assignment > 10) return res.status(400).json({ success: false, message: 'Assignment mark cannot exceed 10.' });

        const editHistory = Array.isArray(existing.editHistory) ? existing.editHistory : [];
        const editor = req.user ? `${req.user.name || req.user.email} (${req.user.role})` : 'Faculty User';

        ['internal1', 'internal2', 'internal3', 'modelExam', 'assignmentMark'].forEach(field => {
          if (req.body[field] !== undefined && Number(req.body[field]) !== existing[field]) {
            editHistory.push({
              markType: field,
              oldValue: existing[field] || 0,
              newValue: Number(req.body[field]),
              editedBy: editor,
              editedAt: new Date()
            });
          }
        });

        req.body.editHistory = editHistory;
        req.body.maxMark = maxMark;
        req.body.average = Number(((int1 + int2 + int3) / 3).toFixed(2));
        req.body.status = req.body.average >= (maxMark * 0.4) ? 'PASS' : 'FAIL';
        req.body.totalInternal = Math.round((req.body.average / maxMark) * 40 + assignment);
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
      res.status(400).json({ success: false, message: err.message });
    }
  },
  delete: async (req, res) => {
    try {
      const existing = await Model.findById(req.params.id);
      if (!existing) return res.status(404).json({ success: false, message: `${modelName} not found` });

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
      res.status(500).json({ success: false, message: err.message });
    }
  },
  bulkDelete: async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, message: 'No record IDs provided for bulk deletion.' });
      }

      const validObjectIds = ids.filter(id => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id));
      const stringIds = ids.filter(id => typeof id === 'string' && !/^[0-9a-fA-F]{24}$/.test(id));

      const orConditions = [];
      if (validObjectIds.length > 0) {
        orConditions.push({ _id: { $in: validObjectIds } });
      }
      if (stringIds.length > 0) {
        orConditions.push(
          { facultyId: { $in: stringIds } },
          { registerNo: { $in: stringIds } },
          { departmentCode: { $in: stringIds } },
          { subjectCode: { $in: stringIds } }
        );
      }

      if (orConditions.length === 0) {
        return res.status(400).json({ success: false, message: 'No valid record IDs provided for bulk deletion.' });
      }

      const filter = orConditions.length === 1 ? orConditions[0] : { $or: orConditions };

      if (modelName === 'User') {
        const protectedUser = await Model.findOne({
          _id: { $in: validObjectIds },
          $or: [{ isProtected: true }, { email: (process.env.SUPER_ADMIN_EMAIL || 'Adminjpcoe@gmail.com').toLowerCase() }]
        });
        if (protectedUser) {
          return res.status(403).json({ success: false, message: 'Permanent Super Admin account cannot be deleted.' });
        }
      }

      const result = await Model.deleteMany(filter);

      await History.create({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        action: `Bulk Delete ${modelName}`,
        user: req.user ? req.user.email : 'System User',
        department: 'General',
        details: `Bulk deleted ${result.deletedCount} ${modelName} records`
      });

      res.json({
        success: true,
        message: `Successfully deleted ${result.deletedCount} ${modelName} records!`,
        count: result.deletedCount
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
  bulkUpdate: async (req, res) => {
    try {
      const { ids, updateData } = req.body;
      if (!Array.isArray(ids) || ids.length === 0 || !updateData || typeof updateData !== 'object') {
        return res.status(400).json({ success: false, message: 'Invalid payload for bulk update.' });
      }

      const validObjectIds = ids.filter(id => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id));
      const stringIds = ids.filter(id => typeof id === 'string' && !/^[0-9a-fA-F]{24}$/.test(id));

      const orConditions = [];
      if (validObjectIds.length > 0) {
        orConditions.push({ _id: { $in: validObjectIds } });
      }
      if (stringIds.length > 0) {
        orConditions.push(
          { facultyId: { $in: stringIds } },
          { registerNo: { $in: stringIds } },
          { departmentCode: { $in: stringIds } },
          { subjectCode: { $in: stringIds } }
        );
      }

      if (orConditions.length === 0) {
        return res.status(400).json({ success: false, message: 'No valid record IDs provided for bulk update.' });
      }

      const filter = orConditions.length === 1 ? orConditions[0] : { $or: orConditions };

      const result = await Model.updateMany(filter, { $set: updateData });

      await History.create({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        action: `Bulk Update ${modelName}`,
        user: req.user ? req.user.email : 'System User',
        department: 'General',
        details: `Bulk updated ${result.modifiedCount} ${modelName} records.`
      });

      res.json({
        success: true,
        message: `Successfully updated ${result.modifiedCount} ${modelName} records!`,
        count: result.modifiedCount
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
});
// AUTH CONTROLLERS
const auth = {
  login: async (req, res) => {
    try {
      const { email, registerNo, username, password } = req.body;
      const loginIdentifier = (registerNo || email || username || '').trim();

      if (!loginIdentifier || !password) {
        return res.status(400).json({ success: false, message: 'Please provide Register Number / Email and password' });
      }

      const cleanIdentifier = loginIdentifier.toLowerCase();

      // Find user by email or registerNo
      const user = await User.findOne({
        $or: [
          { email: cleanIdentifier },
          { registerNo: loginIdentifier }
        ]
      });

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials or Register Number not found.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials or incorrect password.' });
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

  googleLogin: async (req, res) => {
    try {
      const { email, name, googleId, photo, role } = req.body;
      if (!email || !googleId) {
        return res.status(400).json({ success: false, message: 'Missing Google credentials' });
      }

      const cleanEmail = email.toLowerCase().trim();
      let user = await User.findOne({ email: cleanEmail });

      if (!user) {
        user = new User({
          email: cleanEmail,
          name: name || 'Google User',
          googleId,
          photo: photo || '',
          role: role || 'student',
          status: 'Approved',
          isApproved: true,
          isActive: true,
          department: 'General',
          loginTime: new Date()
        });
        await user.save();
      } else {
        user.loginTime = new Date();
        if (photo) user.photo = photo;
        await user.save();
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
        photo: user.photo
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

      res.json({
        success: true,
        message: 'Google Sign-In successful',
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
        employeeId, reasonForAdmin, registerNo, year, semester, section,
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

      // Requirement 6: Faculty Registration Pre-check against Faculty database
      if (role === 'faculty') {
        const queryFacultyId = (facultyId || '').trim();
        if (!queryFacultyId && !cleanEmail) {
          return res.status(400).json({ success: false, message: 'Please provide Faculty ID or Email.' });
        }

        const matchingFaculty = await Faculty.findOne({
          $or: [
            { facultyId: queryFacultyId },
            { email: cleanEmail }
          ]
        });

        if (!matchingFaculty) {
          return res.status(400).json({ success: false, message: 'Faculty record not found. Please contact the administrator.' });
        }

        const existingFacUser = await User.findOne({
          $or: [
            { email: cleanEmail },
            { facultyId: matchingFaculty.facultyId }
          ]
        });

        if (existingFacUser) {
          return res.status(400).json({ success: false, message: 'Faculty account already exists for this Faculty ID or Email.' });
        }
      }

      // Requirement 8: Student Register Number Duplication Prevention
      if (role === 'student') {
        const cleanRegNo = (registerNo || '').trim();
        if (!cleanRegNo) {
          return res.status(400).json({ success: false, message: 'Register Number is required for student registration.' });
        }

        const existingRegNo = await User.findOne({ registerNo: cleanRegNo });
        if (existingRegNo) {
          return res.status(400).json({ success: false, message: 'Register Number is already registered.' });
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const targetRole = role === 'admin' ? 'admin' : (role === 'faculty' ? 'faculty' : 'student');

      // Semester Normalization (Semester 1..8)
      const normalizeSem = (s) => {
        if (!s) return 'Semester 5';
        const numMatch = s.match(/\d+/);
        if (numMatch) return `Semester ${numMatch[0]}`;
        const romanMap = { 'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5, 'vi': 6, 'vii': 7, 'viii': 8 };
        const clean = s.replace(/semester/i, '').trim().toLowerCase();
        if (romanMap[clean]) return `Semester ${romanMap[clean]}`;
        return s;
      };

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
        registerNo: registerNo ? registerNo.trim() : '',
        year: year || 'III Year',
        semester: normalizeSem(semester),
        section: section || 'A',
        facultyId: facultyId ? facultyId.trim() : '',
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
      res.json({
        success: true,
        data: list || [],
        count: list.length,
        totalRecords: list.length,
        page: 1,
        totalPages: 1,
        message: ''
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message, totalRecords: 0, data: [] });
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
      res.json({
        success: true,
        data: list || [],
        count: list.length,
        totalRecords: list.length,
        page: 1,
        totalPages: 1,
        message: ''
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message, totalRecords: 0, data: [] });
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
      res.json({
        success: true,
        data: list || [],
        count: list.length,
        totalRecords: list.length,
        page: 1,
        totalPages: 1,
        message: ''
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message, totalRecords: 0, data: [] });
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
      res.json({
        success: true,
        data: list || [],
        count: list.length,
        totalRecords: list.length,
        page: 1,
        totalPages: 1,
        message: ''
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message, totalRecords: 0, data: [] });
    }
  }
};

// NOTIFICATIONS CONTROLLERS
const notifications = {
  getAll: async (req, res) => {
    try {
      const list = await Notification.find().sort({ createdAt: -1 }).limit(20);
      res.json({
        success: true,
        data: list || [],
        count: list.length,
        totalRecords: list.length,
        page: 1,
        totalPages: 1,
        message: ''
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message, totalRecords: 0, data: [] });
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
        const { parseSpreadsheetOrPdf } = require('../services/import/fileParsers');
        records = await parseSpreadsheetOrPdf(req.file);
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
    const [
      studentCount,
      facultyCount,
      departmentCount,
      subjectCount,
      classCount,
      noteCount,
      pendingUserCount,
      attendanceDocs,
      deptStudentAgg,
      yearStudentAgg,
      semStudentAgg,
      deptFacultyAgg,
      internalAgg,
      semResultAgg
    ] = await Promise.all([
      Student.countDocuments(),
      Faculty.countDocuments(),
      Department.countDocuments(),
      Subject.countDocuments(),
      ClassModel.countDocuments(),
      Note.countDocuments(),
      User.countDocuments({ status: 'Pending' }),
      Attendance.find().select('status percentage').lean(),
      Student.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }]),
      Student.aggregate([{ $group: { _id: '$year', count: { $sum: 1 } } }]),
      Student.aggregate([{ $group: { _id: '$semester', count: { $sum: 1 } } }]),
      Faculty.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }]),
      InternalMark.aggregate([{ $group: { _id: null, avgTotal: { $avg: '$totalInternal' } } }]),
      SemesterMark.aggregate([{ $group: { _id: '$result', count: { $sum: 1 } } }])
    ]);

    // Calculate Overall Attendance Percentage
    let totalAttRecords = attendanceDocs.length;
    let totalPresent = attendanceDocs.filter(a => a.status === 'Present' || a.status === 'Late' || a.status === 'Permission').length;
    let attendanceRatio = totalAttRecords > 0 ? Math.round((totalPresent / totalAttRecords) * 1000) / 10 : 92.5;

    // Convert Aggregations to Objects
    const studentsByDepartment = {};
    deptStudentAgg.forEach(item => { if (item._id) studentsByDepartment[item._id] = item.count; });

    const studentsByYear = {};
    yearStudentAgg.forEach(item => { if (item._id) studentsByYear[item._id] = item.count; });

    const studentsBySemester = {
      'Semester I': 0, 'Semester II': 0, 'Semester III': 0, 'Semester IV': 0,
      'Semester V': 0, 'Semester VI': 0, 'Semester VII': 0, 'Semester VIII': 0
    };
    semStudentAgg.forEach(item => { if (item._id) studentsBySemester[item._id] = item.count; });

    const facultyByDepartment = {};
    deptFacultyAgg.forEach(item => { if (item._id) facultyByDepartment[item._id] = item.count; });

    const avgInternalMark = internalAgg.length > 0 && internalAgg[0].avgTotal ? Math.round(internalAgg[0].avgTotal * 10) / 10 : 47.8;

    const semesterResults = { Pass: 0, Fail: 0 };
    semResultAgg.forEach(item => {
      if (item._id === 'PASS') semesterResults.Pass = item.count;
      else if (item._id === 'FAIL') semesterResults.Fail = item.count;
    });

    res.json({
      success: true,
      stats: {
        totalStudents: studentCount,
        totalFaculty: facultyCount,
        totalDepartments: departmentCount,
        totalSubjects: subjectCount,
        totalClasses: classCount,
        totalNotes: noteCount,
        pendingApprovals: pendingUserCount,
        overallAttendanceRatio: attendanceRatio,
        avgInternalMark,
        studentsByDepartment,
        studentsByYear,
        studentsBySemester,
        facultyByDepartment,
        semesterResults
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

      res.json({
        success: true,
        data: enriched || [],
        count: enriched.length,
        totalRecords: enriched.length,
        page: 1,
        totalPages: 1,
        message: ''
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message, totalRecords: 0, data: [] });
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

// BATCH ATTENDANCE MARKING CONTROLLER
const batchAttendance = async (req, res) => {
  try {
    const { records, date, department, year, semester, section, subject } = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'No attendance records provided.' });
    }

    const markDate = date || new Date().toISOString().split('T')[0];
    const facultyUser = req.user ? (req.user.name || req.user.email) : 'Faculty Member';

    const bulkOperations = records.map(r => ({
      updateOne: {
        filter: {
          studentRegisterNo: r.studentRegisterNo,
          date: markDate,
          subject: subject || r.subject || 'General'
        },
        update: {
          $set: {
            studentRegisterNo: r.studentRegisterNo,
            studentName: r.studentName,
            department: department || r.department || 'AI & DS',
            year: year || r.year || 'III Year',
            semester: semester || r.semester || 'Semester V',
            section: section || r.section || 'A',
            subject: subject || r.subject || 'General',
            date: markDate,
            session: r.session || 'Full Day',
            morningStatus: r.status || 'Present',
            afternoonStatus: r.status || 'Present',
            status: r.status || 'Present',
            markedBy: facultyUser,
            percentage: r.status === 'Present' ? 100 : (r.status === 'Late' || r.status === 'Permission' ? 80 : 0)
          }
        },
        upsert: true
      }
    }));

    const Attendance = require('../models/Attendance');
    await Attendance.bulkWrite(bulkOperations);

    res.json({
      success: true,
      message: `Batch attendance marked successfully for ${records.length} students on ${markDate}!`,
      count: records.length
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Active QR Sessions in-memory store
const activeQRSessions = new Map();

const generateQR = async (req, res) => {
  try {
    const { department, year, semester, section, subject, validityMinutes } = req.body;
    const validity = Number(validityMinutes) || 5;
    const token = 'QR-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const expiresAt = Date.now() + validity * 60 * 1000;

    const sessionData = {
      token,
      department: department || 'AI & DS',
      year: year || 'III Year',
      semester: semester || 'Semester 5',
      section: section || 'A',
      subject: subject || 'AD3501 - Deep Learning',
      faculty: req.user ? (req.user.name || req.user.email) : 'Faculty Member',
      expiresAt,
      date: new Date().toISOString().split('T')[0],
      scannedStudents: []
    };

    activeQRSessions.set(token, sessionData);

    res.json({
      success: true,
      message: `QR Code generated successfully! Valid for ${validity} minutes.`,
      qrToken: token,
      expiresAt,
      sessionData
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const scanQR = async (req, res) => {
  try {
    const { qrToken, studentRegisterNo, studentName, deviceInfo } = req.body;
    if (!qrToken || !activeQRSessions.has(qrToken)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired QR Code token.' });
    }

    const session = activeQRSessions.get(qrToken);
    if (Date.now() > session.expiresAt) {
      activeQRSessions.delete(qrToken);
      return res.status(400).json({ success: false, message: 'QR Code attendance session has expired.' });
    }

    const regNo = studentRegisterNo || (req.user ? req.user.registerNo : null);
    if (!regNo) return res.status(400).json({ success: false, message: 'Student Register Number is required.' });

    if (session.scannedStudents.includes(regNo)) {
      return res.status(400).json({ success: false, message: 'Attendance already recorded for this QR session.' });
    }

    session.scannedStudents.push(regNo);

    const markDate = session.date;
    await Attendance.findOneAndUpdate(
      { studentRegisterNo: regNo, date: markDate, subject: session.subject },
      {
        studentRegisterNo: regNo,
        studentName: studentName || (req.user ? req.user.name : 'Student'),
        department: session.department,
        year: session.year,
        semester: session.semester,
        section: session.section,
        subject: session.subject,
        date: markDate,
        status: 'Present',
        markedBy: session.faculty,
        scanMethod: 'QR_Scan',
        scanTime: new Date().toLocaleTimeString(),
        deviceInfo: deviceInfo || 'Mobile Device'
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: `✅ Attendance marked Present via QR Scan for ${regNo}!`,
      subject: session.subject,
      time: new Date().toLocaleTimeString()
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const promoteStudents = async (req, res) => {
  try {
    const { department, currentSemester, targetSemester } = req.body;
    if (!currentSemester || !targetSemester) {
      return res.status(400).json({ success: false, message: 'Please specify current and target semester.' });
    }

    const filter = { semester: currentSemester };
    if (department && department !== 'All') filter.department = department;

    const result = await Student.updateMany(filter, { $set: { semester: targetSemester } });

    res.json({
      success: true,
      message: `Successfully promoted ${result.modifiedCount} students from ${currentSemester} to ${targetSemester}!`,
      count: result.modifiedCount
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const bulkUpdateInternalMarks = async (req, res) => {
  try {
    const { ids, markType, value, maxMark: inputMaxMark } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No student record IDs selected for bulk update.' });
    }

    if (!['internal1', 'internal2', 'internal3'].includes(markType)) {
      return res.status(400).json({ success: false, message: 'Invalid markType. Allowed: internal1, internal2, internal3.' });
    }

    let maxMark = Number(inputMaxMark) || 50;
    try {
      const setting = await Setting.findOne();
      if (setting && setting.maxInternalMarks) maxMark = setting.maxInternalMarks;
    } catch (e) {}

    const markValue = Number(value);
    if (isNaN(markValue) || markValue < 0 || markValue > maxMark) {
      return res.status(400).json({ success: false, message: `Mark value must be between 0 and configured maximum of ${maxMark}.` });
    }

    const editor = req.user ? `${req.user.name || req.user.email} (${req.user.role})` : 'Faculty User';
    const records = await InternalMark.find({ _id: { $in: ids } });

    const updatePromises = records.map(async (doc) => {
      const oldValue = doc[markType] || 0;
      doc[markType] = markValue;
      doc.maxMark = maxMark;

      const i1 = Number(doc.internal1) || 0;
      const i2 = Number(doc.internal2) || 0;
      const i3 = Number(doc.internal3) || 0;
      doc.average = Number(((i1 + i2 + i3) / 3).toFixed(2));
      doc.status = doc.average >= (maxMark * 0.4) ? 'PASS' : 'FAIL';
      doc.lastUpdated = new Date().toISOString().split('T')[0];

      doc.editHistory.push({
        markType,
        oldValue,
        newValue: markValue,
        editedBy: editor,
        editedAt: new Date()
      });

      return await doc.save();
    });

    const updatedDocs = await Promise.all(updatePromises);

    res.json({
      success: true,
      message: `Bulk updated ${markType} to ${markValue} for ${updatedDocs.length} students.`,
      updatedCount: updatedDocs.length,
      data: updatedDocs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, totalRecords: 0, data: [] });
  }
};

const getInternalMarkSettings = async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({ maxInternalMarks: 50 });
    }
    res.json({ success: true, maxInternalMarks: setting.maxInternalMarks || 50, data: setting });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateInternalMarkSettings = async (req, res) => {
  try {
    const { maxInternalMarks } = req.body;
    const maxVal = Number(maxInternalMarks);

    if (isNaN(maxVal) || maxVal <= 0) {
      return res.status(400).json({ success: false, message: 'Maximum internal marks must be a positive number.' });
    }

    let setting = await Setting.findOne();
    if (!setting) {
      setting = new Setting({ maxInternalMarks: maxVal });
    } else {
      setting.maxInternalMarks = maxVal;
    }
    await setting.save();

    await InternalMark.updateMany({}, { maxMark: maxVal });

    res.json({
      success: true,
      message: `Maximum Internal Marks updated to ${maxVal} throughout the ERP!`,
      maxInternalMarks: maxVal,
      data: setting
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
  sections: createCrudControllers(Section, 'Section'),
  assignments,
  timetables,
  auth,
  notes,
  reports,
  notifications,
  importExport,
  getStats,
  autoSeedDatabase,
  batchAttendance,
  generateQR,
  scanQR,
  promoteStudents,
  bulkUpdateInternalMarks,
  getInternalMarkSettings,
  updateInternalMarkSettings
};
