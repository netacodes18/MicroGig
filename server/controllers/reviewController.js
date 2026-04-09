const Review = require('../models/Review');
const User = require('../models/User');

// GET /api/reviews?user=<id>
exports.getReviews = async (req, res, next) => {
  try {
    const { user, limit, minRating } = req.query;
    let query = {};
    if (user) query.reviewee = user;
    if (minRating) query.rating = { $gte: parseInt(minRating) };

    let reviewsQuery = Review.find(query)
      .populate('reviewer', 'name avatar')
      .populate('reviewee', 'name avatar')
      .sort({ createdAt: -1 });

    if (limit) reviewsQuery = reviewsQuery.limit(parseInt(limit));

    const reviews = await reviewsQuery;
    res.json(reviews);
  } catch (err) { next(err); }
};

// POST /api/reviews
exports.createReview = async (req, res, next) => {
  try {
    const { reviewee, rating, comment, job } = req.body;

    const review = await Review.create({
      reviewer: req.user._id, reviewee, rating, comment, job,
    });

    // Update reviewee average rating
    const allReviews = await Review.find({ reviewee });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(reviewee, { rating: Math.round(avg * 10) / 10, reviewCount: allReviews.length });

    const populated = await review.populate('reviewer', 'name avatar');
    res.status(201).json(populated);
  } catch (err) { next(err); }
};
