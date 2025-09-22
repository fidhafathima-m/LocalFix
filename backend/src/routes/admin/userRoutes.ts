import { Router } from "express";
import { getUsers } from "../../controllers/admin/userController";

const router = Router();

router.get("/", getUsers);

export default router;
