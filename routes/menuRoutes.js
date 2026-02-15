import express from "express";
import {
  createMenu,
  getMenus,
  getMenuByService,
  updateMenu,
  deleteMenu,
} from "../controllers/menuController.js";
import {
  auth,
  requireOrganization,
  requireOrgRole,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// *** БҮХ route-д auth + requireOrganization ***

router.post(
  "/menus",
  auth,
  requireOrganization,
  requireOrgRole("manager", "owner"),
  createMenu,
);
router.get("/menus", auth, requireOrganization, getMenus);
router.get("/menus/:service", auth, requireOrganization, getMenuByService);
router.put(
  "/menus/:menuId",
  auth,
  requireOrganization,
  requireOrgRole("manager", "owner"),
  updateMenu,
);
router.delete(
  "/menus/:menuId",
  auth,
  requireOrganization,
  requireOrgRole("owner"),
  deleteMenu,
);

export default router;
