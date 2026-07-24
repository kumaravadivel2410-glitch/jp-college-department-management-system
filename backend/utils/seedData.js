import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import Department from '../models/Department.js';
import Subject from '../models/Subject.js';
import ClassModel from '../models/ClassModel.js';
import Attendance from '../models/Attendance.js';
import InternalMark from '../models/InternalMark.js';
import SemesterMark from '../models/SemesterMark.js';
import Assignment from '../models/Assignment.js';
import Note from '../models/Note.js';
import Timetable from '../models/Timetable.js';
import Report from '../models/Report.js';
import Download from '../models/Download.js';
import History from '../models/History.js';
import Setting from '../models/Setting.js';
import Approval from '../models/Approval.js';

export const seedDatabase = async () => {
  try {
    const studentCount = await Student.countDocuments();
    if (studentCount > 0) {
      console.log('🌱 Database already contains data. Skipping auto-seed.');
      return;
    }

    console.log('🌱 Seeding initial sample data with Register Numbers & Faculty IDs...');

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const facultyPassword = await bcrypt.hash('faculty123', salt);
    const studentPassword = await bcrypt.hash('student123', salt);

    // 1. Seed Users
    await User.insertMany([
      { name: 'Dr. S. Ramesh', email: 'admin@jpcollege.edu', password: adminPassword, role: 'Admin', department: 'Computer Science' },
      { name: 'Prof. K. Anitha', email: 'faculty@jpcollege.edu', facultyId: 'JPC-FAC-101', password: facultyPassword, role: 'Faculty', department: 'Computer Science' },
      { name: 'Karthik Kumar', email: 'student@jpcollege.edu', registerNumber: '951121104001', password: studentPassword, role: 'Student', department: 'Computer Science' }
    ]);

    // 2. Seed Departments
    await Department.insertMany([
      { code: 'CSE', name: 'Computer Science & Engineering', hod: 'Dr. M. Sundaram', totalFaculty: 18, totalStudents: 480, establishedYear: 2011 },
      { code: 'ECE', name: 'Electronics & Communication Engineering', hod: 'Dr. V. Rajesh', totalFaculty: 15, totalStudents: 420, establishedYear: 2011 },
      { code: 'EEE', name: 'Electrical & Electronics Engineering', hod: 'Dr. P. Swaminathan', totalFaculty: 12, totalStudents: 360, establishedYear: 2012 },
      { code: 'MECH', name: 'Mechanical Engineering', hod: 'Dr. K. Ganesan', totalFaculty: 20, totalStudents: 500, establishedYear: 2011 },
      { code: 'CIVIL', name: 'Civil Engineering', hod: 'Dr. A. Murugan', totalFaculty: 10, totalStudents: 300, establishedYear: 2013 }
    ]);

    // 3. Seed Faculty
    await Faculty.insertMany([
      { facultyId: 'JPC-FAC-101', name: 'Prof. K. Anitha', email: 'anitha@jpcollege.edu', department: 'CSE', designation: 'Associate Professor', qualification: 'Ph.D in AI', phone: '9876543210', experienceYears: 12, assignedSubjects: ['CS8691', 'CS8601'], assignedClasses: ['III Year CSE - A'] },
      { facultyId: 'JPC-FAC-102', name: 'Dr. M. Sundaram', email: 'sundaram@jpcollege.edu', department: 'CSE', designation: 'Professor & HOD', qualification: 'Ph.D in Data Science', phone: '9876543211', experienceYears: 18, assignedSubjects: ['CS8611'], assignedClasses: ['III Year CSE - A'] },
      { facultyId: 'JPC-FAC-103', name: 'Prof. R. Venkatesh', email: 'venkatesh@jpcollege.edu', department: 'ECE', designation: 'Assistant Professor', qualification: 'M.E. VLSI', phone: '9876543212', experienceYears: 7, assignedSubjects: ['EC8651'], assignedClasses: ['III Year ECE - B'] }
    ]);

    // 4. Seed Students
    await Student.insertMany([
      { registerNumber: '951121104001', name: 'Karthik Kumar', email: 'student@jpcollege.edu', department: 'CSE', year: 3, semester: 6, section: 'A', phone: '9123456780', cgpa: 8.75, photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
      { registerNumber: '951121104002', name: 'Priya Dharshini', email: 'priya@jpcollege.edu', department: 'CSE', year: 3, semester: 6, section: 'A', phone: '9123456781', cgpa: 9.12, photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
      { registerNumber: '951121104003', name: 'Arun Prakash', email: 'arun@jpcollege.edu', department: 'CSE', year: 3, semester: 6, section: 'A', phone: '9123456782', cgpa: 7.90, photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
      { registerNumber: '951121104004', name: 'Meena Subramanian', email: 'meena@jpcollege.edu', department: 'ECE', year: 3, semester: 6, section: 'B', phone: '9123456783', cgpa: 8.45, photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80' },
      { registerNumber: '951121104005', name: 'Suresh Raina', email: 'suresh@jpcollege.edu', department: 'EEE', year: 2, semester: 4, section: 'A', phone: '9123456784', cgpa: 8.20, photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' }
    ]);

    // 5. Seed Attendance
    await Attendance.insertMany([
      { registerNumber: '951121104001', studentName: 'Karthik Kumar', subjectCode: 'CS8691', subjectName: 'Artificial Intelligence', department: 'CSE', year: 3, semester: 6, section: 'A', facultyId: 'JPC-FAC-101', date: new Date(), status: 'Present', remarks: 'Regular' },
      { registerNumber: '951121104002', studentName: 'Priya Dharshini', subjectCode: 'CS8691', subjectName: 'Artificial Intelligence', department: 'CSE', year: 3, semester: 6, section: 'A', facultyId: 'JPC-FAC-101', date: new Date(), status: 'Present', remarks: 'Regular' },
      { registerNumber: '951121104003', studentName: 'Arun Prakash', subjectCode: 'CS8691', subjectName: 'Artificial Intelligence', department: 'CSE', year: 3, semester: 6, section: 'A', facultyId: 'JPC-FAC-101', date: new Date(), status: 'Absent', remarks: 'Medical Leave' }
    ]);

    // 6. Seed Marks
    await InternalMark.insertMany([
      { registerNumber: '951121104001', studentName: 'Karthik Kumar', department: 'CSE', year: 3, semester: 6, section: 'A', subjectCode: 'CS8691', subjectName: 'Artificial Intelligence', examType: 'Internal 1', marksObtained: 88, maxMarks: 100 },
      { registerNumber: '951121104002', studentName: 'Priya Dharshini', department: 'CSE', year: 3, semester: 6, section: 'A', subjectCode: 'CS8691', subjectName: 'Artificial Intelligence', examType: 'Internal 1', marksObtained: 95, maxMarks: 100 }
    ]);

    await SemesterMark.insertMany([
      { registerNumber: '951121104001', studentName: 'Karthik Kumar', department: 'CSE', semester: 5, gpa: 8.80, status: 'Pass', subjectsCount: 6, arrearsCount: 0 },
      { registerNumber: '951121104002', studentName: 'Priya Dharshini', department: 'CSE', semester: 5, gpa: 9.35, status: 'Pass', subjectsCount: 6, arrearsCount: 0 }
    ]);

    await Setting.create({
      collegeName: 'J.P. COLLEGE OF ENGINEERING',
      collegeCode: 'JPC-9511',
      academicYear: '2025-2026',
      currentSemesterType: 'Even'
    });

    console.log('✅ Enterprise auto-seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during auto-seeding:', error.message);
  }
};
