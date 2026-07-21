const Faculty = require('../../models/Faculty');
const Department = require('../../models/Department');
const { parseSpreadsheetOrPdf } = require('./fileParsers');
const { createImportReport, finalizeReport } = require('./importReport');
const mongoose = require('mongoose');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

class FacultyImportService {
  static async parseFacultyFile(file) {
    return await parseSpreadsheetOrPdf(file);
  }

  static async validateFaculty(record, index, validDepartmentsSet) {
    const errors = [];
    const rowNum = index + 1;

    const facultyId = String(record.facultyId || record.id || '').trim();
    const facultyName = String(record.facultyName || record.name || '').trim();
    const email = String(record.email || '').toLowerCase().trim();
    const department = String(record.department || record.dept || '').trim();
    const designation = String(record.designation || 'Assistant Professor').trim();
    const phone = String(record.phone || '').trim();
    const qualification = String(record.qualification || '').trim();
    const experience = String(record.experience || '').trim();

    if (!facultyId) errors.push({ row: rowNum, field: 'facultyId', value: record.facultyId, message: 'Faculty ID is required.' });
    if (!facultyName) errors.push({ row: rowNum, field: 'facultyName', value: record.facultyName, message: 'Faculty Name is required.' });
    if (!email) errors.push({ row: rowNum, field: 'email', value: record.email, message: 'Email address is required.' });

    if (email && !EMAIL_REGEX.test(email)) {
      errors.push({ row: rowNum, field: 'email', value: email, message: 'Invalid email address format.' });
    }

    if (department && validDepartmentsSet && !validDepartmentsSet.has(department.toLowerCase())) {
      errors.push({ row: rowNum, field: 'department', value: department, message: `Department '${department}' does not exist.` });
    }

    const cleanRecord = {
      facultyId,
      facultyName,
      email,
      department,
      designation,
      phone,
      qualification,
      experience,
      approvalStatus: 'approved'
    };

    return { isValid: errors.length === 0, errors, record: cleanRecord };
  }

  static async saveFaculty(records, options = {}) {
    const report = createImportReport('Faculty Import');
    report.totalRecords = records.length;

    if (!Array.isArray(records) || records.length === 0) {
      return finalizeReport(report);
    }

    const validDeptsSet = await getValidDepartmentsSet();

    const validatedRecords = [];

    for (let i = 0; i < records.length; i++) {
      const val = await this.validateFaculty(records[i], i, validDeptsSet);
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
        const existing = await Faculty.findOne({
          $or: [{ facultyId: rec.facultyId }, { email: rec.email }]
        }).session(session);

        if (existing) {
          report.duplicates++;
          await Faculty.updateOne({ _id: existing._id }, { $set: rec }).session(session);
          report.updated++;
          report.successRecords.push(rec);
        } else {
          await Faculty.create([rec], { session });
          report.inserted++;
          report.successRecords.push(rec);
        }
      }

      await session.commitTransaction();
    } catch (txErr) {
      if (session) await session.abortTransaction();

      for (const rec of validatedRecords) {
        try {
          const existing = await Faculty.findOne({
            $or: [{ facultyId: rec.facultyId }, { email: rec.email }]
          });

          if (existing) {
            report.duplicates++;
            await Faculty.updateOne({ _id: existing._id }, { $set: rec });
            report.updated++;
            report.successRecords.push(rec);
          } else {
            await Faculty.create(rec);
            report.inserted++;
            report.successRecords.push(rec);
          }
        } catch (dbErr) {
          report.failed++;
          report.validationErrors.push({ row: 'DB Save', field: rec.facultyId, value: rec.facultyId, message: dbErr.message });
        }
      }
    } finally {
      if (session) session.endSession();
    }

    return finalizeReport(report);
  }
}

module.exports = FacultyImportService;
