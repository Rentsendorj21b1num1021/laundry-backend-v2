import type { Request, Response } from 'express'

import { validate } from '@/middleware/validate'
import { changeUserRoleSchema } from '@/validations/admin.validation'

import { changeUserRoleService } from '@/services/admin.service'

export const changeUserRoleValidation = validate(changeUserRoleSchema)

export async function changeUserRoleHandler(req: Request, res: Response) {
  try {
    const result = await changeUserRoleService(req.params.userId, req.body.role)
    return res.json({ message: 'Роль амжилттай өөрчлөгдлөө', ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server алдаа'
    return res.status(message.includes('олдсонгүй') ? 404 : 500).json({ message })
  }
}
