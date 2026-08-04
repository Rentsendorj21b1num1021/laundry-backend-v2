import User from '../../../models/User.js'
import validationSchema from '../../../src/core/validations/user/list.js'

const handler = async (req, res) => {
  try {
    const { page, limit, filter } = validationSchema.parse(req.body)

    const query = {}
    if (filter) {
      query.$or = [{ username: { $regex: filter, $options: 'i' } }, { email: { $regex: filter, $options: 'i' } }, { phone: { $regex: filter, $options: 'i' } }]
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
        pages: Math.ceil(merchantCount / limit)
      }
    })
  } catch (err) {
    console.error('Error fetching merchants:', err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

export default handler
