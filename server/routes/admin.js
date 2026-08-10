const router = require('express').Router();
const protect = require('../middleware/auth');
const {
  getAnalytics,
  getUsers,
  updateUserStatus,
  promoteUserRole,
  getDisputes,
  getDisputeById,
  reviewDispute,
  resolveDispute
} = require('../controllers/adminController');

const { cacheMiddleware } = require('../middleware/cache');

// All routes here require authentication and admin privileges
router.use(protect, protect.isAdmin);

router.get('/analytics', cacheMiddleware(3600, 'analytics'), getAnalytics);
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', promoteUserRole);

router.get('/disputes', getDisputes);
router.get('/disputes/:id', getDisputeById);
router.put('/disputes/:id/review', reviewDispute);
router.put('/disputes/:id/resolve', resolveDispute);

module.exports = router;
