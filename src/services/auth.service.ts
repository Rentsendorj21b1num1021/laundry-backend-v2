import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import { User } from '@/models/collections'
import type { LoginInput, RegisterInput } from '@/validations/auth.validation'

import { logger } from '@/misc/logger'

export async function registerService(input: RegisterInput) {
  const { username, password, phone, email } = input
  logger.debug({ username, phone }, 'AuthService -> register')

  const existingUser = await User.findOne({ $or: [{ username }, { phone }, { email }] })
  if (existingUser) throw new Error('Username, phone эсвэл email давхцаж байна')

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ username, passwordHash, phone, email })

  return { user }
}

export async function loginService(input: LoginInput) {
  const { identifier, password } = input
  logger.debug({ identifier }, 'AuthService -> login')

  const user = await User.findOne({ $or: [{ username: identifier }, { phone: identifier }, { email: identifier }] })
    .populate({ path: 'organizations.organizationId', select: 'name address status businessType' })
    .populate('defaultOrganization', 'name')

  if (!user) throw new Error('Хэрэглэгч олдсонгүй')
  if (!user.isActive) throw new Error('Хэрэглэгч идэвхигүй байна')

  const isMatch = await bcrypt.compare(password, user.passwordHash)
  if (!isMatch) throw new Error('Нууц үг буруу байна')

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '7d' })

  user.lastLoginAt = new Date()
  await user.save()

  const activeOrgs = user.organizations.filter((org) => {
    const orgDoc = org.organizationId as any
    return org.isActive && orgDoc?.status === 'active'
  })

  return {
    token,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatarUrl,
      organizations: activeOrgs,
      defaultOrganization: user.defaultOrganization
    }
  }
}
