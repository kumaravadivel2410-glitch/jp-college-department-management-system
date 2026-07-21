const Subject = require('../../models/Subject');
const Department = require('../../models/Department');
const { parseSpreadsheetOrPdf } = require('./fileParsers');
const { createImportReport, finalizeReport } = require('./importReport');
const mongoose = require('mongoose');

class SubjectImportService {
  static async parseSubjectFile(file) {
    return await parseSpreadsheetOrPdf(file);
  }

  static async validateSubject(record, index, report, options = {}) {
    const errors = [];
    const warnings = [];
    const rowNum = index + 1;

    let subjectCode = String(record.subjectCode || record.code || record.subCode || record.courseCode || record.subjectcode || '').trim().toUpperCase();
    let subjectName = String(record.subjectName || record.name || record.title || record.courseName || record.subjectname || '').trim();
    const department = String(record.department || record.dept || record.branch || 'AI & DS').trim();
    const semester = String(record.semester || record.sem || 'Semester V').trim();
    const credits = parseInt(record.credits || record.credit || 4, 10) || 4;
    const regulation = String(record.regulation || record.reg || '2021').trim();
    const faculty = String(record.faculty || record.facultyName || '').trim();

    // Check zero usable data
    const nonKeys = Object.keys(record).filter(k => String(record[k] || '').trim().length > 0);
    if (nonKeys.length === 0) {
      return { isValid: false, errors: [{ row: rowNum, field: 'all', value: '', message: 'Row contains no usable subject data.' }], warnings: [], record: null };
    }

    if (!subjectCode) {
      if (options.allowAutoGenerateIds) {
        subjectCode = `SUB-${index + 301}`;
        warnings.push({ row: rowNum, field: 'subjectCode', value: '', message: `Subject Code missing. Generated automatically (${subjectCode}).` });
      } else {
        errors.push({ row: rowNum, field: 'subjectCode', value: '', message: 'Subject Code is required. Enable "Auto Generate IDs" to auto-assign.' });
      }
    }

    if (!subjectName) {
      if (options.allowAutoGenerateIds) {
        subjectName = `Subject ${subjectCode}`;
        warnings.push({ row: rowNum, field: 'subjectName', value: '', message: `Subject Name missing. Defaulted to '${subjectName}'.` });
      } else {
        errors.push({ row: rowNum, field: 'subjectName', value: '', message: 'Subject Name is required.' });
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors, warnings, record: null };
    }

    if (report && warnings.length > 0) {
      report.warnings.push(...warnings);
    }

    const cleanRecord = {
      subjectCode,
      code: subjectCode,
      subjectName,
      name: subjectName,
      department,
      semester,
      credits,
      regulation,
      faculty
    };

    return { isValid: true, errors: [], warnings, record: cleanRecord };
  }

  static async saveSubjects(records, options = {}) {
    const report = createImportReport('Subject Import');
    report.totalRecords = records.length;

    if (!Array.isArray(records) || records.length === 0) {
      return finalizeReport(report);
    }

    const validatedRecords = [];
    for (let i = 0; i < records.length; i++) {
      const val = await this.validateSubject(records[i], i, report, options);
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
        console.log('Saving Subject:', rec.subjectCode, rec.subjectName);
        const filter = { $or: [{ subjectCode: rec.subjectCode }, { code: rec.code }] };
        const existing = await Subject.findOne(filter);

        if (existing) {
          report.duplicates++;
          const updatedDoc = await Subject.findOneAndUpdate({ _id: existing._id }, { $set: rec }, { new: true, runValidators: true });
          report.updated++;
          report.successRecords.push(updatedDoc.toObject());
        } else {
          const createdDoc = await Subject.create(rec);
          report.inserted++;
          report.successRecords.push(createdDoc.toObject());
        }
      } catch (dbErr) {
        console.error(`❌ MongoDB Subject Save Error [${rec.subjectCode}]:`, dbErr.message);
        report.failed++;
        report.validationErrors.push({ row: 'DB Save', field: rec.subjectCode, value: rec.subjectCode, message: dbErr.message });
      }
    }

    return finalizeReport(report);
  }
}

module.exports = SubjectImportService;
