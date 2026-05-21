import type { Request, Response } from 'express'

import { getMenuByServiceService } from '@/services/menu.service'

export async function getMenuByServiceHandler(req: Request, res: Response) {
  try {
    const menu = await getMenuByServiceService(req.organizationId!, req.params.service)
    return res.json(menu)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server алдаа'
    return res.status(message.includes('олдсонгүй') ? 404 : 500).json({ message })
  }
}
