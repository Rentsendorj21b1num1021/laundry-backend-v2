const Menu = require("../models/Menu");

// ➕ Menu нэмэх (1 JSON = 1 document)
async function createMenu(req, res) {
  try {
    const menu = new Menu(req.body);
    await menu.save();
    res.status(201).json({ message: "Menu created", menu });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 📥 Бүх menu авах
async function getMenus(req, res) {
  try {
    const menus = await Menu.find();
    res.json(menus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 📥 Service нэрээр menu авах
async function getMenuByService(req, res) {
  try {
    const menu = await Menu.findOne({ service: req.params.service });
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  createMenu,
  getMenus,
  getMenuByService,
};
