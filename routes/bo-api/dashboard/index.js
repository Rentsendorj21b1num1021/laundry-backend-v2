import express from 'express'

import merchantsHandler from '../../../controllers/bo-api/dashboard/merchants.js'
import { auth, superAdminOnly } from '../../../middleware/authMiddleware.js'

const router = express.Router()

router.post('/merchants', auth, superAdminOnly, merchantsHandler)

export default router
