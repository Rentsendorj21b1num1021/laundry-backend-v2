import { Customer } from '@/models/collections'
import type { CreateCustomerInput, GetAllCustomersQuery, UpdateCustomerInput } from '@/validations/customer.validation'

import { logger } from '@/misc/logger'

export async function createCustomerService(input: CreateCustomerInput & { organizationId: string; createdBy: string }) {
  const { phone, name, email, address, organizationId, createdBy } = input
  logger.debug({ organizationId, phone }, 'CustomerService -> create')

  const existing = await Customer.findOne({ organizationId, phone })
  if (existing) throw new Error('Энэ утасны дугаартай хэрэглэгч аль хэдийн бүртгэлтэй байна')

  const customer = await Customer.create({
    organizationId,
    phone,
    name: name || null,
    email: email || null,
    address: address || null,
    createdBy,
    lastVisit: new Date()
  })

  return { customer }
}

export async function getAllCustomersService(query: GetAllCustomersQuery & { organizationId: string }) {
  const { phone, name, page, limit, organizationId } = query
  logger.debug({ organizationId, page, limit }, 'CustomerService -> getAll')

  const filter: Record<string, unknown> = { organizationId }
  if (phone) filter.phone = { $regex: phone, $options: 'i' }
  if (name) filter.name = { $regex: name, $options: 'i' }

  const skip = (page - 1) * limit

  const [customers, total] = await Promise.all([Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('createdBy', 'username name'), Customer.countDocuments(filter)])

  return {
    customers,
    pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalCustomers: total, limit }
  }
}

export async function getCustomerByPhoneService(phone: string, organizationId: string) {
  const customer = await Customer.findOne({ organizationId, phone })
  if (!customer) throw new Error('Хэрэглэгч олдсонгүй')
  return { customer }
}

export async function updateCustomerService(customerId: string, organizationId: string, data: UpdateCustomerInput) {
  logger.debug({ customerId, organizationId }, 'CustomerService -> update')
  const customer = await Customer.findOneAndUpdate({ _id: customerId, organizationId }, data, { new: true })
  if (!customer) throw new Error('Хэрэглэгч олдсонгүй эсвэл хандах эрхгүй')
  return { customer }
}
