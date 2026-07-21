require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const connectDB = require('../config/db');
const controllers = require('../controllers/apiControllers');

const createMockReqRes = (query = {}) => {
  const req = { query, params: {}, body: {}, user: { role: 'admin', email: 'admin@jpcoe.ac.in' } };
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

const runApiStandardizationTests = async () => {
  console.log('==================================================');
  console.log('🧪 TESTING API RESPONSE STANDARDIZATION & SAFETY');
  console.log('==================================================\n');

  await connectDB();

  const endpointsToTest = [
    { name: 'Students GET', fn: controllers.students.getAll },
    { name: 'Faculty GET', fn: controllers.faculty.getAll },
    { name: 'Departments GET', fn: controllers.departments.getAll },
    { name: 'Subjects GET', fn: controllers.subjects.getAll },
    { name: 'Classes GET', fn: controllers.classes.getAll },
    { name: 'Attendance GET', fn: controllers.attendance.getAll },
    { name: 'Internal Marks GET', fn: controllers.internalMarks.getAll },
    { name: 'Semester Marks GET', fn: controllers.semesterMarks.getAll },
    { name: 'Notes GET', fn: controllers.notes.getAll },
    { name: 'Assignments GET', fn: controllers.assignments.getAll },
    { name: 'Timetables GET', fn: controllers.timetables.getAll },
    { name: 'Notifications GET', fn: controllers.notifications.getAll }
  ];

  let passed = 0;
  let failed = 0;

  for (const ep of endpointsToTest) {
    try {
      const { req, res, getResult } = createMockReqRes();
      await ep.fn(req, res);
      const { status, body } = getResult();

      if (status !== 200 || !body || body.success !== true) {
        console.error(`❌ ${ep.name} FAILED: Status ${status}, body:`, body);
        failed++;
        continue;
      }

      if (!Array.isArray(body.data)) {
        console.error(`❌ ${ep.name} FAILED: 'data' is not an array`, body);
        failed++;
        continue;
      }

      if (typeof body.totalRecords !== 'number') {
        console.error(`❌ ${ep.name} FAILED: 'totalRecords' is missing or not a number`, body);
        failed++;
        continue;
      }

      if (typeof body.page !== 'number' || typeof body.totalPages !== 'number') {
        console.error(`❌ ${ep.name} FAILED: 'page' or 'totalPages' missing`, body);
        failed++;
        continue;
      }

      console.log(`  ✅ ${ep.name} PASSED (totalRecords: ${body.totalRecords}, data count: ${body.data.length})`);
      passed++;

    } catch (err) {
      console.error(`❌ ${ep.name} EXCEPTION:`, err.message);
      failed++;
    }
  }

  console.log('\n==================================================');
  console.log(`🎯 API STANDARDIZATION RESULTS: ${passed} PASSED, ${failed} FAILED OUT OF ${endpointsToTest.length}`);
  console.log('==================================================\n');

  process.exit(failed === 0 ? 0 : 1);
};

runApiStandardizationTests();
