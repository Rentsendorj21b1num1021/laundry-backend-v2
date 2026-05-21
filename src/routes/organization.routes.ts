import { Router } from 'express'

import { auth, requireOrganization, requireOrgRole } from '@/middleware/auth.middleware'

import {
  addUserToOrganizationHandler,
  addUserToOrganizationValidation,
  createOrganizationHandler,
  createOrganizationValidation,
  getOrganizationDetailsHandler,
  getOrganizationEmployeesHandler,
  getUserOrganizationsHandler,
  removeUserFromOrganizationHandler,
  removeUserFromOrganizationValidation,
  switchOrganizationHandler,
  switchOrganizationValidation,
  updateOrganizationSettingsHandler,
  updateOrganizationSettingsValidation
} from '@/handlers/organizations'

const router = Router()

router.post('/organizations', auth, createOrganizationValidation, createOrganizationHandler)
router.get('/organizations/my', auth, getUserOrganizationsHandler)
router.post('/organizations/switch', auth, switchOrganizationValidation, switchOrganizationHandler)
router.get('/organizations/current', auth, requireOrganization, getOrganizationDetailsHandler)
router.post('/organizations/add-user', auth, requireOrganization, requireOrgRole('manager', 'owner'), addUserToOrganizationValidation, addUserToOrganizationHandler)
router.post('/organizations/remove-user', auth, requireOrganization, requireOrgRole('owner'), removeUserFromOrganizationValidation, removeUserFromOrganizationHandler)
router.put('/organizations/settings', auth, requireOrganization, requireOrgRole('manager', 'owner'), updateOrganizationSettingsValidation, updateOrganizationSettingsHandler)
router.get('/organizations/employees', auth, requireOrganization, getOrganizationEmployeesHandler)

export default router
