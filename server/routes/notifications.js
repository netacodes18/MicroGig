const router = require('express').Router();
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const protect = require('../middleware/auth');

router.use(protect); // All notification routes require authentication

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

module.exports = router;
