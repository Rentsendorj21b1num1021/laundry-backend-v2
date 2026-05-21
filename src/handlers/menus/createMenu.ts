import type { Request, Response } from 'express'

import { validate } from '@/middleware/validate'
import { type CreateMenuInput, createMenuSchema } from '@/validations/menu.validation'

import { createMenuService } from '@/services/menu.service'

export const createMenuValidation = validate(createMenuSchema)

export async function createMenuHandler(req: Request, res: Response) {
  try {
    const result = await createMenuService({ ...(req.body as CreateMenuInput), organizationId: req.organizationId! })
    return res.status(201).json({ message: 'Menu амжилттай үүсгэгдлээ', ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server алдаа'
    const status = message.includes('аль хэдийн') ? 400 : 500
    return res.status(status).json({ message })
  }
}
