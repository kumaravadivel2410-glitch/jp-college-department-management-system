const Subject = require('../../models/Subject');
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

class SubjectImportService {
  static async parseSubjectFile(file) {
    return await parseSpreadsheetOrPdf(file);
  }

  static async validateSubject(record, index, validDepartmentsSet) {
    const errors = [];
    const rowNum = index + 1;

    const subjectCode = String(record.subjectCode || record.code || '').trim().toUpperCase();
    const subjectName = String(record.subjectName || record.name || '').trim();
    const department = String(record.department || 'AI & DS').trim();
    const semester = String(record.semester || 'Semester V').trim();
    const credits = Number(record.credits) || 4;
    const regulation = String(record.regulation || '2021').trim();
    const facultyName = String(record.faculty || record.facultyName || record.facultyAssigned || '').trim();

    if (!subjectCode) errors.push({ row: rowNum, field: 'subjectCode', value: record.subjectCode, message: 'Subject Code is required.' });
    if (!subjectName) errors.push({ row: rowNum, field: 'subjectName', value: record.subjectName, message: 'Subject Name is required.' });
    if (isNaN(credits) || credits < 0) errors.push({ row: rowNum, field: 'credits', value: record.credits, message: 'Credits must be a valid non-negative number.' });

    if (department && validDepartmentsSet && !validDepartmentsSet.has(department.toLowerCase())) {
      errors.push({ row: rowNum, field: 'department', value: department, message: `Department '${department}' does not exist.` });
    }

    const cleanRecord = {
      subjectCode,
      subjectName,
      department,
      semester,
      credits,
      regulation,
      facultyName,
      facultyAssigned: facultyName
    };

    return { isValid: errors.length === 0, errors, record: cleanRecord };
  }

  static async saveSubjects(records) {
    const report = createImportReport('Subject Import');
    report.totalRecords = records.length;

    if (!Array.isArray(records) || records.length === 0) {
      return finalizeReport(report);
    }

    const validDeptsSet = await getValidDepartmentsSet();

    const validatedRecords = [];
    for (let i = 0; i < records.length; i++) {
      const val = await this.validateSubject(records[i], i, validDeptsSet);
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
        const existing = await Subject.findOne({ subjectCode: rec.subjectCode }).session(session);

        if (existing) {
          report.duplicates++;
          await Subject.updateOne({ _id: existing._id }, { $set: rec }).session(session);
          report.updated++;
          report.successRecords.push(rec);
        } else {
          await Subject.create([rec], { session });
          report.inserted++;
          report.successRecords.push(rec);
        }
      }

      await session.commitTransaction();
    } catch (txErr) {
      if (session) await session.abortTransaction();

      for (const rec of validatedRecords) {
        try {
          const existing = await Subject.findOne({ subjectCode: rec.subjectCode });

          if (existing) {
            report.duplicates++;
            await Subject.updateOne({ _id: existing._id }, { $set: rec });
            report.updated++;
            report.successRecords.push(rec);
          } else {
            await Subject.create(rec);
            report.inserted++;
            report.successRecords.push(rec);
          }
        } catch (dbErr) {
          report.failed++;
          report.validationErrors.push({ row: 'DB Save', field: rec.subjectCode, value: rec.subjectCode, message: dbErr.message });
        }
      }
    } finally {
      if (session) session.endSession();
    }

    return finalizeReport(report);
  }
}

module.exports = SubjectImportService;
