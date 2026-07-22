const mongoose = require('mongoose');

const trainingLogSchema = new mongoose.Schema({
  modelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AIModel',
    required: true
  },
  modelName: {
    type: String,
    required: true
  },
  algorithm: {
    type: String,
    required: true
  },
  datasetSize: {
    type: Number,
    required: true
  },
  metrics: {
    accuracy: Number,
    precision: Number,
    recall: Number,
    f1Score: Number,
    mse: Number,
    r2: Number
  },
  status: {
    type: String,
    enum: ['Success', 'Failed', 'Running'],
    default: 'Success'
  },
  triggeredBy: {
    type: String,
    default: 'Admin'
  },
  durationMs: {
    type: Number,
    default: 0
  },
  details: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('TrainingLog', trainingLogSchema);
