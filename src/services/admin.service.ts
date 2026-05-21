import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

import { Customer, Menu, Order, Organization, User } from '@/models/collections'

import { logger } from '@/misc/logger'

export async function getAllOrganizationsService(query: { page: number; limit: number; search?: string; status?: string }) {
  const { page, limit, search, status } = query
  const filter: Record<string, unknown> = {}
  if (status) filter.status = status
  if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }, { phone: { $regex: search, $options: 'i' } }]

  const skip = (page - 1) * limit
  const [organizations, total] = await Promise.all([
    Organization.find(filter).populate('ownerId', 'username email phone').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Organization.countDocuments(filter)
  ])

  return { organizations, pagination: { currentPage: page, totalPages: Math.ceil(total / limit), total, limit } }
}

export async function deactivateOrganizationService(organizationId: string) {
  logger.debug({ organizationId }, 'AdminService -> deactivateOrganization')
  const organization = await Organization.findByIdAndUpdate(organizationId, { status: 'inactive' }, { new: true })
  if (!organization) throw new Error('Байгууллага олдсонгүй')
  return { organization }
}

export async function activateOrganizationService(organizationId: string) {
  const organization = await Organization.findByIdAndUpdate(organizationId, { status: 'active' }, { new: true })
  if (!organization) throw new Error('Байгууллага олдсонгүй')
  return { organization }
}

export async function deleteOrganizationService(organizationId: string) {
  logger.debug({ organizationId }, 'AdminService -> deleteOrganization')
  await Promise.all([Customer.deleteMany({ organizationId }), Order.deleteMany({ organizationId }), Menu.deleteMany({ organizationId }), Organization.findByIdAndDelete(organizationId)])

  await User.updateMany({ 'organizations.organizationId': organizationId }, { $pull: { organizations: { organizationId } }, $unset: { defaultOrganization: '' } })
}

export async function getOrganizationStatsService(organizationId: string) {
  const [customerCount, orderCount, totalRevenue, employeeCount] = await Promise.all([
    Customer.countDocuments({ organizationId }),
    Order.countDocuments({ organizationId, status: 'PAID', isDeleted: { $ne: true } }),
    Order.aggregate([
      { $match: { organizationId: new mongoose.Types.ObjectId(organizationId), status: 'PAID', isDeleted: { $ne: true } } },
      { $group: { _id: null, total: { $sum: '$total_price' } } }
    ]),
    User.countDocuments({ 'organizations.organizationId': organizationId })
  ])

  return { organizationId, stats: { customers: customerCount, orders: orderCount, totalRevenue: totalRevenue[0]?.total || 0, employees: employeeCount } }
}

export async function getAllUsersService(query: { page: number; limit: number; search?: string; status?: string }) {
  const { page, limit, search, status } = query
  const filter: Record<string, unknown> = {}
  if (status !== undefined) filter.isActive = status === 'true'
  if (search) filter.$or = [{ username: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }, { phone: { $regex: search, $options: 'i' } }]

  const skip = (page - 1) * limit
  const [users, total] = await Promise.all([
    User.find(filter).select('-passwordHash').populate('organizations.organizationId', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter)
  ])

  return { users, pagination: { currentPage: page, totalPages: Math.ceil(total / limit), total, limit } }
}

export async function changeUserRoleService(userId: string, role: string) {
  const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-passwordHash')
  if (!user) throw new Error('Хэрэглэгч олдсонгүй')
  return { user }
}

export async function toggleUserStatusService(userId: string) {
  const user = await User.findById(userId)
  if (!user) throw new Error('Хэрэглэгч олдсонгүй')
  user.isActive = !user.isActive
  await user.save()
  return { _id: user._id, username: user.username, isActive: user.isActive }
}

export async function createSuperAdminService(input: { username: string; password: string; phone: string; email: string }) {
  const { username, password, phone, email } = input
  logger.debug({ username }, 'AdminService -> createSuperAdmin')

  const existing = await User.findOne({ $or: [{ username }, { phone }, { email }] })
  if (existing) throw new Error('Username, phone эсвэл email давхцаж байна')

  const passwordHash = await bcrypt.hash(password, 10)
  const superAdmin = await User.create({ username, passwordHash, phone, email, role: 'super_admin', isActive: true })

  return { user: { _id: superAdmin._id, username: superAdmin.username, email: superAdmin.email, role: superAdmin.role } }
}

export async function getSystemStatsService() {
  const [totalOrganizations, activeOrganizations, totalUsers, totalCustomers, totalOrders, totalRevenue] = await Promise.all([
    Organization.countDocuments(),
    Organization.countDocuments({ status: 'active' }),
    User.countDocuments(),
    Customer.countDocuments(),
    Order.countDocuments({ status: 'PAID', isDeleted: { $ne: true } }),
    Order.aggregate([{ $match: { status: 'PAID', isDeleted: { $ne: true } } }, { $group: { _id: null, total: { $sum: '$total_price' } } }])
  ])

  return {
    system: {
      organizations: { total: totalOrganizations, active: activeOrganizations, inactive: totalOrganizations - activeOrganizations },
      users: totalUsers,
      customers: totalCustomers,
      orders: totalOrders,
      revenue: totalRevenue[0]?.total || 0
    }
  }
}

export async function getOrganizationsRevenueService(startDate?: string, endDate?: string) {
  const matchStage: Record<string, unknown> = { status: 'PAID', isDeleted: { $ne: true } }
  if (startDate || endDate) {
    const dateFilter: Record<string, Date> = {}
    if (startDate) dateFilter.$gte = new Date(startDate)
    if (endDate) dateFilter.$lte = new Date(endDate)
    matchStage.createdAt = dateFilter
  }

  return Order.aggregate([
    { $match: matchStage },
    { $group: { _id: '$organizationId', totalRevenue: { $sum: '$total_price' }, orderCount: { $sum: 1 } } },
    { $lookup: { from: 'organizations', localField: '_id', foreignField: '_id', as: 'organization' } },
    { $unwind: '$organization' },
    { $project: { organizationId: '$_id', organizationName: '$organization.name', totalRevenue: 1, orderCount: 1, _id: 0 } },
    { $sort: { totalRevenue: -1 } }
  ])
}
