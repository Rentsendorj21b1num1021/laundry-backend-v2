import { z } from 'zod'

import validationSchema from '@/src/core/validations/merchant/create.js'

import Merchant from '../../../models/organization.js'

const handler = async (req, res) => {
  try {
    const request = validationSchema.parse(req.body)

    const merchant = await Merchant.insertOne(request)

    res.json({
      success: true,
      message: 'Мерчант амжилттай үүслээ.',
      data: merchant
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.issues[0].message, errors: err.issues })
    }

    console.error('Error creating merchant:', err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

export default handler
