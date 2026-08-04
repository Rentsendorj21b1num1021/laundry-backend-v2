import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import User from '../../../models/User.js'

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body

    // User олох + organizations populate хийх
    const user = await User.findOne({
      $or: [{ username: identifier }, { phone: identifier }, { email: identifier }]
    })
      .populate({
        path: 'organizations.organizationId',
        select: 'name address status businessType'
      })
      .populate('defaultOrganization', 'name')

    if (!user) {
      return res.status(400).json({ message: 'Хэрэглэгч олдсонгүй' })
    }

    // Идэвхитэй эсэхийг шалгах
    if (!user.isActive) {
      return res.status(400).json({ message: 'Хэрэглэгч идэвхигүй байна' })
    }

    if (user.role !== 'super_admin') {
      return res.status(400).json({ message: 'Нэвтрэх боломжгүй хэрэглэгч байна.' })
    }

    // Password шалгах
    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return res.status(400).json({ message: 'Нууц үг буруу байна' })
    }

    // Token үүсгэх
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Сүүлд нэвтэрсэн огноог шинэчлэх
    user.lastLoginAt = new Date()
    await user.save()

    // *** САЙЖРУУЛСАН ХАРИУ - organizations мэдээлэл оруулах ***
    res.json({
      message: 'Амжилттай нэвтэрлээ',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl
      }
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}
