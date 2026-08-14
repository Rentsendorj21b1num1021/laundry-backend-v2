import express from 'express'

import createHandler from '../../../controllers/bo-api/merchant/create.js'
import deleteHandler from '../../../controllers/bo-api/merchant/delete.js'
import detailHandler from '../../../controllers/bo-api/merchant/detail.js'
import listHandler from '../../../controllers/bo-api/merchant/list.js'
import updateHandler from '../../../controllers/bo-api/merchant/update.js'
import { auth, superAdminOnly } from '../../../middleware/authMiddleware.js'

const router = express.Router()

router.post('/list', auth, superAdminOnly, listHandler)
router.post('/create', auth, superAdminOnly, createHandler)
router.post('/detail', auth, superAdminOnly, detailHandler)
router.post('/update', auth, superAdminOnly, updateHandler)
router.post('/delete', auth, superAdminOnly, deleteHandler)

export default router
