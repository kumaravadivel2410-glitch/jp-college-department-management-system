const Department = require('../../models/Department');
const { parseSpreadsheetOrPdf } = require('./fileParsers');
const { createImportReport, finalizeReport } = require('./importReport');
const mongoose = require('mongoose');

class DepartmentImportService {
  static async parseDepartmentFile(file) {
    return await parseSpreadsheetOrPdf(file);
  }

  static async validateDepartment(record, index, report, options = {}) {
    const errors = [];
    const warnings = [];
    const rowNum = index + 1;

    let departmentCode = String(record.departmentCode || record.code || record.deptCode || record.departmentcode || '').trim().toUpperCase();
    let departmentName = String(record.departmentName || record.name || record.deptName || record.departmentname || '').trim();
    const hod = String(record.hod || record.hodName || record.headOfDepartment || '').trim();
    const building = String(record.building || record.block || record.description || '').trim();
    const phone = String(record.phone || record.mobile || '').trim();

    // Check zero usable data
    const nonKeys = Object.keys(record).filter(k => String(record[k] || '').trim().length > 0);
    if (nonKeys.length === 0) {
      return { isValid: false, errors: [{ row: rowNum, field: 'all', value: '', message: 'Row contains no usable department data.' }], warnings: [], record: null };
    }

    if (!departmentCode) {
      if (options.allowAutoGenerateIds) {
        departmentCode = `DEPT-${index + 1}`;
        warnings.push({ row: rowNum, field: 'departmentCode', value: '', message: `Department Code missing. Generated automatically (${departmentCode}).` });
      } else {
        errors.push({ row: rowNum, field: 'departmentCode', value: '', message: 'Department Code is required. Enable "Auto Generate IDs" to auto-assign.' });
      }
    }

    if (!departmentName) {
      if (options.allowAutoGenerateIds) {
        departmentName = `Department of ${departmentCode || 'Engineering'}`;
        warnings.push({ row: rowNum, field: 'departmentName', value: '', message: `Department Name missing. Defaulted to '${departmentName}'.` });
      } else {
        errors.push({ row: rowNum, field: 'departmentName', value: '', message: 'Department Name is required.' });
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors, warnings, record: null };
    }

    if (report && warnings.length > 0) {
      report.warnings.push(...warnings);
    }

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

    return { isValid: true, errors: [], warnings, record: cleanRecord };
  }

  static async saveDepartments(records, options = {}) {
    const report = createImportReport('Department Import');
    report.totalRecords = records.length;

    if (!Array.isArray(records) || records.length === 0) {
      return finalizeReport(report);
    }

    const validatedRecords = [];
    for (let i = 0; i < records.length; i++) {
      const val = await this.validateDepartment(records[i], i, report, options);
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
