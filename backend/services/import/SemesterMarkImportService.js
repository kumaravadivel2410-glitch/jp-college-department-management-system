const SemesterMark = require('../../models/SemesterMark');
const Student = require('../../models/Student');
const Subject = require('../../models/Subject');
const { parseSpreadsheetOrPdf } = require('./fileParsers');
const { createImportReport, finalizeReport } = require('./importReport');
const mongoose = require('mongoose');

const VALID_GRADES = ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F', 'RA', 'AB', 'U'];

class SemesterMarkImportService {
  static async parseSemesterMarkFile(file) {
    return await parseSpreadsheetOrPdf(file);
  }

  static async validateSemesterMarks(record, index, { studentMap, subjectMap }) {
    const errors = [];
    const rowNum = index + 1;

    const studentRegisterNo = String(record.studentRegisterNo || record.registerNo || record.regNo || record.registerno || '').trim();
    const subjectCode = String(record.subjectCode || record.subject || record.subjectcode || '').trim();
    const grade = String(record.grade || 'O').trim().toUpperCase();
    const marks = record.marks !== undefined && record.marks !== '' ? Number(record.marks) : 50;
    const credits = record.credits !== undefined && record.credits !== '' ? Number(record.credits) : 4;
    const gpa = record.gpa !== undefined && record.gpa !== '' ? Number(record.gpa) : 8.0;
    const cgpa = record.cgpa !== undefined && record.cgpa !== '' ? Number(record.cgpa) : 8.0;
    const arrears = record.arrears !== undefined && record.arrears !== '' ? Number(record.arrears) : 0;

    if (!studentRegisterNo) errors.push({ row: rowNum, field: 'studentRegisterNo', value: record.studentRegisterNo, message: 'Student Register Number is required.' });
    if (!subjectCode) errors.push({ row: rowNum, field: 'subjectCode', value: record.subjectCode, message: 'Subject Code is required.' });

    if (grade && !VALID_GRADES.includes(grade)) {
      errors.push({ row: rowNum, field: 'grade', value: grade, message: `Invalid grade '${grade}'. Allowed: ${VALID_GRADES.join(', ')}.` });
    }

    if (isNaN(marks) || marks < 0 || marks > 100) {
      errors.push({ row: rowNum, field: 'marks', value: marks, message: 'Marks must be a number between 0 and 100.' });
    }

    if (isNaN(credits) || credits <= 0) {
      errors.push({ row: rowNum, field: 'credits', value: credits, message: 'Credits must be a number greater than 0.' });
    }

    if (isNaN(gpa) || gpa < 0 || gpa > 10) {
      errors.push({ row: rowNum, field: 'gpa', value: gpa, message: 'GPA must be between 0 and 10.' });
    }

    if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      errors.push({ row: rowNum, field: 'cgpa', value: cgpa, message: 'CGPA must be between 0 and 10.' });
    }

    let studentObj = null;
    if (studentRegisterNo && studentMap) {
      studentObj = studentMap.get(studentRegisterNo);
      if (!studentObj) {
        errors.push({ row: rowNum, field: 'studentRegisterNo', value: studentRegisterNo, message: `Student '${studentRegisterNo}' does not exist in database.` });
      }
    }

    let subjectObj = null;
    if (subjectCode && subjectMap) {
      subjectObj = subjectMap.get(subjectCode.toUpperCase());
      if (!subjectObj) {
        errors.push({ row: rowNum, field: 'subjectCode', value: subjectCode, message: `Subject '${subjectCode}' does not exist in database.` });
      }
    }

    const result = ['F', 'RA', 'U', 'AB'].includes(grade) || marks < 50 ? 'FAIL' : 'PASS';

    const cleanRecord = {
      studentRegisterNo,
      studentName: studentObj?.studentName || record.studentName || '',
      department: studentObj?.department || record.department || 'AI & DS',
      year: studentObj?.year || record.year || 'III Year',
      semester: studentObj?.semester || record.semester || 'Semester V',
      section: studentObj?.section || record.section || 'A',
      subjectCode,
      subjectName: subjectObj?.subjectName || record.subjectName || subjectCode,
      grade,
      marks,
      credits,
      gpa,
      cgpa,
      arrears,
      result
    };

    return { isValid: errors.length === 0, errors, record: cleanRecord };
  }

  static async saveSemesterMarks(records, options = {}) {
    const report = createImportReport('Semester Mark Import');
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

      const val = await this.validateSemesterMarks(row, i, context);
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

    for (const rec of validatedRecords) {
      try {
        console.log('Saving Semester Mark:', rec.studentRegisterNo, rec.subjectCode, rec.grade);
        const filter = { studentRegisterNo: rec.studentRegisterNo, subjectCode: rec.subjectCode };
        const existing = await SemesterMark.findOne(filter);

        if (existing) {
          report.duplicates++;
          const updatedDoc = await SemesterMark.findOneAndUpdate({ _id: existing._id }, { $set: rec }, { new: true, runValidators: true });
          report.updated++;
          report.successRecords.push(updatedDoc.toObject());
        } else {
          const createdDoc = await SemesterMark.create(rec);
          report.inserted++;
          report.successRecords.push(createdDoc.toObject());
        }
      } catch (dbErr) {
        console.error(`❌ MongoDB Semester Mark Save Error [${rec.studentRegisterNo}]:`, dbErr.message);
        report.failed++;
        report.validationErrors.push({ row: 'DB Save', field: rec.studentRegisterNo, value: rec.studentRegisterNo, message: dbErr.message });
      }
    }

    return finalizeReport(report);
  }
}

module.exports = SemesterMarkImportService;
