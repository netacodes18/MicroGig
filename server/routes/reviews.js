const router = require('express').Router();
const { getReviews, createReview } = require('../controllers/reviewController');
const protect = require('../middleware/auth');

router.get('/', getReviews);
router.post('/', protect, createReview);

module.exports = router;
