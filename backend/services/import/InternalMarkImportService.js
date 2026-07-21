const InternalMark = require('../../models/InternalMark');
const Student = require('../../models/Student');
const Subject = require('../../models/Subject');
const { parseSpreadsheetOrPdf } = require('./fileParsers');
const { createImportReport, finalizeReport } = require('./importReport');
const mongoose = require('mongoose');

class InternalMarkImportService {
  static async parseInternalMarkFile(file) {
    return await parseSpreadsheetOrPdf(file);
  }

  static async validateInternalMarks(record, index, { studentMap, subjectMap }) {
    const errors = [];
    const rowNum = index + 1;

    const studentRegisterNo = String(record.studentRegisterNo || record.registerNo || record.regNo || '').trim();
    const subjectCode = String(record.subjectCode || record.subject || '').trim();

    const internal1 = record.internal1 !== undefined && record.internal1 !== '' ? Number(record.internal1) : 0;
    const internal2 = record.internal2 !== undefined && record.internal2 !== '' ? Number(record.internal2) : 0;
    const internal3 = record.internal3 !== undefined && record.internal3 !== '' ? Number(record.internal3) : 0;
    const modelExam = record.modelExam !== undefined && record.modelExam !== '' ? Number(record.modelExam) : 0;
    const assignmentMark = record.assignmentMark !== undefined && record.assignmentMark !== '' ? Number(record.assignmentMark) : 0;

    if (!studentRegisterNo) errors.push({ row: rowNum, field: 'studentRegisterNo', value: record.studentRegisterNo, message: 'Student Register Number is required.' });
    if (!subjectCode) errors.push({ row: rowNum, field: 'subjectCode', value: record.subjectCode, message: 'Subject Code is required.' });

    // Mark range validations
    [
      { name: 'internal1', val: internal1 },
      { name: 'internal2', val: internal2 },
      { name: 'internal3', val: internal3 },
      { name: 'modelExam', val: modelExam },
      { name: 'assignmentMark', val: assignmentMark }
    ].forEach(m => {
      if (isNaN(m.val) || m.val < 0 || m.val > 100) {
        errors.push({ row: rowNum, field: m.name, value: m.val, message: `${m.name} must be a number between 0 and 100.` });
      }
    });

    // Student existence check
    let studentObj = null;
    if (studentRegisterNo && studentMap) {
      studentObj = studentMap.get(studentRegisterNo);
      if (!studentObj) {
        errors.push({ row: rowNum, field: 'studentRegisterNo', value: studentRegisterNo, message: `Student '${studentRegisterNo}' does not exist in database.` });
      }
    }

    // Subject existence check
    let subjectObj = null;
    if (subjectCode && subjectMap) {
      subjectObj = subjectMap.get(subjectCode.toUpperCase());
      if (!subjectObj) {
        errors.push({ row: rowNum, field: 'subjectCode', value: subjectCode, message: `Subject '${subjectCode}' does not exist in database.` });
      }
    }

    // Automatically calculate Average
    const validMarks = [internal1, internal2, internal3].filter(m => !isNaN(m));
    const average = validMarks.length > 0 ? Number((validMarks.reduce((a, b) => a + b, 0) / validMarks.length).toFixed(2)) : 0;
    const totalInternal = Number((average * 0.8 + assignmentMark).toFixed(2));

    const cleanRecord = {
      studentRegisterNo,
      studentName: studentObj?.studentName || record.studentName || '',
      department: studentObj?.department || record.department || 'AI & DS',
      year: studentObj?.year || record.year || 'III Year',
      semester: studentObj?.semester || record.semester || 'Semester V',
      section: studentObj?.section || record.section || 'A',
      subjectCode,
      subjectName: subjectObj?.subjectName || record.subjectName || subjectCode,
      internal1,
      internal2,
      internal3,
      average,
      modelExam,
      assignmentMark,
      totalInternal,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    return { isValid: errors.length === 0, errors, record: cleanRecord };
  }

  static async saveInternalMarks(records, options = {}) {
    const report = createImportReport('Internal Mark Import');
    report.totalRecords = records.length;

    if (!Array.isArray(records) || records.length === 0) {
      return finalizeReport(report);
    }

    const students = await Student.find({}, 'registerNo studentName department year semester section');
    const studentMap = new Map(students.map(s => [s.registerNo, s]));

    const subjects = await Subject.find({}, 'subjectCode subjectName');
    const subjectMap = new Map();
    subjects.forEach(s => {
      if (s.subjectCode) subjectMap.set(s.subjectCode.toUpperCase(), s);
      if (s.subjectName) subjectMap.set(s.subjectName.toUpperCase(), s);
    });

    const context = { studentMap, subjectMap };
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

      const val = await this.validateInternalMarks(row, i, context);
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
        const existing = await InternalMark.findOne({
          studentRegisterNo: rec.studentRegisterNo,
          subjectCode: rec.subjectCode
        }).session(session);

        if (existing) {
          report.duplicates++;
          await InternalMark.updateOne({ _id: existing._id }, { $set: rec }).session(session);
          report.updated++;
          report.successRecords.push(rec);
        } else {
          await InternalMark.create([rec], { session });
          report.inserted++;
          report.successRecords.push(rec);
        }
      }

      await session.commitTransaction();
    } catch (txErr) {
      if (session) await session.abortTransaction();

      for (const rec of validatedRecords) {
        try {
          const existing = await InternalMark.findOne({
            studentRegisterNo: rec.studentRegisterNo,
            subjectCode: rec.subjectCode
          });

          if (existing) {
            report.duplicates++;
            await InternalMark.updateOne({ _id: existing._id }, { $set: rec });
            report.updated++;
            report.successRecords.push(rec);
          } else {
            await InternalMark.create(rec);
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

module.exports = InternalMarkImportService;
