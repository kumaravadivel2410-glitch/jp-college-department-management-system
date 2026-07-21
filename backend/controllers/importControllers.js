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

/**
 * Main Controller handling independent module import execution
 */
const executeModuleImport = async (req, res) => {
  try {
    const targetModule = req.params.module || req.body.target || 'students';
    const userRole = req.user ? req.user.role : 'admin';

    // RBAC check: Student role is strictly forbidden from importing
    if (userRole === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student accounts are not authorized to import data into ERP.'
      });
    }

    // Faculty scope check
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

    const saveMethodName = `save${getSaveMethodName(targetModule)}`;
    const report = await service[saveMethodName](records, { user: req.user });

    res.json({
      success: true,
      importId: report.importId,
      message: `Import completed: ${report.inserted} inserted, ${report.updated} updated, ${report.duplicates} duplicates, ${report.skipped} skipped, ${report.failed} failed.`,
      summary: {
        totalRecords: report.totalRecords,
        inserted: report.inserted,
        updated: report.updated,
        duplicates: report.duplicates,
        skipped: report.skipped,
        failed: report.failed,
        errorsCount: report.validationErrors.length
      },
      errors: report.validationErrors,
      downloadLinks: {
        errorReport: `/api/import/report/${report.importId}/error`,
        successReport: `/api/import/report/${report.importId}/success`
      }
    });

  } catch (err) {
    console.error('Import Controller Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'An unexpected error occurred during import processing.'
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
      return res.status(400).json({ success: false, message: 'No valid rows found in file.' });
    }

    const headers = Object.keys(records[0] || {});
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
