/**
 * JP College of Engineering - Department Management System
 * Initial Mock / Seed Data
 */
const INITIAL_DATA = {
  departments: [
    { _id: 'dept_1', code: 'AI&DS', name: 'Artificial Intelligence & Data Science', hodName: 'Dr. M. Senthil Kumar', description: 'Cutting-edge AI, Machine Learning, and Big Data technologies.', establishedYear: '2021' },
    { _id: 'dept_2', code: 'CSE', name: 'Computer Science & Engineering', hodName: 'Dr. K. Ramanathan', description: 'Core software development, algorithms, and cybersecurity.', establishedYear: '2010' },
    { _id: 'dept_3', code: 'ECE', name: 'Electronics & Communication Engineering', hodName: 'Dr. R. Meenakshi', description: 'VLSI, embedded systems, signal processing, and robotics.', establishedYear: '2010' },
    { _id: 'dept_4', code: 'EEE', name: 'Electrical & Electronics Engineering', hodName: 'Prof. A. Vijay', description: 'Power systems, renewable energy, and smart grids.', establishedYear: '2012' },
    { _id: 'dept_5', code: 'MECH', name: 'Mechanical Engineering', hodName: 'Dr. S. Karthik', description: 'Thermal, CAD/CAM, automotive engineering, and mechatronics.', establishedYear: '2010' },
    { _id: 'dept_6', code: 'CIVIL', name: 'Civil Engineering', hodName: 'Prof. P. Lakshmi', description: 'Structural engineering, surveying, and green construction.', establishedYear: '2014' }
  ],
  faculty: [
    { _id: 'fac_1', facultyId: 'JPC-FAC-101', facultyName: 'Dr. M. Senthil Kumar', department: 'AI & DS', subject: 'Machine Learning', qualification: 'Ph.D. in AI', phone: '9876543210', email: 'senthil@jpcoe.ac.in', experience: '12 Years', designation: 'Professor & HOD' },
    { _id: 'fac_2', facultyId: 'JPC-FAC-102', facultyName: 'Prof. Anitha Raj', department: 'CSE', subject: 'Data Structures', qualification: 'M.E. Computer Science', phone: '9876543211', email: 'anitha@jpcoe.ac.in', experience: '8 Years', designation: 'Associate Professor' },
    { _id: 'fac_3', facultyId: 'JPC-FAC-103', facultyName: 'Dr. R. Meenakshi', department: 'ECE', subject: 'VLSI Design', qualification: 'Ph.D. Microelectronics', phone: '9876543212', email: 'meenakshi@jpcoe.ac.in', experience: '15 Years', designation: 'Professor & HOD' },
    { _id: 'fac_4', facultyId: 'JPC-FAC-104', facultyName: 'Prof. G. Prakash', department: 'EEE', subject: 'Power Electronics', qualification: 'M.Tech EEE', phone: '9876543213', email: 'prakash@jpcoe.ac.in', experience: '6 Years', designation: 'Assistant Professor' },
    { _id: 'fac_5', facultyId: 'JPC-FAC-105', facultyName: 'Dr. S. Karthik', department: 'Mechanical', subject: 'Thermodynamics', qualification: 'Ph.D. Thermal Engg', phone: '9876543214', email: 'karthik@jpcoe.ac.in', experience: '14 Years', designation: 'Professor & HOD' }
  ],
  students: [
    {
      _id: 'stud_1',
      registerNo: '953621104001',
      studentName: 'Aarav Kumar',
      department: 'AI & DS',
      year: 'III Year',
      semester: 'Semester 5',
      section: 'A',
      phone: '9123456780',
      email: 'aarav.21ad@jpcoe.ac.in',
      address: 'Tenkasi, Tamil Nadu',
      parentName: 'R. Kumar',
      parentPhone: '9443322110',
      bloodGroup: 'O+',
      dateOfBirth: '2003-05-14',
      photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
    },
    {
      _id: 'stud_2',
      registerNo: '953621104002',
      studentName: 'Bhavna Sharma',
      department: 'AI & DS',
      year: 'III Year',
      semester: 'Semester 5',
      section: 'A',
      phone: '9123456781',
      email: 'bhavna.21ad@jpcoe.ac.in',
      address: 'Tirunelveli, Tamil Nadu',
      parentName: 'S. Sharma',
      parentPhone: '9443322111',
      bloodGroup: 'A+',
      dateOfBirth: '2003-08-22',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    },
    {
      _id: 'stud_3',
      registerNo: '953621104003',
      studentName: 'Chandran V',
      department: 'CSE',
      year: 'III Year',
      semester: 'Semester 5',
      section: 'B',
      phone: '9123456782',
      email: 'chandran.21cs@jpcoe.ac.in',
      address: 'Madurai, Tamil Nadu',
      parentName: 'M. Velu',
      parentPhone: '9443322112',
      bloodGroup: 'B+',
      dateOfBirth: '2003-02-10',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      _id: 'stud_4',
      registerNo: '953621104004',
      studentName: 'Divya Dharshini',
      department: 'ECE',
      year: 'II Year',
      semester: 'Semester 3',
      section: 'A',
      phone: '9123456783',
      email: 'divya.22ec@jpcoe.ac.in',
      address: 'Sankarankovil, Tamil Nadu',
      parentName: 'K. Perumal',
      parentPhone: '9443322113',
      bloodGroup: 'AB+',
      dateOfBirth: '2004-11-05',
      photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
    },
    {
      _id: 'stud_5',
      registerNo: '953621104005',
      studentName: 'Elango N',
      department: 'Mechanical',
      year: 'IV Year',
      semester: 'Semester 7',
      section: 'A',
      phone: '9123456784',
      email: 'elango.20me@jpcoe.ac.in',
      address: 'Tirunelveli, Tamil Nadu',
      parentName: 'N. Natarajan',
      parentPhone: '9443322114',
      bloodGroup: 'O-',
      dateOfBirth: '2002-04-18',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    }
  ],
  subjects: [
    { _id: 'sub_1', subjectCode: 'AD3501', subjectName: 'Deep Learning', credits: 4, facultyName: 'Dr. M. Senthil Kumar', department: 'AI & DS', semester: 'Semester 5' },
    { _id: 'sub_2', subjectCode: 'CS3401', subjectName: 'Algorithms & Data Structures', credits: 3, facultyName: 'Prof. Anitha Raj', department: 'CSE', semester: 'Semester 3' },
    { _id: 'sub_3', subjectCode: 'EC3302', subjectName: 'VLSI Systems', credits: 4, facultyName: 'Dr. R. Meenakshi', department: 'ECE', semester: 'Semester 5' },
    { _id: 'sub_4', subjectCode: 'EE3403', subjectName: 'Control Systems', credits: 3, facultyName: 'Prof. G. Prakash', department: 'EEE', semester: 'Semester 4' },
    { _id: 'sub_5', subjectCode: 'ME3501', subjectName: 'Fluid Mechanics', credits: 4, facultyName: 'Dr. S. Karthik', department: 'Mechanical', semester: 'Semester 5' }
  ],
  classes: [
    { _id: 'cls_1', className: 'III AI&DS A', department: 'AI & DS', year: 'III Year', semester: 'Semester 5', section: 'A', classAdvisor: 'Dr. M. Senthil Kumar' },
    { _id: 'cls_2', className: 'III CSE B', department: 'CSE', year: 'III Year', semester: 'Semester 5', section: 'B', classAdvisor: 'Prof. Anitha Raj' },
    { _id: 'cls_3', className: 'II ECE A', department: 'ECE', year: 'II Year', semester: 'Semester 3', section: 'A', classAdvisor: 'Dr. R. Meenakshi' },
    { _id: 'cls_4', className: 'IV MECH A', department: 'Mechanical', year: 'IV Year', semester: 'Semester 7', section: 'A', classAdvisor: 'Dr. S. Karthik' }
  ],
  attendance: [
    { _id: 'att_1', studentRegisterNo: '953621104001', studentName: 'Aarav Kumar', department: 'AI & DS', semester: 'Semester 5', date: '2026-07-19', status: 'Present', percentage: 96, remarks: 'On Time' },
    { _id: 'att_2', studentRegisterNo: '953621104002', studentName: 'Bhavna Sharma', department: 'AI & DS', semester: 'Semester 5', date: '2026-07-19', status: 'Present', percentage: 98, remarks: 'On Time' },
    { _id: 'att_3', studentRegisterNo: '953621104003', studentName: 'Chandran V', department: 'CSE', semester: 'Semester 5', date: '2026-07-19', status: 'Medical Leave', percentage: 88, remarks: 'Approved Medical Cert' },
    { _id: 'att_4', studentRegisterNo: '953621104004', studentName: 'Divya Dharshini', department: 'ECE', semester: 'Semester 3', date: '2026-07-19', status: 'OD', percentage: 92, remarks: 'Symposium Duty' },
    { _id: 'att_5', studentRegisterNo: '953621104005', studentName: 'Elango N', department: 'Mechanical', semester: 'Semester 7', date: '2026-07-19', status: 'Present', percentage: 94, remarks: 'On Time' }
  ],
  semesterMarks: [
    { _id: 'sm_1', studentRegisterNo: '953621104001', studentName: 'Aarav Kumar', department: 'AI & DS', semester: 'Semester 5', subjectCode: 'AD3501', subjectName: 'Deep Learning', grade: 'O', cgpa: 9.2, arrears: 0, result: 'PASS' },
    { _id: 'sm_2', studentRegisterNo: '953621104002', studentName: 'Bhavna Sharma', department: 'AI & DS', semester: 'Semester 5', subjectCode: 'AD3501', subjectName: 'Deep Learning', grade: 'A+', cgpa: 8.9, arrears: 0, result: 'PASS' },
    { _id: 'sm_3', studentRegisterNo: '953621104003', studentName: 'Chandran V', department: 'CSE', semester: 'Semester 5', subjectCode: 'CS3401', subjectName: 'Algorithms', grade: 'A', cgpa: 8.1, arrears: 0, result: 'PASS' },
    { _id: 'sm_4', studentRegisterNo: '953621104004', studentName: 'Divya Dharshini', department: 'ECE', semester: 'Semester 3', subjectCode: 'EC3302', subjectName: 'VLSI Systems', grade: 'B+', cgpa: 7.5, arrears: 0, result: 'PASS' }
  ],
  internalMarks: [
    { _id: 'im_1', studentRegisterNo: '953621104001', studentName: 'Aarav Kumar', department: 'AI & DS', semester: 'Semester 5', subjectCode: 'AD3501', subjectName: 'Deep Learning', internal1: 48, internal2: 46, modelExam: 92, assignment: 10, totalInternal: 98 },
    { _id: 'im_2', studentRegisterNo: '953621104002', studentName: 'Bhavna Sharma', department: 'AI & DS', semester: 'Semester 5', subjectCode: 'AD3501', subjectName: 'Deep Learning', internal1: 45, internal2: 47, modelExam: 89, assignment: 10, totalInternal: 94 },
    { _id: 'im_3', studentRegisterNo: '953621104003', studentName: 'Chandran V', department: 'CSE', semester: 'Semester 5', subjectCode: 'CS3401', subjectName: 'Algorithms', internal1: 40, internal2: 42, modelExam: 80, assignment: 9, totalInternal: 85 }
  ],
  history: [
    { _id: 'hist_1', date: '2026-07-19', time: '09:30:15', action: 'System Initialized', user: 'System Admin', department: 'General', details: 'JP College DMS Advanced Version Loaded' },
    { _id: 'hist_2', date: '2026-07-19', time: '10:15:40', action: 'Added New Student', user: 'Dr. M. Senthil Kumar', department: 'AI & DS', details: 'Added student Aarav Kumar (953621104001)' },
    { _id: 'hist_3', date: '2026-07-19', time: '11:05:22', action: 'Updated Attendance', user: 'Prof. Anitha Raj', department: 'CSE', details: 'Marked daily attendance for III CSE B' }
  ],
  settings: {
    collegeName: 'J.P. College of Engineering',
    academicYear: '2025-2026',
    activeSemester: 'Odd Semester (2025-2026)',
    theme: 'golden-dark',
    userRole: 'Faculty/Admin'
  }
};
