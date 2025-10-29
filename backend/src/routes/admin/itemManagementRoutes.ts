import { Router } from "express";
import { itemManagementController } from "../../config/container";

const router = Router();

router.post("/", itemManagementController.createItem);
router.get("/", itemManagementController.getAllItems);
router.get("/search", itemManagementController.searchItems);
router.get("/service/:serviceId", itemManagementController.getItemsByServiceId);
router.get("/:id", itemManagementController.getItemById);
router.put("/:id", itemManagementController.updateItem);
router.delete("/:id", itemManagementController.deleteItem);

export default router;
