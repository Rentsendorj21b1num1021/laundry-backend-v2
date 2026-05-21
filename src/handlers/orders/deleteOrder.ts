import type { Request, Response } from 'express'

import { validate } from '@/middleware/validate'
import { deleteOrderSchema } from '@/validations/order.validation'

import { deleteOrderService } from '@/services/order.service'

export const deleteOrderValidation = validate(deleteOrderSchema)

export async function deleteOrderHandler(req: Request, res: Response) {
  try {
    const orderId = req.body.orderId || req.params.orderId
    await deleteOrderService(orderId, req.organizationId!)
    return res.status(200).json({ message: 'Захиалга амжилттай устгагдлаа' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server алдаа'
    return res.status(message.includes('олдсонгүй') ? 404 : 500).json({ message })
  }
}
