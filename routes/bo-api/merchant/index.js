import express from 'express'

import createHandler from '../../../controllers/bo-api/merchant/create.js'
import listHandler from '../../../controllers/bo-api/merchant/list.js'
import { auth, superAdminOnly } from '../../../middleware/authMiddleware.js'

const router = express.Router()

router.post('/list', auth, superAdminOnly, listHandler)
router.post('/create', auth, superAdminOnly, createHandler)

export default router
