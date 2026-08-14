import express from 'express'

import { createHb } from '../../controllers/hb/create.js'

const router = express.Router()

router.post('/hb', createHb)

export default router
