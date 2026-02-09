import Customer from "../models/customer.js";
import Sale from "../models/Sale.js";
import Order from "../models/order.js";

// 1️⃣ Customer бүртгэх
export const createCustomer = async (req, res) => {
  try {
    const { phone, name } = req.body;
    const createdBy = req.user.id; // auth middleware-с авна

    // Хэрэглэгч аль хэдийн бүртгэлтэй эсэх
    const existingCustomer = await Customer.findOne({ phone });
    if (existingCustomer)
      return res
        .status(400)
        .json({ message: "Хэрэглэгч аль хэдийн бүртгэлтэй" });

    // Customer үүсгэх
    const customer = await Customer.create({
      phone,
      name: name || null, // name оролгуулахгүй бол null
      createdBy,
    });

    res.status(201).json({ message: "Хэрэглэгч бүртгэгдлээ", customer });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getAllCustomers = async (req, res) => {
  try {
    const { phone } = req.query; // query parameter-аас авна
    let filter = {};

    if (phone) {
      // phone утга өгөгдсөн тэмдэгтээр эхэлж байгаа бүх дугаарыг хайна
      filter.phone = { $regex: `^${phone}` };
    }

    const customers = await Customer.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ message: "Хэрэглэгчид ирлээ", customers });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getCustomerByPhone = async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ message: "Утасны дугаар шаардлагатай" });
    }

    const customer = await Customer.findOne({ phone });

    if (!customer) {
      return res.status(404).json({ message: "Хэрэглэгч олдсонгүй" });
    }

    res.status(200).json({
      message: "Хэрэглэгчийн мэдээлэл",
      customer,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const createSale = async (req, res) => {
  try {
    const { customerId, totalAmount } = req.body;
    const employeeId = req.user.id; // JWT-аас авнаb
    // Bonus тооцоолох
    const bonusAmount = totalAmount * 0.05;
    // Борлуулалт үүсгэх
    const sale = await Sale.create({
      employee_id: employeeId,
      customer_id: customerId,
      total_amount: totalAmount,
      bonus_amount: bonusAmount,
    });

    // Хэрэглэгчийн бонус нэмэх
    const customer = await Customer.findById(customerId);
    customer.total_bonus += bonusAmount;
    await customer.save();

    res.status(201).json({
      message: "Борлуулалт үүссэн, бонус нэмэгдлээ",
      sale,
      updatedCustomer: customer,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { customerId, items, usedBonus = 0 } = req.body;
    const employeeId = req.user.id;

    // 1️⃣ Items шалгах
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Items хоосон байна" });
    }
    const toTwoDecimal = (value) => {
      return Number(value.toFixed(2));
    };

    // 2️⃣ Items total

    const itemsTotal = toTwoDecimal(items.reduce((sum, i) => sum + i.price, 0));

    let customer = null;
    let earnedBonus = 0;
    let finalTotal = itemsTotal;

    // 3️⃣ Хэрвээ customer байгаа бол
    if (customerId) {
      customer = await Customer.findById(customerId);
      if (!customer)
        return res.status(404).json({ message: "Customer олдсонгүй" });

      // Bonus ашигласан эсэх
      if (usedBonus > 0) {
        if (usedBonus > customer.total_bonus) {
          return res.status(400).json({ message: "Bonus хүрэлцэхгүй" });
        }
        finalTotal -= usedBonus;
      }
      finalTotal = finalTotal;
      // 4️⃣ 5% бонус бодох
      earnedBonus = finalTotal * 0.05;
    }

    // 5️⃣ Order үүсгэх
    const order = await Order.create({
      customer_id: customerId || null,
      employee_id: employeeId,
      items,
      total_price: toTwoDecimal(finalTotal),
      used_bonus: toTwoDecimal(usedBonus),
      earned_bonus: toTwoDecimal(earnedBonus),
    });

    // 6️⃣ Customer bonus update (хэрвээ байгаа бол)
    if (customer) {
      customer.total_bonus = toTwoDecimal(
        customer.total_bonus - usedBonus + earnedBonus,
      );
      await customer.save();
    }

    res.status(201).json({
      message: "Order амжилттай бүртгэгдлээ",
      order,
      updatedCustomer: customer || null,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getMonthlyIncomeChart = async (req, res) => {
  try {
    const start = new Date();
    start.setMonth(start.getMonth() - 11);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalIncome: { $sum: "$total_price" },
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
        label: `${d.getMonth() + 1} сар`,
        total: 0,
      });
    }

    result.forEach((r) => {
      const index = months.findIndex(
        (m) => m.year === r._id.year && m.month === r._id.month,
      );
      if (index !== -1) months[index].total = r.totalIncome;
    });

    res.json(months);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getLast7DaysIncome = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const start = new Date();
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const result = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: start,
            $lte: today,
          },
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
        label: d.toLocaleDateString("mn-MN", {
          month: "2-digit",
          day: "2-digit",
        }),
        key,
        total: 0,
      });
    }

    result.forEach((r) => {
      const day = days.find((d) => d.key === r._id.day);
      if (day) day.total = r.totalIncome;
    });

    res.json(days);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getIncomeByDateRange = async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res
        .status(400)
        .json({ message: "from болон to date шаардлагатай" });
    }

    const start = new Date(from);
    start.setHours(0, 0, 0, 0);

    const end = new Date(to);
    end.setHours(23, 59, 59, 999);

    const result = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: start,
            $lte: end,
          },
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
        label: cursor.toLocaleDateString("mn-MN", {
          month: "2-digit",
          day: "2-digit",
        }),
        total: 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    result.forEach((r) => {
      const day = days.find((d) => d.key === r._id.day);
      if (day) day.total = r.totalIncome;
    });

    res.json(days);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCustomerOrderHistory = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({ message: "customerId шаардлагатай" });
    }

    const orders = await Order.find({
      customer_id: customerId,
      status: "PAID",
    })
      .sort({ createdAt: -1 })
      .populate("employee_id", "username name")
      .select("items total_price used_bonus earned_bonus createdAt");

    res.json({
      customerId,
      totalOrders: orders.length,
      orders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOrderList = async (req, res) => {
  try {
    const { status, customer_id, employee_id, minPrice, maxPrice } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (customer_id) filter.customer_id = customer_id;
    if (employee_id) filter.employee_id = employee_id;

    if (minPrice || maxPrice) {
      filter.total_price = {};
      if (minPrice) filter.total_price.$gte = Number(minPrice);
      if (maxPrice) filter.total_price.$lte = Number(maxPrice);
    }

    const orders = await Order.find(filter)
      .populate("customer_id", "name email")
      .populate("employee_id", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "orderId шаардлагатай" });
    }

    await Order.findByIdAndDelete(orderId);
    res.status(200).json({ message: "Захиалга амжилттай устгагдлаа" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { customerId, ...updateData } = req.body;

    if (!customerId) {
      return res.status(400).json({ message: "customerId шаардлагатай" });
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      updateData,
      { new: true },
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: "Хэрэглэгч олдсонгүй" });
    }

    res.json(updatedCustomer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
