import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Token байхгүй" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // id, role

    next();
  } catch (err) {
    res.status(401).json({ message: "Token буруу эсвэл хүчингүй" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin-гээр нэвтрэх ёстой" });

  next();
};
