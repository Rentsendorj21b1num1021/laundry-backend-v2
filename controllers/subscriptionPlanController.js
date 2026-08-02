import Order from '../models/order.js'
import Organization from '../models/organization.js'
import SubscriptionPlan from '../models/subscriptionPlan.js'

// 1. Багц үүсгэх (code давхцвал автоматаар дараагийн version-оор үүснэ)
export const createSubscriptionPlan = async (req, res) => {
  try {
    const { code, description, total, count, overagePrice = 0, currency = 'MNT' } = req.body

    if (!code || total === undefined || count === undefined) {
      return res.status(400).json({ message: 'code, total, count заавал шаардлагатай' })
    }

    const normalizedCode = code.trim().toUpperCase()

    const lastVersion = await SubscriptionPlan.findOne({ code: normalizedCode }).sort({ version: -1 })

    const plan = await SubscriptionPlan.create({
      code: normalizedCode,
      version: (lastVersion?.version || 0) + 1,
      description,
      total,
      count,
      overagePrice,
      currency
    })

    res.status(201).json({ message: 'Багц амжилттай үүсгэгдлээ', plan })
  } catch (err) {
    console.error('Create subscription plan error:', err)
    res.status(500).json({ message: err.message })
  }
}

// 2. Багцуудын жагсаалт
export const getSubscriptionPlans = async (req, res) => {
  try {
    const { code, status } = req.query

    const filter = {}
    if (code) filter.code = code.trim().toUpperCase()
    if (status) filter.status = status

    const plans = await SubscriptionPlan.find(filter).sort({ code: 1, version: -1 })

    res.json(plans)
  } catch (err) {
    console.error('Get subscription plans error:', err)
    res.status(500).json({ message: err.message })
  }
}

// 3. Багц архивлах (устгахгүй — өмнө нь холбогдсон байгууллагууд түүхэн мэдээллээрээ хамааралтай хэвээр)
export const archiveSubscriptionPlan = async (req, res) => {
  try {
    const { planId } = req.params

    const plan = await SubscriptionPlan.findByIdAndUpdate(planId, { status: 'archived' }, { new: true })

    if (!plan) {
      return res.status(404).json({ message: 'Багц олдсонгүй' })
    }

    res.json({ message: 'Багц архивлагдлаа', plan })
  } catch (err) {
    console.error('Archive subscription plan error:', err)
    res.status(500).json({ message: err.message })
  }
}

// 4. Байгууллагад багц холбох
export const assignSubscriptionPlan = async (req, res) => {
  try {
    const { organizationId } = req.params
    const { subscriptionPlanId } = req.body

    const plan = await SubscriptionPlan.findById(subscriptionPlanId)
    if (!plan) {
      return res.status(404).json({ message: 'Багц олдсонгүй' })
    }

    const organization = await Organization.findByIdAndUpdate(organizationId, { subscriptionPlanId, subscriptionStartedAt: new Date() }, { new: true }).populate('subscriptionPlanId')

    if (!organization) {
      return res.status(404).json({ message: 'Байгууллага олдсонгүй' })
    }

    res.json({ message: 'Багц амжилттай холбогдлоо', organization })
  } catch (err) {
    console.error('Assign subscription plan error:', err)
    res.status(500).json({ message: err.message })
  }
}

// 5. Тухайн байгууллагын сарын тооцоо (үндсэн хураамж + count-оос давсан захиалгын нэмэгдэл)
export const getOrganizationBill = async (req, res) => {
  try {
    const { organizationId } = req.params
    const { month } = req.query // 'YYYY-MM', өгөгдөөгүй бол энэ сар

    const organization = await Organization.findById(organizationId).populate('subscriptionPlanId')

    if (!organization) {
      return res.status(404).json({ message: 'Байгууллага олдсонгүй' })
    }

    if (!organization.subscriptionPlanId) {
      return res.status(400).json({ message: 'Энэ байгууллагад багц холбогдоогүй байна' })
    }

    const plan = organization.subscriptionPlanId

    const now = new Date()
    const [year, monthNum] = month ? month.split('-').map(Number) : [now.getFullYear(), now.getMonth() + 1]
    const periodStart = new Date(Date.UTC(year, monthNum - 1, 1))
    const periodEnd = new Date(Date.UTC(year, monthNum, 1))

    const orderCount = await Order.countDocuments({
      organizationId,
      isDeleted: { $ne: true },
      createdAt: { $gte: periodStart, $lt: periodEnd }
    })

    const overageCount = Math.max(0, orderCount - plan.count)
    const overageAmount = overageCount * plan.overagePrice
    const totalAmount = plan.total + overageAmount

    res.json({
      organizationId,
      period: `${year}-${String(monthNum).padStart(2, '0')}`,
      plan: {
        code: plan.code,
        version: plan.version,
        total: plan.total,
        count: plan.count,
        overagePrice: plan.overagePrice
      },
      orderCount,
      overageCount,
      overageAmount,
      totalAmount,
      currency: plan.currency
    })
  } catch (err) {
    console.error('Get organization bill error:', err)
    res.status(500).json({ message: err.message })
  }
}
