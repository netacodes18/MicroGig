const router = require('express').Router();
const { getJobs, getJobById, createJob, updateJob, applyToJob, deleteJob } = require('../controllers/jobController');
const protect = require('../middleware/auth');

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', protect, createJob);
router.put('/:id', protect, updateJob);
router.post('/:id/apply', protect, applyToJob);
router.delete('/:id', protect, deleteJob);

module.exports = router;
