import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Organization from "../models/organization.js";

// 1️⃣ Зөвхөн нэвтрэлт шалгах
export const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token байхгүй байна" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-passwordHash");

    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ message: "Хэрэглэгч олдсонгүй эсвэл идэвхигүй байна" });
    }

    req.user = {
      id: user._id,
      username: user.username,
      role: user.role,
      organizations: user.organizations,
      defaultOrganization: user.defaultOrganization,
    };

    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token буруу байна" });
    }
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token-ий хугацаа дууссан байна" });
    }
    console.error("Auth middleware error:", err);
    res.status(500).json({ message: "Server алдаа", error: err.message });
  }
};

// 2️⃣ Organization шаардах (super_admin-д хамаарахгүй!)
export const requireOrganization = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Нэвтэрнэ үү" });
    }

    // *** SUPER ADMIN-ийн онцгой эрх ***
    // Super admin бол x-organization-id өгсөн ч, өгөөгүй ч дамжуулна
    if (req.user.role === "super_admin") {
      const orgId = req.headers["x-organization-id"];

      // Хэрвээ orgId өгсөн бол тухайн байгууллага дээр ажиллана
      if (orgId) {
        const organization = await Organization.findById(orgId);

        if (!organization) {
          return res.status(404).json({ message: "Байгууллага олдсонгүй" });
        }

        req.organizationId = orgId;
        req.organization = organization;
        req.userOrgRole = "super_admin"; // super_admin нь үргэлж бүх эрхтэй
      }

      // orgId байхгүй бол бүх байгууллагыг харна (жишээ: жагсаалт)
      return next();
    }

    // *** Энгийн хэрэглэгчдэд organization заавал шаардлагатай ***
    const orgId =
      req.headers["x-organization-id"] || req.user.defaultOrganization;

    if (!orgId) {
      return res.status(400).json({
        message: "Байгууллага сонгоно уу",
        needsOrganizationSelection: true,
      });
    }

    const hasAccess = req.user.organizations.some(
      (org) =>
        org.organizationId.toString() === orgId.toString() && org.isActive,
    );

    if (!hasAccess) {
      return res.status(403).json({
        message: "Та энэ байгууллагад хандах эрхгүй байна",
      });
    }

    const organization = await Organization.findById(orgId);

    if (!organization || organization.status !== "active") {
      return res.status(403).json({
        message: "Байгууллага идэвхигүй эсвэл олдсонгүй",
      });
    }

    req.organizationId = orgId;
    req.organization = organization;

    const userOrgAccess = req.user.organizations.find(
      (org) => org.organizationId.toString() === orgId.toString(),
    );
    req.userOrgRole = userOrgAccess?.role || null;

    next();
  } catch (err) {
    console.error("RequireOrganization middleware error:", err);
    res.status(500).json({ message: "Server алдаа", error: err.message });
  }
};

// 3️⃣ Эрх шалгах (super_admin-д хамаарахгүй!)
export const requireOrgRole = (...allowedRoles) => {
  return (req, res, next) => {
    // *** Super admin үргэлж бүх зүйлд хандаж болно ***
    if (req.user.role === "super_admin") {
      return next();
    }

    if (!req.userOrgRole) {
      return res
        .status(403)
        .json({ message: "Та энэ байгууллагад хандах эрхгүй" });
    }

    if (!allowedRoles.includes(req.userOrgRole)) {
      return res.status(403).json({
        message: `Энэ үйлдлийг хийхийн тулд ${allowedRoles.join(" эсвэл ")} эрх шаардлагатай`,
      });
    }

    next();
  };
};

// 4️⃣ Зөвхөн super admin
export const superAdminOnly = (req, res, next) => {
  if (req.user.role !== "super_admin") {
    return res.status(403).json({ message: "Super admin эрх шаардлагатай" });
  }
  next();
};

// Байгууллага үүсгэх эрх шалгах
export const canCreateOrganization = async (req, res, next) => {
  try {
    // 1️⃣ Super admin үргэлж үүсгэж болно
    if (req.user.role === "super_admin") {
      return next();
    }

    // 2️⃣ Хэрэглэгчийн дэлгэрэнгүй мэдээлэл татах
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Хэрэглэгч олдсонгүй" });
    }

    // 3️⃣ Хэрвээ байгууллагагүй бол үүсгэж болно
    if (!user.organizations || user.organizations.length === 0) {
      return next();
    }

    // 4️⃣ Байгууллагатай бол owner/manager эсэхийг шалгах
    const hasPermission = user.organizations.some(
      (org) => ["owner", "manager"].includes(org.role) && org.isActive,
    );

    if (hasPermission) {
      return next();
    }

    // 5️⃣ Эрхгүй бол tatгах
    return res.status(403).json({
      message:
        "Байгууллага үүсгэх эрхгүй байна. Зөвхөн owner эсвэл manager шинэ байгууллага үүсгэж болно.",
      hint: "Та одоо байгууллагад employee хэлбэрээр ажиллаж байна. Owner-оос эрх хүсээрэй.",
    });
  } catch (err) {
    console.error("canCreateOrganization middleware error:", err);
    res.status(500).json({ message: "Server алдаа", error: err.message });
  }
};
