const Attendance = require('../../models/Attendance');
const Student = require('../../models/Student');
const Subject = require('../../models/Subject');
const Faculty = require('../../models/Faculty');
const { parseSpreadsheetOrPdf } = require('./fileParsers');
const { createImportReport, finalizeReport } = require('./importReport');
const mongoose = require('mongoose');

class AttendanceImportService {
  static async parseAttendanceFile(file) {
    return await parseSpreadsheetOrPdf(file);
  }

  static async validateAttendance(record, index, { studentMap, subjectMap, facultyMap }) {
    const errors = [];
    const rowNum = index + 1;

    const studentRegisterNo = String(record.studentRegisterNo || record.registerNo || record.regNo || '').trim();
    const subject = String(record.subject || record.subjectCode || '').trim();
    const dateStr = String(record.date || new Date().toISOString().split('T')[0]).trim();
    const session = String(record.session || record.hour || 'Full Day').trim();
    const status = String(record.status || 'Present').trim();
    const markedBy = String(record.markedBy || record.faculty || 'Faculty Member').trim();

    if (!studentRegisterNo) errors.push({ row: rowNum, field: 'studentRegisterNo', value: record.studentRegisterNo, message: 'Student Register Number is required.' });
    if (!subject) errors.push({ row: rowNum, field: 'subject', value: record.subject, message: 'Subject is required.' });
    if (!dateStr) errors.push({ row: rowNum, field: 'date', value: record.date, message: 'Date is required.' });

    if (status && !['Present', 'Absent', 'Late', 'Permission'].includes(status)) {
      errors.push({ row: rowNum, field: 'status', value: status, message: "Status must be 'Present', 'Absent', 'Late', or 'Permission'." });
    }

    // Validate Student existence
    let studentObj = null;
    if (studentRegisterNo && studentMap) {
      studentObj = studentMap.get(studentRegisterNo);
      if (!studentObj) {
        errors.push({ row: rowNum, field: 'studentRegisterNo', value: studentRegisterNo, message: `Student with Register No '${studentRegisterNo}' does not exist in database.` });
      }
    }

    // Validate Subject existence
    if (subject && subjectMap && !subjectMap.has(subject.toUpperCase())) {
      errors.push({ row: rowNum, field: 'subject', value: subject, message: `Subject '${subject}' does not exist in database.` });
    }

    // Validate Faculty existence (if specified)
    if (markedBy && markedBy !== 'Faculty Member' && facultyMap && !facultyMap.has(markedBy.toLowerCase())) {
      errors.push({ row: rowNum, field: 'markedBy', value: markedBy, message: `Faculty '${markedBy}' does not exist in database.` });
    }

    const cleanRecord = {
      studentRegisterNo,
      studentName: studentObj?.studentName || record.studentName || '',
      department: studentObj?.department || record.department || 'AI & DS',
      year: studentObj?.year || record.year || 'III Year',
      semester: studentObj?.semester || record.semester || 'Semester V',
      section: studentObj?.section || record.section || 'A',
      subject,
      date: dateStr,
      session,
      morningStatus: status,
      afternoonStatus: status,
      status,
      percentage: status === 'Present' ? 100 : (status === 'Late' || status === 'Permission' ? 80 : 0),
      markedBy
    };

    return { isValid: errors.length === 0, errors, record: cleanRecord };
  }

  static async saveAttendance(records, options = {}) {
    const report = createImportReport('Attendance Import');
    report.totalRecords = records.length;

    if (!Array.isArray(records) || records.length === 0) {
      return finalizeReport(report);
    }

    // Pre-cache students, subjects, faculty
    const students = await Student.find({}, 'registerNo studentName department year semester section');
    const studentMap = new Map(students.map(s => [s.registerNo, s]));

    const subjects = await Subject.find({}, 'subjectCode subjectName');
    const subjectMap = new Map();
    subjects.forEach(s => {
      if (s.subjectCode) subjectMap.set(s.subjectCode.toUpperCase(), s);
      if (s.subjectName) subjectMap.set(s.subjectName.toUpperCase(), s);
    });

    const faculties = await Faculty.find({}, 'facultyId facultyName email');
    const facultyMap = new Map();
    faculties.forEach(f => {
      if (f.facultyId) facultyMap.set(f.facultyId.toLowerCase(), f);
      if (f.facultyName) facultyMap.set(f.facultyName.toLowerCase(), f);
      if (f.email) facultyMap.set(f.email.toLowerCase(), f);
    });

    const context = { studentMap, subjectMap, facultyMap };
    const userRole = options.user?.role;
    const userDept = options.user?.department;

    const validatedRecords = [];
    for (let i = 0; i < records.length; i++) {
      const row = records[i];

      if (userRole === 'faculty' && userDept && userDept !== 'All') {
        const studentObj = studentMap.get(String(row.studentRegisterNo || row.registerNo || '').trim());
        if (studentObj && studentObj.department.toLowerCase() !== userDept.toLowerCase()) {
          report.skipped++;
          report.validationErrors.push({ row: i + 1, field: 'department', value: studentObj.department, message: `Skipped record outside assigned department (${userDept}).` });
          continue;
        }
      }

      const val = await this.validateAttendance(row, i, context);
      if (!val.isValid) {
        report.failed++;
        report.validationErrors.push(...val.errors);
      } else {
        validatedRecords.push(val.record);
      }
    }

    if (validatedRecords.length === 0) {
      return finalizeReport(report);
    }

    let session = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();

      for (const rec of validatedRecords) {
        const existing = await Attendance.findOne({
          studentRegisterNo: rec.studentRegisterNo,
          date: rec.date,
          subject: rec.subject
        }).session(session);

        if (existing) {
          report.duplicates++;
          await Attendance.updateOne({ _id: existing._id }, { $set: rec }).session(session);
          report.updated++;
          report.successRecords.push(rec);
        } else {
          await Attendance.create([rec], { session });
          report.inserted++;
          report.successRecords.push(rec);
        }
      }

      await session.commitTransaction();
    } catch (txErr) {
      if (session) await session.abortTransaction();

      for (const rec of validatedRecords) {
        try {
          const existing = await Attendance.findOne({
            studentRegisterNo: rec.studentRegisterNo,
            date: rec.date,
            subject: rec.subject
          });

          if (existing) {
            report.duplicates++;
            await Attendance.updateOne({ _id: existing._id }, { $set: rec });
            report.updated++;
            report.successRecords.push(rec);
          } else {
            await Attendance.create(rec);
            report.inserted++;
            report.successRecords.push(rec);
          }
        } catch (dbErr) {
          report.failed++;
          report.validationErrors.push({ row: 'DB Save', field: rec.studentRegisterNo, value: rec.studentRegisterNo, message: dbErr.message });
        }
      }
    } finally {
      if (session) session.endSession();
    }

    return finalizeReport(report);
  }
}

module.exports = AttendanceImportService;
