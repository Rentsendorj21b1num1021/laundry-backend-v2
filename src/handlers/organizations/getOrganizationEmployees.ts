import type { Request, Response } from 'express'

import { getOrganizationEmployeesService } from '@/services/organization.service'

export async function getOrganizationEmployeesHandler(req: Request, res: Response) {
  try {
    const result = await getOrganizationEmployeesService(req.organizationId!)
    return res.json(result)
  } catch (err) {
    return res.status(500).json({ message: err instanceof Error ? err.message : 'Server алдаа' })
  }
}
