import { z } from 'zod'

const menuItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().min(0),
  parentId: z.string().optional(),
  description: z.string().optional(),
  duration: z.number().optional(),
  isAvailable: z.boolean().default(true)
})

const menuCategorySchema = z.object({
  id: z.string(),
  category: z.string(),
  items: z.array(menuItemSchema),
  order: z.number().default(0)
})

export const createMenuSchema = z.object({
  body: z.object({
    service: z.string().min(1),
    categories: z.array(menuCategorySchema).default([]),
    isActive: z.boolean().default(true)
  })
})

export const updateMenuSchema = z.object({
  params: z.object({
    menuId: z.string()
  }),
  body: z.object({
    service: z.string().optional(),
    categories: z.array(menuCategorySchema).optional(),
    isActive: z.boolean().optional()
  })
})

export const deleteMenuSchema = z.object({
  params: z.object({
    menuId: z.string()
  })
})

export const getMenuByServiceSchema = z.object({
  params: z.object({
    service: z.string()
  })
})

export type CreateMenuInput = z.infer<typeof createMenuSchema>['body']
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>['body']
