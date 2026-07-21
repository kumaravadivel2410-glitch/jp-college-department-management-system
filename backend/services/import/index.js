const StudentImportService = require('./StudentImportService');
const FacultyImportService = require('./FacultyImportService');
const DepartmentImportService = require('./DepartmentImportService');
const SubjectImportService = require('./SubjectImportService');
const ClassImportService = require('./ClassImportService');
const AttendanceImportService = require('./AttendanceImportService');
const InternalMarkImportService = require('./InternalMarkImportService');
const SemesterMarkImportService = require('./SemesterMarkImportService');
const NotesImportService = require('./NotesImportService');
const AssignmentImportService = require('./AssignmentImportService');
const TimetableImportService = require('./TimetableImportService');
const NotificationImportService = require('./NotificationImportService');
const { getReport, generateErrorReportCSV, generateSuccessReportCSV } = require('./importReport');

const services = {
  students: StudentImportService,
  faculty: FacultyImportService,
  departments: DepartmentImportService,
  subjects: SubjectImportService,
  classes: ClassImportService,
  attendance: AttendanceImportService,
  internalmarks: InternalMarkImportService,
  internalMarks: InternalMarkImportService,
  semestermarks: SemesterMarkImportService,
  semesterMarks: SemesterMarkImportService,
  notes: NotesImportService,
  subjectNotes: NotesImportService,
  assignments: AssignmentImportService,
  timetable: TimetableImportService,
  timetables: TimetableImportService,
  notifications: NotificationImportService
};

const getImportService = (moduleTarget) => {
  const normalized = String(moduleTarget || '').trim();
  const service = services[normalized] || services[normalized.toLowerCase()];
  if (!service) {
    throw new Error(`Invalid or unsupported import module target '${moduleTarget}'.`);
  }
  return service;
};

module.exports = {
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
  NotificationImportService,
  getImportService,
  getReport,
  generateErrorReportCSV,
  generateSuccessReportCSV
};
