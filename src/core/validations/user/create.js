import { z } from 'zod'

const validationSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(6).max(100),
  phone: z.string().regex(/^\+?\d{10,15}$/),
  email: z.string().email(),
  role: z.enum(['super_admin', 'owner', 'manager', 'employee']).optional(),
  organizations: z
    .array(
      z.object({
        organizationId: z.string().regex(/^[0-9a-fA-F]{24}$/),
        role: z.enum(['owner', 'manager', 'employee']).optional(),
        permissions: z.array(z.string()).optional(),
        joinedAt: z.date().optional(),
        isActive: z.boolean().optional()
      })
    )
    .optional(),
  defaultOrganization: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  avatarUrl: z.string().url().optional()
})

export default validationSchema
