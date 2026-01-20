import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER
export const register = async (req, res) => {
  try {
    const { username, password, phone, email } = req.body;

    // Check if user exists by username, phone or email
    const existingUser = await User.findOne({ 
      $or: [{ username }, { phone }, { email }] 
    });
    if (existingUser) {
      return res.status(400).json({ message: "Username, phone эсвэл email давхцаж байна" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      passwordHash,
      phone,
      email,
    });

    res.status(201).json({
      message: "User амжилттай бүртгэгдлээ",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Find user by username, phone or email
    const user = await User.findOne({ 
      $or: [
        { username: identifier }, 
        { phone: identifier }, 
        { email: identifier }
      ]
    });
    if (!user) return res.status(400).json({ message: "Хэрэглэгч олдсонгүй" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Password буруу" });

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Амжилттай нэвтэрлээ",
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
