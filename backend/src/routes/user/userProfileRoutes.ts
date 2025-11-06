import { Router } from "express";
import { protect } from "../../middleware/authMiddleware";
import multer from "multer";
import {
  userLocationController,
  userProfileController,
  addressController,
  reviewController,
} from "../../config/container";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

router.get("/profile", protect, userProfileController.getUserProfile);
router.put("/profile", protect, userProfileController.updateUserProfile);
router.post(
  "/profile/upload-photo",
  protect,
  upload.single("profilePicture"),
  userProfileController.uploadProfilePicture
);
router.post("/change-password", protect, userProfileController.changePassword);

// addresses
router.get("/addresses", protect, addressController.getUserAddresses);
router.post("/addresses", protect, addressController.createAddress);
router.put("/addresses/:addressId", protect, addressController.updateAddress);
router.delete(
  "/addresses/:addressId",
  protect,
  addressController.deleteAddress
);
router.patch(
  "/addresses/:addressId/default",
  protect,
  addressController.setDefaultAddress
);

// Location routes
router.put("/location", protect, (req, res) =>
  userLocationController.updateUserLocation(req, res)
);
router.get("/location", protect, (req, res) =>
  userLocationController.getUserLocation(req, res)
);
router.delete("/location", protect, (req, res) =>
  userLocationController.deleteUserLocation(req, res)
);

// Public route for nearby technicians
router.get("/nearby-technicians", (req, res) =>
  userLocationController.getNearbyTechnicians(req, res)
);

router.post("/reviews", protect, (req, res) =>
  reviewController.createReview(req, res)
);
router.put("/reviews/:reviewId", protect, (req, res) =>
  reviewController.updateReview(req, res)
);
router.delete("/reviews/:reviewId", protect, (req, res) =>
  reviewController.deleteReview(req, res)
);
router.get("/reviews", protect, (req, res) =>
  reviewController.getUserReviews(req, res)
);
router.get("/reviews/:reviewId", (req, res) =>
  reviewController.getReviewById(req, res)
);
router.get("/reviews/order/:orderId", (req, res) =>
  reviewController.getOrderReview(req, res)
);
router.get("/reviews/technician/:technicianId", (req, res) =>
  reviewController.getTechnicianReviews(req, res)
);
router.get("/reviews/technician/:technicianId/stats", (req, res) =>
  reviewController.getTechnicianReviewStats(req, res)
);
router.get("/reviews/can-review/:orderId", protect, (req, res) =>
  reviewController.canUserReviewOrder(req, res)
);

export default router;
