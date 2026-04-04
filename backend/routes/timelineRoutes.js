const express = require('express');
const router = express.Router();
const timelineController = require('../controllers/timelineController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware(['PATIENT', 'DOCTOR', 'CAREGIVER']), timelineController.getTimeline);
router.post('/', authMiddleware(['DOCTOR']), timelineController.addEvent);

module.exports = router;
