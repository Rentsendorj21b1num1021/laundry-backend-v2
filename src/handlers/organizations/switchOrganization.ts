import type { Request, Response } from 'express'

import { validate } from '@/middleware/validate'
import { switchOrganizationSchema } from '@/validations/organization.validation'

import { switchOrganizationService } from '@/services/organization.service'

export const switchOrganizationValidation = validate(switchOrganizationSchema)

export async function switchOrganizationHandler(req: Request, res: Response) {
  try {
    const result = await switchOrganizationService(req.user!.id, req.body.organizationId)
    return res.json({ message: 'Байгууллага амжилттай солигдлоо', ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server алдаа'
    return res.status(message.includes('эрхгүй') ? 403 : 500).json({ message })
  }
}
