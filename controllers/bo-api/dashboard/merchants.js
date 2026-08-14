import Customer from '../../../models/customer.js'
import Order from '../../../models/order.js'
import Organization from '../../../models/organization.js'

const ULAANBAATAR_OFFSET_MS = 8 * 60 * 60 * 1000

// Улаанбаатарын цагаар өнөөдрийн 00:00 - маргаашийн 00:00 хүртэлх хугацааг UTC-рүү хөрвүүлнэ
const getTodayRangeUtc = () => {
  const now = new Date()
  const nowUb = new Date(now.getTime() + ULAANBAATAR_OFFSET_MS)
  const startOfTodayUb = new Date(Date.UTC(nowUb.getUTCFullYear(), nowUb.getUTCMonth(), nowUb.getUTCDate()))
  const startOfToday = new Date(startOfTodayUb.getTime() - ULAANBAATAR_OFFSET_MS)
  const startOfTomorrow = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)

  return { startOfToday, startOfTomorrow }
}

const handler = async (_req, res) => {
  try {
    const { startOfToday, startOfTomorrow } = getTodayRangeUtc()

    const merchants = await Organization.find({}).select('name status businessType currency')

    const [todayStats, totalStats, customerStats] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            status: 'PAID',
            createdAt: { $gte: startOfToday, $lt: startOfTomorrow }
          }
        },
        {
          $group: {
            _id: '$organizationId',
            revenue: { $sum: '$total_price' },
            customerIds: { $addToSet: '$customer_id' }
          }
        }
      ]),
      Order.aggregate([
        { $match: { status: 'PAID' } },
        {
          $group: { _id: '$organizationId', revenue: { $sum: '$total_price' } }
        }
      ]),
      Customer.aggregate([{ $group: { _id: '$organizationId', count: { $sum: 1 } } }])
    ])

    const todayMap = new Map(todayStats.map((stat) => [String(stat._id), stat]))
    const totalMap = new Map(totalStats.map((stat) => [String(stat._id), stat]))
    const customerMap = new Map(customerStats.map((stat) => [String(stat._id), stat]))

    const data = merchants.map((merchant) => {
      const id = String(merchant._id)
      const today = todayMap.get(id)
      const total = totalMap.get(id)
      const customers = customerMap.get(id)

      return {
        merchantId: id,
        name: merchant.name,
        status: merchant.status,
        businessType: merchant.businessType,
        currency: merchant.currency,
        todayRevenue: today?.revenue ?? 0,
        todayCustomerCount: today ? today.customerIds.filter(Boolean).length : 0,
        totalRevenue: total?.revenue ?? 0,
        totalCustomerCount: customers?.count ?? 0
      }
    })

    res.json({
      success: true,
      data
    })
  } catch (err) {
    console.error('Error fetching dashboard merchant stats:', err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

export default handler
