const Student = require('../../models/Student');
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

class StudentImportService {
  static async parseStudentFile(file) {
    return await parseSpreadsheetOrPdf(file);
  }

  static async validateStudent(record, index, validDepartmentsSet, report, options = {}) {
    const errors = [];
    const warnings = [];
    const rowNum = index + 1;

    let registerNo = String(record.registerNo || record.registerNumber || record.regNo || record.registerno || record.registrationNumber || '').trim();
    let studentName = String(record.studentName || record.name || record.fullName || record.candidateName || record.studentname || '').trim();
    let email = String(record.email || record.emailAddress || record.mail || record.studentEmail || '').toLowerCase().trim();
    const phone = String(record.phone || record.phoneNumber || record.mobile || record.contact || '').trim();
    const department = String(record.department || record.dept || record.branch || 'AI & DS').trim();
    const year = String(record.year || 'III Year').trim();
    const semester = String(record.semester || 'Semester V').trim();
    const section = String(record.section || 'A').trim();
    const gender = String(record.gender || 'Male').trim();
    const dateOfBirth = String(record.dateOfBirth || record.dob || '').trim();

    // Check if row has zero usable data
    const nonKeys = Object.keys(record).filter(k => String(record[k] || '').trim().length > 0);
    if (nonKeys.length === 0) {
      return { isValid: false, errors: [{ row: rowNum, field: 'all', value: '', message: 'Row contains no usable student data.' }], warnings: [], record: null };
    }

    // Required Register Number Handling
    if (!registerNo) {
      if (options.allowAutoGenerateIds) {
        registerNo = `953621${Date.now().toString().slice(-4)}${index + 10}`;
        warnings.push({ row: rowNum, field: 'registerNo', value: '', message: `Register Number missing. Generated automatically (${registerNo}).` });
      } else {
        errors.push({ row: rowNum, field: 'registerNo', value: '', message: 'Register Number is missing. Enable "Auto Generate IDs" to auto-assign.' });
      }
    }

    if (!studentName) {
      if (options.allowAutoGenerateIds) {
        studentName = email ? email.split('@')[0] : `Student ${registerNo.slice(-4)}`;
        warnings.push({ row: rowNum, field: 'studentName', value: '', message: `Student Name missing. Defaulted to '${studentName}'.` });
      } else {
        errors.push({ row: rowNum, field: 'studentName', value: '', message: 'Student Name is required.' });
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors, warnings, record: null };
    }

    if (!email) {
      if (options.allowAutoGenerateIds) {
        email = `student_${registerNo.toLowerCase()}@jpcoe.ac.in`;
        warnings.push({ row: rowNum, field: 'email', value: '', message: `Email missing. Saved as default (${email}).` });
      } else {
        email = '';
      }
    } else if (!EMAIL_REGEX.test(email)) {
      if (options.allowAutoGenerateIds) {
        const fallbackEmail = `student_${registerNo.toLowerCase()}@jpcoe.ac.in`;
        warnings.push({ row: rowNum, field: 'email', value: email, message: `Invalid email address format. Replaced with default (${fallbackEmail}).` });
        email = fallbackEmail;
      }
    }

    if (report && warnings.length > 0) {
      report.warnings.push(...warnings);
    }

    const cleanRecord = {
      registerNo,
      rollNumber: String(record.rollNumber || record.rollNo || '').trim(),
      studentName,
      email,
      phone,
      department,
      year,
      semester,
      section,
      gender: ['Male', 'Female', 'Other'].includes(gender) ? gender : 'Male',
      dateOfBirth,
      bloodGroup: String(record.bloodGroup || '').trim(),
      address: String(record.address || '').trim(),
      parentName: String(record.parentName || record.fatherName || '').trim(),
      parentPhone: String(record.parentPhone || record.fatherPhone || '').trim(),
      status: 'Active',
      approvalStatus: 'approved'
    };

    return { isValid: true, errors: [], warnings, record: cleanRecord };
  }

  static async saveStudents(records, options = {}) {
    const report = createImportReport('Student Import');
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
          report.warnings.push({ row: i + 1, field: 'department', value: rowDept, message: `Skipped record outside assigned department (${userDept}).` });
          continue;
        }
        row.department = userDept;
      }

      const val = await this.validateStudent(row, i, validDeptsSet, report, options);
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
        console.log('Saving Student:', rec.registerNo, rec.studentName, rec.email);
        const filterOr = [{ registerNo: rec.registerNo }];
        if (rec.email) filterOr.push({ email: rec.email });

        const existing = await Student.findOne({ $or: filterOr });

        if (existing) {
          report.duplicates++;
          const updatedDoc = await Student.findOneAndUpdate({ _id: existing._id }, { $set: rec }, { new: true, runValidators: true });
          report.updated++;
          report.successRecords.push(updatedDoc.toObject());
        } else {
          const createdDoc = await Student.create(rec);
          report.inserted++;
          report.successRecords.push(createdDoc.toObject());
        }
      } catch (dbErr) {
        console.error(`❌ MongoDB Student Save Error [${rec.registerNo}]:`, dbErr.message);
        report.failed++;
        report.validationErrors.push({ row: 'DB Save', field: rec.registerNo, value: rec.registerNo, message: dbErr.message });
      }
    }

    return finalizeReport(report);
  }
}

module.exports = StudentImportService;
