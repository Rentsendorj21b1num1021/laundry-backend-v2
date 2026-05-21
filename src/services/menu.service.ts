import { Menu } from '@/models/collections'
import type { CreateMenuInput, UpdateMenuInput } from '@/validations/menu.validation'

import { logger } from '@/misc/logger'

export async function createMenuService(input: CreateMenuInput & { organizationId: string }) {
  logger.debug({ organizationId: input.organizationId, service: input.service }, 'MenuService -> create')
  const menu = await Menu.create({ ...input })
  return { menu }
}

export async function getMenusService(organizationId: string) {
  logger.debug({ organizationId }, 'MenuService -> getAll')
  const menus = await Menu.find({ organizationId, isActive: true })
  return menus
}

export async function getMenuByServiceService(organizationId: string, service: string) {
  const menu = await Menu.findOne({ organizationId, service, isActive: true })
  if (!menu) throw new Error('Menu олдсонгүй')
  return menu
}

export async function updateMenuService(menuId: string, organizationId: string, data: UpdateMenuInput) {
  logger.debug({ menuId, organizationId }, 'MenuService -> update')
  const menu = await Menu.findOneAndUpdate({ _id: menuId, organizationId }, data, { new: true, runValidators: true })
  if (!menu) throw new Error('Menu олдсонгүй эсвэл хандах эрхгүй')
  return { menu }
}

export async function deleteMenuService(menuId: string, organizationId: string) {
  logger.debug({ menuId, organizationId }, 'MenuService -> delete')
  const menu = await Menu.findOneAndDelete({ _id: menuId, organizationId })
  if (!menu) throw new Error('Menu олдсонгүй эсвэл хандах эрхгүй')
}
