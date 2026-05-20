const router = require('express').Router();
const { register, login, getMe, logout, googleLogin } = require('../controllers/authController');
const protect = require('../middleware/auth');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validation');

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validateRequest
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').exists().withMessage('Password is required'),
  validateRequest
], login);

router.get('/logout', logout);
router.get('/me', getMe);
router.post('/google', googleLogin);

module.exports = router;
