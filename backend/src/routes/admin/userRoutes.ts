import { Router } from "express";
import { deleteUser, editUser, getUsers, updateUserStatus } from "../../controllers/admin/userController";

const router = Router();

router.get("/", getUsers);
router.patch("/:userId/status", updateUserStatus);
router.patch("/:userId/edit", editUser);
router.patch("/:userId/delete", deleteUser);

export default router;
