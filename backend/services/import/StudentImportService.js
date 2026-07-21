const Student = require('../../models/Student');
const Department = require('../../models/Department');
const { parseSpreadsheetOrPdf } = require('./fileParsers');
const { createImportReport, finalizeReport } = require('./importReport');
const mongoose = require('mongoose');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s\-()]{7,15}$/;

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

  static async validateStudent(record, index, validDepartmentsSet) {
    const errors = [];
    const rowNum = index + 1;

    const registerNo = String(record.registerNo || record.registerNumber || record.regNo || record.registerno || '').trim();
    const studentName = String(record.studentName || record.name || record.studentname || '').trim();
    const email = String(record.email || '').toLowerCase().trim();
    const phone = String(record.phone || record.phoneNumber || record.mobile || '').trim();
    const department = String(record.department || record.dept || 'AI & DS').trim();
    const year = String(record.year || 'III Year').trim();
    const semester = String(record.semester || 'Semester V').trim();
    const section = String(record.section || 'A').trim();
    const gender = String(record.gender || 'Male').trim();
    const dateOfBirth = String(record.dateOfBirth || record.dob || '').trim();

    if (!registerNo) errors.push({ row: rowNum, field: 'registerNo', value: record.registerNo, message: 'Register Number is required.' });
    if (!studentName) errors.push({ row: rowNum, field: 'studentName', value: record.studentName, message: 'Student Name is required.' });
    if (!email) errors.push({ row: rowNum, field: 'email', value: record.email, message: 'Email address is required.' });

    if (email && !EMAIL_REGEX.test(email)) {
      errors.push({ row: rowNum, field: 'email', value: email, message: 'Invalid email address format.' });
    }

    if (phone && !PHONE_REGEX.test(phone)) {
      errors.push({ row: rowNum, field: 'phone', value: phone, message: 'Invalid phone number format.' });
    }

    if (gender && !['Male', 'Female', 'Other'].includes(gender)) {
      errors.push({ row: rowNum, field: 'gender', value: gender, message: "Gender must be 'Male', 'Female', or 'Other'." });
    }

    if (validDepartmentsSet && !validDepartmentsSet.has(department.toLowerCase())) {
      errors.push({ row: rowNum, field: 'department', value: department, message: `Department '${department}' does not exist in ERP system.` });
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
      gender,
      dateOfBirth,
      bloodGroup: String(record.bloodGroup || '').trim(),
      address: String(record.address || '').trim(),
      parentName: String(record.parentName || record.fatherName || '').trim(),
      parentPhone: String(record.parentPhone || record.fatherPhone || '').trim(),
      status: 'Active',
      approvalStatus: 'approved'
    };

    return { isValid: errors.length === 0, errors, record: cleanRecord };
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
          report.validationErrors.push({ row: i + 1, field: 'department', value: rowDept, message: `Skipped record outside assigned department (${userDept}).` });
          continue;
        }
        row.department = userDept;
      }

      const val = await this.validateStudent(row, i, validDeptsSet);
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
        const filter = { $or: [{ registerNo: rec.registerNo }, { email: rec.email }] };
        const existing = await Student.findOne(filter);

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
