import { Organization, User } from '@/models/collections'
import type { CreateOrganizationInput, UpdateOrganizationSettingsInput } from '@/validations/organization.validation'

import { logger } from '@/misc/logger'

export async function createOrganizationService(input: CreateOrganizationInput & { ownerId: string }) {
  const { name, address, phone, email, bonusPercentage, orderPrefix, businessType, ownerId } = input
  logger.debug({ name, ownerId }, 'OrganizationService -> create')

  const organization = await Organization.create({
    name,
    address,
    phone,
    email,
    bonusPercentage: bonusPercentage || 0.05,
    orderPrefix: orderPrefix || 'ORD',
    businessType: businessType || 'laundry',
    ownerId
  })

  const user = await User.findById(ownerId)
  if (!user) throw new Error('Хэрэглэгч олдсонгүй')

  user.organizations.push({ organizationId: organization._id as any, role: 'owner', permissions: [], joinedAt: new Date(), isActive: true })
  if (!user.defaultOrganization) user.defaultOrganization = organization._id as any
  await user.save()

  return { organization }
}

export async function getUserOrganizationsService(userId: string) {
  const user = await User.findById(userId).populate({ path: 'organizations.organizationId', select: 'name address phone status businessType' }).populate('defaultOrganization', 'name')

  if (!user) throw new Error('Хэрэглэгч олдсонгүй')

  const activeOrgs = user.organizations.filter((org) => {
    const orgDoc = org.organizationId as any
    return org.isActive && orgDoc?.status === 'active'
  })

  return { organizations: activeOrgs, defaultOrganization: user.defaultOrganization }
}

export async function switchOrganizationService(userId: string, organizationId: string) {
  const user = await User.findById(userId)
  if (!user) throw new Error('Хэрэглэгч олдсонгүй')

  const hasAccess = user.organizations.some((org) => org.organizationId.toString() === organizationId && org.isActive)
  if (!hasAccess) throw new Error('Та энэ байгууллагад хандах эрхгүй')

  user.defaultOrganization = organizationId as any
  await user.save()

  return { organizationId }
}

export async function addUserToOrganizationService(identifier: string, role: string, organizationId: string) {
  logger.debug({ identifier, role, organizationId }, 'OrganizationService -> addUser')
  const user = await User.findOne({ $or: [{ username: identifier }, { phone: identifier }, { email: identifier }] })
  if (!user) throw new Error('Хэрэглэгч олдсонгүй')

  const alreadyAdded = user.organizations.some((org) => org.organizationId.toString() === organizationId)
  if (alreadyAdded) throw new Error('Хэрэглэгч аль хэдийн энэ байгууллагад нэмэгдсэн байна')

  user.organizations.push({ organizationId: organizationId as any, role: role as any, permissions: [], joinedAt: new Date(), isActive: true })
  if (!user.defaultOrganization) user.defaultOrganization = organizationId as any
  await user.save()

  return { user: { _id: user._id, username: user.username, organizations: user.organizations } }
}

export async function removeUserFromOrganizationService(userId: string, organizationId: string) {
  const user = await User.findById(userId)
  if (!user) throw new Error('Хэрэглэгч олдсонгүй')

  user.organizations = user.organizations.filter((org) => org.organizationId.toString() !== organizationId)
  if (user.defaultOrganization?.toString() === organizationId) {
    user.defaultOrganization = (user.organizations[0]?.organizationId as any) || undefined
  }

  await user.save()
}

export async function updateOrganizationSettingsService(organizationId: string, updates: UpdateOrganizationSettingsInput) {
  const updateData: Record<string, unknown> = { ...updates }
  delete updateData.ownerId

  const organization = await Organization.findByIdAndUpdate(organizationId, { $set: updateData }, { new: true, runValidators: true })
  if (!organization) throw new Error('Байгууллага олдсонгүй')

  return { organization }
}

export async function getOrganizationDetailsService(organizationId: string) {
  const organization = await Organization.findById(organizationId).populate('ownerId', 'username name email')
  if (!organization) throw new Error('Байгууллага олдсонгүй')
  return organization
}

export async function getOrganizationEmployeesService(organizationId: string) {
  const users = await User.find({ 'organizations.organizationId': organizationId, 'organizations.isActive': true }).select('username email phone organizations')

  const employees = users.map((user) => {
    const orgAccess = user.organizations.find((org) => org.organizationId.toString() === organizationId)
    return { _id: user._id, username: user.username, email: user.email, phone: user.phone, role: orgAccess?.role, joinedAt: orgAccess?.joinedAt, permissions: orgAccess?.permissions }
  })

  return { employees }
}
