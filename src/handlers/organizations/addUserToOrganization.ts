import type { Request, Response } from 'express'

import { validate } from '@/middleware/validate'
import { addUserToOrganizationSchema } from '@/validations/organization.validation'

import { addUserToOrganizationService } from '@/services/organization.service'

export const addUserToOrganizationValidation = validate(addUserToOrganizationSchema)

export async function addUserToOrganizationHandler(req: Request, res: Response) {
  try {
    if (!['owner', 'manager'].includes(req.userOrgRole!)) {
      return res.status(403).json({ message: 'Зөвхөн owner эсвэл manager хэрэглэгч нэмэх эрхтэй' })
    }
    const { identifier, role = 'employee' } = req.body
    const result = await addUserToOrganizationService(identifier, role, req.organizationId!)
    return res.json({ message: 'Хэрэглэгч амжилттай нэмэгдлээ', ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server алдаа'
    const status = message.includes('олдсонгүй') ? 404 : message.includes('аль хэдийн') ? 400 : 500
    return res.status(status).json({ message })
  }
}
