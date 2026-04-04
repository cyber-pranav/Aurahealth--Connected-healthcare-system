const express = require('express');
const router = express.Router();
const carePlanController = require('../controllers/carePlanController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware(['DOCTOR']), carePlanController.createCarePlan);
router.get('/', authMiddleware(['PATIENT', 'DOCTOR', 'CAREGIVER']), carePlanController.getCarePlans);
router.patch('/:planId/items/:itemIndex', authMiddleware(['PATIENT', 'DOCTOR', 'CAREGIVER']), carePlanController.updateCarePlanItem);
router.post('/:planId/notes', authMiddleware(['DOCTOR']), carePlanController.addDoctorNote);

module.exports = router;
