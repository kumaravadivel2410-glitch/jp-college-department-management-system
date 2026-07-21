const Notification = require('../../models/Notification');
const { parseSpreadsheetOrPdf } = require('./fileParsers');
const { createImportReport, finalizeReport } = require('./importReport');
const mongoose = require('mongoose');

const VALID_TYPES = ['attendance', 'marks', 'notes', 'import', 'export', 'approval', 'system'];
const VALID_ROLES = ['all', 'admin', 'faculty', 'student'];

class NotificationImportService {
  static async parseNotificationFile(file) {
    return await parseSpreadsheetOrPdf(file);
  }

  static async validateNotification(record, index) {
    const errors = [];
    const rowNum = index + 1;

    const title = String(record.title || record.subject || '').trim();
    const message = String(record.message || record.body || record.content || '').trim();
    const type = String(record.type || record.category || 'system').toLowerCase().trim();
    const recipientRole = String(record.recipientRole || record.audience || record.role || 'all').toLowerCase().trim();
    const recipientEmail = String(record.recipientEmail || record.email || '').toLowerCase().trim();

    if (!title) errors.push({ row: rowNum, field: 'title', value: record.title, message: 'Notification Title is required.' });
    if (!message) errors.push({ row: rowNum, field: 'message', value: record.message, message: 'Notification Message is required.' });

    if (type && !VALID_TYPES.includes(type)) {
      errors.push({ row: rowNum, field: 'type', value: type, message: `Type must be one of: ${VALID_TYPES.join(', ')}.` });
    }

    if (recipientRole && !VALID_ROLES.includes(recipientRole)) {
      errors.push({ row: rowNum, field: 'recipientRole', value: recipientRole, message: `Recipient Role must be one of: ${VALID_ROLES.join(', ')}.` });
    }

    const cleanRecord = {
      title,
      message,
      type: VALID_TYPES.includes(type) ? type : 'system',
      recipientRole: VALID_ROLES.includes(recipientRole) ? recipientRole : 'all',
      recipientEmail,
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

    let session = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();

      for (const rec of validatedRecords) {
        const existing = await Notification.findOne({
          title: rec.title,
          message: rec.message
        }).session(session);

        if (existing) {
          report.duplicates++;
          await Notification.updateOne({ _id: existing._id }, { $set: rec }).session(session);
          report.updated++;
          report.successRecords.push(rec);
        } else {
          await Notification.create([rec], { session });
          report.inserted++;
          report.successRecords.push(rec);
        }
      }

      await session.commitTransaction();
    } catch (txErr) {
      if (session) await session.abortTransaction();

      for (const rec of validatedRecords) {
        try {
          const existing = await Notification.findOne({
            title: rec.title,
            message: rec.message
          });

          if (existing) {
            report.duplicates++;
            await Notification.updateOne({ _id: existing._id }, { $set: rec });
            report.updated++;
            report.successRecords.push(rec);
          } else {
            await Notification.create(rec);
            report.inserted++;
            report.successRecords.push(rec);
          }
        } catch (dbErr) {
          report.failed++;
          report.validationErrors.push({ row: 'DB Save', field: rec.title, value: rec.title, message: dbErr.message });
        }
      }
    } finally {
      if (session) session.endSession();
    }

    return finalizeReport(report);
  }
}

module.exports = NotificationImportService;
