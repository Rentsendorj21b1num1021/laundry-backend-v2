import express from "express";
import {
  createCustomer,
  getAllCustomers,
  getCustomerByPhone,
  createOrder,
  getMonthlyIncomeChart,
  getLast7DaysIncome,
  getIncomeByDateRange,
  getCustomerOrderHistory,
  getOrderList,
  deleteOrder,
  updateCustomer,
  getStatistics,
} from "../controllers/customerController.js";
import {
  auth,
  requireOrganization,
  requireOrgRole,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// *** БҮХ route-д auth + requireOrganization ***

// Customer CRUD
router.post("/customer", auth, requireOrganization, createCustomer);
router.get("/customer-list", auth, requireOrganization, getAllCustomers);
router.get("/customer/by-phone", auth, requireOrganization, getCustomerByPhone);
router.post("/updateCustomer", auth, requireOrganization, updateCustomer);

// Order CRUD
router.post("/order", auth, requireOrganization, createOrder);
router.get("/getOrders", auth, requireOrganization, getOrderList);
router.post(
  "/deleteOrder",
  auth,
  requireOrganization,
  requireOrgRole("manager", "owner"),
  deleteOrder,
);
router.get(
  "/customers/:customerId/orders",
  auth,
  requireOrganization,
  getCustomerOrderHistory,
);

// Statistics & Charts
router.get("/statistics", auth, requireOrganization, getStatistics);
router.get(
  "/income/chart/monthly",
  auth,
  requireOrganization,
  getMonthlyIncomeChart,
);
router.get(
  "/income/chart/last-7-days",
  auth,
  requireOrganization,
  getLast7DaysIncome,
);
router.get(
  "/income/chart/range",
  auth,
  requireOrganization,
  getIncomeByDateRange,
);

export default router;
