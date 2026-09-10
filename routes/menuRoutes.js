import express from 'express'

import {
  addCategory,
  addItem,
  createMenu,
  deleteCategory,
  deleteItem,
  deleteMenu,
  getMenuByService,
  getMenus,
  updateCategory,
  updateItem,
  updateMenu
} from '../controllers/menuController.js'
import { auth, requireOrganization, requireOrgRole } from '../middleware/authMiddleware.js'

const router = express.Router()

// *** БҮХ route-д auth + requireOrganization ***

router.post('/menus', auth, requireOrganization, requireOrgRole('manager', 'owner'), createMenu)
router.get('/menus', auth, requireOrganization, getMenus)
router.get('/menus/:service', auth, requireOrganization, getMenuByService)
router.put('/menus/:menuId', auth, requireOrganization, requireOrgRole('manager', 'owner'), updateMenu)
router.delete('/menus/:menuId', auth, requireOrganization, requireOrgRole('owner'), deleteMenu)

// *** Категори CRUD ***
router.post('/menus/:menuId/categories', auth, requireOrganization, requireOrgRole('manager', 'owner'), addCategory)
router.put('/menus/:menuId/categories/:categoryId', auth, requireOrganization, requireOrgRole('manager', 'owner'), updateCategory)
router.delete('/menus/:menuId/categories/:categoryId', auth, requireOrganization, requireOrgRole('manager', 'owner'), deleteCategory)

// *** Бараа CRUD ***
router.post('/menus/:menuId/categories/:categoryId/items', auth, requireOrganization, requireOrgRole('manager', 'owner'), addItem)
router.put('/menus/:menuId/items/:itemId', auth, requireOrganization, requireOrgRole('manager', 'owner'), updateItem)
router.delete('/menus/:menuId/items/:itemId', auth, requireOrganization, requireOrgRole('manager', 'owner'), deleteItem)

export default router
