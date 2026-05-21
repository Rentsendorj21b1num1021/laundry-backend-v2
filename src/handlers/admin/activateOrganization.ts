import type { Request, Response } from 'express'

import { activateOrganizationService } from '@/services/admin.service'

export async function activateOrganizationHandler(req: Request, res: Response) {
  try {
    const result = await activateOrganizationService(req.params.orgId)
    return res.json({ message: 'Байгууллага идэвхитэй болгогдлоо', ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server алдаа'
    return res.status(message.includes('олдсонгүй') ? 404 : 500).json({ message })
  }
}
