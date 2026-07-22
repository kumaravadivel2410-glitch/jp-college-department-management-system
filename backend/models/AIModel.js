const mongoose = require('mongoose');

const aiModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  algorithm: {
    type: String,
    enum: ['linear_regression', 'logistic_regression', 'decision_tree', 'random_forest', 'knn', 'svm', 'naive_bayes'],
    required: true
  },
  targetVariable: {
    type: String,
    required: true
  },
  parameters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  metrics: {
    accuracy: { type: Number, default: 0 },
    precision: { type: Number, default: 0 },
    recall: { type: Number, default: 0 },
    f1Score: { type: Number, default: 0 },
    mse: { type: Number, default: 0 },
    r2: { type: Number, default: 0 }
  },
  featureWeights: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  trainedRecordsCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  createdBy: {
    type: String,
    default: 'System Admin'
  }
}, { timestamps: true });

module.exports = mongoose.model('AIModel', aiModelSchema);
