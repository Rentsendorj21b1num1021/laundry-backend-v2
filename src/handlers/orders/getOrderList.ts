import type { Request, Response } from 'express'

import { validate } from '@/middleware/validate'
import { getOrderListSchema } from '@/validations/order.validation'

import { getOrderListService } from '@/services/order.service'

export const getOrderListValidation = validate(getOrderListSchema)

export async function getOrderListHandler(req: Request, res: Response) {
  try {
    const { page = '1', limit = '20', status, startDate, endDate } = req.query as Record<string, string>
    const result = await getOrderListService({ page: Number(page), limit: Number(limit), status: status as any, startDate, endDate, organizationId: req.organizationId! })
    return res.status(200).json(result)
  } catch (err) {
    return res.status(500).json({ message: err instanceof Error ? err.message : 'Server алдаа' })
  }
}
