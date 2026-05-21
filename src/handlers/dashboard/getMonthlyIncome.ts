import type { Request, Response } from 'express'

import { getMonthlyIncomeService } from '@/services/dashboard.service'

export async function getMonthlyIncomeHandler(req: Request, res: Response) {
  try {
    const result = await getMonthlyIncomeService(req.organizationId!)
    return res.json(result)
  } catch (err) {
    return res.status(500).json({ message: err instanceof Error ? err.message : 'Server алдаа' })
  }
}
