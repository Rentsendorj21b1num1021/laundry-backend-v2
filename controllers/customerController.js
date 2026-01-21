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
