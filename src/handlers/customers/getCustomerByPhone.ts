import type { Request, Response } from 'express'

import { validate } from '@/middleware/validate'
import { getCustomerByPhoneSchema } from '@/validations/customer.validation'

import { getCustomerByPhoneService } from '@/services/customer.service'

export const getCustomerByPhoneValidation = validate(getCustomerByPhoneSchema)

export async function getCustomerByPhoneHandler(req: Request, res: Response) {
  try {
    const { phone } = req.query as { phone: string }
    const result = await getCustomerByPhoneService(phone, req.organizationId!)
    return res.status(200).json({ message: 'Хэрэглэгчийн мэдээлэл', ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server алдаа'
    return res.status(message.includes('олдсонгүй') ? 404 : 500).json({ message })
  }
}
