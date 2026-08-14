import { z } from 'zod'

const validationSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'id буруу байна'),
  username: z.string().min(3).max(30).optional(),
  password: z.string().min(6).max(100).optional(),
  phone: z
    .string()
    .regex(/^\+?\d{8,15}$/)
    .optional(),
  email: z.email().optional(),
  role: z.enum(['super_admin', 'owner', 'manager', 'employee']).optional(),
  isActive: z.boolean().optional(),
  avatarUrl: z.string().url().optional()
})

export default validationSchema
