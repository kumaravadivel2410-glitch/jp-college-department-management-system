const XLSX = require('xlsx');
const csvParser = require('csv-parser');
const { Readable } = require('stream');
let pdfParse = null;
try {
  pdfParse = require('pdf-parse');
} catch (e) {
  pdfParse = null;
}

/**
 * Normalizes header keys into clean camelCase property names
 */
const normalizeKey = (key) => {
  if (!key || typeof key !== 'string') return '';
  return key
    .trim()
    .replace(/[^a-zA-Z0-9\s_]/g, '')
    .replace(/\s+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toLowerCase());
};

/**
 * Validates basic file metadata before parsing
 */
const validateFileHeader = (file, maxSizeBytes = 25 * 1024 * 1024) => {
  if (!file) {
    throw new Error('No file uploaded. Please select a valid file.');
  }

  if (typeof file.size === 'number' && file.size > maxSizeBytes) {
    throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds maximum limit of ${maxSizeBytes / (1024 * 1024)}MB.`);
  }

  const originalName = file.originalname || file.name || '';
  if (!originalName) {
    throw new Error('File name missing or invalid.');
  }

  const ext = originalName.substring(originalName.lastIndexOf('.')).toLowerCase();
  return { originalName, ext };
};

/**
 * Auto-detects file type and parses content into an array of objects
 */
const parseSpreadsheetOrPdf = async (file, options = {}) => {
  const { originalName, ext } = validateFileHeader(file);
  const buffer = file.buffer || (file.path ? require('fs').readFileSync(file.path) : null);

  if (!buffer || buffer.length === 0) {
    throw new Error('File buffer is empty or corrupted.');
  }

  let rawRecords = [];

  if (['.xlsx', '.xls', '.ods'].includes(ext)) {
    rawRecords = parseExcelBuffer(buffer);
  } else if (ext === '.csv' || ext === '.txt') {
    rawRecords = await parseCsvBuffer(buffer);
  } else if (ext === '.pdf') {
    rawRecords = await parsePdfBuffer(buffer);
  } else if (options.allowDocTypes && ['.docx', '.pptx', '.zip'].includes(ext)) {
    // Return mock metadata record for document uploads (e.g. Subject Notes)
    rawRecords = [{
      title: options.title || originalName.substring(0, originalName.lastIndexOf('.')),
      fileName: originalName,
      fileType: ext.replace('.', ''),
      fileSize: `${(buffer.length / 1024).toFixed(1)} KB`,
      buffer
    }];
  } else {
    throw new Error(`Unsupported file extension '${ext}'. Allowed types: .xlsx, .xls, .csv, .pdf${options.allowDocTypes ? ', .docx, .pptx, .zip' : ''}`);
  }

  if (!Array.isArray(rawRecords) || rawRecords.length === 0) {
    throw new Error('File parsed successfully but contains no data rows or valid worksheet entries.');
  }

  // Clean and normalize keys for all rows
  const cleanedRecords = rawRecords.map((row) => {
    if (!row || typeof row !== 'object') return {};
    const normalized = {};
    Object.keys(row).forEach((key) => {
      const cleanKey = normalizeKey(key);
      if (cleanKey) {
        const val = row[key];
        normalized[cleanKey] = typeof val === 'string' ? val.trim() : val;
      }
    });
    return normalized;
  }).filter(row => Object.keys(row).length > 0);

  if (!Array.isArray(cleanedRecords) || cleanedRecords.length === 0) {
    throw new Error('Spreadsheet headers or columns are missing or unreadable.');
  }

  return cleanedRecords;
};

/**
 * Excel Parser using xlsx
 */
const parseExcelBuffer = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  if (!workbook || !Array.isArray(workbook.SheetNames) || workbook.SheetNames.length === 0) {
    throw new Error('Undefined worksheet. The uploaded Excel file has no valid sheets.');
  }

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Sheet '${sheetName}' is empty or unreadable.`);
  }

  const records = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  return records;
};

/**
 * CSV Parser using csv-parser
 */
const parseCsvBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer);
    stream
      .pipe(csvParser({ mapHeaders: ({ header }) => header ? header.trim() : '' }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(new Error(`CSV Parsing failed: ${err.message}`)));
  });
};

/**
 * PDF Parser extracting lines and mapping key-value / tabular rows
 */
const parsePdfBuffer = async (buffer) => {
  let text = '';
  if (pdfParse) {
    const pdfData = await pdfParse(buffer);
    text = pdfData?.text || '';
  } else {
    // Fallback simple text buffer extract
    text = buffer.toString('utf8');
  }

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error('Unable to extract tabular text from PDF file.');
  }

  // Detect header line (first non-empty line with delimiters like tab, comma, or multi-space)
  let headerIndex = -1;
  let headers = [];

  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const parts = lines[i].split(/\t|,|\s{2,}/).filter(Boolean);
    if (parts.length >= 2) {
      headerIndex = i;
      headers = parts;
      break;
    }
  }

  if (headerIndex === -1 || headers.length === 0) {
    throw new Error('Could not identify valid headers in PDF document.');
  }

  const records = [];
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const parts = lines[i].split(/\t|,|\s{2,}/).filter(Boolean);
    if (parts.length >= 1) {
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = parts[idx] || '';
      });
      records.push(row);
    }
  }

  return records;
};

module.exports = {
  normalizeKey,
  validateFileHeader,
  parseSpreadsheetOrPdf
};
