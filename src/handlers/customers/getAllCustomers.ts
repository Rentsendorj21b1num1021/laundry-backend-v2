import type { Request, Response } from 'express'

import { validate } from '@/middleware/validate'
import { getAllCustomersSchema } from '@/validations/customer.validation'

import { getAllCustomersService } from '@/services/customer.service'

export const getAllCustomersValidation = validate(getAllCustomersSchema)

export async function getAllCustomersHandler(req: Request, res: Response) {
  try {
    const { page = 1, limit = 20, phone, name } = req.query as Record<string, string>
    const result = await getAllCustomersService({ page: Number(page), limit: Number(limit), phone, name, organizationId: req.organizationId! })
    return res.status(200).json({ message: 'Хэрэглэгчид амжилттай ирлээ', ...result })
  } catch (err) {
    return res.status(500).json({ message: err instanceof Error ? err.message : 'Server алдаа' })
  }
}
