import { Router } from "express";
import { deleteUser, editUser, getUsers, updateUserStatus } from "./admin.controller";

const router = Router();

router.get("/", getUsers);
router.patch("/:userId/status", updateUserStatus);
router.patch("/:userId/edit", editUser);
router.patch("/:userId/delete", deleteUser);

export default router;
