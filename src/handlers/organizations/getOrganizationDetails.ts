import type { Request, Response } from 'express'

import { getOrganizationDetailsService } from '@/services/organization.service'

export async function getOrganizationDetailsHandler(req: Request, res: Response) {
  try {
    const organization = await getOrganizationDetailsService(req.organizationId!)
    return res.json(organization)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server алдаа'
    return res.status(message.includes('олдсонгүй') ? 404 : 500).json({ message })
  }
}
