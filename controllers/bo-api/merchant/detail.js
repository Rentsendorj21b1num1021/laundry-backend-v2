import Merchant from '../../../models/organization.js'

const handler = async (req, res) => {
  try {
    const { id } = req.body

    const merchant = await Merchant.findById(id).populate('ownerId', 'username email phone')

    if (!merchant) {
      return res.status(404).json({ success: false, message: 'Мерчант олдсонгүй.' })
    }

    res.json({
      success: true,
      data: merchant
    })
  } catch (err) {
    console.error('Error fetching merchant:', err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

export default handler
