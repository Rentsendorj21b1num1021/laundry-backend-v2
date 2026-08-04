import express from 'express'

import { getMerchants } from '../../../controllers/bo-api/merchant/list.js'
import { auth, superAdminOnly } from '../../../middleware/authMiddleware.js'

const router = express.Router()

router.post('/list', auth, superAdminOnly, getMerchants)

export default router
