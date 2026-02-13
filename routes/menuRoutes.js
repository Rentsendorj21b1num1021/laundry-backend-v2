import express from "express";
import {
  createMenu,
  getMenus,
  getMenuByService,
} from "../controllers/menuController.js";

const router = express.Router();

router.post("/menus", createMenu);
router.get("/menus", getMenus);
router.get("/menus/:service", getMenuByService);

export default router;
