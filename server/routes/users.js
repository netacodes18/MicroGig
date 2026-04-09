const router = require('express').Router();
const { getUsers, getUserById, updateUser, getDashboard } = require('../controllers/userController');
const protect = require('../middleware/auth');

router.get('/me/dashboard', protect, getDashboard);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', protect, updateUser);

module.exports = router;
