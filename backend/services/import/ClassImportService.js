const ClassModel = require('../../models/ClassModel');
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

class ClassImportService {
  static async parseClassFile(file) {
    return await parseSpreadsheetOrPdf(file);
  }

  static async validateClass(record, index, validDepartmentsSet) {
    const errors = [];
    const rowNum = index + 1;

    const department = String(record.department || record.dept || 'AI & DS').trim();
    const year = String(record.year || 'III Year').trim();
    const semester = String(record.semester || 'Semester V').trim();
    const section = String(record.section || 'A').trim();
    const classAdvisor = String(record.classAdvisor || record.advisor || '').trim();
    const roomNumber = String(record.roomNumber || record.room || 'LH-201').trim();
    const className = record.className || `${department} - ${year} - ${section}`;

    if (!department) errors.push({ row: rowNum, field: 'department', value: record.department, message: 'Department is required.' });
    if (!year) errors.push({ row: rowNum, field: 'year', value: record.year, message: 'Year is required.' });
    if (!semester) errors.push({ row: rowNum, field: 'semester', value: record.semester, message: 'Semester is required.' });
    if (!section) errors.push({ row: rowNum, field: 'section', value: record.section, message: 'Section is required.' });

    if (department && validDepartmentsSet && !validDepartmentsSet.has(department.toLowerCase())) {
      errors.push({ row: rowNum, field: 'department', value: department, message: `Department '${department}' does not exist.` });
    }

    const cleanRecord = {
      className,
      department,
      year,
      semester,
      section,
      classAdvisor,
      roomNumber
    };

    return { isValid: errors.length === 0, errors, record: cleanRecord };
  }

  static async saveClasses(records) {
    const report = createImportReport('Class Import');
    report.totalRecords = records.length;

    if (!Array.isArray(records) || records.length === 0) {
      return finalizeReport(report);
    }

    const validDeptsSet = await getValidDepartmentsSet();

    const validatedRecords = [];
    for (let i = 0; i < records.length; i++) {
      const val = await this.validateClass(records[i], i, validDeptsSet);
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
        const existing = await ClassModel.findOne({
          department: rec.department,
          year: rec.year,
          semester: rec.semester,
          section: rec.section
        }).session(session);

        if (existing) {
          report.duplicates++;
          await ClassModel.updateOne({ _id: existing._id }, { $set: rec }).session(session);
          report.updated++;
          report.successRecords.push(rec);
        } else {
          await ClassModel.create([rec], { session });
          report.inserted++;
          report.successRecords.push(rec);
        }
      }

      await session.commitTransaction();
    } catch (txErr) {
      if (session) await session.abortTransaction();

      for (const rec of validatedRecords) {
        try {
          const existing = await ClassModel.findOne({
            department: rec.department,
            year: rec.year,
            semester: rec.semester,
            section: rec.section
          });

          if (existing) {
            report.duplicates++;
            await ClassModel.updateOne({ _id: existing._id }, { $set: rec });
            report.updated++;
            report.successRecords.push(rec);
          } else {
            await ClassModel.create(rec);
            report.inserted++;
            report.successRecords.push(rec);
          }
        } catch (dbErr) {
          report.failed++;
          report.validationErrors.push({ row: 'DB Save', field: rec.className, value: rec.className, message: dbErr.message });
        }
      }
    } finally {
      if (session) session.endSession();
    }

    return finalizeReport(report);
  }
}

module.exports = ClassImportService;
