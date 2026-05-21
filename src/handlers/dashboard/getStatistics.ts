import type { Request, Response } from 'express'

import { getStatisticsService } from '@/services/dashboard.service'

export async function getStatisticsHandler(req: Request, res: Response) {
  try {
    const { period = 'today' } = req.query as { period?: string }
    const result = await getStatisticsService(req.organizationId!, period)
    return res.json(result)
  } catch (err) {
    return res.status(500).json({ message: err instanceof Error ? err.message : 'Server алдаа' })
  }
}
