import { z } from 'zod'

import User from '../../../models/User.js'
import validationSchema from '../../../src/core/validations/user/create.js'

const handler = async (req, res) => {
  try {
    const request = validationSchema.parse(req.body)

    const user = await User.insertOne(request)

    res.json({
      success: true,
      message: 'Хэрэглэгч амжилттай үүслээ.',
      data: user
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.issues[0].message, errors: err.issues })
    }

    console.error('Error creating user:', err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

export default handler
