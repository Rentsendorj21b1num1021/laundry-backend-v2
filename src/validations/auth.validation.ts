import { z } from 'zod'

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(2),
    password: z.string().min(6),
    phone: z.string().min(8),
    email: z.string().email()
  })
})

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(1),
    password: z.string().min(1)
  })
})

export type RegisterInput = z.infer<typeof registerSchema>['body']
export type LoginInput = z.infer<typeof loginSchema>['body']
