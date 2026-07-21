const Timetable = require('../../models/Timetable');
const Department = require('../../models/Department');
const { parseSpreadsheetOrPdf } = require('./fileParsers');
const { createImportReport, finalizeReport } = require('./importReport');
const mongoose = require('mongoose');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getValidDepartmentsSet = async () => {
  const depts = await Department.find({});
  const set = new Set(['ai & ds', 'cse', 'ece', 'eee', 'mech', 'civil', 'it', 'aids', 'all']);
  depts.forEach(d => {
    if (d.code) set.add(d.code.toLowerCase());
    if (d.departmentCode) set.add(d.departmentCode.toLowerCase());
    if (d.name) set.add(d.name.toLowerCase());
    if (d.departmentName) set.add(d.departmentName.toLowerCase());
  });
  return set;
};

class TimetableImportService {
  static async parseTimetableFile(file) {
    return await parseSpreadsheetOrPdf(file);
  }

  static async validateTimetable(record, index, validDepartmentsSet) {
    const errors = [];
    const rowNum = index + 1;

    const department = String(record.department || record.dept || 'AI & DS').trim();
    const year = String(record.year || 'III Year').trim();
    const semester = String(record.semester || 'Semester V').trim();
    const section = String(record.section || 'A').trim();
    const day = String(record.day || 'Monday').trim();
    const period = String(record.period || record.time || 'Period 1 (09:00 AM - 10:00 AM)').trim();
    const subjectCode = String(record.subjectCode || record.subject || 'AD3501').trim();
    const subjectName = String(record.subjectName || subjectCode).trim();
    const facultyName = String(record.facultyName || record.faculty || 'Faculty Member').trim();
    const roomNo = String(record.roomNo || record.room || 'LH-201').trim();

    if (!department) errors.push({ row: rowNum, field: 'department', value: record.department, message: 'Department is required.' });

    if (day && !DAYS.includes(day)) {
      errors.push({ row: rowNum, field: 'day', value: day, message: `Invalid day '${day}'. Allowed: ${DAYS.join(', ')}.` });
    }

    if (department && validDepartmentsSet && !validDepartmentsSet.has(department.toLowerCase())) {
      errors.push({ row: rowNum, field: 'department', value: department, message: `Department '${department}' does not exist.` });
    }

    const cleanRecord = {
      department,
      year,
      semester,
      section,
      day,
      schedule: [
        {
          period,
          subjectCode,
          subjectName,
          facultyName,
          roomNo
        }
      ]
    };

    return { isValid: errors.length === 0, errors, record: cleanRecord };
  }

  static async saveTimetable(records, options = {}) {
    const report = createImportReport('Timetable Import');
    report.totalRecords = records.length;

    if (!Array.isArray(records) || records.length === 0) {
      return finalizeReport(report);
    }

    const validDeptsSet = await getValidDepartmentsSet();
    const userRole = options.user?.role;
    const userDept = options.user?.department;

    const validatedRecords = [];
    for (let i = 0; i < records.length; i++) {
      const row = records[i];

      if (userRole === 'faculty' && userDept && userDept !== 'All') {
        const rowDept = row.department || row.dept || '';
        if (rowDept && rowDept.toLowerCase() !== userDept.toLowerCase()) {
          report.skipped++;
          report.validationErrors.push({ row: i + 1, field: 'department', value: rowDept, message: `Skipped record outside assigned department (${userDept}).` });
          continue;
        }
        row.department = userDept;
      }

      const val = await this.validateTimetable(row, i, validDeptsSet);
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
        console.log('Saving Timetable:', rec.department, rec.day, rec.section);
        const filter = { department: rec.department, year: rec.year, semester: rec.semester, section: rec.section, day: rec.day };
        const existing = await Timetable.findOne(filter);

        if (existing) {
          report.duplicates++;
          const updatedDoc = await Timetable.findOneAndUpdate(
            { _id: existing._id },
            { $set: { department: rec.department, year: rec.year, semester: rec.semester, section: rec.section, day: rec.day }, $addToSet: { schedule: { $each: rec.schedule } } },
            { new: true, runValidators: true }
          );
          report.updated++;
          report.successRecords.push(updatedDoc.toObject());
        } else {
          const createdDoc = await Timetable.create(rec);
          report.inserted++;
          report.successRecords.push(createdDoc.toObject());
        }
      } catch (dbErr) {
        console.error(`❌ MongoDB Timetable Save Error [${rec.department}]:`, dbErr.message);
        report.failed++;
        report.validationErrors.push({ row: 'DB Save', field: rec.department, value: rec.department, message: dbErr.message });
      }
    }

    return finalizeReport(report);
  }
}

module.exports = TimetableImportService;
