import type { Request, Response } from 'express'

import { validate } from '@/middleware/validate'
import { type UpdateOrganizationSettingsInput, updateOrganizationSettingsSchema } from '@/validations/organization.validation'

import { updateOrganizationSettingsService } from '@/services/organization.service'

export const updateOrganizationSettingsValidation = validate(updateOrganizationSettingsSchema)

export async function updateOrganizationSettingsHandler(req: Request, res: Response) {
  try {
    if (!['owner', 'manager'].includes(req.userOrgRole!)) {
      return res.status(403).json({ message: 'Зөвхөн owner/manager тохиргоо өөрчлөх эрхтэй' })
    }
    const result = await updateOrganizationSettingsService(req.organizationId!, req.body as UpdateOrganizationSettingsInput)
    return res.json({ message: 'Тохиргоо амжилттай шинэчлэгдлээ', ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server алдаа'
    return res.status(message.includes('олдсонгүй') ? 404 : 500).json({ message })
  }
}
