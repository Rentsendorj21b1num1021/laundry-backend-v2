const express = require("express");
const router = express.Router();
const {
  createMenu,
  getMenus,
  getMenuByService,
} = require("../controllers/menuController");

router.post("/menus", createMenu);
router.get("/menus", getMenus);
router.get("/menus/:service", getMenuByService);

module.exports = router;
