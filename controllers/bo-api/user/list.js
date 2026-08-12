import User from '../../../models/User.js'
import validationSchema from '../../../src/core/validations/user/list.js'

const handler = async (req, res) => {
  try {
    const { page, limit, filter } = validationSchema.parse(req.body)

    const query = {}
    if (filter?.username || filter?.email || filter?.phone) {
      query.$or = [
        filter.username ? { username: { $regex: filter.username, $options: 'i' } } : null,
        filter.email ? { email: { $regex: filter.email, $options: 'i' } } : null,
        filter.phone ? { phone: { $regex: filter.phone, $options: 'i' } } : null
      ].filter(Boolean)
    }
    if (filter?.organizationId) {
      query['organizations.organizationId'] = filter.organizationId
    }

    const userCount = await User.countDocuments(query)

    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(limit)

    res.json({
      success: true,
      data: {
        docs: users,
        total: userCount,
        limit: limit,
        page: page,
        pages: Math.ceil(userCount / limit)
      }
    })
  } catch (err) {
    console.error('Error fetching merchants:', err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

export default handler
