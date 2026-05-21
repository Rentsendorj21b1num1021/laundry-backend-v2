import type { Request, Response } from 'express'

import { validate } from '@/middleware/validate'
import { type UpdateMenuInput, updateMenuSchema } from '@/validations/menu.validation'

import { updateMenuService } from '@/services/menu.service'

export const updateMenuValidation = validate(updateMenuSchema)

export async function updateMenuHandler(req: Request, res: Response) {
  try {
    if (!['owner', 'manager'].includes(req.userOrgRole!)) {
      return res.status(403).json({ message: 'Зөвхөн owner/manager меню засах эрхтэй' })
    }
    const result = await updateMenuService(req.params.menuId, req.organizationId!, req.body as UpdateMenuInput)
    return res.json({ message: 'Menu амжилттай шинэчлэгдлээ', ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server алдаа'
    return res.status(message.includes('олдсонгүй') ? 404 : 500).json({ message })
  }
}
