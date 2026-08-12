import { z } from 'zod'

const validationSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'id буруу байна')
})

export default validationSchema
