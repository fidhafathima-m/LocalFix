import { Router } from "express";
import { protect } from "../../middleware/authMiddleware";
import multer from "multer";

export const createUserProfileRoutes = (
  userLocationController: any,
  userProfileController: any,
  addressController: any,
  reviewController: any,
) => {
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
    userProfileController.uploadProfilePicture,
  );
  router.post(
    "/change-password",
    protect,
    userProfileController.changePassword,
  );

  // addresses
  router.get("/addresses", protect, addressController.getUserAddresses);
  router.post("/addresses", protect, addressController.createAddress);
  router.put("/addresses/:addressId", protect, addressController.updateAddress);
  router.delete(
    "/addresses/:addressId",
    protect,
    addressController.deleteAddress,
  );
  router.patch(
    "/addresses/:addressId/default",
    protect,
    addressController.setDefaultAddress,
  );

  // Location routes
  router.put("/location", protect, userLocationController.updateUserLocation);
  router.get("/location", protect, userLocationController.getUserLocation);
  router.delete(
    "/location",
    protect,
    userLocationController.deleteUserLocation,
  );

  // Public route for nearby technicians
  router.get(
    "/nearby-technicians",
    userLocationController.getNearbyTechnicians,
  );

  // Review routes
  router.post("/reviews", protect, reviewController.createReview);
  router.put("/reviews/:reviewId", protect, reviewController.updateReview);
  router.delete("/reviews/:reviewId", protect, reviewController.deleteReview);
  router.get("/reviews", protect, reviewController.getUserReviews);
  router.get("/reviews/:reviewId", reviewController.getReviewById);
  router.get("/reviews/order/:orderId", reviewController.getOrderReview);
  router.get(
    "/reviews/technician/:technicianId",
    reviewController.getTechnicianReviews,
  );
  router.get(
    "/reviews/technician/:technicianId/stats",
    reviewController.getTechnicianReviewStats,
  );
  router.get(
    "/reviews/can-review/:orderId",
    protect,
    reviewController.canUserReviewOrder,
  );
  router.post(
    "/reviews/:reviewId/report",
    protect,
    reviewController.reportReview,
  );

  return router;
};

export default createUserProfileRoutes;
