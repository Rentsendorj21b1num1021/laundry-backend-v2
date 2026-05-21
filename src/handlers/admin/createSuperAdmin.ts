import type { Request, Response } from 'express'

import { validate } from '@/middleware/validate'
import { createSuperAdminSchema } from '@/validations/admin.validation'

import { createSuperAdminService } from '@/services/admin.service'

export const createSuperAdminValidation = validate(createSuperAdminSchema)

export async function createSuperAdminHandler(req: Request, res: Response) {
  try {
    const { secretKey, ...input } = req.body
    if (secretKey !== process.env.SUPER_ADMIN_SECRET) {
      return res.status(403).json({ message: 'Зөвшөөрөлгүй' })
    }
    const result = await createSuperAdminService(input)
    return res.status(201).json({ message: 'Super admin амжилттай үүсгэгдлээ', ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server алдаа'
    return res.status(message.includes('давхцаж') ? 400 : 500).json({ message })
  }
}
