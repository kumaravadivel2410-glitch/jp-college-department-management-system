const mongoose = require('mongoose');
const connectDB = require('../config/db');
const {
  getImportService,
  getReport,
  generateErrorReportCSV,
  generateSuccessReportCSV,
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

const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const Subject = require('../models/Subject');
const ClassModel = require('../models/ClassModel');
const Attendance = require('../models/Attendance');
const InternalMark = require('../models/InternalMark');
const SemesterMark = require('../models/SemesterMark');
const Note = require('../models/Note');
const Assignment = require('../models/Assignment');
const Timetable = require('../models/Timetable');
const Notification = require('../models/Notification');

const modelMap = {
  students: { model: Student, collection: 'students' },
  faculty: { model: Faculty, collection: 'faculty' },
  departments: { model: Department, collection: 'departments' },
  subjects: { model: Subject, collection: 'subjects' },
  classes: { model: ClassModel, collection: 'classes' },
  attendance: { model: Attendance, collection: 'attendance' },
  internalmarks: { model: InternalMark, collection: 'internalMarks' },
  internalMarks: { model: InternalMark, collection: 'internalMarks' },
  semestermarks: { model: SemesterMark, collection: 'semesterMarks' },
  semesterMarks: { model: SemesterMark, collection: 'semesterMarks' },
  notes: { model: Note, collection: 'subjectNotes' },
  subjectNotes: { model: Note, collection: 'subjectNotes' },
  assignments: { model: Assignment, collection: 'assignments' },
  timetable: { model: Timetable, collection: 'timetable' },
  timetables: { model: Timetable, collection: 'timetable' },
  notifications: { model: Notification, collection: 'notifications' }
};

/**
 * Main Controller handling independent module import execution with full verification & logging
 */
const executeModuleImport = async (req, res) => {
  const startTime = Date.now();
  console.log('\n==================================================');
  console.log('🚀 IMPORT TRANSACTION STARTED');
  console.log('==================================================');

  try {
    const targetModule = req.params.module || req.body.target || 'students';
    const userRole = req.user ? req.user.role : 'admin';

    // 1. Verify MongoDB Connection
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ Mongoose connection not ready. Re-connecting...');
      await connectDB();
    }

    const dbName = mongoose.connection.name || mongoose.connection.db?.databaseName || 'collegeDB';
    const targetInfo = modelMap[targetModule] || modelMap[targetModule.toLowerCase()] || { model: Student, collection: targetModule };
    console.log(`✅ MongoDB Connected | Database: ${dbName} | Target Collection: ${targetInfo.collection}`);

    // 2. File Upload Logging
    if (req.file) {
      console.log(`📁 File Received: ${req.file.originalname} | Size: ${(req.file.size / 1024).toFixed(1)} KB | Mime: ${req.file.mimetype}`);
    }

    // RBAC check
    if (userRole === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student accounts are not authorized to import data into ERP.'
      });
    }

    if (userRole === 'faculty') {
      const allowedTargets = ['attendance', 'internalmarks', 'internalMarks', 'semestermarks', 'semesterMarks', 'notes', 'subjectNotes', 'assignments', 'timetable', 'timetables'];
      if (!allowedTargets.includes(targetModule)) {
        return res.status(403).json({
          success: false,
          message: `Faculty members are restricted from importing '${targetModule}'. Allowed modules: ${allowedTargets.join(', ')}.`
        });
      }
    }

    if (!req.file && !Array.isArray(req.body.records)) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded or spreadsheet records array provided.'
      });
    }

    const service = getImportService(targetModule);
    let records = [];

    if (req.file) {
      records = await service[`parse${getParseMethodName(targetModule)}File`](req.file);
    } else if (Array.isArray(req.body.records)) {
      records = req.body.records;
    }

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Spreadsheet parsed successfully but contained 0 data rows.'
      });
    }

    console.log(`📊 Rows Parsed: ${records.length}`);
    console.log(`   🔹 First Row:`, records[0]);
    console.log(`   🔹 Last Row:`, records[records.length - 1]);

    // Save records via independent service
    const saveMethodName = `save${getSaveMethodName(targetModule)}`;
    const report = await service[saveMethodName](records, { user: req.user });

    console.log(`📋 Rows Validated & Processed:`);
    console.log(`   ✅ Valid/Saved: ${report.inserted + report.updated} (Inserted: ${report.inserted}, Updated: ${report.updated})`);
    console.log(`   ⚠️ Duplicates: ${report.duplicates}`);
    console.log(`   ⏭️ Skipped: ${report.skipped}`);
    console.log(`   ❌ Failed: ${report.failed}`);

    // Immediately Query MongoDB to verify saved documents
    let savedRecords = [];
    if (targetInfo.model) {
      savedRecords = await targetInfo.model.find({}).sort({ updatedAt: -1 }).limit(100).lean();
    }

    console.log(`🔍 MongoDB Verification Query: Retrieved ${savedRecords.length} documents from collection '${targetInfo.collection}'`);
    console.log('🏁 IMPORT TRANSACTION FINISHED in ' + (Date.now() - startTime) + 'ms');
    console.log('==================================================\n');

    res.json({
      success: true,
      collection: targetInfo.collection,
      parsed: report.totalRecords,
      inserted: report.inserted,
      updated: report.updated,
      duplicates: report.duplicates,
      skipped: report.skipped,
      failed: report.failed,
      errorsCount: report.validationErrors.length,
      savedRecords,
      importId: report.importId,
      message: `Import completed for '${targetInfo.collection}': ${report.inserted} inserted, ${report.updated} updated, ${report.duplicates} duplicates, ${report.skipped} skipped, ${report.failed} failed.`,
      errors: report.validationErrors,
      downloadLinks: {
        errorReport: `/api/import/report/${report.importId}/error`,
        successReport: `/api/import/report/${report.importId}/success`
      }
    });

  } catch (err) {
    console.error('❌ Real MongoDB Import Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'An unexpected error occurred during import processing.',
      error: err.stack || err.message
    });
  }
};

