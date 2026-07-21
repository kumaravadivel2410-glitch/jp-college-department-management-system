const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const XLSX = require('xlsx');

const {
  StudentImportService,
  FacultyImportService,
  DepartmentImportService,
  SubjectImportService,
  ClassImportService,
  AttendanceImportService,
  InternalMarkImportService,
  SemesterMarkImportService,
  NotesImportService,
  AssignmentImportService,
  TimetableImportService,
  NotificationImportService
} = require('../services/import');

const connectDB = require('../config/db');

const createMockFile = (data, filename = 'test_import.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ImportSheet');
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return {
    originalname: filename,
    buffer,
    size: buffer.length
  };
};

const runAllImportTests = async () => {
  console.log('==================================================');
  console.log('🧪 RUNNING AUTOMATED TESTS FOR ALL 12 IMPORT MODULES');
  console.log('==================================================\n');

  try {
    await connectDB();
    let passed = 0;
    let failed = 0;

    // 1. Department Import Test
    try {
      console.log('1️⃣ Testing DepartmentImportService...');
      const deptData = [
        { departmentCode: 'TEST_CS', departmentName: 'Test CS Dept', hod: 'Dr. Test HOD', building: 'Block A', phone: '9998887770' }
      ];
      const deptFile = createMockFile(deptData);
      const parsed = await DepartmentImportService.parseDepartmentFile(deptFile);
      const report = await DepartmentImportService.saveDepartments(parsed);
      if (report.inserted > 0 || report.updated > 0) {
        console.log(`  ✅ DepartmentImportService PASSED (Inserted: ${report.inserted}, Updated: ${report.updated})`);
        passed++;
      } else {
        throw new Error('No records inserted or updated.');
      }
    } catch (err) {
      console.error(`  ❌ DepartmentImportService FAILED: ${err.message}`);
      failed++;
    }

    // 2. Student Import Test
    try {
      console.log('2️⃣ Testing StudentImportService...');
      const studentData = [
        { registerNo: 'TEST99001', studentName: 'Test Student One', email: 'test.student1@jpcoe.ac.in', phone: '9876543210', department: 'AI & DS', year: 'III Year', semester: 'Semester V', section: 'A', gender: 'Male' }
      ];
      const studentFile = createMockFile(studentData);
      const parsed = await StudentImportService.parseStudentFile(studentFile);
      const report = await StudentImportService.saveStudents(parsed);
      if (report.inserted > 0 || report.updated > 0) {
        console.log(`  ✅ StudentImportService PASSED (Inserted: ${report.inserted}, Updated: ${report.updated})`);
        passed++;
      } else {
        throw new Error('No records inserted or updated.');
      }
    } catch (err) {
      console.error(`  ❌ StudentImportService FAILED: ${err.message}`);
      failed++;
    }

    // 3. Faculty Import Test
    try {
      console.log('3️⃣ Testing FacultyImportService...');
      const facData = [
        { facultyId: 'TESTFAC01', facultyName: 'Dr. Test Faculty', email: 'testfac@jpcoe.ac.in', department: 'AI & DS', designation: 'Associate Professor' }
      ];
      const facFile = createMockFile(facData);
      const parsed = await FacultyImportService.parseFacultyFile(facFile);
      const report = await FacultyImportService.saveFaculty(parsed);
      if (report.inserted > 0 || report.updated > 0) {
        console.log(`  ✅ FacultyImportService PASSED (Inserted: ${report.inserted}, Updated: ${report.updated})`);
        passed++;
      } else {
        throw new Error('No records inserted or updated.');
      }
    } catch (err) {
      console.error(`  ❌ FacultyImportService FAILED: ${err.message}`);
      failed++;
    }

    // 4. Subject Import Test
    try {
      console.log('4️⃣ Testing SubjectImportService...');
      const subData = [
        { subjectCode: 'TEST301', subjectName: 'Test Subject', department: 'AI & DS', semester: 'Semester V', credits: 4, regulation: '2021' }
      ];
      const subFile = createMockFile(subData);
      const parsed = await SubjectImportService.parseSubjectFile(subFile);
      const report = await SubjectImportService.saveSubjects(parsed);
      if (report.inserted > 0 || report.updated > 0) {
        console.log(`  ✅ SubjectImportService PASSED (Inserted: ${report.inserted}, Updated: ${report.updated})`);
        passed++;
      } else {
        throw new Error('No records inserted or updated.');
      }
    } catch (err) {
      console.error(`  ❌ SubjectImportService FAILED: ${err.message}`);
      failed++;
    }

    // 5. Class Import Test
    try {
      console.log('5️⃣ Testing ClassImportService...');
      const classData = [
        { department: 'AI & DS', year: 'III Year', semester: 'Semester V', section: 'A', classAdvisor: 'Dr. Test Faculty', roomNumber: 'LH-301' }
      ];
      const classFile = createMockFile(classData);
      const parsed = await ClassImportService.parseClassFile(classFile);
      const report = await ClassImportService.saveClasses(parsed);
      if (report.inserted > 0 || report.updated > 0) {
        console.log(`  ✅ ClassImportService PASSED (Inserted: ${report.inserted}, Updated: ${report.updated})`);
        passed++;
      } else {
        throw new Error('No records inserted or updated.');
      }
    } catch (err) {
      console.error(`  ❌ ClassImportService FAILED: ${err.message}`);
      failed++;
    }

    // 6. Attendance Import Test
    try {
      console.log('6️⃣ Testing AttendanceImportService...');
      const attData = [
        { studentRegisterNo: 'TEST99001', subject: 'TEST301', date: '2026-07-21', session: 'Full Day', status: 'Present' }
      ];
      const attFile = createMockFile(attData);
      const parsed = await AttendanceImportService.parseAttendanceFile(attFile);
      const report = await AttendanceImportService.saveAttendance(parsed);
      if (report.inserted > 0 || report.updated > 0) {
        console.log(`  ✅ AttendanceImportService PASSED (Inserted: ${report.inserted}, Updated: ${report.updated})`);
        passed++;
      } else {
        throw new Error('No records inserted or updated.');
      }
    } catch (err) {
      console.error(`  ❌ AttendanceImportService FAILED: ${err.message}`);
      failed++;
    }

    // 7. Internal Mark Import Test
    try {
      console.log('7️⃣ Testing InternalMarkImportService...');
      const intData = [
        { studentRegisterNo: 'TEST99001', subjectCode: 'TEST301', internal1: 45, internal2: 48, internal3: 50, assignmentMark: 10 }
      ];
      const intFile = createMockFile(intData);
      const parsed = await InternalMarkImportService.parseInternalMarkFile(intFile);
      const report = await InternalMarkImportService.saveInternalMarks(parsed);
      if (report.inserted > 0 || report.updated > 0) {
        console.log(`  ✅ InternalMarkImportService PASSED (Avg Calculated: ${report.successRecords[0]?.average}, Total: ${report.inserted + report.updated})`);
        passed++;
      } else {
        throw new Error('No records inserted or updated.');
      }
    } catch (err) {
      console.error(`  ❌ InternalMarkImportService FAILED: ${err.message}`);
      failed++;
    }

    // 8. Semester Mark Import Test
    try {
      console.log('8️⃣ Testing SemesterMarkImportService...');
      const semData = [
        { studentRegisterNo: 'TEST99001', subjectCode: 'TEST301', grade: 'O', marks: 95, credits: 4, gpa: 9.5, cgpa: 9.2 }
      ];
      const semFile = createMockFile(semData);
      const parsed = await SemesterMarkImportService.parseSemesterMarkFile(semFile);
      const report = await SemesterMarkImportService.saveSemesterMarks(parsed);
      if (report.inserted > 0 || report.updated > 0) {
        console.log(`  ✅ SemesterMarkImportService PASSED (Inserted: ${report.inserted}, Updated: ${report.updated})`);
        passed++;
      } else {
        throw new Error('No records inserted or updated.');
      }
    } catch (err) {
      console.error(`  ❌ SemesterMarkImportService FAILED: ${err.message}`);
      failed++;
    }

    // 9. Notes Import Test
    try {
      console.log('9️⃣ Testing NotesImportService...');
      const notesData = [
        { title: 'Test Unit 1 Notes', department: 'AI & DS', semester: 'Semester V', subjectCode: 'TEST301', fileName: 'unit1.pdf', fileSize: '2.4 MB' }
      ];
      const notesFile = createMockFile(notesData);
      const parsed = await NotesImportService.parseNotesFile(notesFile);
      const report = await NotesImportService.saveNotes(parsed);
      if (report.inserted > 0 || report.updated > 0) {
        console.log(`  ✅ NotesImportService PASSED (Inserted: ${report.inserted}, Updated: ${report.updated})`);
        passed++;
      } else {
        throw new Error('No records inserted or updated.');
      }
    } catch (err) {
      console.error(`  ❌ NotesImportService FAILED: ${err.message}`);
      failed++;
    }

    // 10. Assignment Import Test
    try {
      console.log('🔟 Testing AssignmentImportService...');
      const assData = [
        { title: 'Test Assignment 1', description: 'Complete Unit 1 Problems', department: 'AI & DS', subjectCode: 'TEST301', dueDate: '2026-08-01' }
      ];
      const assFile = createMockFile(assData);
      const parsed = await AssignmentImportService.parseAssignmentFile(assFile);
      const report = await AssignmentImportService.saveAssignments(parsed);
      if (report.inserted > 0 || report.updated > 0) {
        console.log(`  ✅ AssignmentImportService PASSED (Inserted: ${report.inserted}, Updated: ${report.updated})`);
        passed++;
      } else {
        throw new Error('No records inserted or updated.');
      }
    } catch (err) {
      console.error(`  ❌ AssignmentImportService FAILED: ${err.message}`);
      failed++;
    }

    // 11. Timetable Import Test
    try {
      console.log('1️⃣1️⃣ Testing TimetableImportService...');
      const ttData = [
        { department: 'AI & DS', year: 'III Year', semester: 'Semester V', section: 'A', day: 'Monday', period: '09:00 AM - 10:00 AM', subjectCode: 'TEST301', roomNo: 'Lab 2' }
      ];
      const ttFile = createMockFile(ttData);
      const parsed = await TimetableImportService.parseTimetableFile(ttFile);
      const report = await TimetableImportService.saveTimetable(parsed);
      if (report.inserted > 0 || report.updated > 0) {
        console.log(`  ✅ TimetableImportService PASSED (Inserted: ${report.inserted}, Updated: ${report.updated})`);
        passed++;
      } else {
        throw new Error('No records inserted or updated.');
      }
    } catch (err) {
      console.error(`  ❌ TimetableImportService FAILED: ${err.message}`);
      failed++;
    }

    // 12. Notification Import Test
    try {
      console.log('1️⃣2️⃣ Testing NotificationImportService...');
      const notifData = [
        { title: 'System Maintenance Notice', message: 'ERP scheduled update tonight.', type: 'system', recipientRole: 'all' }
      ];
      const notifFile = createMockFile(notifData);
      const parsed = await NotificationImportService.parseNotificationFile(notifFile);
      const report = await NotificationImportService.saveNotifications(parsed);
      if (report.inserted > 0 || report.updated > 0) {
        console.log(`  ✅ NotificationImportService PASSED (Inserted: ${report.inserted}, Updated: ${report.updated})`);
        passed++;
      } else {
        throw new Error('No records inserted or updated.');
      }
    } catch (err) {
      console.error(`  ❌ NotificationImportService FAILED: ${err.message}`);
      failed++;
    }

    console.log('\n==================================================');
    console.log(`🎯 TEST RESULTS: ${passed} PASSED, ${failed} FAILED OUT OF 12 MODULES`);
    console.log('==================================================\n');

    process.exit(failed === 0 ? 0 : 1);
  } catch (err) {
    console.error('Test Runner Error:', err);
    process.exit(1);
  }
};

runAllImportTests();
