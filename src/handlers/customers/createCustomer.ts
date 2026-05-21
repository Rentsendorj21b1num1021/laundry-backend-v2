import type { Request, Response } from 'express'

import { validate } from '@/middleware/validate'
import { type CreateCustomerInput, createCustomerSchema } from '@/validations/customer.validation'

import { createCustomerService } from '@/services/customer.service'

export const createCustomerValidation = validate(createCustomerSchema)

export async function createCustomerHandler(req: Request, res: Response) {
  try {
    const result = await createCustomerService({ ...(req.body as CreateCustomerInput), organizationId: req.organizationId!, createdBy: req.user!.id })
    return res.status(200).json({ message: 'Хэрэглэгч амжилттай бүртгэгдлээ', ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server алдаа'
    const status = message.includes('бүртгэлтэй') ? 400 : 500
    return res.status(status).json({ message })
  }
}
