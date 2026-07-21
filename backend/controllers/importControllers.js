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

const normalizeModuleName = (mod) => {
  if (!mod) return 'students';
  const m = mod.toLowerCase().trim();
  if (['student', 'students'].includes(m)) return 'students';
  if (['faculty'].includes(m)) return 'faculty';
  if (['department', 'departments'].includes(m)) return 'departments';
  if (['subject', 'subjects'].includes(m)) return 'subjects';
  if (['class', 'classes'].includes(m)) return 'classes';
  if (['attendance'].includes(m)) return 'attendance';
  if (['internalmarks', 'internal_marks', 'internal-marks'].includes(m)) return 'internalmarks';
  if (['semestermarks', 'semester_marks', 'semester-marks'].includes(m)) return 'semestermarks';
  if (['notes', 'subjectnotes', 'subject_notes'].includes(m)) return 'notes';
  if (['assignment', 'assignments'].includes(m)) return 'assignments';
  if (['timetable', 'timetables'].includes(m)) return 'timetable';
  if (['notification', 'notifications'].includes(m)) return 'notifications';
  return m;
};

const formatModuleName = (mod) => {
  const map = {
    students: 'Student',
    faculty: 'Faculty',
    departments: 'Department',
    subjects: 'Subject',
    classes: 'Class',
    attendance: 'Attendance',
    internalmarks: 'Internal Marks',
    semestermarks: 'Semester Marks',
    notes: 'Subject Notes',
    assignments: 'Assignment',
    timetable: 'Timetable',
    notifications: 'Notification'
  };
  return map[mod] || mod;
};

/**
 * Main Controller handling independent module import execution with intelligent column mapping & warning reports
 */
const executeModuleImport = async (req, res) => {
  const startTime = Date.now();
  console.log('\n==================================================');
  console.log('🚀 INTELLIGENT IMPORT TRANSACTION STARTED');
  console.log('==================================================');

  try {
    const targetModule = req.params.module || req.body.target || 'students';
    const normTarget = normalizeModuleName(targetModule);
    const userRole = req.user ? req.user.role : 'admin';

    // 1. Verify MongoDB Connection
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ Mongoose connection not ready. Re-connecting...');
      await connectDB();
    }

    const dbName = mongoose.connection.name || mongoose.connection.db?.databaseName || 'collegeDB';
    const targetInfo = modelMap[normTarget] || { model: Student, collection: normTarget };
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
      const allowedTargets = ['attendance', 'internalmarks', 'semestermarks', 'notes', 'assignments', 'timetable'];
      if (!allowedTargets.includes(normTarget)) {
        return res.status(403).json({
          success: false,
          message: `Faculty members are restricted from importing '${normTarget}'. Allowed modules: ${allowedTargets.join(', ')}.`
        });
      }
    }

    if (!req.file && !Array.isArray(req.body.records)) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded or spreadsheet records array provided.'
      });
    }

    const service = getImportService(normTarget);
    let records = [];

    if (req.file) {
      records = await service[`parse${getParseMethodName(normTarget)}File`](req.file);
    } else if (Array.isArray(req.body.records)) {
      const { smartMapRow } = require('../services/import/fileParsers');
      records = req.body.records.map(r => smartMapRow(r));
    }

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Spreadsheet parsed successfully but contained 0 data rows.'
      });
    }

    // Intelligent Module Detection & Mismatch Prevention
    const { detectFileModule } = require('../services/import/fileParsers');
    const detection = detectFileModule(records);

    if (detection.confidence >= 2 && detection.detectedModule !== 'unknown' && detection.detectedModule !== normTarget) {
      const targetName = formatModuleName(normTarget);
      const detectedName = formatModuleName(detection.detectedModule);
      console.warn(`⚠️ Module Mismatch Detected: Selected '${targetName}', uploaded '${detectedName}'`);
      return res.status(400).json({
        success: false,
        moduleMismatch: true,
        expectedModule: normTarget,
        detectedModule: detection.detectedModule,
        expectedModuleName: targetName,
        detectedModuleName: detectedName,
        message: `You selected ${targetName} Import but uploaded a ${detectedName} Import file.`,
        detectedColumns: detection.keys || [],
        totalRecords: records.length,
        data: []
      });
    }

    console.log(`📊 Rows Parsed: ${records.length}`);
    console.log(`   🔹 First Row:`, records[0]);

    const allowAutoGenerateIds = req.body?.autoGenerateIds === true || req.body?.autoGenerateIds === 'true' || req.query?.autoGenerateIds === 'true';

    // Save records via independent service
    const saveMethodName = `save${getSaveMethodName(normTarget)}`;
    const report = await service[saveMethodName](records, { user: req.user, allowAutoGenerateIds });

    console.log(`📋 Rows Validated & Processed:`);
    console.log(`   ✅ Valid/Saved: ${report.inserted + report.updated} (Inserted: ${report.inserted}, Updated: ${report.updated})`);
    console.log(`   ⚠️ Duplicates: ${report.duplicates}`);
    console.log(`   ⚠️ Warnings: ${report.warningsCount || (report.warnings || []).length}`);
    console.log(`   ⏭️ Skipped: ${report.skipped}`);
    console.log(`   ❌ Failed: ${report.failed}`);

    // Query MongoDB to verify saved documents
    let savedRecords = [];
    if (targetInfo.model) {
      savedRecords = await targetInfo.model.find({}).sort({ updatedAt: -1 }).limit(100).lean();
    }

    console.log(`🔍 MongoDB Verification Query: Retrieved ${savedRecords.length} documents from collection '${targetInfo.collection}'`);
    console.log('🏁 IMPORT TRANSACTION FINISHED in ' + (Date.now() - startTime) + 'ms');
    console.log('==================================================\n');

    res.json({
      success: true,
      imported: report.inserted || 0,
      updated: report.updated || 0,
      duplicates: report.duplicates || 0,
      skipped: report.skipped || 0,
      warnings: report.warningsCount || (report.warnings || []).length || 0,
      failed: report.failed || 0,
      totalRecords: report.totalRecords || 0,
      collection: targetInfo.collection,
      parsed: report.totalRecords || 0,
      inserted: report.inserted || 0,
      summary: {
        totalRecords: report.totalRecords || 0,
        inserted: report.inserted || 0,
        updated: report.updated || 0,
        duplicates: report.duplicates || 0,
        skipped: report.skipped || 0,
        warnings: report.warningsCount || (report.warnings || []).length || 0,
        failed: report.failed || 0,
        errorsCount: (report.validationErrors || []).length
      },
      warningList: report.warnings || [],
      savedRecords: savedRecords || [],
      data: savedRecords || [],
      importId: report.importId,
      message: `Import completed for '${targetInfo.collection}': ${report.inserted || 0} inserted, ${report.updated || 0} updated.`,
      errors: report.validationErrors || [],
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
      imported: 0,
      updated: 0,
      duplicates: 0,
      skipped: 0,
      warnings: 0,
      failed: 0,
      totalRecords: 0,
      data: [],
      errors: [err.message]
    });
  }
};

