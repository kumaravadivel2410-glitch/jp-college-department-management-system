const Note = require('../../models/Note');
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

class NotesImportService {
  static async parseNotesFile(file) {
    return await parseSpreadsheetOrPdf(file, { allowDocTypes: true });
  }

  static async validateNotes(record, index, { validDepartmentsSet, subjectMap }) {
    const errors = [];
    const rowNum = index + 1;

    const title = String(record.title || record.name || record.fileName || '').trim();
    const department = String(record.department || 'AI & DS').trim();
    const semester = String(record.semester || 'Semester V').trim();
    const section = String(record.section || 'A').trim();
    const subjectCode = String(record.subjectCode || record.subject || 'AD3501').trim();
    const fileUrl = String(record.fileUrl || `/uploads/${record.fileName || 'note.pdf'}`).trim();
    const fileType = String(record.fileType || 'pdf').toLowerCase().replace('.', '');
    const fileName = String(record.fileName || `${title}.${fileType}`).trim();
    const fileSize = String(record.fileSize || '1.2 MB').trim();
    const uploadedBy = String(record.uploadedBy || record.faculty || 'Faculty Member').trim();

    if (!title) errors.push({ row: rowNum, field: 'title', value: record.title, message: 'Notes title is required.' });
    if (!subjectCode) errors.push({ row: rowNum, field: 'subjectCode', value: record.subjectCode, message: 'Subject Code is required.' });

    if (department && validDepartmentsSet && !validDepartmentsSet.has(department.toLowerCase())) {
      errors.push({ row: rowNum, field: 'department', value: department, message: `Department '${department}' does not exist.` });
    }

    let subjectObj = null;
    if (subjectCode && subjectMap) {
      subjectObj = subjectMap.get(subjectCode.toUpperCase());
    }

    const cleanRecord = {
      title,
      department,
      semester,
      section,
      subjectCode,
      subjectName: subjectObj?.subjectName || record.subjectName || subjectCode,
      fileUrl,
      fileType,
      fileName,
      fileSize,
      uploadedBy,
      uploaderEmail: String(record.uploaderEmail || '').trim()
    };

    return { isValid: errors.length === 0, errors, record: cleanRecord };
  }

  static async saveNotes(records, options = {}) {
    const report = createImportReport('Subject Notes Import');
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

      const val = await this.validateNotes(row, i, context);
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
        const existing = await Note.findOne({
          title: rec.title,
          subjectCode: rec.subjectCode
        }).session(session);

        if (existing) {
          report.duplicates++;
          await Note.updateOne({ _id: existing._id }, { $set: rec }).session(session);
          report.updated++;
          report.successRecords.push(rec);
        } else {
          await Note.create([rec], { session });
          report.inserted++;
          report.successRecords.push(rec);
        }
      }

      await session.commitTransaction();
    } catch (txErr) {
      if (session) await session.abortTransaction();

      for (const rec of validatedRecords) {
        try {
          const existing = await Note.findOne({
            title: rec.title,
            subjectCode: rec.subjectCode
          });

          if (existing) {
            report.duplicates++;
            await Note.updateOne({ _id: existing._id }, { $set: rec });
            report.updated++;
            report.successRecords.push(rec);
          } else {
            await Note.create(rec);
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

module.exports = NotesImportService;
