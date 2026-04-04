const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware(), authController.getMe);
router.post('/link-patient', authMiddleware(['CAREGIVER']), authController.linkPatient);
router.get('/linked-patients', authMiddleware(['CAREGIVER']), authController.getLinkedPatients);

module.exports = router;
