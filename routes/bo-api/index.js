import express from 'express'

import authRoutes from './auth/authRoutes.js'
import merchantRoutes from './merchant/index.js'
import userRoutes from './user/index.js'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/merchant', merchantRoutes)
router.use('/user', userRoutes)

export default router
