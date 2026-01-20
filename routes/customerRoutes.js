import express from "express";
import { createCustomer, createSale, getAllCustomers, getCustomerByPhone, createOrder} from "../controllers/customerController.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Customer бүртгэх (employer token шаардлагатай)
router.post("/customer", auth, createCustomer);
router.get("/customer-list", auth, getAllCustomers);
// Борлуулалт үүсгэх (bonus update)
router.post("/sale", auth, createSale);
router.get("/customer/by-phone", auth, getCustomerByPhone);

router.post("/order", auth, createOrder);

export default router;
