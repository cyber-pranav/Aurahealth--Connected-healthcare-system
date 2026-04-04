const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');

router.get('/patient', authMiddleware(['PATIENT', 'DOCTOR', 'CAREGIVER']), analyticsController.getPatientAnalytics);
router.get('/doctor', authMiddleware(['DOCTOR']), analyticsController.getDoctorAnalytics);

module.exports = router;
