import Customer from "../models/customer.js";
import Sale from "../models/Sale.js";

// 1️⃣ Customer бүртгэх
export const createCustomer = async (req, res) => {
  try {
    const { phone, name } = req.body;
    const createdBy = req.user.id; // auth middleware-с авна

    // Хэрэглэгч аль хэдийн бүртгэлтэй эсэх
    const existingCustomer = await Customer.findOne({ phone });
    if (existingCustomer)
      return res.status(400).json({ message: "Хэрэглэгч аль хэдийн бүртгэлтэй" });

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

// 2️⃣ Борлуулалт үүсгэх + 5% бонус
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
