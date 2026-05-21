import type { Request, Response } from 'express'

import { getOrganizationsRevenueService } from '@/services/admin.service'

export async function getOrganizationsRevenueHandler(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string }
    const result = await getOrganizationsRevenueService(startDate, endDate)
    return res.json(result)
  } catch (err) {
    return res.status(500).json({ message: err instanceof Error ? err.message : 'Server алдаа' })
  }
}
