import { Router } from "express";
import { deleteUser, editUser, getUsers, updateUserStatus } from "./admin.controller";
import { admin, protect } from "../../middleware/authMiddleware";

const router = Router();

// USER MANAGEMENT ROUTES
router.get("/",protect, admin, getUsers);
router.patch("/:userId/status",protect, admin, updateUserStatus);
router.patch("/:userId/edit",protect, admin, editUser);
router.patch("/:userId/delete",protect, admin, deleteUser);



export default router;
