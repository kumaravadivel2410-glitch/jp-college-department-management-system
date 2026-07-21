const Department = require('../../models/Department');
const { parseSpreadsheetOrPdf } = require('./fileParsers');
const { createImportReport, finalizeReport } = require('./importReport');
const mongoose = require('mongoose');

class DepartmentImportService {
  static async parseDepartmentFile(file) {
    return await parseSpreadsheetOrPdf(file);
  }

  static async validateDepartment(record, index) {
    const errors = [];
    const rowNum = index + 1;

    const departmentCode = String(record.departmentCode || record.code || '').trim().toUpperCase();
    const departmentName = String(record.departmentName || record.name || '').trim();
    const hod = String(record.hod || record.hodName || '').trim();
    const building = String(record.building || record.description || '').trim();
    const phone = String(record.phone || '').trim();

    if (!departmentCode) errors.push({ row: rowNum, field: 'departmentCode', value: record.departmentCode, message: 'Department Code is required.' });
    if (!departmentName) errors.push({ row: rowNum, field: 'departmentName', value: record.departmentName, message: 'Department Name is required.' });

    const cleanRecord = {
      departmentCode,
      code: departmentCode,
      departmentName,
      name: departmentName,
      hod,
      hodName: hod,
      description: building,
      phone
    };

    return { isValid: errors.length === 0, errors, record: cleanRecord };
  }

  static async saveDepartments(records) {
    const report = createImportReport('Department Import');
    report.totalRecords = records.length;

    if (!Array.isArray(records) || records.length === 0) {
      return finalizeReport(report);
    }

    const validatedRecords = [];
    for (let i = 0; i < records.length; i++) {
      const val = await this.validateDepartment(records[i], i);
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
        const existing = await Department.findOne({
          $or: [{ departmentCode: rec.departmentCode }, { code: rec.code }, { departmentName: rec.departmentName }, { name: rec.name }]
        }).session(session);

        if (existing) {
          report.duplicates++;
          await Department.updateOne({ _id: existing._id }, { $set: rec }).session(session);
          report.updated++;
          report.successRecords.push(rec);
        } else {
          await Department.create([rec], { session });
          report.inserted++;
          report.successRecords.push(rec);
        }
      }

      await session.commitTransaction();
    } catch (txErr) {
      if (session) await session.abortTransaction();

      for (const rec of validatedRecords) {
        try {
          const existing = await Department.findOne({
            $or: [{ departmentCode: rec.departmentCode }, { code: rec.code }, { departmentName: rec.departmentName }, { name: rec.name }]
          });

          if (existing) {
            report.duplicates++;
            await Department.updateOne({ _id: existing._id }, { $set: rec });
            report.updated++;
            report.successRecords.push(rec);
          } else {
            await Department.create(rec);
            report.inserted++;
            report.successRecords.push(rec);
          }
        } catch (dbErr) {
          report.failed++;
          report.validationErrors.push({ row: 'DB Save', field: rec.departmentCode, value: rec.departmentCode, message: dbErr.message });
        }
      }
    } finally {
      if (session) session.endSession();
    }

    return finalizeReport(report);
  }
}

module.exports = DepartmentImportService;
