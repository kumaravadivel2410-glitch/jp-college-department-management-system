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

    const departmentCode = String(record.departmentCode || record.code || record.departmentcode || '').trim().toUpperCase();
    const departmentName = String(record.departmentName || record.name || record.departmentname || '').trim();
    const hod = String(record.hod || record.hodName || record.hodname || '').trim();
    const building = String(record.building || record.description || '').trim();
    const phone = String(record.phone || record.mobile || '').trim();

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

    for (const rec of validatedRecords) {
      try {
        console.log('Saving Department:', rec.departmentCode, rec.departmentName);
        const filter = { $or: [{ departmentCode: rec.departmentCode }, { code: rec.code }, { departmentName: rec.departmentName }, { name: rec.name }] };
        const existing = await Department.findOne(filter);

        if (existing) {
          report.duplicates++;
          const updatedDoc = await Department.findOneAndUpdate({ _id: existing._id }, { $set: rec }, { new: true, runValidators: true });
          report.updated++;
          report.successRecords.push(updatedDoc.toObject());
        } else {
          const createdDoc = await Department.create(rec);
          report.inserted++;
          report.successRecords.push(createdDoc.toObject());
        }
      } catch (dbErr) {
        console.error(`❌ MongoDB Department Save Error [${rec.departmentCode}]:`, dbErr.message);
        report.failed++;
        report.validationErrors.push({ row: 'DB Save', field: rec.departmentCode, value: rec.departmentCode, message: dbErr.message });
      }
    }

    return finalizeReport(report);
  }
}

module.exports = DepartmentImportService;
