const Notification = require('../../models/Notification');
const { parseSpreadsheetOrPdf } = require('./fileParsers');
const { createImportReport, finalizeReport } = require('./importReport');
const mongoose = require('mongoose');

const VALID_TYPES = ['attendance', 'marks', 'notes', 'import', 'export', 'approval', 'system'];

class NotificationImportService {
  static async parseNotificationFile(file) {
    return await parseSpreadsheetOrPdf(file);
  }

  static async validateNotification(record, index, report) {
    const warnings = [];
    const rowNum = index + 1;

    let title = String(record.title || record.subject || record.notificationTitle || '').trim();
    let message = String(record.message || record.body || record.content || record.details || '').trim();
    let type = String(record.type || record.category || 'system').trim().toLowerCase();
    const recipientRole = String(record.recipientRole || record.role || 'all').trim();

    // Check zero usable data
    const nonKeys = Object.keys(record).filter(k => String(record[k] || '').trim().length > 0);
    if (nonKeys.length === 0) {
      return { isValid: false, errors: [{ row: rowNum, field: 'all', value: '', message: 'Row contains no usable notification data.' }], warnings: [], record: null };
    }

    if (!title) {
      title = `Notification ${index + 1}`;
      warnings.push({ row: rowNum, field: 'title', value: '', message: `Notification Title missing. Defaulted to '${title}'.` });
    }

    if (!message) {
      message = title;
      warnings.push({ row: rowNum, field: 'message', value: '', message: 'Notification Message missing. Defaulted to title.' });
    }

    if (!VALID_TYPES.includes(type)) {
      warnings.push({ row: rowNum, field: 'type', value: type, message: `Invalid notification type '${type}'. Defaulted to 'system'.` });
      type = 'system';
    }

    if (report && warnings.length > 0) {
      report.warnings.push(...warnings);
    }

    const cleanRecord = {
      title,
      message,
      type,
      recipientRole,
      read: false
    };

    return { isValid: true, errors: [], warnings, record: cleanRecord };
  }

  static async saveNotifications(records) {
    const report = createImportReport('Notification Import');
    report.totalRecords = records.length;

    if (!Array.isArray(records) || records.length === 0) {
      return finalizeReport(report);
    }

    const validatedRecords = [];
    for (let i = 0; i < records.length; i++) {
      const val = await this.validateNotification(records[i], i, report);
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
        console.log('Saving Notification:', rec.title, rec.type);
        const filter = { title: rec.title, message: rec.message };
        const existing = await Notification.findOne(filter);

        if (existing) {
          report.duplicates++;
          const updatedDoc = await Notification.findOneAndUpdate({ _id: existing._id }, { $set: rec }, { new: true, runValidators: true });
          report.updated++;
          report.successRecords.push(updatedDoc.toObject());
        } else {
          const createdDoc = await Notification.create(rec);
          report.inserted++;
          report.successRecords.push(createdDoc.toObject());
        }
      } catch (dbErr) {
        console.error(`❌ MongoDB Notification Save Error [${rec.title}]:`, dbErr.message);
        report.failed++;
        report.validationErrors.push({ row: 'DB Save', field: rec.title, value: rec.title, message: dbErr.message });
      }
    }

    return finalizeReport(report);
  }
}

module.exports = NotificationImportService;
