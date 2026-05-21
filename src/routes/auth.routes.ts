import { Router } from 'express'

import { loginHandler, loginValidation, registerHandler, registerValidation } from '@/handlers/auth'

const router = Router()

router.post('/register', registerValidation, registerHandler)
router.post('/login', loginValidation, loginHandler)

export default router
