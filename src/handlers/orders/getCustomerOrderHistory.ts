import type { Request, Response } from 'express'

import { validate } from '@/middleware/validate'
import { getCustomerOrderHistorySchema } from '@/validations/order.validation'

import { getCustomerOrderHistoryService } from '@/services/order.service'

export const getCustomerOrderHistoryValidation = validate(getCustomerOrderHistorySchema)

export async function getCustomerOrderHistoryHandler(req: Request, res: Response) {
  try {
    const result = await getCustomerOrderHistoryService(req.params.customerId, req.organizationId!)
    return res.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server алдаа'
    return res.status(message.includes('олдсонгүй') ? 404 : 500).json({ message })
  }
}
