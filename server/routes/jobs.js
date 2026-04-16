const router = require('express').Router();
const { getJobs, getJobById, createJob, updateJob, applyToJob, deleteJob, hireFreelancer, submitWork, acceptWork, payFreelancer, generateJobData } = require('../controllers/jobController');
const protect = require('../middleware/auth');

const { upload } = require('../config/cloudinary');

router.get('/', getJobs);
router.post('/generate', protect, generateJobData);
router.get('/:id', getJobById);
router.post('/', protect, createJob);
router.put('/:id', protect, updateJob);
router.post('/:id/apply', protect, (req, res, next) => {
  upload.single('attachment')(req, res, (err) => {
    if (err) {
      console.error('[MULTER/CLOUDINARY ERROR]:', err.message);
      return res.status(400).json({ message: 'File upload failed: ' + err.message });
    }
    next();
  });
}, applyToJob);
router.post('/:id/hire', protect, hireFreelancer);
router.post('/:id/submit', protect, submitWork);
router.post('/:id/accept', protect, acceptWork);
router.post('/:id/pay', protect, payFreelancer);
router.delete('/:id', protect, deleteJob);

module.exports = router;
