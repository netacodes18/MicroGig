const router = require('express').Router();
const { getUsers, getUserById, updateUser, getDashboard, getGuildStats, getClientStats } = require('../controllers/userController');
const protect = require('../middleware/auth');
const { cacheMiddleware } = require('../middleware/cache');

router.get('/me/dashboard', protect, cacheMiddleware(3600, 'user-dashboard'), getDashboard);
router.get('/client/stats/:clientId', cacheMiddleware(3600, 'client-stats'), getClientStats);
router.get('/guilds/stats', getGuildStats);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', protect, updateUser);

module.exports = router;
