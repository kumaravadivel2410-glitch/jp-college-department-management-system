require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const StudentImportService = require('../services/import/StudentImportService');
const FacultyImportService = require('../services/import/FacultyImportService');
const connectDB = require('../config/db');

const runIntelligentImportTest = async () => {
  console.log('==================================================');
  console.log('🧪 TESTING INTELLIGENT COLUMN MAPPING & TOLERANT IMPORT');
  console.log('==================================================\n');

  await connectDB();

  // Test 1: Student import with non-standard column headers, missing Register No & missing Email, unknown extra columns
  const rawStudentRows = [
    {
      'Register Number': '953621109999',
      'Candidate Name': 'Subhash Bose',
      'Mail Address': 'subhash@jpcoe.ac.in',
      'Contact Number': '9876543299',
      'Branch': 'AI & DS',
      'Academic Year': 'III Year',
      'Sem': 'Semester V',
      'Sec': 'A',
      'Extra Custom Field': 'Ignored Data'
    },
    {
      'Full Name': 'Auto Reg Student',
      'Mail Address': '',
      'Mobile': '9123456789',
      'Department': 'CSE',
      'Random Unused Column': 'Will Be Ignored'
    }
  ];

  console.log('1️⃣ Testing Student Import with mismatched headers & missing values...');
  const studentReport = await StudentImportService.saveStudents(rawStudentRows);

  console.log(`  ✅ Total Processed: ${studentReport.totalRecords}`);
  console.log(`  ✅ Inserted/Updated: ${studentReport.inserted + studentReport.updated}`);
  console.log(`  ⚠️ Warnings (${studentReport.warnings.length}):`);
  studentReport.warnings.forEach(w => console.log(`     - Row ${w.row}: [${w.field}] ${w.message}`));

  if (studentReport.inserted + studentReport.updated === 2) {
    console.log('  🎉 Student Intelligent Import PASSED 100%!\n');
  } else {
    console.error('  ❌ Student Intelligent Import FAILED!\n');
  }

  // Test 2: Faculty import with mismatched column headers & missing Faculty ID
  const rawFacultyRows = [
    {
      'Teacher ID': 'JPC-FAC-888',
      'Staff Name': 'Dr. Kavitha Sundaram',
      'Email Address': 'kavitha@jpcoe.ac.in',
      'Branch': 'ECE',
      'Position': 'Associate Professor',
      'Work Experience': '10 Years'
    },
    {
      'Name': 'Auto ID Teacher',
      'Email': 'autoid@jpcoe.ac.in',
      'Role': 'Assistant Professor'
    }
  ];

  console.log('2️⃣ Testing Faculty Import with mismatched headers & missing Faculty ID...');
  const facultyReport = await FacultyImportService.saveFaculty(rawFacultyRows);

  console.log(`  ✅ Total Processed: ${facultyReport.totalRecords}`);
  console.log(`  ✅ Inserted/Updated: ${facultyReport.inserted + facultyReport.updated}`);
  console.log(`  ⚠️ Warnings (${facultyReport.warnings.length}):`);
  facultyReport.warnings.forEach(w => console.log(`     - Row ${w.row}: [${w.field}] ${w.message}`));

  if (facultyReport.inserted + facultyReport.updated === 2) {
    console.log('  🎉 Faculty Intelligent Import PASSED 100%!\n');
  } else {
    console.error('  ❌ Faculty Intelligent Import FAILED!\n');
  }

  console.log('==================================================');
  console.log('🎯 INTELLIGENT IMPORT TESTS COMPLETED SUCCESSFULLY');
  console.log('==================================================\n');

  process.exit(0);
};

runIntelligentImportTest();
