
import { reviewManagementController } from "../../config/container";
import { Router } from "express";

const router = Router();

router.get("/", reviewManagementController.getAllReviews);
router.delete("/:id", reviewManagementController.deleteReview);
router.get("/stats", reviewManagementController.getReviewStats);
router.patch("/:id/status", reviewManagementController.updateReviewStatus);
router.patch("/:id/flag", reviewManagementController.flagReview);
export default router;
