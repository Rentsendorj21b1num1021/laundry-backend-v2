import mongoose from 'mongoose'

import { Customer, Order } from '@/models/collections'

import { logger } from '@/misc/logger'

const paidMatch = (organizationId: string, extra: Record<string, unknown> = {}) => ({
  organizationId: new mongoose.Types.ObjectId(organizationId),
  status: 'PAID',
  isDeleted: { $ne: true },
  ...extra
})

export async function getMonthlyIncomeService(organizationId: string) {
  logger.debug({ organizationId }, 'DashboardService -> getMonthlyIncome')
  const start = new Date()
  start.setMonth(start.getMonth() - 11)
  start.setDate(1)
  start.setHours(0, 0, 0, 0)

  const result = await Order.aggregate([
    { $match: paidMatch(organizationId, { createdAt: { $gte: start } }) },
    { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, totalIncome: { $sum: '$total_price' }, orderCount: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ])

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (11 - i))
    return { year: d.getFullYear(), month: d.getMonth() + 1, label: `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}`, total: 0, orderCount: 0 }
  })

  result.forEach((r) => {
    const index = months.findIndex((m) => m.year === r._id.year && m.month === r._id.month)
    if (index !== -1) {
      months[index].total = r.totalIncome
      months[index].orderCount = r.orderCount
    }
  })

  return months
}

export async function getLast7DaysIncomeService(organizationId: string) {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const start = new Date()
  start.setDate(start.getDate() - 6)
  start.setHours(0, 0, 0, 0)

  const result = await Order.aggregate([
    { $match: paidMatch(organizationId, { createdAt: { $gte: start, $lte: today } }) },
    { $group: { _id: { day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } }, totalIncome: { $sum: '$total_price' }, orderCount: { $sum: 1 } } },
    { $sort: { '_id.day': 1 } }
  ])

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().slice(0, 10)
    return { label: `${d.getMonth() + 1}/${d.getDate()}`, key, total: 0, orderCount: 0 }
  })

  result.forEach((r) => {
    const day = days.find((d) => d.key === r._id.day)
    if (day) {
      day.total = r.totalIncome
      day.orderCount = r.orderCount
    }
  })

  return days
}

export async function getIncomeByDateRangeService(organizationId: string, from: string, to: string) {
  const start = new Date(from)
  start.setHours(0, 0, 0, 0)
  const end = new Date(to)
  end.setHours(23, 59, 59, 999)

  const result = await Order.aggregate([
    { $match: paidMatch(organizationId, { createdAt: { $gte: start, $lte: end } }) },
    { $group: { _id: { day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } }, totalIncome: { $sum: '$total_price' }, orderCount: { $sum: 1 } } },
    { $sort: { '_id.day': 1 } }
  ])

  const days: Array<{ key: string; label: string; total: number; orderCount: number }> = []
  const cursor = new Date(start)
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10)
    days.push({ key, label: `${cursor.getMonth() + 1}/${cursor.getDate()}`, total: 0, orderCount: 0 })
    cursor.setDate(cursor.getDate() + 1)
  }

  result.forEach((r) => {
    const day = days.find((d) => d.key === r._id.day)
    if (day) {
      day.total = r.totalIncome
      day.orderCount = r.orderCount
    }
  })

  return days
}

export async function getStatisticsService(organizationId: string, period: string) {
  logger.debug({ organizationId, period }, 'DashboardService -> getStatistics')
  const startDate = new Date()
  if (period === 'today') startDate.setHours(0, 0, 0, 0)
  else if (period === 'week') startDate.setDate(startDate.getDate() - 7)
  else if (period === 'month') startDate.setMonth(startDate.getMonth() - 1)
  else if (period === 'year') startDate.setFullYear(startDate.getFullYear() - 1)

  const match = paidMatch(organizationId, { createdAt: { $gte: startDate } })

  const [totalRevenue, orderCount, customerCount, avgOrderValue] = await Promise.all([
    Order.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: '$total_price' } } }]),
    Order.countDocuments({ organizationId, status: 'PAID', createdAt: { $gte: startDate }, isDeleted: { $ne: true } }),
    Customer.countDocuments({ organizationId }),
    Order.aggregate([{ $match: match }, { $group: { _id: null, avgValue: { $avg: '$total_price' } } }])
  ])

  return {
    period,
    totalRevenue: totalRevenue[0]?.total || 0,
    orderCount,
    customerCount,
    avgOrderValue: avgOrderValue[0]?.avgValue || 0
  }
}