/**
 * Controller for pre-import data dry-run preview and row validation
 */
const previewImportFile = async (req, res) => {
  try {
    const targetModule = req.params.module || req.body.target || 'students';
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a spreadsheet file for preview.' });
    }

    const service = getImportService(targetModule);
    const records = await service[`parse${getParseMethodName(targetModule)}File`](req.file);

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'The uploaded file is empty or contains no valid data.' });
    }

    const firstRecord = records[0] || {};
    const headers = Object.keys(firstRecord);
    const sampleRows = records.slice(0, 50);

    res.json({
      success: true,
      targetModule,
      totalRows: records.length,
      headers,
      previewRows: sampleRows
    });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Controller downloading error report as CSV
 */
const downloadErrorReport = (req, res) => {
  const { importId } = req.params;
  const report = getReport(importId);

  if (!report) {
    return res.status(404).send('Error report session expired or not found.');
  }

  const csv = generateErrorReportCSV(report);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="Import_Error_Report_${importId}.csv"`);
  res.status(200).send(csv);
};

/**
 * Controller downloading success report as CSV
 */
const downloadSuccessReport = (req, res) => {
  const { importId } = req.params;
  const report = getReport(importId);

  if (!report) {
    return res.status(404).send('Success report session expired or not found.');
  }

  const csv = generateSuccessReportCSV(report);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="Import_Success_Report_${importId}.csv"`);
  res.status(200).send(csv);
};

// Helper name maps
function getParseMethodName(target) {
  const map = {
    students: 'Student', faculty: 'Faculty', departments: 'Department', subjects: 'Subject',
    classes: 'Class', attendance: 'Attendance', internalmarks: 'InternalMark', internalMarks: 'InternalMark',
    semestermarks: 'SemesterMark', semesterMarks: 'SemesterMark', notes: 'Notes', subjectNotes: 'Notes',
    assignments: 'Assignment', timetable: 'Timetable', timetables: 'Timetable', notifications: 'Notification'
  };
  return map[target] || map[target.toLowerCase()] || 'Student';
}

function getSaveMethodName(target) {
  const map = {
    students: 'Students', faculty: 'Faculty', departments: 'Departments', subjects: 'Subjects',
    classes: 'Classes', attendance: 'Attendance', internalmarks: 'InternalMarks', internalMarks: 'InternalMarks',
    semestermarks: 'SemesterMarks', semesterMarks: 'SemesterMarks', notes: 'Notes', subjectNotes: 'Notes',
    assignments: 'Assignments', timetable: 'Timetable', timetables: 'Timetable', notifications: 'Notifications'
  };
  return map[target] || map[target.toLowerCase()] || 'Students';
}

module.exports = {
  executeModuleImport,
  previewImportFile,
  downloadErrorReport,
  downloadSuccessReport
};
