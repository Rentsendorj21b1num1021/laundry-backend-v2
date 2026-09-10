import { randomUUID } from 'node:crypto'

import Menu from '../models/Menu.js'

// Menu үүсгэх
export async function createMenu(req, res) {
  try {
    const organizationId = req.organizationId
    const menuData = { ...req.body, organizationId }

    const menu = new Menu(menuData)
    await menu.save()

    res.status(201).json({
      message: 'Menu амжилттай үүсгэгдлээ',
      menu
    })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: 'Энэ service-ийн меню аль хэдийн байна'
      })
    }
    console.error('Create menu error:', err)
    res.status(500).json({ error: err.message })
  }
}

// Бүх menu-г авах
export async function getMenus(req, res) {
  try {
    const organizationId = req.organizationId
    const includeInactive = req.query.includeInactive === 'true'

    // *** Зөвхөн тухайн газрын меню ***
    const filter = { organizationId }
    if (!includeInactive) {
      filter.isActive = true
    }

    const menus = await Menu.find(filter).sort({ createdAt: 1 })

    res.json(menus)
  } catch (err) {
    console.error('Get menus error:', err)
    res.status(500).json({ error: err.message })
  }
}

// Service нэрээр menu авах
export async function getMenuByService(req, res) {
  try {
    const organizationId = req.organizationId
    const { service } = req.params

    // *** Зөвхөн тухайн газрын меню ***
    const menu = await Menu.findOne({
      organizationId,
      service,
      isActive: true
    })

    if (!menu) {
      return res.status(404).json({ message: 'Menu олдсонгүй' })
    }

    res.json(menu)
  } catch (err) {
    console.error('Get menu by service error:', err)
    res.status(500).json({ error: err.message })
  }
}

// Menu шинэчлэх
export async function updateMenu(req, res) {
  try {
    const organizationId = req.organizationId
    const { menuId } = req.params

    // Зөвхөн owner/manager
    if (!['owner', 'manager'].includes(req.userOrgRole)) {
      return res.status(403).json({
        message: 'Зөвхөн owner/manager меню засах эрхтэй'
      })
    }

    // *** Зөвхөн эдгээр талбарыг л шинэчлэхийг зөвшөөрнө (organizationId зэргийг client-с бичихээс сэргийлнэ) ***
    const allowedFields = ['service', 'categories', 'isActive']
    const updates = {}
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Шинэчлэх мэдээлэл алга' })
    }

    const menu = await Menu.findOneAndUpdate({ _id: menuId, organizationId }, updates, { new: true, runValidators: true })

    if (!menu) {
      return res.status(404).json({
        message: 'Menu олдсонгүй эсвэл хандах эрхгүй'
      })
    }

    res.json({
      message: 'Menu амжилттай шинэчлэгдлээ',
      menu
    })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: 'Энэ service-ийн меню аль хэдийн байна'
      })
    }
    console.error('Update menu error:', err)
    res.status(500).json({ error: err.message })
  }
}

// Категори нэмэх
export async function addCategory(req, res) {
  try {
    const organizationId = req.organizationId
    const { menuId } = req.params
    const { category, order } = req.body

    if (!category?.trim()) {
      return res.status(400).json({ message: 'Категорийн нэр оруулна уу' })
    }

    const menu = await Menu.findOne({ _id: menuId, organizationId })
    if (!menu) {
      return res.status(404).json({ message: 'Menu олдсонгүй эсвэл хандах эрхгүй' })
    }

    const newCategory = {
      id: randomUUID(),
      category: category.trim(),
      items: [],
      order: typeof order === 'number' ? order : menu.categories.length
    }

    menu.categories.push(newCategory)
    await menu.save()

    res.status(201).json({
      message: 'Категори амжилттай нэмэгдлээ',
      menu
    })
  } catch (err) {
    console.error('Add category error:', err)
    res.status(500).json({ error: err.message })
  }
}

// Категори засах (нэр, эрэмбэ)
export async function updateCategory(req, res) {
  try {
    const organizationId = req.organizationId
    const { menuId, categoryId } = req.params
    const { category, order } = req.body

    const menu = await Menu.findOne({ _id: menuId, organizationId })
    if (!menu) {
      return res.status(404).json({ message: 'Menu олдсонгүй эсвэл хандах эрхгүй' })
    }

    const cat = menu.categories.find((c) => c.id === categoryId)
    if (!cat) {
      return res.status(404).json({ message: 'Категори олдсонгүй' })
    }

    if (category !== undefined) {
      if (!category.trim()) {
        return res.status(400).json({ message: 'Категорийн нэр хоосон байж болохгүй' })
      }
      cat.category = category.trim()
    }
    if (order !== undefined) {
      cat.order = order
    }

    await menu.save()

    res.json({
      message: 'Категори амжилттай шинэчлэгдлээ',
      menu
    })
  } catch (err) {
    console.error('Update category error:', err)
    res.status(500).json({ error: err.message })
  }
}

