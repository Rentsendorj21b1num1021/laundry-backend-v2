import hb from '../../models/hb'

// 1️⃣ Customer бүртгэх
export const createHb = async (req, res) => {
  try {
    const { notes, date } = req.body

    const customer = await hb.create({
      notes,
      date
    })

    res.status(200).json({
      message: 'Амжилттай.',
      customer
    })
  } catch (err) {
    console.error('Create customer error:', err)
    res.status(500).json({ message: 'Server алдаа', error: err.message })
  }
}
