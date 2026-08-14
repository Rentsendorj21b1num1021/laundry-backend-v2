import express from 'express'

import createHandler from '../../controllers/hb/create'

const router = express.Router()

router.post('/hb', createHandler)

export default router
