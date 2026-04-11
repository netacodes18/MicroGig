const router = require('express').Router();
const { getJobs, getJobById, createJob, updateJob, applyToJob, deleteJob, hireFreelancer, submitWork, acceptWork, payFreelancer } = require('../controllers/jobController');
const protect = require('../middleware/auth');

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', protect, createJob);
router.put('/:id', protect, updateJob);
router.post('/:id/apply', protect, applyToJob);
router.post('/:id/hire', protect, hireFreelancer);
router.post('/:id/submit', protect, submitWork);
router.post('/:id/accept', protect, acceptWork);
router.post('/:id/pay', protect, payFreelancer);
router.delete('/:id', protect, deleteJob);

module.exports = router;
