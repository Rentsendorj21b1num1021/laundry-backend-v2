import type { Request, Response } from 'express'

import { validate } from '@/middleware/validate'
import { type RegisterInput, registerSchema } from '@/validations/auth.validation'

import { registerService } from '@/services/auth.service'

export const registerValidation = validate(registerSchema)

export async function registerHandler(req: Request, res: Response) {
  try {
    const result = await registerService(req.body as RegisterInput)
    return res.status(201).json({ message: 'User амжилттай бүртгэгдлээ', ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error'
    const status = message.includes('давхцаж') ? 400 : 500
    return res.status(status).json({ message })
  }
}