// Категори устгах (доторх бараануудын хамт)
export async function deleteCategory(req, res) {
  try {
    const organizationId = req.organizationId
    const { menuId, categoryId } = req.params

    const menu = await Menu.findOne({ _id: menuId, organizationId })
    if (!menu) {
      return res.status(404).json({ message: 'Menu олдсонгүй эсвэл хандах эрхгүй' })
    }

    const before = menu.categories.length
    menu.categories = menu.categories.filter((c) => c.id !== categoryId)

    if (menu.categories.length === before) {
      return res.status(404).json({ message: 'Категори олдсонгүй' })
    }

    await menu.save()

    res.json({
      message: 'Категори амжилттай устгагдлаа',
      menu
    })
  } catch (err) {
    console.error('Delete category error:', err)
    res.status(500).json({ error: err.message })
  }
}

// Категорид бараа нэмэх
export async function addItem(req, res) {
  try {
    const organizationId = req.organizationId
    const { menuId, categoryId } = req.params
    const { name, price, description, duration, isAvailable } = req.body

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Барааны нэр оруулна уу' })
    }
    if (price === undefined || price === null || Number.isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ message: 'Үнэ буруу байна' })
    }

    const menu = await Menu.findOne({ _id: menuId, organizationId })
    if (!menu) {
      return res.status(404).json({ message: 'Menu олдсонгүй эсвэл хандах эрхгүй' })
    }

    const cat = menu.categories.find((c) => c.id === categoryId)
    if (!cat) {
      return res.status(404).json({ message: 'Категори олдсонгүй' })
    }

    const newItem = {
      id: randomUUID(),
      name: name.trim(),
      price: Number(price),
      parentId: categoryId,
      description: description?.trim() || undefined,
      duration: duration !== undefined && duration !== null && duration !== '' ? Number(duration) : undefined,
      isAvailable: isAvailable !== false
    }

    cat.items.push(newItem)
    await menu.save()

    res.status(201).json({
      message: 'Бараа амжилттай нэмэгдлээ',
      menu
    })
  } catch (err) {
    console.error('Add item error:', err)
    res.status(500).json({ error: err.message })
  }
}

// Бараа засах (нэр, үнэ, тайлбар, байгаа эсэх)
export async function updateItem(req, res) {
  try {
    const organizationId = req.organizationId
    const { menuId, itemId } = req.params
    const { name, price, description, duration, isAvailable } = req.body

    const menu = await Menu.findOne({ _id: menuId, organizationId })
    if (!menu) {
      return res.status(404).json({ message: 'Menu олдсонгүй эсвэл хандах эрхгүй' })
    }

    let item = null
    for (const cat of menu.categories) {
      item = cat.items.find((i) => i.id === itemId)
      if (item) break
    }
    if (!item) {
      return res.status(404).json({ message: 'Бараа олдсонгүй' })
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: 'Барааны нэр хоосон байж болохгүй' })
      }
      item.name = name.trim()
    }
    if (price !== undefined) {
      if (Number.isNaN(Number(price)) || Number(price) < 0) {
        return res.status(400).json({ message: 'Үнэ буруу байна' })
      }
      item.price = Number(price)
    }
    if (description !== undefined) {
      item.description = description?.trim() || undefined
    }
    if (duration !== undefined) {
      item.duration = duration === null || duration === '' ? undefined : Number(duration)
    }
    if (isAvailable !== undefined) {
      item.isAvailable = !!isAvailable
    }

    await menu.save()

    res.json({
      message: 'Бараа амжилттай шинэчлэгдлээ',
      menu
    })
  } catch (err) {
    console.error('Update item error:', err)
    res.status(500).json({ error: err.message })
  }
}

// Бараа устгах
export async function deleteItem(req, res) {
  try {
    const organizationId = req.organizationId
    const { menuId, itemId } = req.params

    const menu = await Menu.findOne({ _id: menuId, organizationId })
    if (!menu) {
      return res.status(404).json({ message: 'Menu олдсонгүй эсвэл хандах эрхгүй' })
    }

    let found = false
    for (const cat of menu.categories) {
      const before = cat.items.length
      cat.items = cat.items.filter((i) => i.id !== itemId)
      if (cat.items.length !== before) found = true
    }

    if (!found) {
      return res.status(404).json({ message: 'Бараа олдсонгүй' })
    }

    await menu.save()

    res.json({
      message: 'Бараа амжилттай устгагдлаа',
      menu
    })
  } catch (err) {
    console.error('Delete item error:', err)
    res.status(500).json({ error: err.message })
  }
}

// Menu устгах
export async function deleteMenu(req, res) {
  try {
    const organizationId = req.organizationId
    const { menuId } = req.params

    // Зөвхөн owner
    if (req.userOrgRole !== 'owner') {
      return res.status(403).json({
        message: 'Зөвхөн owner меню устгах эрхтэй'
      })
    }

    const menu = await Menu.findOneAndDelete({
      _id: menuId,
      organizationId
    })

    if (!menu) {
      return res.status(404).json({
        message: 'Menu олдсонгүй эсвэл хандах эрхгүй'
      })
    }

    res.json({ message: 'Menu амжилттай устгагдлаа' })
  } catch (err) {
    console.error('Delete menu error:', err)
    res.status(500).json({ error: err.message })
  }
}
