import { Router } from 'express'

import { auth, requireOrganization } from '@/middleware/auth.middleware'

import { createMenuHandler, createMenuValidation, deleteMenuHandler, getMenuByServiceHandler, getMenusHandler, updateMenuHandler, updateMenuValidation } from '@/handlers/menus'

const router = Router()

router.post('/menus', auth, requireOrganization, createMenuValidation, createMenuHandler)
router.get('/menus', auth, requireOrganization, getMenusHandler)
router.get('/menus/:service', auth, requireOrganization, getMenuByServiceHandler)
router.put('/menus/:menuId', auth, requireOrganization, updateMenuValidation, updateMenuHandler)
router.delete('/menus/:menuId', auth, requireOrganization, deleteMenuHandler)

export default router
