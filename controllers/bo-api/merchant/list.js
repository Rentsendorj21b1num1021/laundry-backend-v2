import Merchant from '../../../models/organization.js'

const handler = async (req, res) => {
  try {
    const { page, limit } = req.body
    const query = {}

    const merchantCount = await Merchant.countDocuments(query)

    const merchants = await Merchant.find(query)
      .skip((page - 1) * limit)
      .limit(limit)

    res.json({
      success: true,
      data: {
        docs: merchants,
        total: merchantCount,
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
