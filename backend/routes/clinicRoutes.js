const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinicController');
const authMiddleware = require('../middleware/auth');

router.get('/doctors', authMiddleware(['PATIENT', 'DOCTOR']), clinicController.getDoctors);

router.post('/appointments', authMiddleware(['PATIENT']), clinicController.bookAppointment);
router.get('/appointments', authMiddleware(['PATIENT', 'DOCTOR']), clinicController.getAppointments);

router.post('/consultations', authMiddleware(['DOCTOR']), clinicController.submitConsultation);

router.get('/medications/schedule', authMiddleware(['PATIENT']), clinicController.getMedicationSchedule);
router.post('/medications/log', authMiddleware(['PATIENT']), clinicController.logMedication);

module.exports = router;
