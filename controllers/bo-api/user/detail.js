import User from '../../../models/User.js'

const handler = async (req, res) => {
  try {
    const { id } = req.body

    const user = await User.findById(id)

    if (!user) {
      return res.status(404).json({ success: false, message: 'Хэрэглэгч олдсонгүй.' })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (err) {
    console.error('Error fetching user:', err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

export default handler
