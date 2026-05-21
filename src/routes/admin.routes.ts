import { Router } from 'express'

import { auth, superAdminOnly } from '@/middleware/auth.middleware'

import {
  activateOrganizationHandler,
  changeUserRoleHandler,
  changeUserRoleValidation,
  createSuperAdminHandler,
  createSuperAdminValidation,
  deactivateOrganizationHandler,
  deleteOrganizationHandler,
  getAllOrganizationsHandler,
  getAllUsersHandler,
  getOrganizationStatsHandler,
  getOrganizationsRevenueHandler,
  getSystemStatsHandler,
  toggleUserStatusHandler
} from '@/handlers/admin'

const router = Router()

// Organizations
router.get('/admin/organizations', auth, superAdminOnly, getAllOrganizationsHandler)
router.get('/admin/organizations/:orgId/stats', auth, superAdminOnly, getOrganizationStatsHandler)
router.put('/admin/organizations/:orgId/deactivate', auth, superAdminOnly, deactivateOrganizationHandler)
router.put('/admin/organizations/:orgId/activate', auth, superAdminOnly, activateOrganizationHandler)
router.delete('/admin/organizations/:orgId', auth, superAdminOnly, deleteOrganizationHandler)

// Users
router.get('/admin/users', auth, superAdminOnly, getAllUsersHandler)
router.put('/admin/users/:userId/role', auth, superAdminOnly, changeUserRoleValidation, changeUserRoleHandler)
router.put('/admin/users/:userId/toggle-status', auth, superAdminOnly, toggleUserStatusHandler)
router.post('/admin/users/super-admin', auth, superAdminOnly, createSuperAdminValidation, createSuperAdminHandler)

// Stats
router.get('/admin/stats/system', auth, superAdminOnly, getSystemStatsHandler)
router.get('/admin/stats/organizations-revenue', auth, superAdminOnly, getOrganizationsRevenueHandler)

export default router
