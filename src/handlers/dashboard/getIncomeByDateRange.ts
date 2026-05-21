import type { Request, Response } from 'express'

import { getIncomeByDateRangeService } from '@/services/dashboard.service'

export async function getIncomeByDateRangeHandler(req: Request, res: Response) {
  try {
    const { from, to } = req.query as { from: string; to: string }
    if (!from || !to) return res.status(400).json({ message: 'from болон to date шаардлагатай' })
    const result = await getIncomeByDateRangeService(req.organizationId!, from, to)
    return res.json(result)
  } catch (err) {
    return res.status(500).json({ message: err instanceof Error ? err.message : 'Server алдаа' })
  }
}
