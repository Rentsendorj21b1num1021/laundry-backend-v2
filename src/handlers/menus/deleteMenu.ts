import type { Request, Response } from 'express'

import { deleteMenuService } from '@/services/menu.service'

export async function deleteMenuHandler(req: Request, res: Response) {
  try {
    if (req.userOrgRole !== 'owner') {
      return res.status(403).json({ message: 'Зөвхөн owner меню устгах эрхтэй' })
    }
    await deleteMenuService(req.params.menuId, req.organizationId!)
    return res.json({ message: 'Menu амжилттай устгагдлаа' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server алдаа'
    return res.status(message.includes('олдсонгүй') ? 404 : 500).json({ message })
  }
}
