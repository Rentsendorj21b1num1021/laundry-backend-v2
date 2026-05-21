import type { Request, Response } from 'express'

import { deactivateOrganizationService } from '@/services/admin.service'

export async function deactivateOrganizationHandler(req: Request, res: Response) {
  try {
    const result = await deactivateOrganizationService(req.params.orgId)
    return res.json({ message: 'Байгууллага идэвхигүй болгогдлоо', ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server алдаа'
    return res.status(message.includes('олдсонгүй') ? 404 : 500).json({ message })
  }
}
