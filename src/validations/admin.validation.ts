import { z } from 'zod'

export const adminPaginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    status: z.string().optional()
  })
})

export const orgIdParamSchema = z.object({
  params: z.object({
    orgId: z.string().min(1)
  })
})

export const userIdParamSchema = z.object({
  params: z.object({
    userId: z.string().min(1)
  })
})

export const changeUserRoleSchema = z.object({
  params: z.object({
    userId: z.string().min(1)
  }),
  body: z.object({
    role: z.enum(['super_admin', 'owner', 'manager', 'employee'])
  })
})

export const toggleUserStatusSchema = z.object({
  params: z.object({
    userId: z.string().min(1)
  }),
  body: z.object({
    isActive: z.boolean()
  })
})

export const createSuperAdminSchema = z.object({
  body: z.object({
    username: z.string().min(2),
    password: z.string().min(6),
    phone: z.string().min(8),
    email: z.string().email(),
    secretKey: z.string().min(1)
  })
})

export const revenueQuerySchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional()
  })
})
