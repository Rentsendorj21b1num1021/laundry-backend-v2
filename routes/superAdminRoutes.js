import express from 'express'

import { archiveSubscriptionPlan, assignSubscriptionPlan, createSubscriptionPlan, getOrganizationBill, getSubscriptionPlans } from '../controllers/subscriptionPlanController.js'
import {
  activateOrganization,
  changeUserRole,
  createSuperAdmin,
  deactivateOrganization,
  deleteOrganization,
  getAllOrganizations,
  getAllUsers,
  getOrganizationStats,
  getOrganizationsRevenue,
  getSystemStats,
  toggleUserStatus
} from '../controllers/superAdminController.js'
import { auth, superAdminOnly } from '../middleware/authMiddleware.js'

const router = express.Router()

// *** БҮХ route зөвхөн super admin (requireOrganization ШААРДАХГҮЙ) ***

// Organizations
router.get('/admin/organizations', auth, superAdminOnly, getAllOrganizations)
router.get('/admin/organizations/:organizationId/stats', auth, superAdminOnly, getOrganizationStats)
router.put('/admin/organizations/:organizationId/deactivate', auth, superAdminOnly, deactivateOrganization)
router.put('/admin/organizations/:organizationId/activate', auth, superAdminOnly, activateOrganization)
router.delete('/admin/organizations/:organizationId', auth, superAdminOnly, deleteOrganization)

// Users
router.get('/admin/users', auth, superAdminOnly, getAllUsers)
router.put('/admin/users/:userId/role', auth, superAdminOnly, changeUserRole)
router.put('/admin/users/:userId/toggle-status', auth, superAdminOnly, toggleUserStatus)
router.post('/admin/users/super-admin', auth, superAdminOnly, createSuperAdmin)

// Statistics
router.get('/admin/stats/system', auth, superAdminOnly, getSystemStats)
router.get('/admin/stats/organizations-revenue', auth, superAdminOnly, getOrganizationsRevenue)

// Subscription plans
router.post('/admin/subscription-plans', auth, superAdminOnly, createSubscriptionPlan)
router.get('/admin/subscription-plans', auth, superAdminOnly, getSubscriptionPlans)
router.patch('/admin/subscription-plans/:planId/archive', auth, superAdminOnly, archiveSubscriptionPlan)
router.put('/admin/organizations/:organizationId/subscription', auth, superAdminOnly, assignSubscriptionPlan)
router.get('/admin/organizations/:organizationId/bill', auth, superAdminOnly, getOrganizationBill)

export default router
