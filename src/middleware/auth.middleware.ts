import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

import { Organization } from '@/models/organization.model'
import { User } from '@/models/user.model'

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Token байхгүй байна' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: string }
    const user = await User.findById(decoded.id).select('-passwordHash')

    if (!user?.isActive) return res.status(401).json({ message: 'Хэрэглэгч олдсонгүй эсвэл идэвхигүй байна' })

    req.user = { id: String(user._id), username: user.username, role: user.role, organizations: user.organizations as any, defaultOrganization: user.defaultOrganization as any }
    next()
  } catch (err: any) {
    if (err.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Token буруу байна' })
    if (err.name === 'TokenExpiredError') return res.status(401).json({ message: 'Token-ий хугацаа дууссан байна' })
    return res.status(500).json({ message: 'Server алдаа' })
  }
}

export const requireOrganization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Нэвтэрнэ үү' })

    if (req.user.role === 'super_admin') {
      const orgId = req.headers['x-organization-id'] as string | undefined
      if (orgId) {
        const organization = await Organization.findById(orgId)
        if (!organization) return res.status(404).json({ message: 'Байгууллага олдсонгүй' })
        req.organizationId = orgId
        req.organization = organization.toObject()
        req.userOrgRole = 'super_admin'
      }
      return next()
    }

    const orgId = (req.headers['x-organization-id'] as string) || req.user.defaultOrganization?.toString()
    if (!orgId) return res.status(400).json({ message: 'Байгууллага сонгоно уу', needsOrganizationSelection: true })

    const hasAccess = req.user.organizations.some((org) => org.organizationId.toString() === orgId && org.isActive)
    if (!hasAccess) return res.status(403).json({ message: 'Та энэ байгууллагад хандах эрхгүй байна' })

    const organization = await Organization.findById(orgId)
    if (!organization || organization.status !== 'active') return res.status(403).json({ message: 'Байгууллага идэвхигүй эсвэл олдсонгүй' })

    req.organizationId = orgId
    req.organization = organization.toObject()

    const userOrgAccess = req.user.organizations.find((org) => org.organizationId.toString() === orgId)
    req.userOrgRole = userOrgAccess?.role || undefined
    next()
  } catch (_err) {
    return res.status(500).json({ message: 'Server алдаа' })
  }
}

export const requireOrgRole =
  (...allowedRoles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role === 'super_admin') return next()
    if (!req.userOrgRole) return res.status(403).json({ message: 'Та энэ байгууллагад хандах эрхгүй' })
    if (!allowedRoles.includes(req.userOrgRole)) return res.status(403).json({ message: `Энэ үйлдлийг хийхийн тулд ${allowedRoles.join(' эсвэл ')} эрх шаардлагатай` })
    next()
  }

export const superAdminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'super_admin') return res.status(403).json({ message: 'Super admin эрх шаардлагатай' })
  next()
}

export const canCreateOrganization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role === 'super_admin') return next()
    const user = await User.findById(req.user?.id)
    if (!user) return res.status(404).json({ message: 'Хэрэглэгч олдсонгүй' })
    if (!user.organizations || user.organizations.length === 0) return next()
    const hasPermission = user.organizations.some((org) => ['owner', 'manager'].includes(org.role) && org.isActive)
    if (hasPermission) return next()
    return res.status(403).json({ message: 'Байгууллага үүсгэх эрхгүй байна.' })
  } catch {
    return res.status(500).json({ message: 'Server алдаа' })
  }
}
