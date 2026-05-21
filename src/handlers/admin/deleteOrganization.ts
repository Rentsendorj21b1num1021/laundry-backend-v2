import type { Request, Response } from 'express'

import { deleteOrganizationService } from '@/services/admin.service'

export async function deleteOrganizationHandler(req: Request, res: Response) {
  try {
    const { confirmDelete } = req.body
    if (!confirmDelete) return res.status(400).json({ message: 'Устгахыг баталгаажуулна уу (confirmDelete: true)' })
    await deleteOrganizationService(req.params.orgId)
    return res.json({ message: 'Байгууллага болон холбогдох бүх өгөгдөл устгагдлаа' })
  } catch (err) {
    return res.status(500).json({ message: err instanceof Error ? err.message : 'Server алдаа' })
  }
}
