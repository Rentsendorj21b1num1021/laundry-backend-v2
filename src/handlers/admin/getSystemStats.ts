import type { Request, Response } from 'express'

import { getSystemStatsService } from '@/services/admin.service'

export async function getSystemStatsHandler(_req: Request, res: Response) {
  try {
    const result = await getSystemStatsService()
    return res.json(result)
  } catch (err) {
    return res.status(500).json({ message: err instanceof Error ? err.message : 'Server алдаа' })
  }
}
