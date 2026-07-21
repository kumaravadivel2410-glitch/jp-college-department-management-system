const { parseSpreadsheetOrPdf, parseExcelBuffer, parseCsvBuffer } = require('../services/import/fileParsers');

const runEdgeCaseTests = async () => {
  console.log('==================================================');
  console.log('🧪 TESTING FILE PARSER SAFETY & USER-FRIENDLY ERRORS');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Empty file upload
  try {
    console.log('Test 1: Empty file object...');
    await parseSpreadsheetOrPdf(null);
    console.error('❌ Test 1 FAILED (expected error)');
    failed++;
  } catch (err) {
    if (err.message.includes('The uploaded file is empty.')) {
      console.log(`  ✅ Test 1 PASSED: Got expected error -> "${err.message}"`);
      passed++;
    } else {
      console.error(`  ❌ Test 1 FAILED: Got wrong error -> "${err.message}"`);
      failed++;
    }
  }

  // Test 2: File size 0
  try {
    console.log('Test 2: Zero length file buffer...');
    const emptyFile = { originalname: 'empty.xlsx', buffer: Buffer.from([]), size: 0 };
    await parseSpreadsheetOrPdf(emptyFile);
    console.error('❌ Test 2 FAILED (expected error)');
    failed++;
  } catch (err) {
    if (err.message.includes('The uploaded file is empty.')) {
      console.log(`  ✅ Test 2 PASSED: Got expected error -> "${err.message}"`);
      passed++;
    } else {
      console.error(`  ❌ Test 2 FAILED: Got wrong error -> "${err.message}"`);
      failed++;
    }
  }

  // Test 3: Unsupported file extension
  try {
    console.log('Test 3: Unsupported extension .exe...');
    const exeFile = { originalname: 'script.exe', buffer: Buffer.from([1, 2, 3]), size: 3 };
    await parseSpreadsheetOrPdf(exeFile);
    console.error('❌ Test 3 FAILED (expected error)');
    failed++;
  } catch (err) {
    if (err.message.includes('Unsupported file format')) {
      console.log(`  ✅ Test 3 PASSED: Got expected error -> "${err.message}"`);
      passed++;
    } else {
      console.error(`  ❌ Test 3 FAILED: Got wrong error -> "${err.message}"`);
      failed++;
    }
  }

  // Test 4: Empty CSV string
  try {
    console.log('Test 4: Empty CSV buffer...');
    await parseCsvBuffer(Buffer.from(''));
    console.error('❌ Test 4 FAILED (expected error)');
    failed++;
  } catch (err) {
    if (err.message.includes('The uploaded file is empty') || err.message.includes('No records found')) {
      console.log(`  ✅ Test 4 PASSED: Got expected error -> "${err.message}"`);
      passed++;
    } else {
      console.error(`  ❌ Test 4 FAILED: Got wrong error -> "${err.message}"`);
      failed++;
    }
  }

  console.log('\n==================================================');
  console.log(`🎯 EDGE CASE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================\n');

  process.exit(failed === 0 ? 0 : 1);
};

runEdgeCaseTests();
