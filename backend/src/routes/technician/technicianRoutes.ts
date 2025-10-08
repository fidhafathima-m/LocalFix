import express from 'express';
import multer from 'multer';
import  TechnicianApplicationController from '../../controllers/technician/technicianApplication';
import { protect } from '../../middleware/authMiddleware';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed'));
    }
  }
});

// Define fields for file uploads
const uploadFields = upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'idProof', maxCount: 1 },
  { name: 'addressProof', maxCount: 1 },
  { name: 'certifications', maxCount: 1 },
  { name: 'policeVerification', maxCount: 1 },
  { name: 'tradeLicense', maxCount: 1 },
  { name: 'passportPhoto', maxCount: 1 }
]);

// Application routes
router.post('/start', TechnicianApplicationController.startApplication);
router.post('/save-step', protect, uploadFields, TechnicianApplicationController.saveStep);
router.get('/:applicationId', protect, TechnicianApplicationController.getApplication);
router.post('/submit', protect, TechnicianApplicationController.submitApplication);
router.get('/status/:email', TechnicianApplicationController.getApplicationStatus);
router.get('/user/applications', protect, TechnicianApplicationController.getUserApplications);


export default router;