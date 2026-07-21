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
  console.log(`[FileParser] Validating file header:`, file ? (file.originalname || file.name) : 'No file');
  if (!file) {
    throw new Error('The uploaded file is empty.');
  }

  if (typeof file.size === 'number' && file.size === 0) {
    throw new Error('The uploaded file is empty.');
  }

  if (typeof file.size === 'number' && file.size > maxSizeBytes) {
    throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds maximum limit of ${maxSizeBytes / (1024 * 1024)}MB.`);
  }

  const originalName = file.originalname || file.name || '';
  if (!originalName) {
    throw new Error('Missing required fields: File name missing.');
  }

  const ext = originalName.substring(originalName.lastIndexOf('.')).toLowerCase();
  return { originalName, ext };
};

/**
 * Auto-detects file type and parses content into an array of objects
 */
const parseSpreadsheetOrPdf = async (file, options = {}) => {
  try {
    const { originalName, ext } = validateFileHeader(file);
    const buffer = file.buffer || (file.path ? require('fs').readFileSync(file.path) : null);

    if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
      throw new Error('The uploaded file is empty.');
    }

    console.log(`[FileParser] Parsing '${originalName}' (${ext}, ${buffer.length} bytes)`);

    let rawRecords = [];

    if (['.xlsx', '.xls', '.ods'].includes(ext)) {
      rawRecords = parseExcelBuffer(buffer);
    } else if (ext === '.csv' || ext === '.txt') {
      rawRecords = await parseCsvBuffer(buffer);
    } else if (ext === '.pdf') {
      rawRecords = await parsePdfBuffer(buffer);
    } else if (options.allowDocTypes && ['.docx', '.pptx', '.zip'].includes(ext)) {
      rawRecords = [{
        title: options.title || originalName.substring(0, originalName.lastIndexOf('.')),
        fileName: originalName,
        fileType: ext.replace('.', ''),
        fileSize: `${(buffer.length / 1024).toFixed(1)} KB`,
        buffer
      }];
    } else {
      throw new Error(`Unsupported file format '${ext}'. Allowed types: .xlsx, .xls, .csv, .pdf${options.allowDocTypes ? ', .docx, .pptx, .zip' : ''}`);
    }

    if (!Array.isArray(rawRecords) || rawRecords.length === 0) {
      throw new Error('The uploaded file is empty or contains no valid data.');
    }

    // Clean and normalize keys for all rows safely
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
      throw new Error('Invalid column names or empty rows in uploaded file.');
    }

    console.log(`[FileParser] Successfully parsed ${cleanedRecords.length} valid records from '${originalName}'`);
    return cleanedRecords;

  } catch (err) {
    console.error(`[FileParser Error] Parsing failed: ${err.message}`);
    throw err;
  }
};

/**
 * Excel Parser using xlsx with strict safety checks
 */
const parseExcelBuffer = (buffer) => {
  try {
    if (!buffer || buffer.length === 0) {
      throw new Error('The uploaded file is empty.');
    }

    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });

    if (!workbook || !workbook.SheetNames || !Array.isArray(workbook.SheetNames) || workbook.SheetNames.length === 0) {
      throw new Error('No worksheets found in the uploaded Excel file.');
    }

    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      throw new Error('Worksheet name is missing.');
    }

    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      throw new Error('Worksheet could not be loaded.');
    }

    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error('No records found in the uploaded file.');
    }

    return rows;
  } catch (err) {
    console.error(`[ExcelParser Error]: ${err.message}`);
    throw err;
  }
};

/**
 * CSV Parser using csv-parser with strict safety checks
 */
const parseCsvBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    try {
      if (!buffer || buffer.length === 0) {
        return reject(new Error('The uploaded file is empty.'));
      }

      const results = [];
      const stream = Readable.from(buffer);

      stream
        .pipe(csvParser({ mapHeaders: ({ header }) => header ? header.trim() : '' }))
        .on('data', (data) => {
          if (data && typeof data === 'object' && Object.keys(data).length > 0) {
            results.push(data);
          }
        })
        .on('end', () => {
          if (!Array.isArray(results) || results.length === 0) {
            return reject(new Error('No records found in the uploaded file.'));
          }

          const firstRow = results[0];
          if (!firstRow || typeof firstRow !== 'object' || Object.keys(firstRow).length === 0) {
            return reject(new Error('Invalid column names or empty rows in CSV file.'));
          }

          resolve(results);
        })
        .on('error', (err) => {
          console.error(`[CSVParser Error]: ${err.message}`);
          reject(new Error(`CSV Parsing failed: ${err.message}`));
        });
    } catch (err) {
      console.error(`[CSVParser Exception]: ${err.message}`);
      reject(err);
    }
  });
};

/**
 * PDF Parser extracting lines and mapping key-value / tabular rows with strict safety checks
 */
const parsePdfBuffer = async (buffer) => {
  try {
    if (!buffer || buffer.length === 0) {
      throw new Error('The uploaded file is empty.');
    }

    let text = '';
    if (pdfParse) {
      const pdfData = await pdfParse(buffer);
      text = pdfData?.text || '';
    } else {
      text = buffer.toString('utf8');
    }

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (!Array.isArray(lines) || lines.length === 0) {
      throw new Error('The uploaded file is empty or contains no readable PDF text.');
    }

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

    if (headerIndex === -1 || !Array.isArray(headers) || headers.length === 0) {
      throw new Error('Invalid column names or headers in PDF table.');
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

    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('No records found in the uploaded file.');
    }

    return records;

  } catch (err) {
    console.error(`[PDFParser Error]: ${err.message}`);
    throw err;
  }
};

module.exports = {
  normalizeKey,
  validateFileHeader,
  parseSpreadsheetOrPdf,
  parseExcelBuffer,
  parseCsvBuffer,
  parsePdfBuffer
};
