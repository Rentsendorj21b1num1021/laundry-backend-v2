import type { Request, Response } from 'express'

import { validate } from '@/middleware/validate'
import { removeUserFromOrganizationSchema } from '@/validations/organization.validation'

import { removeUserFromOrganizationService } from '@/services/organization.service'

export const removeUserFromOrganizationValidation = validate(removeUserFromOrganizationSchema)

export async function removeUserFromOrganizationHandler(req: Request, res: Response) {
  try {
    if (req.userOrgRole !== 'owner') {
      return res.status(403).json({ message: 'Зөвхөн owner хэрэглэгч хасах эрхтэй' })
    }
    await removeUserFromOrganizationService(req.body.userId, req.organizationId!)
    return res.json({ message: 'Хэрэглэгч амжилттай хасагдлаа' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server алдаа'
    return res.status(message.includes('олдсонгүй') ? 404 : 500).json({ message })
  }
}
