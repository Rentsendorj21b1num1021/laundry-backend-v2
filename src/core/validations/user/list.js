import { z } from 'zod'

const validationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  filter: z
    .object({
      username: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional()
    })
    .optional()
})

export default validationSchema
