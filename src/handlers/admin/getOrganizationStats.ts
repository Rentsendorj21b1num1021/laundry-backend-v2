import type { Request, Response } from 'express'

import { getOrganizationStatsService } from '@/services/admin.service'

export async function getOrganizationStatsHandler(req: Request, res: Response) {
  try {
    const result = await getOrganizationStatsService(req.params.orgId)
    return res.json(result)
  } catch (err) {
    return res.status(500).json({ message: err instanceof Error ? err.message : 'Server алдаа' })
  }
}
