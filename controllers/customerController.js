import Customer from "../models/customer.js";
import Order from "../models/order.js";
import mongoose from "mongoose";

// 1️⃣ Customer бүртгэх
export const createCustomer = async (req, res) => {
  try {
    const { phone, name, email, address } = req.body;
    const createdBy = req.user.id;
    const organizationId = req.organizationId; // middleware-с

    // Утасны дугаар шалгах
    if (!phone) {
      return res.status(400).json({ message: "Утасны дугаар шаардлагатай" });
    }
    // *** Зөвхөн тухайн газар дотор уникаль эсэхийг шалгах ***
    const existingCustomer = await Customer.findOne({
      organizationId,
      phone,
    });

    if (existingCustomer) {
      return res.status(400).json({
        message: "Энэ утасны дугаартай хэрэглэгч аль хэдийн бүртгэлтэй байна",
      });
    }

    // Customer үүсгэх
    const customer = await Customer.create({
      organizationId,
      phone,
      name: name || null,
      email: email || null,
      address: address || null,
      createdBy,
      lastVisit: new Date(),
    });

    res.status(200).json({
      message: "Хэрэглэгч амжилттай бүртгэгдлээ",
      customer,
    });
  } catch (err) {
    console.error("Create customer error:", err);
    res.status(500).json({ message: "Server алдаа", error: err.message });
  }
};

// Бүх үйлчлүүлэгчдийг авах
export const getAllCustomers = async (req, res) => {
  try {
    const { phone, name, page = 1, limit = 50 } = req.query;
    const organizationId = req.organizationId;

    // *** Заавал тухайн байгууллагын үйлчлүүлэгчдийг л харуулна ***
    let filter = { organizationId };

    // Хайлт
    if (phone) {
      filter.phone = { $regex: phone, $options: "i" };
    }

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("createdBy", "username name"),
      Customer.countDocuments(filter),
    ]);

    res.status(200).json({
      message: "Хэрэглэгчид амжилттай ирлээ",
      customers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalCustomers: total,
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error("Get customers error:", err);
    res.status(500).json({ message: "Server алдаа", error: err.message });
  }
};

// Утасны дугаараар хайх
export const getCustomerByPhone = async (req, res) => {
  try {
    const { phone } = req.query;
    const organizationId = req.organizationId;

    if (!phone) {
      return res.status(400).json({ message: "Утасны дугаар шаардлагатай" });
    }

    // *** Зөвхөн тухайн газрын үйлчлүүлэгчээс хайх ***
    const customer = await Customer.findOne({
      organizationId,
      phone,
    });

    if (!customer) {
      return res.status(404).json({ message: "Хэрэглэгч олдсонгүй" });
    }

    res.status(200).json({
      message: "Хэрэглэгчийн мэдээлэл",
      customer,
    });
  } catch (err) {
    console.error("Get customer by phone error:", err);
    res.status(500).json({ message: "Server алдаа", error: err.message });
  }
};

// Захиалга үүсгэх - ГҮЙЦЭД ШИНЭЧИЛСЭН
export const createOrder = async (req, res) => {
  try {
    const { customerId, items, usedBonus = 0, paymentMethod, notes } = req.body;
    const employeeId = req.user.id;
    const organizationId = req.organizationId;

    // 1️⃣ Items шалгах
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Items хоосон байна" });
    }

    const toTwoDecimal = (value) => {
      return Number(value.toFixed(2));
    };

    // 2️⃣ Items total
    const itemsTotal = toTwoDecimal(
      items.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0),
    );

    let customer = null;
    let earnedBonus = 0;
    let finalTotal = itemsTotal;

    // 3️⃣ Хэрвээ customer байгаа бол
    if (customerId) {
      // *** Зөвхөн тухайн газрын үйлчлүүлэгч эсэхийг шалгах ***
      customer = await Customer.findOne({
        _id: customerId,
        organizationId,
      });

      if (!customer) {
        return res.status(404).json({
          message: "Customer олдсонгүй эсвэл хандах эрхгүй",
        });
      }

      // Bonus ашигласан эсэх
      if (usedBonus > 0) {
        if (usedBonus > customer.total_bonus) {
          return res.status(400).json({
            message: "Bonus хүрэлцэхгүй байна",
            availableBonus: customer.total_bonus,
          });
        }
        finalTotal = toTwoDecimal(finalTotal - usedBonus);
      }

      // Хэрвээ тэг болвол 1 болго (минимум төлбөр)
      if (finalTotal < 0) finalTotal = 0;

      // 4️⃣ Бонус бодох (байгууллагын тохиргооноос)
      const bonusPercentage = req.organization.bonusPercentage || 0.05;
      earnedBonus = toTwoDecimal(finalTotal * bonusPercentage);
    }

    // 5️⃣ Захиалгын дугаар үүсгэх
    // Сүүлийн захиалгын дугаарыг олох
    const lastOrder = await Order.findOne({ organizationId })
      .sort({ createdAt: -1 })
      .select("orderNumber");

    let orderNumber;
    if (lastOrder && lastOrder.orderNumber) {
      // Дугаараас тоог салгаж авах (жишээ: BZ-0123 -> 123)
      const lastNum = parseInt(lastOrder.orderNumber.split("-")[1] || "0");
      const newNum = (lastNum + 1).toString().padStart(4, "0");
      const prefix = req.organization.orderPrefix || "ORD";
      orderNumber = `${prefix}-${newNum}`;
    } else {
      const prefix = req.organization.orderPrefix || "ORD";
      orderNumber = `${prefix}-0001`;
    }

    // 6️⃣ Order үүсгэх
    const order = await Order.create({
      organizationId,
      orderNumber,
      customer_id: customerId || null,
      employee_id: employeeId,
      items,
      total_price: toTwoDecimal(finalTotal),
      used_bonus: toTwoDecimal(usedBonus),
      earned_bonus: toTwoDecimal(earnedBonus),
      paymentMethod: paymentMethod || "cash",
      notes: notes || null,
    });

    // 7️⃣ Customer bonus update (хэрвээ байгаа бол)
    if (customer) {
      customer.total_bonus = toTwoDecimal(
        customer.total_bonus - usedBonus + earnedBonus,
      );
      customer.lastVisit = new Date();
      await customer.save();
    }

    // Populate employee мэдээлэл
    await order.populate("employee_id", "username name");

    res.status(201).json({
      message: "Захиалга амжилттай бүртгэгдлээ",
      order,
      updatedCustomer: customer || null,
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: "Server алдаа", error: err.message });
  }
};

