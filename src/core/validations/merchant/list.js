import { z } from 'zod'

const validationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  filter: z.object({}).optional()
})

export default validationSchema
