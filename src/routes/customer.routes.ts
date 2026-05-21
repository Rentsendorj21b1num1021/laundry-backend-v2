import { Router } from 'express'

import { auth, requireOrganization, requireOrgRole } from '@/middleware/auth.middleware'

import {
  createCustomerHandler,
  createCustomerValidation,
  getAllCustomersHandler,
  getAllCustomersValidation,
  getCustomerByPhoneHandler,
  getCustomerByPhoneValidation,
  updateCustomerHandler,
  updateCustomerValidation
} from '@/handlers/customers'
import { getIncomeByDateRangeHandler, getLast7DaysIncomeHandler, getMonthlyIncomeHandler, getStatisticsHandler } from '@/handlers/dashboard'
import { createOrderHandler, createOrderValidation, deleteOrderHandler, getCustomerOrderHistoryHandler, getCustomerOrderHistoryValidation, getOrderListHandler } from '@/handlers/orders'

const router = Router()

// Customer
router.post('/customer', auth, requireOrganization, createCustomerValidation, createCustomerHandler)
router.get('/customer-list', auth, requireOrganization, getAllCustomersValidation, getAllCustomersHandler)
router.get('/customer/by-phone', auth, requireOrganization, getCustomerByPhoneValidation, getCustomerByPhoneHandler)
router.post('/updateCustomer/:customerId', auth, requireOrganization, updateCustomerValidation, updateCustomerHandler)

// Order
router.post('/order', auth, requireOrganization, createOrderValidation, createOrderHandler)
router.get('/getOrders', auth, requireOrganization, getOrderListHandler)
router.post('/deleteOrder', auth, requireOrganization, requireOrgRole('manager', 'owner'), deleteOrderHandler)
router.get('/customers/:customerId/orders', auth, requireOrganization, getCustomerOrderHistoryValidation, getCustomerOrderHistoryHandler)

// Dashboard
router.get('/statistics', auth, requireOrganization, getStatisticsHandler)
router.get('/income/chart/monthly', auth, requireOrganization, getMonthlyIncomeHandler)
router.get('/income/chart/last-7-days', auth, requireOrganization, getLast7DaysIncomeHandler)
router.get('/income/chart/range', auth, requireOrganization, getIncomeByDateRangeHandler)

export default router
