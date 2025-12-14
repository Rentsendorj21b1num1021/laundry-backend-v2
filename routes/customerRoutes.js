import express from "express";
import { createCustomer, createSale } from "../controllers/customerController.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Customer бүртгэх (employer token шаардлагатай)
router.post("/customer", auth, createCustomer);

// Борлуулалт үүсгэх (bonus update)
router.post("/sale", auth, createSale);

export default router;
