import type { IOrganization } from '@/models/collections'
import { Counter, Customer, Order } from '@/models/collections'
import type { CreateOrderInput, GetOrderListQuery } from '@/validations/order.validation'

import { logger } from '@/misc/logger'

const toTwoDecimal = (value: number) => Number(value.toFixed(2))

export async function createOrderService(input: CreateOrderInput & { employeeId: string; organizationId: string; organization: IOrganization }) {
  const { customerId, items, usedBonus = 0, paymentMethod, notes, employeeId, organizationId, organization } = input

  logger.debug({ organizationId, employeeId, customerId, itemCount: items?.length }, 'OrderService -> create')
  if (!items || items.length === 0) throw new Error('Items хоосон байна')

  const itemsTotal = toTwoDecimal(items.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0))

  let customer = null
  let earnedBonus = 0
  let finalTotal = itemsTotal

  if (customerId) {
    customer = await Customer.findOne({ _id: customerId, organizationId })
    if (!customer) throw new Error('Customer олдсонгүй эсвэл хандах эрхгүй')

    if (usedBonus > 0) {
      if (usedBonus > customer.total_bonus) throw new Error('Bonus хүрэлцэхгүй байна')
      finalTotal = toTwoDecimal(finalTotal - usedBonus)
    }

    if (finalTotal < 0) finalTotal = 0

    const bonusPercentage = organization.bonusPercentage || 0.05
    earnedBonus = toTwoDecimal(finalTotal * bonusPercentage)
  }

  const prefix = organization.orderPrefix || 'ORD'
  const counter = await Counter.findOneAndUpdate({ _id: `orderNumber:${organizationId}` }, { $inc: { seq: 1 } }, { new: true, upsert: true })
  const orderNumber = `${prefix}-${counter!.seq.toString().padStart(4, '0')}`

  const order = await Order.create({
    organizationId,
    orderNumber,
    customer_id: customerId || null,
    employee_id: employeeId,
    items,
    total_price: toTwoDecimal(finalTotal),
    used_bonus: toTwoDecimal(usedBonus),
    earned_bonus: toTwoDecimal(earnedBonus),
    paymentMethod: paymentMethod || 'cash',
    notes: notes || null
  })

  if (customer) {
    customer.total_bonus = toTwoDecimal(customer.total_bonus - usedBonus + earnedBonus)
    customer.lastVisit = new Date()
    await customer.save()
  }

  await order.populate('employee_id', 'username name')

  return {
    order,
    updatedCustomer: customer,
    printReceipt: organization.settings?.printReceipts ?? false
  }
}

export async function getOrderListService(query: GetOrderListQuery & { organizationId: string }) {
  logger.debug({ organizationId: query.organizationId, page: query.page, status: query.status }, 'OrderService -> getList')
  const { page, limit, status, startDate, endDate, organizationId } = query

  const filter: Record<string, unknown> = { organizationId, isDeleted: { $ne: true } }
  if (status) filter.status = status

  if (startDate || endDate) {
    const dateFilter: Record<string, Date> = {}
    if (startDate) {
      const d = new Date(startDate)
      d.setHours(0, 0, 0, 0)
      dateFilter.$gte = d
    }
    if (endDate) {
      const d = new Date(endDate)
      d.setHours(23, 59, 59, 999)
      dateFilter.$lte = d
    }
    filter.createdAt = dateFilter
  }

  const skip = (page - 1) * limit

  const [orders, total] = await Promise.all([
    Order.find(filter).populate('customer_id', 'name phone').populate('employee_id', 'username name').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter)
  ])

  return {
    orders,
    pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalOrders: total, limit }
  }
}

export async function deleteOrderService(orderId: string, organizationId: string) {
  logger.debug({ orderId, organizationId }, 'OrderService -> delete')
  const order = await Order.findOne({ _id: orderId, organizationId })
  if (!order) throw new Error('Захиалга олдсонгүй эсвэл хандах эрхгүй')

  if (order.customer_id && (order.used_bonus > 0 || order.earned_bonus > 0)) {
    const customer = await Customer.findById(order.customer_id)
    if (customer) {
      customer.total_bonus += order.used_bonus - order.earned_bonus
      await customer.save()
    }
  }

  await Order.findByIdAndUpdate(orderId, { isDeleted: true })
}

export async function getCustomerOrderHistoryService(customerId: string, organizationId: string) {
  logger.debug({ customerId, organizationId }, 'OrderService -> getCustomerHistory')
  const customer = await Customer.findOne({ _id: customerId, organizationId })
  if (!customer) throw new Error('Customer олдсонгүй эсвэл хандах эрхгүй')

  const orders = await Order.find({ organizationId, customer_id: customerId, status: { $in: ['PAID'] }, isDeleted: { $ne: true } })
    .sort({ createdAt: -1 })
    .populate('employee_id', 'username name')
    .select('orderNumber items total_price used_bonus earned_bonus createdAt paymentMethod')

  return { customer, totalOrders: orders.length, orders }
}
