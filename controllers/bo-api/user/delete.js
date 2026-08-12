import { z } from 'zod'

import User from '../../../models/User.js'
import validationSchema from '../../../src/core/validations/user/delete.js'

const handler = async (req, res) => {
  try {
    const { id } = validationSchema.parse(req.body)

    const user = await User.findByIdAndDelete(id)

    if (!user) {
      return res.status(404).json({ success: false, message: 'Хэрэглэгч олдсонгүй.' })
    }

    res.json({
      success: true,
      message: 'Хэрэглэгч амжилттай устгагдлаа.'
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.issues[0].message, errors: err.issues })
    }

    console.error('Error deleting user:', err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

export default handler