/**
 * Controller to preview file analysis without saving to DB
 */
const previewImportFile = async (req, res) => {
  try {
    const targetModule = req.params.module || req.body.target || 'students';
    const normTarget = normalizeModuleName(targetModule);

    if (!req.file && !Array.isArray(req.body.records)) {
      return res.status(400).json({ success: false, message: 'No file uploaded or spreadsheet records array provided.' });
    }

    const service = getImportService(normTarget);
    let records = [];

    if (req.file) {
      records = await service[`parse${getParseMethodName(normTarget)}File`](req.file);
    } else if (Array.isArray(req.body.records)) {
      const { smartMapRow } = require('../services/import/fileParsers');
      records = req.body.records.map(r => smartMapRow(r));
    }

    const { detectFileModule } = require('../services/import/fileParsers');
    const detection = detectFileModule(records);

    const isMismatch = (detection.confidence >= 2 && detection.detectedModule !== 'unknown' && detection.detectedModule !== normTarget);
    const targetName = formatModuleName(normTarget);
    const detectedName = formatModuleName(detection.detectedModule);

    const firstRow = records[0] || {};
    const detectedColumns = Object.keys(firstRow);

    res.json({
      success: true,
      moduleMismatch: isMismatch,
      expectedModule: normTarget,
      detectedModule: detection.detectedModule,
      detectedModuleName: detectedName,
      expectedModuleName: targetName,
      message: isMismatch ? `You selected ${targetName} Import but uploaded a ${detectedName} Import file.` : 'File analyzed successfully.',
      totalRecords: records.length,
      detectedColumns,
      mappedFields: firstRow,
      sampleRows: records.slice(0, 10)
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const downloadErrorReport = (req, res) => {
  try {
    const { importId } = req.params;
    const csvContent = generateErrorReportCSV(importId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="Import_Errors_${importId}.csv"`);
    res.status(200).send(csvContent);
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

const downloadSuccessReport = (req, res) => {
  try {
    const { importId } = req.params;
    const csvContent = generateSuccessReportCSV(importId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="Import_Success_${importId}.csv"`);
    res.status(200).send(csvContent);
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

const getParseMethodName = (target) => {
  const norm = normalizeModuleName(target);
  const map = {
    students: 'Student',
    faculty: 'Faculty',
    departments: 'Department',
    subjects: 'Subject',
    classes: 'Class',
    attendance: 'Attendance',
    internalmarks: 'InternalMark',
    semestermarks: 'SemesterMark',
    notes: 'Notes',
    assignments: 'Assignment',
    timetable: 'Timetable',
    notifications: 'Notification'
  };
  return map[norm] || 'Student';
};

const getSaveMethodName = (target) => {
  const norm = normalizeModuleName(target);
  const map = {
    students: 'Students',
    faculty: 'Faculty',
    departments: 'Departments',
    subjects: 'Subjects',
    classes: 'Classes',
    attendance: 'Attendance',
    internalmarks: 'InternalMarks',
    semestermarks: 'SemesterMarks',
    notes: 'Notes',
    assignments: 'Assignments',
    timetable: 'Timetables',
    notifications: 'Notifications'
  };
  return map[norm] || 'Students';
};

module.exports = {
  executeModuleImport,
  previewImportFile,
  downloadErrorReport,
  downloadSuccessReport
};
