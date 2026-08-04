import express from 'express'

import authRoutes from './auth/authRoutes.js'
import merchantRoutes from './merchant/index.js'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/merchant', merchantRoutes)
router.use('/user', merchantRoutes)

export default router
