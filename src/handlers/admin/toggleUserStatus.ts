import type { Request, Response } from 'express'

import { toggleUserStatusService } from '@/services/admin.service'

export async function toggleUserStatusHandler(req: Request, res: Response) {
  try {
    const user = await toggleUserStatusService(req.params.userId)
    return res.json({ message: `Хэрэглэгч ${user.isActive ? 'идэвхитэй' : 'идэвхигүй'} болгогдлоо`, user })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server алдаа'
    return res.status(message.includes('олдсонгүй') ? 404 : 500).json({ message })
  }
}