// Сарын орлогын график
export const getMonthlyIncomeChart = async (req, res) => {
  try {
    const organizationId = req.organizationId;

    const start = new Date();
    start.setMonth(start.getMonth() - 11);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    // *** Зөвхөн тухайн газрын захиалгуудаас тооцох ***
    const result = await Order.aggregate([
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(organizationId),
          createdAt: { $gte: start },
          status: { $in: ["PAID"] }, // Зөвхөн төлөгдсөн
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalIncome: { $sum: "$total_price" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // 12 сарын array бэлдэх
    const months = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      months.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        label: `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, "0")}`,
        total: 0,
        orderCount: 0,
      });
    }

    result.forEach((r) => {
      const index = months.findIndex(
        (m) => m.year === r._id.year && m.month === r._id.month,
      );
      if (index !== -1) {
        months[index].total = r.totalIncome;
        months[index].orderCount = r.orderCount;
      }
    });

    res.json(months);
  } catch (err) {
    console.error("Get monthly income error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Сүүлийн 7 хоногийн орлого
export const getLast7DaysIncome = async (req, res) => {
  try {
    const organizationId = req.organizationId;

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const start = new Date();
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    // *** Зөвхөн тухайн газрын захиалгууд ***
    const result = await Order.aggregate([
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(organizationId),
          createdAt: {
            $gte: start,
            $lte: today,
          },
          status: { $in: ["PAID"] },
        },
      },
      {
        $group: {
          _id: {
            day: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
          },
          totalIncome: { $sum: "$total_price" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.day": 1 } },
    ]);

    // 7 хоногийн массив
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        key,
        total: 0,
        orderCount: 0,
      });
    }

    result.forEach((r) => {
      const day = days.find((d) => d.key === r._id.day);
      if (day) {
        day.total = r.totalIncome;
        day.orderCount = r.orderCount;
      }
    });

    res.json(days);
  } catch (err) {
    console.error("Get 7 days income error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Огнооны хүрээгээр орлого
export const getIncomeByDateRange = async (req, res) => {
  try {
    const { from, to } = req.query;
    const organizationId = req.organizationId;

    if (!from || !to) {
      return res.status(400).json({
        message: "from болон to date шаардлагатай",
      });
    }

    const start = new Date(from);
    start.setHours(0, 0, 0, 0);

    const end = new Date(to);
    end.setHours(23, 59, 59, 999);

    // *** Зөвхөн тухайн газрын захиалгууд ***
    const result = await Order.aggregate([
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(organizationId),
          createdAt: {
            $gte: start,
            $lte: end,
          },
          status: { $in: ["PAID"] },
        },
      },
      {
        $group: {
          _id: {
            day: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
          },
          totalIncome: { $sum: "$total_price" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.day": 1 } },
    ]);

    // Range-ийн бүх өдрийг бэлдэх
    const days = [];
    const cursor = new Date(start);

    while (cursor <= end) {
      const key = cursor.toISOString().slice(0, 10);
      days.push({
        key,
        label: `${cursor.getMonth() + 1}/${cursor.getDate()}`,
        total: 0,
        orderCount: 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    result.forEach((r) => {
      const day = days.find((d) => d.key === r._id.day);
      if (day) {
        day.total = r.totalIncome;
        day.orderCount = r.orderCount;
      }
    });

    res.json(days);
  } catch (err) {
    console.error("Get date range income error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Үйлчлүүлэгчийн захиалгын түүх
export const getCustomerOrderHistory = async (req, res) => {
  try {
    const { customerId } = req.params;
    const organizationId = req.organizationId;

    if (!customerId) {
      return res.status(400).json({ message: "customerId шаардлагатай" });
    }

    // *** Customer тухайн газрынх эсэхийг шалгах ***
    const customer = await Customer.findOne({
      _id: customerId,
      organizationId,
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer олдсонгүй эсвэл хандах эрхгүй",
      });
    }

    const orders = await Order.find({
      organizationId,
      customer_id: customerId,
      status: { $in: ["PAID"] },
    })
      .sort({ createdAt: -1 })
      .populate("employee_id", "username name")
      .select(
        "orderNumber items total_price used_bonus earned_bonus createdAt paymentMethod",
      );

    res.json({
      customer,
      totalOrders: orders.length,
      orders,
    });
  } catch (err) {
    console.error("Get customer order history error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Захиалгын жагсаалт
export const getOrderList = async (req, res) => {
  try {
    const {
      status,
      customer_id,
      employee_id,
      minPrice,
      maxPrice,
      page = 1,
      limit = 50,
      startDate,
      endDate,
    } = req.query;

    const organizationId = req.organizationId;

    // *** Заавал тухайн байгууллагын захиалгууд ***
    const filter = { organizationId };

    if (status) filter.status = status;
    if (customer_id) filter.customer_id = customer_id;
    if (employee_id) filter.employee_id = employee_id;

    if (minPrice || maxPrice) {
      filter.total_price = {};
      if (minPrice) filter.total_price.$gte = Number(minPrice);
      if (maxPrice) filter.total_price.$lte = Number(maxPrice);
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("customer_id", "name phone")
        .populate("employee_id", "username name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalOrders: total,
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error("Get order list error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Захиалга устгах
export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const organizationId = req.organizationId;

    if (!orderId) {
      return res.status(400).json({ message: "orderId шаардлагатай" });
    }

    // *** Зөвхөн өөрийн газрын захиалгыг устгаж болно ***
    const order = await Order.findOne({
      _id: orderId,
      organizationId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Захиалга олдсонгүй эсвэл хандах эрхгүй",
      });
    }

    // Хэрвээ бонус ашигласан бол буцааж өгөх
    if (order.customer_id && (order.used_bonus > 0 || order.earned_bonus > 0)) {
      const customer = await Customer.findById(order.customer_id);
      if (customer) {
        customer.total_bonus += order.used_bonus - order.earned_bonus;
        await customer.save();
      }
    }

    await Order.findByIdAndDelete(orderId);

    res.status(200).json({
      message: "Захиалга амжилттай устгагдлаа",
    });
  } catch (err) {
    console.error("Delete order error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Customer мэдээлэл шинэчлэх
export const updateCustomer = async (req, res) => {
  try {
    const { customerId, ...updateData } = req.body;
    const organizationId = req.organizationId;

    if (!customerId) {
      return res.status(400).json({ message: "customerId шаардлагатай" });
    }

    // *** Зөвхөн өөрийн газрын үйлчлүүлэгчийг засаж болно ***
    const updatedCustomer = await Customer.findOneAndUpdate(
      { _id: customerId, organizationId },
      updateData,
      { new: true },
    );

    if (!updatedCustomer) {
      return res.status(404).json({
        message: "Хэрэглэгч олдсонгүй эсвэл хандах эрхгүй",
      });
    }

    res.json({
      message: "Хэрэглэгчийн мэдээлэл шинэчлэгдлээ",
      customer: updatedCustomer,
    });
  } catch (err) {
    console.error("Update customer error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Статистик
export const getStatistics = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    const { period = "today" } = req.query; // today, week, month, year

    let startDate = new Date();

    switch (period) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const [totalRevenue, orderCount, customerCount, avgOrderValue] =
      await Promise.all([
        Order.aggregate([
          {
            $match: {
              organizationId: new mongoose.Types.ObjectId(organizationId),
              status: "PAID",
              createdAt: { $gte: startDate },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$total_price" },
            },
          },
        ]),
        Order.countDocuments({
          organizationId,
          status: "PAID",
          createdAt: { $gte: startDate },
        }),
        Customer.countDocuments({ organizationId }),
        Order.aggregate([
          {
            $match: {
              organizationId: new mongoose.Types.ObjectId(organizationId),
              status: "PAID",
              createdAt: { $gte: startDate },
            },
          },
          {
            $group: {
              _id: null,
              avgValue: { $avg: "$total_price" },
            },
          },
        ]),
      ]);

    res.json({
      period,
      totalRevenue: totalRevenue[0]?.total || 0,
      orderCount,
      customerCount,
      avgOrderValue: avgOrderValue[0]?.avgValue || 0,
    });
  } catch (err) {
    console.error("Get statistics error:", err);
    res.status(500).json({ message: err.message });
  }
};
