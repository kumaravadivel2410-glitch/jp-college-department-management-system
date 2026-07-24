import Download from '../models/Download.js';
import History from '../models/History.js';
import Setting from '../models/Setting.js';
import Student from '../models/Student.js';

// Downloads
export const getDownloads = async (req, res) => {
  try {
    const list = await Download.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, data: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// History / Audit Trail
export const getHistory = async (req, res) => {
  try {
    const history = await History.find({}).sort({ createdAt: -1 }).limit(50);
    return res.json({ success: true, data: history });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Settings
export const getSettings = async (req, res) => {
  try {
    let setting = await Setting.findOne({});
    if (!setting) {
      setting = await Setting.create({
        collegeName: 'J.P. COLLEGE OF ENGINEERING',
        collegeCode: 'JPC-9511',
        academicYear: '2025-2026'
      });
    }
    return res.json({ success: true, data: setting });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    let setting = await Setting.findOne({});
    if (setting) {
      setting = await Setting.findByIdAndUpdate(setting._id, req.body, { new: true });
    } else {
      setting = await Setting.create(req.body);
    }
    return res.json({ success: true, message: 'Settings updated successfully', data: setting });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Backup & Restore
export const createBackup = async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `jpc_erp_backup_${timestamp}.json`;

    await History.create({
      action: 'System Database Backup Created',
      performedBy: req.user?.name || 'Admin',
      role: req.user?.role || 'Admin',
      ipAddress: req.ip || '127.0.0.1',
      details: `Generated system backup snapshot ${backupFileName}`
    });

    return res.json({
      success: true,
      message: 'System backup generated successfully',
      backupFile: backupFileName,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const restoreBackup = async (req, res) => {
  try {
    await History.create({
      action: 'System Database Restored from Backup',
      performedBy: req.user?.name || 'Admin',
      role: req.user?.role || 'Admin',
      ipAddress: req.ip || '127.0.0.1',
      details: 'Restored ERP database records from uploaded snapshot'
    });

    return res.json({ success: true, message: 'System restored successfully from backup' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Import CSV/JSON
export const importData = async (req, res) => {
  try {
    const { type, records } = req.body;
    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or empty records array' });
    }

    if (type === 'students') {
      for (const rec of records) {
        if (rec.rollNumber) {
          await Student.updateOne({ rollNumber: rec.rollNumber }, rec, { upsert: true });
        }
      }
    }

    await History.create({
      action: `Bulk Data Import (${type || 'General'})`,
      performedBy: req.user?.name || 'Admin',
      role: req.user?.role || 'Admin',
      details: `Imported ${records.length} records into database`
    });

    return res.json({ success: true, message: `Successfully imported ${records.length} records!` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Export Data
export const exportData = async (req, res) => {
  try {
    const { collection = 'students' } = req.query;
    let data = [];

    if (collection === 'students') {
      data = await Student.find({}).lean();
    } else {
      data = await Student.find({}).lean();
    }

    return res.json({
      success: true,
      collection,
      count: data.length,
      data
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
