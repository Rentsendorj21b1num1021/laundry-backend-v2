import { z } from 'zod'

const orderItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().min(0),
  quantity: z.number().int().min(1).default(1),
  parentId: z.string().optional()
})

export const createOrderSchema = z.object({
  body: z.object({
    customerId: z.string().optional(),
    items: z.array(orderItemSchema).min(1, 'Items хоосон байж болохгүй'),
    usedBonus: z.number().min(0).default(0),
    paymentMethod: z.enum(['cash', 'card', 'qpay', 'monpay', 'hipay', 'bonus']).optional(),
    notes: z.string().optional()
  })
})

export const getOrderListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z.enum(['PENDING', 'PAID', 'CANCELLED', 'REFUNDED']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional()
  })
})

export const deleteOrderSchema = z.object({
  params: z.object({
    orderId: z.string()
  })
})

export const getCustomerOrderHistorySchema = z.object({
  params: z.object({
    customerId: z.string()
  })
})

export const dateRangeSchema = z.object({
  query: z.object({
    startDate: z.string().min(1),
    endDate: z.string().min(1)
  })
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>['body']
export type GetOrderListQuery = z.infer<typeof getOrderListSchema>['query']
