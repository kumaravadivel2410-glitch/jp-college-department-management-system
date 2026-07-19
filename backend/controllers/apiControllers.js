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
    { facultyId: 'JPC-FAC-101', facultyName: 'Dr. M. Senthil Kumar', department: 'AI & DS', subject: 'Machine Learning', qualification: 'Ph.D. in AI', phone: '9876543210', email: 'senthil@jpcoe.ac.in', experience: '12 Years', designation: 'Professor & HOD' },
    { facultyId: 'JPC-FAC-102', facultyName: 'Prof. Anitha Raj', department: 'CSE', subject: 'Data Structures', qualification: 'M.E. Computer Science', phone: '9876543211', email: 'anitha@jpcoe.ac.in', experience: '8 Years', designation: 'Associate Professor' },
    { facultyId: 'JPC-FAC-103', facultyName: 'Dr. R. Meenakshi', department: 'ECE', subject: 'VLSI Design', qualification: 'Ph.D. Microelectronics', phone: '9876543212', email: 'meenakshi@jpcoe.ac.in', experience: '15 Years', designation: 'Professor & HOD' },
    { facultyId: 'JPC-FAC-104', facultyName: 'Prof. G. Prakash', department: 'EEE', subject: 'Power Electronics', qualification: 'M.Tech EEE', phone: '9876543213', email: 'prakash@jpcoe.ac.in', experience: '6 Years', designation: 'Assistant Professor' },
    { facultyId: 'JPC-FAC-105', facultyName: 'Dr. S. Karthik', department: 'Mechanical', subject: 'Thermodynamics', qualification: 'Ph.D. Thermal Engg', phone: '9876543214', email: 'karthik@jpcoe.ac.in', experience: '14 Years', designation: 'Professor & HOD' }
  ],
  students: [
    { registerNo: '953621104001', studentName: 'Aarav Kumar', rollNumber: '21AD01', department: 'AI & DS', year: 'III Year', semester: 'Semester V', section: 'A', phone: '9123456780', email: 'aarav.21ad@jpcoe.ac.in', address: 'Tenkasi, Tamil Nadu', parentName: 'R. Kumar', parentPhone: '9443322110', bloodGroup: 'O+', dateOfBirth: '2003-05-14', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80' },
    { registerNo: '953621104002', studentName: 'Bhavna Sharma', rollNumber: '21AD02', department: 'AI & DS', year: 'III Year', semester: 'Semester V', section: 'A', phone: '9123456781', email: 'bhavna.21ad@jpcoe.ac.in', address: 'Tirunelveli, Tamil Nadu', parentName: 'S. Sharma', parentPhone: '9443322111', bloodGroup: 'A+', dateOfBirth: '2003-08-22', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
    { registerNo: '953621104003', studentName: 'Chandran V', rollNumber: '21CS01', department: 'CSE', year: 'III Year', semester: 'Semester V', section: 'B', phone: '9123456782', email: 'chandran.21cs@jpcoe.ac.in', address: 'Madurai, Tamil Nadu', parentName: 'M. Velu', parentPhone: '9443322112', bloodGroup: 'B+', dateOfBirth: '2003-02-10', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { registerNo: '953621104004', studentName: 'Divya Dharshini', rollNumber: '22EC05', department: 'ECE', year: 'II Year', semester: 'Semester III', section: 'A', phone: '9123456783', email: 'divya.22ec@jpcoe.ac.in', address: 'Sankarankovil, Tamil Nadu', parentName: 'K. Perumal', parentPhone: '9443322113', bloodGroup: 'AB+', dateOfBirth: '2004-11-05', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
    { registerNo: '953621104005', studentName: 'Elango N', rollNumber: '20ME12', department: 'Mechanical', year: 'IV Year', semester: 'Semester VII', section: 'A', phone: '9123456784', email: 'elango.20me@jpcoe.ac.in', address: 'Tirunelveli, Tamil Nadu', parentName: 'N. Natarajan', parentPhone: '9443322114', bloodGroup: 'O-', dateOfBirth: '2002-04-18', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' }
  ],
  subjects: [
    { subjectCode: 'AD3501', subjectName: 'Deep Learning', credits: 4, facultyName: 'Dr. M. Senthil Kumar', department: 'AI & DS', semester: 'Semester V' },
    { subjectCode: 'CS3401', subjectName: 'Algorithms & Data Structures', credits: 3, facultyName: 'Prof. Anitha Raj', department: 'CSE', semester: 'Semester III' },
    { subjectCode: 'EC3302', subjectName: 'VLSI Systems', credits: 4, facultyName: 'Dr. R. Meenakshi', department: 'ECE', semester: 'Semester V' }
  ],
  classes: [
    { className: 'III AI&DS A', department: 'AI & DS', year: 'III Year', semester: 'Semester V', section: 'A', classAdvisor: 'Dr. M. Senthil Kumar' },
    { className: 'III CSE B', department: 'CSE', year: 'III Year', semester: 'Semester V', section: 'B', classAdvisor: 'Prof. Anitha Raj' }
  ],
  attendance: [
    { studentRegisterNo: '953621104001', studentName: 'Aarav Kumar', department: 'AI & DS', semester: 'Semester V', date: '2026-07-19', status: 'Present', percentage: 96, remarks: 'On Time' },
    { studentRegisterNo: '953621104002', studentName: 'Bhavna Sharma', department: 'AI & DS', semester: 'Semester V', date: '2026-07-19', status: 'Present', percentage: 98, remarks: 'On Time' }
  ],
  semesterMarks: [
    { studentRegisterNo: '953621104001', studentName: 'Aarav Kumar', department: 'AI & DS', semester: 'Semester V', subjectCode: 'AD3501', subjectName: 'Deep Learning', grade: 'O', cgpa: 9.2, arrears: 0, result: 'PASS' },
    { studentRegisterNo: '953621104002', studentName: 'Bhavna Sharma', department: 'AI & DS', semester: 'Semester V', subjectCode: 'AD3501', subjectName: 'Deep Learning', grade: 'A+', cgpa: 8.9, arrears: 0, result: 'PASS' }
  ],
  internalMarks: [
    { studentRegisterNo: '953621104001', studentName: 'Aarav Kumar', department: 'AI & DS', semester: 'Semester V', subjectCode: 'AD3501', subjectName: 'Deep Learning', internal1: 48, internal2: 46, modelExam: 92, assignment: 10, totalInternal: 98 },
    { studentRegisterNo: '953621104002', studentName: 'Bhavna Sharma', department: 'AI & DS', semester: 'Semester V', subjectCode: 'AD3501', subjectName: 'Deep Learning', internal1: 45, internal2: 47, modelExam: 89, assignment: 10, totalInternal: 94 }
  ],
  history: [
    { date: '2026-07-19', time: '09:30:15', action: 'MongoDB Atlas Connected', user: 'System Admin', department: 'General', details: 'JP College DMS Connected to MongoDB Atlas Cloud collegeDB' }
  ]
};

// Helper for formatting duplicate key errors into human friendly responses
const formatDuplicateError = (err, defaultModelName) => {
  const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'field';
  if (field === 'facultyId' || defaultModelName === 'Faculty') {
    return 'Faculty ID already exists. Please use a different Faculty ID.';
  }
  if (field === 'registerNo' || defaultModelName === 'Student') {
    return 'Register Number already exists. Please use a different Register Number.';
  }
  return `${field} already exists. Please use a unique value.`;
};

// Seed MongoDB Atlas automatically if collections are empty & log collection stats
const autoSeedDatabase = async () => {
  try {
    try {
      await Student.collection.dropIndex('studentId_1');
    } catch (e) {}

    try {
      await Faculty.collection.dropIndex('email_1');
    } catch (e) {}

    const studentCount = await Student.countDocuments();
    if (studentCount === 0) {
      console.log('🌱 Seeding initial records directly into MongoDB Atlas [collegeDB]...');
      await Department.insertMany(SEED_DATA.departments);
      await Faculty.insertMany(SEED_DATA.faculty);
      await Student.insertMany(SEED_DATA.students);
      await Subject.insertMany(SEED_DATA.subjects);
      await ClassModel.insertMany(SEED_DATA.classes);
      await Attendance.insertMany(SEED_DATA.attendance);
      await SemesterMark.insertMany(SEED_DATA.semesterMarks);
      await InternalMark.insertMany(SEED_DATA.internalMarks);
      await History.insertMany(SEED_DATA.history);
      console.log('✅ Initial documents inserted into MongoDB Atlas [collegeDB] successfully!');
    }

    const counts = {
      students: await Student.countDocuments(),
      faculty: await Faculty.countDocuments(),
      departments: await Department.countDocuments(),
      subjects: await Subject.countDocuments(),
      classes: await ClassModel.countDocuments(),
      attendance: await Attendance.countDocuments(),
      internalmarks: await InternalMark.countDocuments(),
      semestermarks: await SemesterMark.countDocuments(),
      history: await History.countDocuments(),
      settings: await Setting.countDocuments()
    };

    console.log('Collections in collegeDB:');
    Object.keys(counts).forEach(col => {
      console.log(`- ${col} (${counts[col]} documents)`);
    });
  } catch (err) {
    console.error('Auto seed / collection log warning:', err.message);
  }
};

// Helper to record history log
const recordHistory = async (action, user = 'Faculty/Admin', department = 'General', details = '') => {
  try {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];
    
    await History.create({
      date: dateStr,
      time: timeStr,
      action,
      user,
      department,
      details
    });
  } catch (err) {
    console.error('History logging error:', err.message);
  }
};

// Generic Controller Handler Generator for MongoDB Mongoose
const createCrudHandlers = (Model, modelName) => ({
  getAll: async (req, res) => {
    try {
      const items = await Model.find().sort({ updatedAt: -1 });
      res.json({ success: true, data: items });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
  create: async (req, res) => {
    try {
      // Pre-check for duplicate Faculty ID before save
      if (modelName === 'Faculty' && req.body.facultyId) {
        const existing = await Faculty.findOne({ facultyId: req.body.facultyId.trim() });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'Faculty ID already exists. Please use a different Faculty ID.'
          });
        }
      }

      const newItem = await Model.create(req.body);
      await recordHistory(
        `Added New ${modelName}`,
        req.headers['x-user-role'] || 'Faculty/Admin',
        req.body.department || 'General',
        `Created ${modelName}: ${newItem.studentName || newItem.facultyName || newItem.name || newItem.subjectName || newItem._id}`
      );
      res.status(201).json({ success: true, data: newItem });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({
          success: false,
          message: formatDuplicateError(err, modelName)
        });
      }
      res.status(400).json({ success: false, message: err.message });
    }
  },
  update: async (req, res) => {
    try {
      // Pre-check for duplicate Faculty ID on update
      if (modelName === 'Faculty' && req.body.facultyId) {
        const existing = await Faculty.findOne({
          facultyId: req.body.facultyId.trim(),
          _id: { $ne: req.params.id }
        });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'Faculty ID already exists. Please use a different Faculty ID.'
          });
        }
      }

      const updatedItem = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!updatedItem) return res.status(404).json({ success: false, message: 'Not found' });

      await recordHistory(
        `Updated ${modelName}`,
        req.headers['x-user-role'] || 'Faculty/Admin',
        updatedItem.department || 'General',
        `Updated ${modelName}: ${updatedItem.studentName || updatedItem.facultyName || updatedItem.name || updatedItem._id}`
      );
      res.json({ success: true, data: updatedItem });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({
          success: false,
          message: formatDuplicateError(err, modelName)
        });
      }
      res.status(400).json({ success: false, message: err.message });
    }
  },
  delete: async (req, res) => {
    try {
      const deletedItem = await Model.findByIdAndDelete(req.params.id);
      if (!deletedItem) return res.status(404).json({ success: false, message: 'Not found' });

      await recordHistory(
        `Deleted ${modelName}`,
        req.headers['x-user-role'] || 'Faculty/Admin',
        deletedItem.department || 'General',
        `Removed ${modelName} ID: ${req.params.id}`
      );
      res.json({ success: true, data: deletedItem });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
});

// Stats controller for Dashboard
const getStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalFaculty = await Faculty.countDocuments();
    const totalDepartments = await Department.countDocuments();
    const totalSubjects = await Subject.countDocuments();
    const totalClasses = await ClassModel.countDocuments();
    const recentHistory = await History.find().sort({ createdAt: -1 }).limit(10);

    res.json({
      success: true,
      data: {
        totalStudents,
        totalFaculty,
        totalDepartments,
        totalSubjects,
        totalClasses,
        recentHistory
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  students: createCrudHandlers(Student, 'Student'),
  faculty: createCrudHandlers(Faculty, 'Faculty'),
  departments: createCrudHandlers(Department, 'Department'),
  subjects: createCrudHandlers(Subject, 'Subject'),
  classes: createCrudHandlers(ClassModel, 'Class'),
  attendance: createCrudHandlers(Attendance, 'Attendance'),
  semesterMarks: createCrudHandlers(SemesterMark, 'Semester Mark'),
  internalMarks: createCrudHandlers(InternalMark, 'Internal Mark'),
  history: createCrudHandlers(History, 'History Record'),
  settings: createCrudHandlers(Setting, 'Setting'),
  getStats,
  recordHistory,
  autoSeedDatabase
};
