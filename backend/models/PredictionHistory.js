const mongoose = require('mongoose');

const predictionHistorySchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  registerNo: {
    type: String,
    required: true,
    index: true
  },
  studentName: {
    type: String,
    required: true
  },
  department: {
    type: String,
    default: 'General'
  },
  year: {
    type: String,
    default: 'III Year'
  },
  semester: {
    type: String,
    default: 'Semester 5'
  },
  section: {
    type: String,
    default: 'A'
  },
  predictedGPA: {
    type: Number,
    default: 0
  },
  expectedSemesterMarks: {
    type: Number,
    default: 0
  },
  passProbability: {
    type: Number,
    default: 100
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Low'
  },
  attendanceRisk: {
    type: Boolean,
    default: false
  },
  attendancePercentage: {
    type: Number,
    default: 100
  },
  modelVersion: {
    type: String,
    default: '1.0.0'
  },
  algorithmUsed: {
    type: String,
    default: 'random_forest'
  },
  recommendedActions: [{
    type: String
  }],
  predictedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('PredictionHistory', predictionHistorySchema);
