require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const connectDB = require('../config/db');
const Faculty = require('../models/Faculty');
const controllers = require('../controllers/apiControllers');

const createMockReqRes = (body = {}, userRole = 'admin') => {
  const req = { body, params: {}, query: {}, user: { role: userRole, email: 'admin@jpcoe.ac.in', name: 'Admin User' } };
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

const runFacultyBulkDeleteTest = async () => {
  console.log('==================================================');
  console.log('🧪 TESTING FACULTY BULK DELETE API (DELETE & POST /api/faculty/bulk-delete)');
  console.log('==================================================\n');

  await connectDB();

  const facIds = ['TEST_FAC1001', 'TEST_FAC1002', 'TEST_FAC1003'];
  await Faculty.deleteMany({ facultyId: { $in: facIds } });

  // Create temporary test faculty members
  console.log('1️⃣ Creating temporary faculty records...');
  const tempFaculty = await Faculty.insertMany([
    { facultyId: 'TEST_FAC1001', facultyName: 'Dr. Test One', department: 'AI & DS', email: 'test1@jpcoe.ac.in' },
    { facultyId: 'TEST_FAC1002', facultyName: 'Prof. Test Two', department: 'CSE', email: 'test2@jpcoe.ac.in' },
    { facultyId: 'TEST_FAC1003', facultyName: 'Dr. Test Three', department: 'ECE', email: 'test3@jpcoe.ac.in' }
  ]);

  console.log(`  Created ${tempFaculty.length} records with IDs:`, facIds);

  // Test DELETE /api/faculty/bulk-delete
  console.log('2️⃣ Calling bulkDelete controller with request payload { ids: ["TEST_FAC1001", "TEST_FAC1002", "TEST_FAC1003"] }...');
  const { req, res, getResult } = createMockReqRes({ ids: facIds }, 'admin');
  await controllers.faculty.bulkDelete(req, res);

  const result = getResult();
  console.log('  Response status:', result.status);
  console.log('  Response body:', result.body);

  if (result.status === 200 && (result.body?.deleted === 3 || result.body?.deletedCount === 3)) {
    console.log('  ✅ Faculty Bulk Delete Test PASSED 100%!');
  } else {
    console.error('  ❌ Faculty Bulk Delete Test FAILED!');
    process.exit(1);
  }

  // Verify deletion from MongoDB
  const remaining = await Faculty.find({ facultyId: { $in: facIds } });
  if (remaining.length === 0) {
    console.log('  ✅ Confirmed 0 documents remain in MongoDB Atlas for deleted faculty!');
  } else {
    console.error(`  ❌ Failed: ${remaining.length} documents still exist in MongoDB!`);
    process.exit(1);
  }

  console.log('\n==================================================');
  console.log('🎯 FACULTY BULK DELETE TEST COMPLETED SUCCESSFULLY');
  console.log('==================================================\n');

  process.exit(0);
};

runFacultyBulkDeleteTest();
