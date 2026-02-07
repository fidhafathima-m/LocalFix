"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserProfileRoutes = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const multer_1 = __importDefault(require("multer"));
const container_1 = require("../../config/container");
const createUserProfileRoutes = (userLocationController, userProfileController, addressController, reviewController) => {
    const router = (0, express_1.Router)();
    const storage = multer_1.default.memoryStorage();
    const upload = (0, multer_1.default)({
        storage: storage,
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        },
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith("image/")) {
                cb(null, true);
            }
            else {
                cb(new Error("Only image files are allowed"));
            }
        },
    });
    router.get("/profile", authMiddleware_1.protect, userProfileController.getUserProfile);
    router.put("/profile", authMiddleware_1.protect, userProfileController.updateUserProfile);
    router.post("/profile/upload-photo", authMiddleware_1.protect, upload.single("profilePicture"), userProfileController.uploadProfilePicture);
    router.post("/change-password", authMiddleware_1.protect, userProfileController.changePassword);
    // addresses
    router.get("/addresses", authMiddleware_1.protect, addressController.getUserAddresses);
    router.post("/addresses", authMiddleware_1.protect, addressController.createAddress);
    router.put("/addresses/:addressId", authMiddleware_1.protect, addressController.updateAddress);
    router.delete("/addresses/:addressId", authMiddleware_1.protect, addressController.deleteAddress);
    router.patch("/addresses/:addressId/default", authMiddleware_1.protect, addressController.setDefaultAddress);
    // Location routes
    router.put("/location", authMiddleware_1.protect, userLocationController.updateUserLocation);
    router.get("/location", authMiddleware_1.protect, userLocationController.getUserLocation);
    router.delete("/location", authMiddleware_1.protect, userLocationController.deleteUserLocation);
    // Public route for nearby technicians
    router.get("/nearby-technicians", userLocationController.getNearbyTechnicians);
    // Review routes
    router.post("/reviews", authMiddleware_1.protect, reviewController.createReview);
    router.put("/reviews/:reviewId", authMiddleware_1.protect, reviewController.updateReview);
    router.delete("/reviews/:reviewId", authMiddleware_1.protect, reviewController.deleteReview);
    router.get("/reviews", authMiddleware_1.protect, reviewController.getUserReviews);
    router.get("/reviews/:reviewId", reviewController.getReviewById);
    router.get("/reviews/order/:orderId", reviewController.getOrderReview);
    router.get("/reviews/technician/:technicianId", reviewController.getTechnicianReviews);
    router.get("/reviews/technician/:technicianId/stats", reviewController.getTechnicianReviewStats);
    router.get("/reviews/can-review/:orderId", authMiddleware_1.protect, reviewController.canUserReviewOrder);
    router.post("/reviews/:reviewId/report", authMiddleware_1.protect, reviewController.reportReview);
    router.get("/payments/transactions", authMiddleware_1.protect, userProfileController.getUserTransactions);
    router.get("/wallet/transactions", authMiddleware_1.protect, userProfileController.getWalletTransactions);
    router.get("/wallet/balance", authMiddleware_1.protect, container_1.walletController.getWalletBalance);
    router.post("/wallet/add-money/order", authMiddleware_1.protect, container_1.walletController.createAddMoneyOrder);
    router.post("/wallet/add-money/verify", authMiddleware_1.protect, container_1.walletController.verifyAddMoneyPayment);
    router.post("/wallet/withdraw", authMiddleware_1.protect, container_1.walletController.withdrawMoney);
    router.get("/wallet/transactions", authMiddleware_1.protect, container_1.walletController.getWalletTransactions);
    // Bank account routes
    router.get("/wallet/bank-accounts", authMiddleware_1.protect, container_1.walletController.getBankAccounts);
    router.post("/wallet/bank-accounts", authMiddleware_1.protect, container_1.walletController.addBankAccount);
    router.patch("/wallet/bank-accounts/:accountId/default", authMiddleware_1.protect, container_1.walletController.setDefaultBankAccount);
    router.delete("/wallet/bank-accounts/:accountId", authMiddleware_1.protect, container_1.walletController.deleteBankAccount);
    return router;
};
exports.createUserProfileRoutes = createUserProfileRoutes;
exports.default = exports.createUserProfileRoutes;
