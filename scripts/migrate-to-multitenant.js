import dotenv from 'dotenv'
import mongoose from 'mongoose'

import Customer from '../models/customer.js'
import Menu from '../models/Menu.js'
import Order from '../models/order.js'
import Organization from '../models/organization.js'
import User from '../models/User.js'

dotenv.config()

async function migrate() {
  try {
    // MongoDB холбогдох
    await mongoose.connect(process.env.MONGO_URL)
    console.log('✅ MongoDB холбогдлоо')

    // 1️⃣ Анхны байгууллага үүсгэх
    console.log('\n📝 Анхны байгууллага үүсгэж байна...')

    // Эхний admin хэрэглэгчийг олох
    const firstAdmin = await User.findOne({
      role: { $in: ['admin', 'employer'] }
    })

    if (!firstAdmin) {
      console.log('❌ Admin хэрэглэгч олдсонгүй. Эхлээд хэрэглэгч үүсгэнэ үү.')
      process.exit(1)
    }

    const defaultOrg = await Organization.create({
      name: 'Үндсэн салбар', // Энийг өөрчилж болно
      businessType: 'laundry',
      ownerId: firstAdmin._id,
      bonusPercentage: 0.05,
      orderPrefix: 'ORD',
      status: 'active'
    })

    console.log(`✅ Байгууллага үүсгэгдлээ: ${defaultOrg.name} (ID: ${defaultOrg._id})`)

    // 2️⃣ Бүх хэрэглэгчдэд organizations нэмэх
    console.log('\n📝 Хэрэглэгчдийг шинэчилж байна...')

    const users = await User.find()
    let updatedUsers = 0

    for (const user of users) {
      const userRole = user.role === 'admin' ? 'owner' : 'employee'

      user.organizations = [
        {
          organizationId: defaultOrg._id,
          role: userRole,
          isActive: true,
          joinedAt: user.createdAt || new Date()
        }
      ]

      user.defaultOrganization = defaultOrg._id
      await user.save()
      updatedUsers++
    }

    console.log(`✅ ${updatedUsers} хэрэглэгч шинэчлэгдлээ`)

    // 3️⃣ Бүх customer-д organizationId нэмэх
    console.log('\n📝 Үйлчлүүлэгчдийг шинэчилж байна...')

    const customerResult = await Customer.updateMany({ organizationId: { $exists: false } }, { $set: { organizationId: defaultOrg._id } })

    console.log(`✅ ${customerResult.modifiedCount} үйлчлүүлэгч шинэчлэгдлээ`)

    // 4️⃣ Бүх order-д organizationId ба orderNumber нэмэх
    console.log('\n📝 Захиалгуудыг шинэчилж байна...')

    const orders = await Order.find({ organizationId: { $exists: false } })
    let updatedOrders = 0

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i]
      order.organizationId = defaultOrg._id

      // Order number үүсгэх
      if (!order.orderNumber) {
        const orderNum = (i + 1).toString().padStart(4, '0')
        order.orderNumber = `${defaultOrg.orderPrefix}-${orderNum}`
      }

      await order.save()
      updatedOrders++
    }

    console.log(`✅ ${updatedOrders} захиалга шинэчлэгдлээ`)

    // 5️⃣ Бүх menu-д organizationId нэмэх
    console.log('\n📝 Меню-г шинэчилж байна...')

    const menuResult = await Menu.updateMany({ organizationId: { $exists: false } }, { $set: { organizationId: defaultOrg._id, isActive: true } })

    console.log(`✅ ${menuResult.modifiedCount} меню шинэчлэгдлээ`)

    // 6️⃣ Index үүсгэх
    console.log('\n📝 Index-үүдийг үүсгэж байна...')

    await Customer.createIndexes()
    await Order.createIndexes()
    await Menu.createIndexes()
    await User.createIndexes()
    await Organization.createIndexes()

    console.log('✅ Бүх index үүсгэгдлээ')

    console.log('\n🎉 Migration амжилттай дууслаа!')
    console.log(`\n📊 Дүн:
- Байгууллага: 1
- Хэрэглэгч: ${updatedUsers}
- Үйлчлүүлэгч: ${customerResult.modifiedCount}
- Захиалга: ${updatedOrders}
- Меню: ${menuResult.modifiedCount}
`)

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Migration алдаа:', error)
    process.exit(1)
  }
}

// Script ажиллуулах
migrate()
