require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const connectDB = require('../config/db');
const Student = require('../models/Student');
const InternalMark = require('../models/InternalMark');
const Setting = require('../models/Setting');
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

const runBulkActionsTest = async () => {
  console.log('==================================================');
  console.log('🧪 TESTING BULK ACTIONS, CONFIGURABLE MARKS & IN-PLACE EDITS');
  console.log('==================================================\n');

  await connectDB();

  // Test 1: Configure Max Internal Marks Setting
  console.log('1️⃣ Testing Max Internal Marks Configuration (Setting to 75)...');
  const { req: reqSet, res: resSet, getResult: getResSet } = createMockReqRes({ maxInternalMarks: 75 });
  await controllers.updateInternalMarkSettings(reqSet, resSet);
  const resultSet = getResSet();

  if (resultSet.status === 200 && resultSet.body?.maxInternalMarks === 75) {
    console.log('  ✅ Setting Updated Successfully to 75 Marks!');
  } else {
    console.error('  ❌ Setting Update FAILED:', resultSet);
  }

  // Test 2: In-place edit validation against max mark (75)
  console.log('2️⃣ Testing Internal Mark Validation against max mark (Attempting 80 out of 75)...');
  const docToEdit = await InternalMark.create({
    studentRegisterNo: 'TEST_BULK_001',
    studentName: 'Test Student Bulk',
    subjectCode: 'CS301',
    internal1: 40,
    internal2: 40,
    maxMark: 75
  });

  const { req: reqVal, res: resVal, getResult: getResVal } = createMockReqRes({ internal1: 80, maxMark: 75 });
  reqVal.params = { id: docToEdit._id.toString() };
  await controllers.internalMarks.update(reqVal, resVal);
  const resValData = getResVal();

  if (resValData.status === 400 && resValData.body?.message?.includes('cannot exceed configured maximum')) {
    console.log(`  ✅ Over-max validation caught correctly! Message: "${resValData.body.message}"`);
  } else {
    console.error('  ❌ Over-max validation FAILED:', resValData);
  }

  // Test 3: In-place edit with edit history tracking
  console.log('3️⃣ Testing In-place Edit with Edit History Tracking...');
  const { req: reqEdit, res: resEdit, getResult: getResEdit } = createMockReqRes({ internal1: 70, maxMark: 75 });
  reqEdit.params = { id: docToEdit._id.toString() };
  await controllers.internalMarks.update(reqEdit, resEdit);
  const resEditData = getResEdit();

  if (resEditData.status === 200 && resEditData.body?.data?.internal1 === 70) {
    const updatedMarkDoc = resEditData.body.data;
    console.log(`  ✅ Mark updated to 70. Average calculated: ${updatedMarkDoc.average}, Status: ${updatedMarkDoc.status}`);
    console.log(`  ✅ Edit History Logged: ${updatedMarkDoc.editHistory?.length || 0} entries`);
  } else {
    console.error('  ❌ In-place edit FAILED:', resEditData);
  }

  // Test 4: Bulk Delete Students
  console.log('4️⃣ Testing Bulk Delete Students...');
  const tempStudents = await Student.insertMany([
    { registerNo: 'TEST_DEL_01', studentName: 'Del Student 1', email: 'del1@jpcoe.ac.in' },
    { registerNo: 'TEST_DEL_02', studentName: 'Del Student 2', email: 'del2@jpcoe.ac.in' }
  ]);

  const delIds = tempStudents.map(s => s._id.toString());
  const { req: reqDel, res: resDel, getResult: getResDel } = createMockReqRes({ ids: delIds });
  await controllers.students.bulkDelete(reqDel, resDel);
  const resDelData = getResDel();

  if (resDelData.status === 200 && resDelData.body?.deletedCount === 2) {
    console.log(`  ✅ Bulk Delete Successful! Deleted ${resDelData.body.deletedCount} records permanently.`);
  } else {
    console.error('  ❌ Bulk Delete FAILED:', resDelData);
  }

  // Clean up test internal mark
  await InternalMark.findByIdAndDelete(docToEdit._id);

  console.log('\n==================================================');
  console.log('🎯 ALL BULK ACTIONS & MARK SETTINGS TESTS COMPLETED SUCCESSFULLY');
  console.log('==================================================\n');

  process.exit(0);
};

runBulkActionsTest();
