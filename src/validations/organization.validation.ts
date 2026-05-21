import { z } from 'zod'

export const createOrganizationSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    bonusPercentage: z.number().min(0).max(1).optional(),
    orderPrefix: z.string().max(3).optional(),
    businessType: z.string().optional()
  })
})

export const switchOrganizationSchema = z.object({
  body: z.object({
    organizationId: z.string().min(1)
  })
})

export const addUserToOrganizationSchema = z.object({
  body: z.object({
    identifier: z.string().min(1),
    role: z.enum(['manager', 'employee']).default('employee')
  })
})

export const removeUserFromOrganizationSchema = z.object({
  body: z.object({
    userId: z.string().min(1)
  })
})

export const updateOrganizationSettingsSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    bonusPercentage: z.number().min(0).max(1).optional(),
    orderPrefix: z.string().max(3).optional(),
    businessType: z.string().optional(),
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
})

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>['body']
export type UpdateOrganizationSettingsInput = z.infer<typeof updateOrganizationSettingsSchema>['body']
