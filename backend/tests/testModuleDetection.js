require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const connectDB = require('../config/db');
const StudentImportService = require('../services/import/StudentImportService');
const FacultyImportService = require('../services/import/FacultyImportService');
const importControllers = require('../controllers/importControllers');

const createMockReqRes = (params = {}, body = {}, file = null) => {
  const req = { params, body, file, user: { role: 'admin', email: 'admin@jpcoe.ac.in' } };
  let responseData = null;
  let statusCode = 200;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    }
  };

  return { req, res, getResult: () => ({ status: statusCode, body: responseData }) };
};

const runModuleDetectionTests = async () => {
  console.log('==================================================');
  console.log('🧪 TESTING INTELLIGENT MODULE DETECTION & MISMATCH PREVENTION');
  console.log('==================================================\n');

  await connectDB();

  // Test 1: Cross-module mismatch detection (Faculty rows into Student import)
  console.log('1️⃣ Testing Faculty file uploaded into Student Import...');
  const facultyRowsInStudentTarget = [
    {
      facultyId: 'JPC-FAC-999',
      facultyName: 'Dr. Mismatch Faculty',
      designation: 'Professor',
      qualification: 'Ph.D.'
    }
  ];

  const { req: req1, res: res1, getResult: getRes1 } = createMockReqRes({ module: 'students' }, { records: facultyRowsInStudentTarget });
  await importControllers.executeModuleImport(req1, res1);
  const resData1 = getRes1();

  if (resData1.status === 400 && resData1.body?.moduleMismatch === true && resData1.body?.detectedModule === 'faculty') {
    console.log(`  ✅ Mismatch Detected Correctly! Message: "${resData1.body.message}"`);
    console.log('  🎉 Cross-Module Mismatch Test PASSED!\n');
  } else {
    console.error('  ❌ Cross-Module Mismatch Test FAILED:', resData1);
  }

  // Test 2: Student file uploaded into Faculty import
  console.log('2️⃣ Testing Student file uploaded into Faculty Import...');
  const studentRowsInFacultyTarget = [
    {
      registerNo: '953621101111',
      studentName: 'Mismatch Student',
      rollNumber: '21AD99',
      parentPhone: '9876543210'
    }
  ];

  const { req: req2, res: res2, getResult: getRes2 } = createMockReqRes({ module: 'faculty' }, { records: studentRowsInFacultyTarget });
  await importControllers.executeModuleImport(req2, res2);
  const resData2 = getRes2();

  if (resData2.status === 400 && resData2.body?.moduleMismatch === true && resData2.body?.detectedModule === 'students') {
    console.log(`  ✅ Mismatch Detected Correctly! Message: "${resData2.body.message}"`);
    console.log('  🎉 Cross-Module Mismatch Test PASSED!\n');
  } else {
    console.error('  ❌ Cross-Module Mismatch Test FAILED:', resData2);
  }

  // Test 3: Missing Register No WITHOUT autoGenerateIds (Default: Reject fake auto-generated IDs)
  console.log('3️⃣ Testing missing Register No WITHOUT autoGenerateIds (Default Behavior)...');
  const missingRegRows = [
    {
      studentName: 'No Reg Student',
      department: 'CSE'
    }
  ];

  const reportNoAuto = await StudentImportService.saveStudents(missingRegRows, { allowAutoGenerateIds: false });
  console.log(`  Validation Failed Count: ${reportNoAuto.failed}`);
  console.log(`  Error Message: "${reportNoAuto.validationErrors[0]?.message}"`);

  if (reportNoAuto.failed === 1 && reportNoAuto.validationErrors[0]?.message.includes('Register Number is missing')) {
    console.log('  🎉 Fake ID prevention PASSED 100%!\n');
  } else {
    console.error('  ❌ Fake ID prevention FAILED:', reportNoAuto);
  }

  // Test 4: Missing Register No WITH autoGenerateIds enabled
  console.log('4️⃣ Testing missing Register No WITH autoGenerateIds enabled...');
  const reportWithAuto = await StudentImportService.saveStudents(missingRegRows, { allowAutoGenerateIds: true });
  console.log(`  Inserted/Updated Count: ${reportWithAuto.inserted + reportWithAuto.updated}`);
  console.log(`  Warning Message: "${reportWithAuto.warnings[0]?.message}"`);

  if (reportWithAuto.inserted + reportWithAuto.updated === 1 && reportWithAuto.warnings[0]?.message.includes('Generated automatically')) {
    console.log('  🎉 Auto-Generate IDs Toggle PASSED 100%!\n');
  } else {
    console.error('  ❌ Auto-Generate IDs Toggle FAILED:', reportWithAuto);
  }

  console.log('==================================================');
  console.log('🎯 INTELLIGENT MODULE DETECTION TESTS COMPLETED');
  console.log('==================================================\n');

  process.exit(0);
};

runModuleDetectionTests();
