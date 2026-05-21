import type { Types } from 'mongoose'

import type { IOrganization } from '@/models/organization.model'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        username: string
        role: 'super_admin' | 'owner' | 'manager' | 'employee'
        organizations: Array<{
          organizationId: Types.ObjectId
          role: 'owner' | 'manager' | 'employee'
          permissions: string[]
          isActive: boolean
        }>
        defaultOrganization?: Types.ObjectId
      }
      organizationId?: string
      organization?: IOrganization
      userOrgRole?: 'owner' | 'manager' | 'employee' | 'super_admin'
    }
  }
}
