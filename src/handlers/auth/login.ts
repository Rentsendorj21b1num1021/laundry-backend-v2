import type { Request, Response } from 'express'

import { validate } from '@/middleware/validate'
import { type LoginInput, loginSchema } from '@/validations/auth.validation'

import { loginService } from '@/services/auth.service'

export const loginValidation = validate(loginSchema)

export async function loginHandler(req: Request, res: Response) {
  try {
    const result = await loginService(req.body as LoginInput)
    return res.json({ message: 'Амжилттай нэвтэрлээ', ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error'
    const status = message.includes('олдсонгүй') || message.includes('буруу') || message.includes('идэвхигүй') ? 400 : 500
    return res.status(status).json({ message })
  }
}
