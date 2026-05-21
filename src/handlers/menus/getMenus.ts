import type { Request, Response } from 'express'

import { getMenusService } from '@/services/menu.service'

export async function getMenusHandler(req: Request, res: Response) {
  try {
    const menus = await getMenusService(req.organizationId!)
    return res.json(menus)
  } catch (err) {
    return res.status(500).json({ message: err instanceof Error ? err.message : 'Server алдаа' })
  }
}
