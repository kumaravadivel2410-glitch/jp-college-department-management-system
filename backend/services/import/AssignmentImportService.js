const Assignment = require('../../models/Assignment');
const Department = require('../../models/Department');
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

  static async validateAssignment(record, index, validDepartmentsSet) {
    const errors = [];
    const rowNum = index + 1;

    const title = String(record.title || record.assignmentTitle || 'Course Assignment').trim();
    const description = String(record.description || record.details || '').trim();
    const department = String(record.department || record.dept || 'AI & DS').trim();
    const year = String(record.year || 'III Year').trim();
    const semester = String(record.semester || 'Semester V').trim();
    const section = String(record.section || 'A').trim();
    const subjectCode = String(record.subjectCode || record.subject || 'AD3501').trim();
    const subjectName = String(record.subjectName || title).trim();
    const dueDate = String(record.dueDate || record.deadline || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]).trim();
    const uploadedBy = String(record.uploadedBy || record.faculty || 'Faculty Member').trim();

    if (!title) errors.push({ row: rowNum, field: 'title', value: record.title, message: 'Assignment Title is required.' });
    if (!department) errors.push({ row: rowNum, field: 'department', value: record.department, message: 'Department is required.' });

    if (department && validDepartmentsSet && !validDepartmentsSet.has(department.toLowerCase())) {
      errors.push({ row: rowNum, field: 'department', value: department, message: `Department '${department}' does not exist.` });
    }

    const cleanRecord = {
      title,
      description,
      department,
      year,
      semester,
      section,
      subjectCode,
      subjectName,
      dueDate,
      uploadedBy,
      uploaderEmail: String(record.uploaderEmail || 'faculty@jpcoe.ac.in').trim(),
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

      const val = await this.validateAssignment(row, i, validDeptsSet);
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
        console.log('Saving Assignment:', rec.title, rec.department, rec.subjectCode);
        const filter = { title: rec.title, department: rec.department, subjectCode: rec.subjectCode };
        const existing = await Assignment.findOne(filter);

        if (existing) {
          report.duplicates++;
          const updatedDoc = await Assignment.findOneAndUpdate({ _id: existing._id }, { $set: rec }, { new: true, runValidators: true });
          report.updated++;
          report.successRecords.push(updatedDoc.toObject());
        } else {
          const createdDoc = await Assignment.create(rec);
          report.inserted++;
          report.successRecords.push(createdDoc.toObject());
        }
      } catch (dbErr) {
        console.error(`❌ MongoDB Assignment Save Error [${rec.title}]:`, dbErr.message);
        report.failed++;
        report.validationErrors.push({ row: 'DB Save', field: rec.title, value: rec.title, message: dbErr.message });
      }
    }

    return finalizeReport(report);
  }
}

module.exports = AssignmentImportService;
