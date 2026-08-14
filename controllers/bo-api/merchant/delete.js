import { z } from 'zod'

import Merchant from '../../../models/organization.js'
import validationSchema from '../../../src/core/validations/merchant/delete.js'

const handler = async (req, res) => {
  try {
    const { id } = validationSchema.parse(req.body)

    const merchant = await Merchant.findByIdAndDelete(id)

    if (!merchant) {
      return res.status(404).json({ success: false, message: 'Мерчант олдсонгүй.' })
    }

    res.json({
      success: true,
      message: 'Мерчант амжилттай устгагдлаа.'
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.issues[0].message, errors: err.issues })
    }

    console.error('Error deleting merchant:', err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

export default handler
