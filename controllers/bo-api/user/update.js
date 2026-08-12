import bcrypt from 'bcryptjs'
import { z } from 'zod'

import User from '../../../models/User.js'
import validationSchema from '../../../src/core/validations/user/update.js'

const handler = async (req, res) => {
  try {
    const { id, password, ...request } = validationSchema.parse(req.body)

    const update = { ...request }
    if (password) {
      update.passwordHash = await bcrypt.hash(password, 10)
    }

    const user = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true })

    if (!user) {
      return res.status(404).json({ success: false, message: 'Хэрэглэгч олдсонгүй.' })
    }

    res.json({
      success: true,
      message: 'Хэрэглэгч амжилттай шинэчлэгдлээ.',
      data: user
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.issues[0].message, errors: err.issues })
    }

    console.error('Error updating user:', err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

export default handler
