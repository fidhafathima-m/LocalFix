// src/modules/admin/admin.technicianRoutes.ts
import { admin, protect } from "../../middleware/authMiddleware";
import { Router } from "express";
import { 
  approveApplication, 
  getAllTechnicians, 
  getApplicationById, 
  getApplicationStats, 
  getPendingApplications, 
  getTechnicianById, 
  getTechnicianStats, 
  rejectApplication, 
  updateTechnicianStatus 
} from "./admin.controller";

const router = Router();

// Add this at the top of your admin.technicianRoutes.ts
router.get('/test', (req, res) => {
  console.log('✅ /api/technicians/test route hit');
  res.json({ message: 'Test route working', timestamp: new Date().toISOString() });
});

// TECHNICIAN MANAGEMENT ROUTES - Remove the duplicate '/technicians'
router.get('/', protect, admin, getAllTechnicians); // Now: GET /api/technicians
router.get('/stats', protect, admin, getTechnicianStats); // GET /api/technicians/stats
router.get('/:id', protect, admin, getTechnicianById); // GET /api/technicians/:id
router.patch('/:id/status', protect, admin, updateTechnicianStatus); // PATCH /api/technicians/:id/status

// APPLICATION MANAGEMENT ROUTES
router.get('/applications/pending', protect, admin, getPendingApplications); // GET /api/technicians/applications/pending
router.get('/applications/stats', protect, admin, getApplicationStats); // GET /api/technicians/applications/stats
router.get('/applications/:id', protect, admin, getApplicationById); // GET /api/technicians/applications/:id
router.patch('/applications/:id/approve', protect, admin, approveApplication); // PATCH /api/technicians/applications/:id/approve
router.patch('/applications/:id/reject', protect, admin, rejectApplication); // PATCH /api/technicians/applications/:id/reject

export default router;