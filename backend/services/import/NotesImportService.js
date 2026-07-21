const Note = require('../../models/Note');
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

class NotesImportService {
  static async parseNotesFile(file) {
    return await parseSpreadsheetOrPdf(file, { allowDocTypes: true });
  }

  static async validateNotes(record, index, validDepartmentsSet) {
    const errors = [];
    const rowNum = index + 1;

    const title = String(record.title || record.name || record.subjectName || 'Subject Resource Note').trim();
    const department = String(record.department || record.dept || 'AI & DS').trim();
    const semester = String(record.semester || 'Semester V').trim();
    const section = String(record.section || 'A').trim();
    const subjectCode = String(record.subjectCode || record.subject || 'AD3501').trim();
    const subjectName = String(record.subjectName || title).trim();
    const fileName = String(record.fileName || record.filename || `${title}.pdf`).trim();
    const fileType = String(record.fileType || record.filetype || 'pdf').trim();
    const fileSize = String(record.fileSize || record.filesize || '1.5 MB').trim();
    const fileUrl = String(record.fileUrl || record.url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf').trim();
    const uploadedBy = String(record.uploadedBy || record.faculty || 'Faculty Member').trim();

    if (!title) errors.push({ row: rowNum, field: 'title', value: record.title, message: 'Notes Title is required.' });
    if (!department) errors.push({ row: rowNum, field: 'department', value: record.department, message: 'Department is required.' });

    if (department && validDepartmentsSet && !validDepartmentsSet.has(department.toLowerCase())) {
      errors.push({ row: rowNum, field: 'department', value: department, message: `Department '${department}' does not exist.` });
    }

    const cleanRecord = {
      title,
      department,
      semester,
      section,
      subjectCode,
      subjectName,
      fileName,
      fileType,
      fileSize,
      fileUrl,
      uploadedBy,
      uploaderEmail: String(record.uploaderEmail || 'faculty@jpcoe.ac.in').trim()
    };

    return { isValid: errors.length === 0, errors, record: cleanRecord };
  }

  static async saveNotes(records, options = {}) {
    const report = createImportReport('Subject Notes Import');
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

      const val = await this.validateNotes(row, i, validDeptsSet);
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
        console.log('Saving Subject Note:', rec.title, rec.department, rec.subjectCode);
        const filter = { title: rec.title, department: rec.department, subjectCode: rec.subjectCode };
        const existing = await Note.findOne(filter);

        if (existing) {
          report.duplicates++;
          const updatedDoc = await Note.findOneAndUpdate({ _id: existing._id }, { $set: rec }, { new: true, runValidators: true });
          report.updated++;
          report.successRecords.push(updatedDoc.toObject());
        } else {
          const createdDoc = await Note.create(rec);
          report.inserted++;
          report.successRecords.push(createdDoc.toObject());
        }
      } catch (dbErr) {
        console.error(`❌ MongoDB Notes Save Error [${rec.title}]:`, dbErr.message);
        report.failed++;
        report.validationErrors.push({ row: 'DB Save', field: rec.title, value: rec.title, message: dbErr.message });
      }
    }

    return finalizeReport(report);
  }
}

module.exports = NotesImportService;
