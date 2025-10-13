// src/modules/admin/admin.technicianRoutes.ts
import { admin, protect } from "../../middleware/authMiddleware";
import { Router } from "express";
import technicianManagement from "../../controllers/admin/technicianManagement";

const router = Router();

// Add this at the top of your admin.technicianRoutes.ts
router.get('/test', (req, res) => {
  console.log('✅ /api/technicians/test route hit');
  res.json({ message: 'Test route working', timestamp: new Date().toISOString() });
});

// TECHNICIAN MANAGEMENT ROUTES - Remove the duplicate '/technicians'
router.get('/', protect, admin, technicianManagement.getAllTechnicians); // Now: GET /api/technicians
router.get('/stats', protect, admin, technicianManagement.getTechnicianStats); // GET /api/technicians/stats
router.get('/:id', protect, admin, technicianManagement.getTechnicianById); // GET /api/technicians/:id
router.patch('/:id/status', protect, admin, technicianManagement.updateTechnicianStatus); // PATCH /api/technicians/:id/status

// APPLICATION MANAGEMENT ROUTES
router.get('/applications/pending', protect, admin, technicianManagement.getPendingApplications); // GET /api/technicians/applications/pending
router.get('/applications/stats', protect, admin, technicianManagement.getApplicationStats); // GET /api/technicians/applications/stats
router.get('/applications/:id', protect, admin, technicianManagement.getApplicationById); // GET /api/technicians/applications/:id
router.patch('/applications/:id/approve', protect, admin, technicianManagement.approveApplication); // PATCH /api/technicians/applications/:id/approve
router.patch('/applications/:id/reject', protect, admin, technicianManagement.rejectApplication); // PATCH /api/technicians/applications/:id/reject


export default router;