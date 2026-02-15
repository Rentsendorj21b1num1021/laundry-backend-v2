import express from "express";
import {
  getAllOrganizations,
  deactivateOrganization,
  activateOrganization,
  deleteOrganization,
  getOrganizationStats,
  getAllUsers,
  changeUserRole,
  toggleUserStatus,
  createSuperAdmin,
  getSystemStats,
  getOrganizationsRevenue,
} from "../controllers/superAdminController.js";
import { auth, superAdminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// *** БҮХ route зөвхөн super admin (requireOrganization ШААРДАХГҮЙ) ***

// Organizations
router.get("/admin/organizations", auth, superAdminOnly, getAllOrganizations);
router.get(
  "/admin/organizations/:organizationId/stats",
  auth,
  superAdminOnly,
  getOrganizationStats,
);
router.put(
  "/admin/organizations/:organizationId/deactivate",
  auth,
  superAdminOnly,
  deactivateOrganization,
);
router.put(
  "/admin/organizations/:organizationId/activate",
  auth,
  superAdminOnly,
  activateOrganization,
);
router.delete(
  "/admin/organizations/:organizationId",
  auth,
  superAdminOnly,
  deleteOrganization,
);

// Users
router.get("/admin/users", auth, superAdminOnly, getAllUsers);
router.put("/admin/users/:userId/role", auth, superAdminOnly, changeUserRole);
router.put(
  "/admin/users/:userId/toggle-status",
  auth,
  superAdminOnly,
  toggleUserStatus,
);
router.post("/admin/users/super-admin", auth, superAdminOnly, createSuperAdmin);

// Statistics
router.get("/admin/stats/system", auth, superAdminOnly, getSystemStats);
router.get(
  "/admin/stats/organizations-revenue",
  auth,
  superAdminOnly,
  getOrganizationsRevenue,
);

export default router;
