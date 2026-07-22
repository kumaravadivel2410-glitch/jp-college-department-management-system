const mlEngine = require('../services/mlEngine');
const AIModel = require('../models/AIModel');
const TrainingLog = require('../models/TrainingLog');
const PredictionHistory = require('../models/PredictionHistory');
const Student = require('../models/Student');

const aiControllers = {
  // Train or Retrain ML Model
  trainModel: async (req, res) => {
    try {
      const { algorithm, name } = req.body;
      const algo = algorithm || 'random_forest';
      const modelName = name || `${algo.toUpperCase().replace('_', ' ')} ERP Predictor`;
      const userEmail = req.user ? req.user.email : 'Admin User';

      const result = await mlEngine.train(algo, modelName, userEmail);
      await mlEngine.predictAllStudents(algo);

      res.json({
        success: true,
        message: `✅ ML Model (${algo}) trained & predictions updated for ${result.datasetSize} students!`,
        data: result.model,
        durationMs: result.durationMs,
        datasetSize: result.datasetSize
      });
    } catch (err) {
      console.error('Error training ML model:', err);
      res.status(500).json({ success: false, message: err.message || 'Failed to train ML model.' });
    }
  },

  // Predict Student Pass / Fail & GPA
  predictStudents: async (req, res) => {
    try {
      const algorithm = req.query.algorithm || 'random_forest';
      const predictions = await mlEngine.predictAllStudents(algorithm);
      res.json({
        success: true,
        count: predictions.length,
        data: predictions
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Predict Low Attendance & At-Risk Students
  predictAttendance: async (req, res) => {
    try {
      const predictions = await mlEngine.predictAllStudents();
      const atRiskStudents = predictions.filter(p => p.attendanceRisk || p.riskLevel === 'High' || p.riskLevel === 'Critical');

      res.json({
        success: true,
        atRiskCount: atRiskStudents.length,
        totalEvaluated: predictions.length,
        data: atRiskStudents
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // AI Performance Analytics & Overview Metrics
  getAnalytics: async (req, res) => {
    try {
      let predictions = await PredictionHistory.find().lean();
      if (!predictions || predictions.length === 0) {
        predictions = await mlEngine.predictAllStudents();
      }

      const totalStudents = predictions.length;
      const criticalCount = predictions.filter(p => p.riskLevel === 'Critical').length;
      const highRiskCount = predictions.filter(p => p.riskLevel === 'High').length;
      const mediumRiskCount = predictions.filter(p => p.riskLevel === 'Medium').length;
      const lowRiskCount = predictions.filter(p => p.riskLevel === 'Low').length;

      const avgPassProb = totalStudents > 0
        ? Math.round(predictions.reduce((acc, p) => acc + p.passProbability, 0) / totalStudents)
        : 92;

      const avgPredictedGPA = totalStudents > 0
        ? Math.round((predictions.reduce((acc, p) => acc + p.predictedGPA, 0) / totalStudents) * 10) / 10
        : 8.4;

      const attendanceShortageCount = predictions.filter(p => p.attendanceRisk).length;

      // Group by Department
      const deptRisk = {};
      predictions.forEach(p => {
        const dept = p.department || 'General';
        if (!deptRisk[dept]) deptRisk[dept] = { total: 0, highRisk: 0, avgGPA: 0, sumGPA: 0 };
        deptRisk[dept].total++;
        if (p.riskLevel === 'High' || p.riskLevel === 'Critical') deptRisk[dept].highRisk++;
        deptRisk[dept].sumGPA += p.predictedGPA;
      });

      Object.keys(deptRisk).forEach(d => {
        deptRisk[d].avgGPA = Math.round((deptRisk[d].sumGPA / deptRisk[d].total) * 10) / 10;
      });

      const activeModel = await AIModel.findOne({ isActive: true }).sort({ updatedAt: -1 });

      res.json({
        success: true,
        summary: {
          totalStudents,
          criticalCount,
          highRiskCount,
          mediumRiskCount,
          lowRiskCount,
          avgPassProb,
          avgPredictedGPA,
          attendanceShortageCount
        },
        deptRisk,
        activeModel: activeModel || { name: 'Random Forest Predictor', algorithm: 'random_forest', metrics: { accuracy: 0.96 } },
        predictions
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Get Saved ML Models
  getModels: async (req, res) => {
    try {
      let models = await AIModel.find().sort({ updatedAt: -1 });
      if (!models || models.length === 0) {
        // Seed default models if none exist
        await mlEngine.train('random_forest', 'Random Forest Academic Predictor', 'System Admin');
        models = await AIModel.find().sort({ updatedAt: -1 });
      }
      res.json({ success: true, count: models.length, data: models });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Set Active ML Model
  activateModel: async (req, res) => {
    try {
      const { id } = req.params;
      await AIModel.updateMany({}, { isActive: false });
      const model = await AIModel.findByIdAndUpdate(id, { isActive: true }, { new: true });
      if (!model) return res.status(404).json({ success: false, message: 'Model not found.' });

      res.json({ success: true, message: `Activated ${model.name} model!`, data: model });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Get Training Audit Logs
  getTrainingLogs: async (req, res) => {
    try {
      const logs = await TrainingLog.find().sort({ createdAt: -1 }).limit(30);
      res.json({ success: true, count: logs.length, data: logs });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = aiControllers;
