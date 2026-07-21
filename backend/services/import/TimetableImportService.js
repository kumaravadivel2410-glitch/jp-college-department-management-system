const Timetable = require('../../models/Timetable');
const Department = require('../../models/Department');
const { parseSpreadsheetOrPdf } = require('./fileParsers');
const { createImportReport, finalizeReport } = require('./importReport');
const mongoose = require('mongoose');

const VALID_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

    const department = String(record.department || 'AI & DS').trim();
    const year = String(record.year || 'III Year').trim();
    const semester = String(record.semester || 'Semester V').trim();
    const section = String(record.section || 'A').trim();
    const day = String(record.day || 'Monday').trim();
    const period = String(record.period || record.time || '09:00 AM - 10:00 AM').trim();
    const subjectCode = String(record.subjectCode || record.subject || '').trim();
    const subjectName = String(record.subjectName || '').trim();
    const facultyName = String(record.facultyName || record.faculty || '').trim();
    const roomNo = String(record.roomNo || record.room || 'Lab 1').trim();

    if (!department) errors.push({ row: rowNum, field: 'department', value: record.department, message: 'Department is required.' });
    if (!day) errors.push({ row: rowNum, field: 'day', value: record.day, message: 'Day is required.' });

    if (day && !VALID_DAYS.map(d => d.toLowerCase()).includes(day.toLowerCase())) {
      errors.push({ row: rowNum, field: 'day', value: day, message: `Day must be one of ${VALID_DAYS.join(', ')}.` });
    }

    if (department && validDepartmentsSet && !validDepartmentsSet.has(department.toLowerCase())) {
      errors.push({ row: rowNum, field: 'department', value: department, message: `Department '${department}' does not exist.` });
    }

    const formattedDay = VALID_DAYS.find(d => d.toLowerCase() === day.toLowerCase()) || 'Monday';

    const cleanSlot = {
      period,
      subjectCode,
      subjectName: subjectName || subjectCode,
      facultyName,
      roomNo
    };

    const cleanRecord = {
      department,
      year,
      semester,
      section,
      day: formattedDay,
      scheduleSlot: cleanSlot
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
        if (row.department && row.department.toLowerCase() !== userDept.toLowerCase()) {
          report.skipped++;
          report.validationErrors.push({ row: i + 1, field: 'department', value: row.department, message: `Skipped record outside assigned department (${userDept}).` });
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

    const grouped = new Map();
    validatedRecords.forEach(r => {
      const key = `${r.department}_${r.year}_${r.semester}_${r.section}_${r.day}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          department: r.department,
          year: r.year,
          semester: r.semester,
          section: r.section,
          day: r.day,
          schedule: []
        });
      }
      grouped.get(key).schedule.push(r.scheduleSlot);
    });

    let session = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();

      for (const [key, groupObj] of grouped.entries()) {
        const filter = {
          department: groupObj.department,
          year: groupObj.year,
          semester: groupObj.semester,
          section: groupObj.section,
          day: groupObj.day
        };

        const existing = await Timetable.findOne(filter).session(session);
        if (existing) {
          report.duplicates++;
          await Timetable.updateOne({ _id: existing._id }, { $set: { schedule: groupObj.schedule } }).session(session);
          report.updated++;
          report.successRecords.push(groupObj);
        } else {
          await Timetable.create([groupObj], { session });
          report.inserted++;
          report.successRecords.push(groupObj);
        }
      }

      await session.commitTransaction();
    } catch (txErr) {
      if (session) await session.abortTransaction();

      for (const [key, groupObj] of grouped.entries()) {
        try {
          const filter = {
            department: groupObj.department,
            year: groupObj.year,
            semester: groupObj.semester,
            section: groupObj.section,
            day: groupObj.day
          };

          const existing = await Timetable.findOne(filter);
          if (existing) {
            report.duplicates++;
            await Timetable.updateOne({ _id: existing._id }, { $set: { schedule: groupObj.schedule } });
            report.updated++;
            report.successRecords.push(groupObj);
          } else {
            await Timetable.create(groupObj);
            report.inserted++;
            report.successRecords.push(groupObj);
          }
        } catch (dbErr) {
          report.failed++;
          report.validationErrors.push({ row: 'DB Save', field: key, value: key, message: dbErr.message });
        }
      }
    } finally {
      if (session) session.endSession();
    }

    return finalizeReport(report);
  }
}

module.exports = TimetableImportService;
