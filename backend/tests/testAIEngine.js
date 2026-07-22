const connectDB = require('../config/db');
const mlEngine = require('../services/mlEngine');
const AIModel = require('../models/AIModel');
const PredictionHistory = require('../models/PredictionHistory');

const runAIEngineTest = async () => {
  console.log('\n===================================================');
  console.log('🤖 TESTING NATIVE AI & MACHINE LEARNING ERP ENGINE');
  console.log('===================================================\n');

  await connectDB();

  try {
    // 1. Train Random Forest Model
    console.log('1️⃣ Training Random Forest Academic Model...');
    const trainResult = await mlEngine.train('random_forest', 'Random Forest ERP Model', 'test.admin@jpcoe.ac.in');
    console.log(`  ✅ Model Trained Successfully in ${trainResult.durationMs}ms`);
    console.log(`  ✅ Dataset Records Processed: ${trainResult.datasetSize}`);
    console.log(`  ✅ Model Version: ${trainResult.model.version}`);
    console.log(`  ✅ Model Metrics: Accuracy: ${(trainResult.model.metrics.accuracy * 100).toFixed(1)}%`);

    // 2. Train Logistic Regression Model
    console.log('\n2️⃣ Training Logistic Regression Pass/Fail Predictor...');
    const logRegResult = await mlEngine.train('logistic_regression', 'Logistic Regression Pass Predictor', 'test.admin@jpcoe.ac.in');
    console.log(`  ✅ Model Trained Successfully in ${logRegResult.durationMs}ms`);

    // 3. Generate Student Predictions
    console.log('\n3️⃣ Generating Student Academic & Risk Predictions...');
    const predictions = await mlEngine.predictAllStudents('random_forest');
    console.log(`  ✅ Generated ${predictions.length} student predictions`);

    if (predictions.length > 0) {
      const sample = predictions[0];
      console.log(`  ✅ Sample Student: ${sample.studentName} (${sample.registerNo})`);
      console.log(`     - Pass Probability: ${sample.passProbability}%`);
      console.log(`     - Predicted GPA: ${sample.predictedGPA}`);
      console.log(`     - Expected Marks: ${sample.expectedSemesterMarks}`);
      console.log(`     - Risk Level: ${sample.riskLevel}`);
      console.log(`     - Attendance Shortage Risk: ${sample.attendanceRisk ? 'YES' : 'NO'}`);
      console.log(`     - Recommended Actions: ${sample.recommendedActions.join('; ')}`);
    }

    // 4. Verify AI Model Records in MongoDB Atlas
    console.log('\n4️⃣ Verifying AI Models & Predictions in MongoDB Atlas...');
    const activeModelCount = await AIModel.countDocuments({ isActive: true });
    const totalPredictionsCount = await PredictionHistory.countDocuments();
    console.log(`  ✅ Active Models in MongoDB: ${activeModelCount}`);
    console.log(`  ✅ Prediction Records Saved: ${totalPredictionsCount}`);

    console.log('\n===================================================');
    console.log('🎯 ALL AI & MACHINE LEARNING TESTS COMPLETED SUCCESSFULLY!');
    console.log('===================================================\n');
    process.exit(0);
  } catch (err) {
    console.error(`❌ AI Engine Test Failed: ${err.message}`);
    process.exit(1);
  }
};

runAIEngineTest();
