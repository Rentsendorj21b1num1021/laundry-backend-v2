import type { Request, Response } from 'express'

import { validate } from '@/middleware/validate'
import { type UpdateCustomerInput, updateCustomerSchema } from '@/validations/customer.validation'

import { updateCustomerService } from '@/services/customer.service'

export const updateCustomerValidation = validate(updateCustomerSchema)

export async function updateCustomerHandler(req: Request, res: Response) {
  try {
    const { customerId } = req.params
    const result = await updateCustomerService(customerId, req.organizationId!, req.body as UpdateCustomerInput)
    return res.json({ message: 'Хэрэглэгчийн мэдээлэл шинэчлэгдлээ', ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server алдаа'
    return res.status(message.includes('олдсонгүй') ? 404 : 500).json({ message })
  }
}
