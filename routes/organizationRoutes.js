import express from "express";
import {
  createOrganization,
  getUserOrganizations,
  switchOrganization,
  addUserToOrganization,
  removeUserFromOrganization,
  updateOrganizationSettings,
  getOrganizationDetails,
  getOrganizationEmployees,
} from "../controllers/organizationController.js";
import {
  auth,
  requireOrganization,
  requireOrgRole,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// *** Organization шаардахгүй routes ***
router.post("/organizations", auth, createOrganization);
router.get("/organizations/my", auth, getUserOrganizations);
router.post("/organizations/switch", auth, switchOrganization);

// *** Organization шаардах routes ***
router.get(
  "/organizations/current",
  auth,
  requireOrganization,
  getOrganizationDetails,
);

router.post(
  "/organizations/add-user",
  auth,
  requireOrganization,
  requireOrgRole("manager", "owner"),
  addUserToOrganization,
);

router.post(
  "/organizations/remove-user",
  auth,
  requireOrganization,
  requireOrgRole("owner"),
  removeUserFromOrganization,
);

router.put(
  "/organizations/settings",
  auth,
  requireOrganization,
  requireOrgRole("manager", "owner"),
  updateOrganizationSettings,
);

router.get(
  "/organizations/employees",
  auth,
  requireOrganization,
  getOrganizationEmployees,
);

export default router;
