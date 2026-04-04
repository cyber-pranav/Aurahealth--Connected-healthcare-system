const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinicController');
const authMiddleware = require('../middleware/auth');

router.get('/doctors', authMiddleware(['PATIENT', 'DOCTOR', 'CAREGIVER']), clinicController.getDoctors);

router.post('/appointments', authMiddleware(['PATIENT']), clinicController.bookAppointment);
router.get('/appointments', authMiddleware(['PATIENT', 'DOCTOR', 'CAREGIVER']), clinicController.getAppointments);
router.patch('/appointments/:id/status', authMiddleware(['DOCTOR', 'PATIENT']), clinicController.updateAppointmentStatus);

router.post('/consultations', authMiddleware(['DOCTOR']), clinicController.submitConsultation);

router.get('/medications/schedule', authMiddleware(['PATIENT', 'CAREGIVER']), clinicController.getMedicationSchedule);
router.post('/medications/log', authMiddleware(['PATIENT']), clinicController.logMedication);

router.get('/messages/:roomId', authMiddleware(['PATIENT', 'DOCTOR']), clinicController.getChatHistory);

router.get('/medical-records', authMiddleware(['PATIENT', 'DOCTOR']), clinicController.getMedicalRecords);

module.exports = router;
