import express from 'express';
import multer from 'multer';
import {
  startApplication,
  saveStep,
  getApplication,
  submitApplication,
  getApplicationStatus,
  getUserApplications
} from './technician.controller';
import { TechnicianApplication } from './schemas/TechnicianApplicationSchema';
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
router.post('/start', startApplication);
router.post('/save-step', protect, uploadFields, saveStep);
router.get('/:applicationId', protect, getApplication);
router.post('/submit', protect, submitApplication);
router.get('/status/:email', getApplicationStatus);
router.get('/user/applications', protect, getUserApplications);


export default router;