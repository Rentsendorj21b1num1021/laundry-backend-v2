import express from 'express'

import listRoutes from './list.js'

const router = express.Router()

router.use(listRoutes)

export default router
