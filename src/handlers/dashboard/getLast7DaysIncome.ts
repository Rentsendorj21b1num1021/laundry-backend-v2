import type { Request, Response } from 'express'

import { getLast7DaysIncomeService } from '@/services/dashboard.service'

export async function getLast7DaysIncomeHandler(req: Request, res: Response) {
  try {
    const result = await getLast7DaysIncomeService(req.organizationId!)
    return res.json(result)
  } catch (err) {
    return res.status(500).json({ message: err instanceof Error ? err.message : 'Server алдаа' })
  }
}
