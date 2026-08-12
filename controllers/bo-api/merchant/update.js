import { z } from 'zod'

import Merchant from '../../../models/organization.js'
import validationSchema from '../../../src/core/validations/merchant/update.js'

const handler = async (req, res) => {
  try {
    const { id, ...request } = validationSchema.parse(req.body)

    const merchant = await Merchant.findByIdAndUpdate(id, request, { new: true, runValidators: true })

    if (!merchant) {
      return res.status(404).json({ success: false, message: 'Мерчант олдсонгүй.' })
    }

    res.json({
      success: true,
      message: 'Мерчант амжилттай шинэчлэгдлээ.',
      data: merchant
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.issues[0].message, errors: err.issues })
    }

    console.error('Error updating merchant:', err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

export default handler
