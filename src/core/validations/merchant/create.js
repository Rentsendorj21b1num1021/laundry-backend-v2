import { z } from 'zod'

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/

const validationSchema = z.object({
  name: z.string().trim().min(1, 'Мерчантын нэр шаардлагатай'),
  ownerId: z.string().regex(OBJECT_ID_REGEX, 'ownerId буруу байна'),
  businessType: z.string().trim().optional(),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.email('Имэйл буруу байна').trim().optional(),
  bonusPercentage: z.number().min(0).max(1).optional(),
  currency: z.string().trim().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  orderPrefix: z.string().trim().max(3).optional(),
  subscriptionPlanId: z.string().regex(OBJECT_ID_REGEX, 'subscriptionPlanId буруу байна').optional(),
  settings: z
    .object({
      workingHours: z
        .object({
          start: z.string().optional(),
          end: z.string().optional()
        })
        .optional(),
      closedDays: z.array(z.number().min(0).max(6)).optional(),
      paymentMethods: z.array(z.enum(['cash', 'card', 'qpay', 'monpay', 'hipay'])).optional(),
      autoConfirmOrders: z.boolean().optional(),
      printReceipts: z.boolean().optional()
    })
    .optional()
})

export default validationSchema
