import type { Request, Response } from 'express'

import { validate } from '@/middleware/validate'
import { type CreateOrderInput, createOrderSchema } from '@/validations/order.validation'

import { createOrderService } from '@/services/order.service'

export const createOrderValidation = validate(createOrderSchema)

export async function createOrderHandler(req: Request, res: Response) {
  try {
    const result = await createOrderService({
      ...(req.body as CreateOrderInput),
      employeeId: req.user!.id,
      organizationId: req.organizationId!,
      organization: req.organization!
    })
    return res.status(201).json({ message: 'Захиалга амжилттай бүртгэгдлээ', ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server алдаа'
    const status = message.includes('олдсонгүй') ? 404 : message.includes('хүрэлцэхгүй') || message.includes('хоосон') ? 400 : 500
    return res.status(status).json({ message })
  }
}
