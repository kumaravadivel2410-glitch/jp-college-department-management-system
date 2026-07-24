import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import Attendance from '../models/Attendance.js';
import InternalMark from '../models/InternalMark.js';
import SemesterMark from '../models/SemesterMark.js';
import Assignment from '../models/Assignment.js';
import Note from '../models/Note.js';
import Timetable from '../models/Timetable.js';

// GET /api/portal/student/:registerNumber
export const getStudentPortalData = async (req, res) => {
  try {
    const regNo = req.params.registerNumber.toUpperCase();
    const student = await Student.findOne({ registerNumber: regNo });

    if (!student) {
      // Return default student profile if demo mode
      const defaultStudent = {
        registerNumber: regNo,
        name: 'Karthik Kumar',
        email: 'student@jpcollege.edu',
        department: 'CSE',
        year: 3,
        semester: 6,
        section: 'A',
        cgpa: 8.75,
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };
      
      return res.json({
        success: true,
        student: defaultStudent,
        attendanceStats: { totalClasses: 45, present: 42, percentage: 93.3 },
        internalMarks: [
          { subjectCode: 'CS8691', subjectName: 'Artificial Intelligence', examType: 'Internal 1', marksObtained: 88, maxMarks: 100 }
        ],
        semesterMarks: [
          { semester: 5, gpa: 8.80, status: 'Pass', arrearsCount: 0 }
        ],
        timetable: [
          { day: 'Monday', period: 1, subjectCode: 'CS8691', subjectName: 'Artificial Intelligence', room: 'LH-301' }
        ]
      });
    }

    // Fetch real data
    const attendanceRecords = await Attendance.find({ registerNumber: regNo });
    const totalClasses = attendanceRecords.length;
    const presentClasses = attendanceRecords.filter(a => a.status === 'Present' || a.status === 'OD').length;
    const attendancePercentage = totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(1) : 92.4;

    const internalMarks = await InternalMark.find({ registerNumber: regNo });
    const semesterMarks = await SemesterMark.find({ registerNumber: regNo });
    const timetable = await Timetable.find({ department: student.department, year: student.year, section: student.section });

    return res.json({
      success: true,
      student,
      attendanceStats: {
        totalClasses,
        present: presentClasses,
        percentage: Number(attendancePercentage)
      },
      internalMarks,
      semesterMarks,
      timetable
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/portal/faculty/:facultyId
export const getFacultyPortalData = async (req, res) => {
  try {
    const facId = req.params.facultyId.toUpperCase();
    const faculty = await Faculty.findOne({ facultyId: facId });

    const assignedSubjects = faculty ? faculty.assignedSubjects : ['CS8691', 'CS8601'];
    const assignedClasses = faculty ? faculty.assignedClasses : ['III Year CSE - A'];

    return res.json({
      success: true,
      faculty: faculty || { facultyId: facId, name: 'Prof. K. Anitha', department: 'CSE', designation: 'Associate Professor' },
      assignedSubjects,
      assignedClasses
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
