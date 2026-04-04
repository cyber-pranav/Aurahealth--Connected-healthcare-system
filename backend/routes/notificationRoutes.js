const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware(), notificationController.getNotifications);
router.get('/unread-count', authMiddleware(), notificationController.getUnreadCount);
// read-all MUST come before /:id/read to avoid matching 'read-all' as an id
router.patch('/read-all', authMiddleware(), notificationController.markAllRead);
router.post('/read-all', authMiddleware(), notificationController.markAllRead); // Also support POST
router.patch('/:id/read', authMiddleware(), notificationController.markRead);
router.post('/generate', authMiddleware(), notificationController.generateSmartNotifications);

module.exports = router;
