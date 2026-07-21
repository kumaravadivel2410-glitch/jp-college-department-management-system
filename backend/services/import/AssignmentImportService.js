const Assignment = require('../../models/Assignment');
const Department = require('../../models/Department');
const Subject = require('../../models/Subject');
const { parseSpreadsheetOrPdf } = require('./fileParsers');
const { createImportReport, finalizeReport } = require('./importReport');
const mongoose = require('mongoose');

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

class AssignmentImportService {
  static async parseAssignmentFile(file) {
    return await parseSpreadsheetOrPdf(file);
  }

  static async validateAssignment(record, index, { validDepartmentsSet, subjectMap }) {
    const errors = [];
    const rowNum = index + 1;

    const title = String(record.title || record.assignmentTitle || '').trim();
    const description = String(record.description || record.instructions || '').trim();
    const department = String(record.department || 'AI & DS').trim();
    const year = String(record.year || 'III Year').trim();
    const semester = String(record.semester || 'Semester V').trim();
    const section = String(record.section || 'A').trim();
    const subjectCode = String(record.subjectCode || record.subject || '').trim();
    const dueDate = String(record.dueDate || record.deadline || '').trim();
    const uploadedBy = String(record.uploadedBy || record.faculty || 'Faculty').trim();

    if (!title) errors.push({ row: rowNum, field: 'title', value: record.title, message: 'Assignment Title is required.' });
    if (!dueDate) errors.push({ row: rowNum, field: 'dueDate', value: record.dueDate, message: 'Due Date is required.' });

    if (department && validDepartmentsSet && !validDepartmentsSet.has(department.toLowerCase())) {
      errors.push({ row: rowNum, field: 'department', value: department, message: `Department '${department}' does not exist.` });
    }

    let subjectObj = null;
    if (subjectCode && subjectMap) {
      subjectObj = subjectMap.get(subjectCode.toUpperCase());
    }

    const cleanRecord = {
      title,
      description,
      department,
      year,
      semester,
      section,
      subjectCode,
      subjectName: subjectObj?.subjectName || record.subjectName || subjectCode,
      dueDate,
      uploadedBy,
      submissions: []
    };

    return { isValid: errors.length === 0, errors, record: cleanRecord };
  }

  static async saveAssignments(records, options = {}) {
    const report = createImportReport('Assignment Import');
    report.totalRecords = records.length;

    if (!Array.isArray(records) || records.length === 0) {
      return finalizeReport(report);
    }

    const validDepartmentsSet = await getValidDepartmentsSet();

    const subjects = await Subject.find({}, 'subjectCode subjectName');
    const subjectMap = new Map();
    subjects.forEach(s => {
      if (s.subjectCode) subjectMap.set(s.subjectCode.toUpperCase(), s);
    });

    const context = { validDepartmentsSet, subjectMap };
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

      const val = await this.validateAssignment(row, i, context);
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
        const existing = await Assignment.findOne({
          title: rec.title,
          dueDate: rec.dueDate
        }).session(session);

        if (existing) {
          report.duplicates++;
          await Assignment.updateOne({ _id: existing._id }, { $set: rec }).session(session);
          report.updated++;
          report.successRecords.push(rec);
        } else {
          await Assignment.create([rec], { session });
          report.inserted++;
          report.successRecords.push(rec);
        }
      }

      await session.commitTransaction();
    } catch (txErr) {
      if (session) await session.abortTransaction();

      for (const rec of validatedRecords) {
        try {
          const existing = await Assignment.findOne({
            title: rec.title,
            dueDate: rec.dueDate
          });

          if (existing) {
            report.duplicates++;
            await Assignment.updateOne({ _id: existing._id }, { $set: rec });
            report.updated++;
            report.successRecords.push(rec);
          } else {
            await Assignment.create(rec);
            report.inserted++;
            report.successRecords.push(rec);
          }
        } catch (dbErr) {
          report.failed++;
          report.validationErrors.push({ row: 'DB Save', field: rec.title, value: rec.title, message: dbErr.message });
        }
      }
    } finally {
      if (session) session.endSession();
    }

    return finalizeReport(report);
  }
}

module.exports = AssignmentImportService;
