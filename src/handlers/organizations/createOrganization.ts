import type { Request, Response } from 'express'

import { validate } from '@/middleware/validate'
import { type CreateOrganizationInput, createOrganizationSchema } from '@/validations/organization.validation'

import { createOrganizationService } from '@/services/organization.service'

export const createOrganizationValidation = validate(createOrganizationSchema)

export async function createOrganizationHandler(req: Request, res: Response) {
  try {
    const result = await createOrganizationService({ ...(req.body as CreateOrganizationInput), ownerId: req.user!.id })
    return res.status(201).json({ message: 'Байгууллага амжилттай үүсгэгдлээ', ...result })
  } catch (err) {
    return res.status(500).json({ message: err instanceof Error ? err.message : 'Server алдаа' })
  }
}
