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

  static async validateFaculty(record, index, validDepartmentsSet, report) {
    const warnings = [];
    const rowNum = index + 1;

    let facultyId = String(record.facultyId || record.id || record.teacherId || record.staffId || record.employeeId || '').trim();
    let facultyName = String(record.facultyName || record.name || record.teacherName || record.staffName || '').trim();
    let email = String(record.email || record.emailAddress || record.mail || '').toLowerCase().trim();
    const department = String(record.department || record.dept || record.branch || 'AI & DS').trim();
    const designation = String(record.designation || record.role || 'Assistant Professor').trim();
    const phone = String(record.phone || record.mobile || record.contact || '').trim();
    const qualification = String(record.qualification || record.degree || 'M.E.').trim();
    const experience = String(record.experience || record.exp || '2 Years').trim();

    // Check zero usable data
    const nonKeys = Object.keys(record).filter(k => String(record[k] || '').trim().length > 0);
    if (nonKeys.length === 0) {
      return { isValid: false, errors: [{ row: rowNum, field: 'all', value: '', message: 'Row contains no usable faculty data.' }], warnings: [], record: null };
    }

    // Tolerant fallbacks & auto-generation
    if (!facultyId) {
      facultyId = `JPC-FAC-${Date.now().toString().slice(-4)}${index + 10}`;
      warnings.push({ row: rowNum, field: 'facultyId', value: '', message: `Faculty ID missing. Generated automatically (${facultyId}).` });
    }

    if (!facultyName) {
      facultyName = email ? email.split('@')[0] : `Faculty ${facultyId.slice(-4)}`;
      warnings.push({ row: rowNum, field: 'facultyName', value: '', message: `Faculty Name missing. Defaulted to '${facultyName}'.` });
    }

    if (!email) {
      email = `faculty_${facultyId.toLowerCase().replace(/[^a-z0-9]/g, '')}@jpcoe.ac.in`;
      warnings.push({ row: rowNum, field: 'email', value: '', message: `Email missing. Saved as default (${email}).` });
    } else if (!EMAIL_REGEX.test(email)) {
      const fallbackEmail = `faculty_${facultyId.toLowerCase().replace(/[^a-z0-9]/g, '')}@jpcoe.ac.in`;
      warnings.push({ row: rowNum, field: 'email', value: email, message: `Invalid email address format. Replaced with default (${fallbackEmail}).` });
      email = fallbackEmail;
    }

    if (report && warnings.length > 0) {
      report.warnings.push(...warnings);
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

    return { isValid: true, errors: [], warnings, record: cleanRecord };
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
      const val = await this.validateFaculty(records[i], i, validDeptsSet, report);
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
        console.log('Saving Faculty:', rec.facultyId, rec.facultyName, rec.email);
        const filterOr = [{ facultyId: rec.facultyId }];
        if (rec.email) filterOr.push({ email: rec.email });

        const existing = await Faculty.findOne({ $or: filterOr });

        if (existing) {
          report.duplicates++;
          const updatedDoc = await Faculty.findOneAndUpdate({ _id: existing._id }, { $set: rec }, { new: true, runValidators: true });
          report.updated++;
          report.successRecords.push(updatedDoc.toObject());
        } else {
          const createdDoc = await Faculty.create(rec);
          report.inserted++;
          report.successRecords.push(createdDoc.toObject());
        }
      } catch (dbErr) {
        console.error(`❌ MongoDB Faculty Save Error [${rec.facultyId}]:`, dbErr.message);
        report.failed++;
        report.validationErrors.push({ row: 'DB Save', field: rec.facultyId, value: rec.facultyId, message: dbErr.message });
      }
    }

    return finalizeReport(report);
  }
}

module.exports = FacultyImportService;
