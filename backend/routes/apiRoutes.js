const express = require('express');
const router = express.Router();
const controllers = require('../controllers/apiControllers');

// Helper to mount CRUD routes
const mountCrud = (prefix, controller) => {
  router.get(`/${prefix}`, controller.getAll);
  router.post(`/${prefix}`, controller.create);
  router.put(`/${prefix}/:id`, controller.update);
  router.delete(`/${prefix}/:id`, controller.delete);
};

mountCrud('students', controllers.students);
mountCrud('faculty', controllers.faculty);
mountCrud('departments', controllers.departments);
mountCrud('subjects', controllers.subjects);
mountCrud('classes', controllers.classes);
mountCrud('attendance', controllers.attendance);
mountCrud('semester-marks', controllers.semesterMarks);
mountCrud('internal-marks', controllers.internalMarks);
mountCrud('history', controllers.history);
mountCrud('settings', controllers.settings);

// Stats route
router.get('/stats', controllers.getStats);

module.exports = router;
