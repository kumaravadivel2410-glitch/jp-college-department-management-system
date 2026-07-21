const reportStore = new Map();

/**
 * Creates a clean Import Report accumulator object
 */
const createImportReport = (moduleName) => {
  const importId = 'IMP-' + Date.now() + '-' + Math.round(Math.random() * 1000);
  const report = {
    importId,
    module: moduleName,
    startTime: new Date(),
    endTime: null,
    totalRecords: 0,
    inserted: 0,
    updated: 0,
    duplicates: 0,
    skipped: 0,
    failed: 0,
    validationErrors: [],
    successRecords: []
  };

  reportStore.set(importId, report);
  return report;
};

/**
 * Finalizes the report execution
 */
const finalizeReport = (report) => {
  report.endTime = new Date();
  report.durationMs = report.endTime - report.startTime;
  return report;
};

/**
 * Retrieves a cached report by import ID
 */
const getReport = (importId) => {
  return reportStore.get(importId) || null;
};

/**
 * Converts validation errors array into CSV format for download
 */
const generateErrorReportCSV = (report) => {
  const errors = report?.validationErrors || [];
  let csv = 'Row Number,Field Name,Submitted Value,Error Description\n';
  errors.forEach(e => {
    const row = e.row || 'N/A';
    const field = String(e.field || '').replace(/"/g, '""');
    const val = String(e.value || '').replace(/"/g, '""');
    const msg = String(e.message || '').replace(/"/g, '""');
    csv += `"${row}","${field}","${val}","${msg}"\n`;
  });
  return csv;
};

/**
 * Converts success records array into CSV format for download
 */
const generateSuccessReportCSV = (report) => {
  const records = report?.successRecords || [];
  if (!Array.isArray(records) || records.length === 0) {
    return 'Status,Message\nSuccess,No records were imported.\n';
  }

  const first = records[0] || {};
  const headers = Object.keys(first).filter(k => !['_id', '__v', 'createdAt', 'updatedAt'].includes(k));
  let csv = headers.join(',') + '\n';

  records.forEach(r => {
    const rowValues = headers.map(h => {
      const val = r[h] !== undefined && r[h] !== null ? String(r[h]).replace(/"/g, '""') : '';
      return `"${val}"`;
    });
    csv += rowValues.join(',') + '\n';
  });

  return csv;
};

module.exports = {
  createImportReport,
  finalizeReport,
  getReport,
  generateErrorReportCSV,
  generateSuccessReportCSV
};
