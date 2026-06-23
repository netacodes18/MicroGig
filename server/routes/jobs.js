const router = require('express').Router();
const { getJobs, getJobById, createJob, updateJob, applyToJob, deleteJob, hireFreelancer, submitWork, acceptWork, approveWork, requestRevisions, postWorkspaceMessage, generateJobData, rejectApplicant } = require('../controllers/jobController');
const protect = require('../middleware/auth');

const { upload } = require('../config/cloudinary');

const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validation');

router.get('/', getJobs);
router.post('/generate', protect, generateJobData);
router.get('/:id', getJobById);
router.post('/', protect, [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('budget.min').isNumeric().withMessage('Minimum budget must be a number'),
  body('budget.max').isNumeric().withMessage('Maximum budget must be a number'),
  body('duration').trim().notEmpty().withMessage('Duration is required'),
  body('skills').isArray().withMessage('Skills must be an array'),
  validateRequest
], createJob);
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
router.post('/:id/submit', protect, submitWork);
router.post('/:id/accept', protect, acceptWork);
router.post('/:id/approve', protect, approveWork);
router.post('/:id/revision', protect, requestRevisions);
router.post('/:id/reject', protect, rejectApplicant);
router.post('/:id/hire', protect, hireFreelancer);
router.post('/:id/workspace/message', protect, (req, res, next) => {
  upload.single('attachment')(req, res, (err) => {
    if (err) {
      console.error('[MULTER/CLOUDINARY ERROR]:', err.message);
      return res.status(400).json({ message: 'File upload failed: ' + err.message });
    }
    next();
  });
}, postWorkspaceMessage);
router.delete('/:id', protect, deleteJob);

module.exports = router;
