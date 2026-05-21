import type { Request, Response } from 'express'

import { getUserOrganizationsService } from '@/services/organization.service'

export async function getUserOrganizationsHandler(req: Request, res: Response) {
  try {
    const result = await getUserOrganizationsService(req.user!.id)
    return res.json(result)
  } catch (err) {
    return res.status(500).json({ message: err instanceof Error ? err.message : 'Server алдаа' })
  }
}
