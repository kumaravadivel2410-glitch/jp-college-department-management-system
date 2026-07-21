const Notification = require('../../models/Notification');
const { parseSpreadsheetOrPdf } = require('./fileParsers');
const { createImportReport, finalizeReport } = require('./importReport');
const mongoose = require('mongoose');

class NotificationImportService {
  static async parseNotificationFile(file) {
    return await parseSpreadsheetOrPdf(file);
  }

  static async validateNotification(record, index) {
    const errors = [];
    const rowNum = index + 1;

    const title = String(record.title || record.subject || record.notificationTitle || 'System Notification').trim();
    const message = String(record.message || record.body || record.content || '').trim();
    const type = String(record.type || record.category || 'general').trim();
    const recipientRole = String(record.recipientRole || record.role || 'all').trim();

    if (!title) errors.push({ row: rowNum, field: 'title', value: record.title, message: 'Notification Title is required.' });

    const cleanRecord = {
      title,
      message: message || title,
      type,
      recipientRole,
      read: false
    };

    return { isValid: errors.length === 0, errors, record: cleanRecord };
  }

  static async saveNotifications(records) {
    const report = createImportReport('Notification Import');
    report.totalRecords = records.length;

    if (!Array.isArray(records) || records.length === 0) {
      return finalizeReport(report);
    }

    const validatedRecords = [];
    for (let i = 0; i < records.length; i++) {
      const val = await this.validateNotification(records[i], i);
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
