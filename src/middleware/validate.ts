import type { NextFunction, Request, Response } from 'express'
import { type ZodTypeAny, z } from 'zod'

export const validate = (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse({ body: req.body, query: req.query, params: req.params })
  if (!result.success) {
    return res.status(400).json({ message: 'Validation error', errors: result.error.flatten() })
  }
  next()
}

export const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
  })
})
