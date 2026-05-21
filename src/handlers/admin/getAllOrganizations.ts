import type { Request, Response } from 'express'

import { getAllOrganizationsService } from '@/services/admin.service'

export async function getAllOrganizationsHandler(req: Request, res: Response) {
  try {
    const { page = '1', limit = '50', search, status } = req.query as Record<string, string>
    const result = await getAllOrganizationsService({ page: Number(page), limit: Number(limit), search, status })
    return res.json(result)
  } catch (err) {
    return res.status(500).json({ message: err instanceof Error ? err.message : 'Server алдаа' })
  }
}
