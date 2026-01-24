import express from "express";
import {
  createCustomer,
  createSale,
  getAllCustomers,
  getCustomerByPhone,
  createOrder,
  getMonthlyIncomeChart,
  getLast7DaysIncome,
  getIncomeByDateRange,
  getCustomerOrderHistory,
} from "../controllers/customerController.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Customer бүртгэх (employer token шаардлагатай)
router.post("/customer", auth, createCustomer);
router.get("/customer-list", auth, getAllCustomers);
// Борлуулалт үүсгэх (bonus update)
router.post("/sale", auth, createSale);
router.get("/customer/by-phone", auth, getCustomerByPhone);

router.post("/order", auth, createOrder);
router.get("/income/chart/monthly", auth, getMonthlyIncomeChart);
router.get("/income/chart/last-7-days", auth, getLast7DaysIncome);
router.get("/income/chart/range", auth, getIncomeByDateRange);
router.get("/customers/:customerId/orders", auth, getCustomerOrderHistory);

export default router;
