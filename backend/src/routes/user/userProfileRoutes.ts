import { Router } from "express";
import { protect } from "../../middleware/authMiddleware";
import multer from "multer";
import { userProfileController } from "../../config/container";

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

router.use(protect);

router.get("/profile", userProfileController.getUserProfile);
router.put("/profile", userProfileController.updateUserProfile);
router.post(
  "/profile/upload-photo",
  upload.single("profilePicture"),
  userProfileController.uploadProfilePicture
);

export default router;
