import { z } from 'zod'

export const createCustomerSchema = z.object({
  body: z.object({
    phone: z.string().min(8),
    name: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional()
  })
})

export const getAllCustomersSchema = z.object({
  query: z.object({
    phone: z.string().optional(),
    name: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
  })
})

export const getCustomerByPhoneSchema = z.object({
  query: z.object({
    phone: z.string().min(1)
  })
})

export const updateCustomerSchema = z.object({
  params: z.object({
    customerId: z.string()
  }),
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
    notes: z.string().optional()
  })
})

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>['body']
export type GetAllCustomersQuery = z.infer<typeof getAllCustomersSchema>['query']
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>['body']
