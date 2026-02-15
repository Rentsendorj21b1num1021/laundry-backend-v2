import Menu from "../models/menu.js";

// Menu үүсгэх
export async function createMenu(req, res) {
  try {
    const organizationId = req.organizationId;
    const menuData = { ...req.body, organizationId };

    const menu = new Menu(menuData);
    await menu.save();

    res.status(201).json({
      message: "Menu амжилттай үүсгэгдлээ",
      menu,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Энэ service-ийн меню аль хэдийн байна",
      });
    }
    console.error("Create menu error:", err);
    res.status(500).json({ error: err.message });
  }
}

// Бүх menu-г авах
export async function getMenus(req, res) {
  try {
    const organizationId = req.organizationId;

    // *** Зөвхөн тухайн газрын меню ***
    const menus = await Menu.find({
      organizationId,
      isActive: true,
    });

    res.json(menus);
  } catch (err) {
    console.error("Get menus error:", err);
    res.status(500).json({ error: err.message });
  }
}

// Service нэрээр menu авах
export async function getMenuByService(req, res) {
  try {
    const organizationId = req.organizationId;
    const { service } = req.params;

    // *** Зөвхөн тухайн газрын меню ***
    const menu = await Menu.findOne({
      organizationId,
      service,
      isActive: true,
    });

    if (!menu) {
      return res.status(404).json({ message: "Menu олдсонгүй" });
    }

    res.json(menu);
  } catch (err) {
    console.error("Get menu by service error:", err);
    res.status(500).json({ error: err.message });
  }
}

// Menu шинэчлэх
export async function updateMenu(req, res) {
  try {
    const organizationId = req.organizationId;
    const { menuId } = req.params;

    // Зөвхөн owner/manager
    if (!["owner", "manager"].includes(req.userOrgRole)) {
      return res.status(403).json({
        message: "Зөвхөн owner/manager меню засах эрхтэй",
      });
    }

    const menu = await Menu.findOneAndUpdate(
      { _id: menuId, organizationId },
      req.body,
      { new: true, runValidators: true },
    );

    if (!menu) {
      return res.status(404).json({
        message: "Menu олдсонгүй эсвэл хандах эрхгүй",
      });
    }

    res.json({
      message: "Menu амжилттай шинэчлэгдлээ",
      menu,
    });
  } catch (err) {
    console.error("Update menu error:", err);
    res.status(500).json({ error: err.message });
  }
}

// Menu устгах
export async function deleteMenu(req, res) {
  try {
    const organizationId = req.organizationId;
    const { menuId } = req.params;

    // Зөвхөн owner
    if (req.userOrgRole !== "owner") {
      return res.status(403).json({
        message: "Зөвхөн owner меню устгах эрхтэй",
      });
    }

    const menu = await Menu.findOneAndDelete({
      _id: menuId,
      organizationId,
    });

    if (!menu) {
      return res.status(404).json({
        message: "Menu олдсонгүй эсвэл хандах эрхгүй",
      });
    }

    res.json({ message: "Menu амжилттай устгагдлаа" });
  } catch (err) {
    console.error("Delete menu error:", err);
    res.status(500).json({ error: err.message });
  }
}
