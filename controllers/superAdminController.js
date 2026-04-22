import Organization from "../models/organization.js";
import User from "../models/User.js";
import Customer from "../models/customer.js";
import Order from "../models/order.js";
import Menu from "../models/Menu.js";

// ========================================
// БАЙГУУЛЛАГА УДИРДЛАГА
// ========================================

// 1. Бүх байгууллагууд
export const getAllOrganizations = async (req, res) => {
  try {
    const { status, page = 1, limit = 50, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [organizations, total] = await Promise.all([
      Organization.find(filter)
        .populate("ownerId", "username email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Organization.countDocuments(filter),
    ]);

    res.json({
      organizations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error("Get all organizations error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 2. Байгууллага идэвхигүй болгох
export const deactivateOrganization = async (req, res) => {
  try {
    const { organizationId } = req.params;

    const organization = await Organization.findByIdAndUpdate(
      organizationId,
      { status: "inactive" },
      { new: true },
    );

    if (!organization) {
      return res.status(404).json({ message: "Байгууллага олдсонгүй" });
    }

    res.json({
      message: "Байгууллага идэвхигүй болгогдлоо",
      organization,
    });
  } catch (err) {
    console.error("Deactivate organization error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 3. Байгууллага идэвхитэй болгох
export const activateOrganization = async (req, res) => {
  try {
    const { organizationId } = req.params;

    const organization = await Organization.findByIdAndUpdate(
      organizationId,
      { status: "active" },
      { new: true },
    );

    if (!organization) {
      return res.status(404).json({ message: "Байгууллага олдсонгүй" });
    }

    res.json({
      message: "Байгууллага идэвхитэй болгогдлоо",
      organization,
    });
  } catch (err) {
    console.error("Activate organization error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 4. Байгууллага устгах (хатуу устгах)
export const deleteOrganization = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { confirmDelete } = req.body;

    if (!confirmDelete) {
      return res.status(400).json({
        message: "Устгахыг баталгаажуулна уу (confirmDelete: true)",
      });
    }

    // Байгууллагатай холбоотой бүх өгөгдлийг устгах
    await Promise.all([
      Customer.deleteMany({ organizationId }),
      Order.deleteMany({ organizationId }),
      Menu.deleteMany({ organizationId }),
      Organization.findByIdAndDelete(organizationId),
    ]);

    // Хэрэглэгчдийн organizations массиваас хасах
    await User.updateMany(
      { "organizations.organizationId": organizationId },
      {
        $pull: { organizations: { organizationId } },
        $unset: { defaultOrganization: "" },
      },
    );

    res.json({ message: "Байгууллага болон холбогдох бүх өгөгдөл устгагдлаа" });
  } catch (err) {
    console.error("Delete organization error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 5. Байгууллагын статистик
export const getOrganizationStats = async (req, res) => {
  try {
    const { organizationId } = req.params;

    const [customerCount, orderCount, totalRevenue, employeeCount] =
      await Promise.all([
        Customer.countDocuments({ organizationId }),
        Order.countDocuments({ organizationId, status: "PAID" }),
        Order.aggregate([
          {
            $match: {
              organizationId: new mongoose.Types.ObjectId(organizationId),
              status: "PAID",
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$total_price" },
            },
          },
        ]),
        User.countDocuments({ "organizations.organizationId": organizationId }),
      ]);

    res.json({
      organizationId,
      stats: {
        customers: customerCount,
        orders: orderCount,
        totalRevenue: totalRevenue[0]?.total || 0,
        employees: employeeCount,
      },
    });
  } catch (err) {
    console.error("Get organization stats error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ========================================
// ХЭРЭГЛЭГЧ УДИРДЛАГА
// ========================================

// 6. Бүх хэрэглэгчид
export const getAllUsers = async (req, res) => {
  try {
    const { role, isActive, page = 1, limit = 50, search } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-passwordHash")
        .populate("organizations.organizationId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 7. Хэрэглэгчийн роль өөрчлөх
export const changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["super_admin", "owner", "manager", "employee"].includes(role)) {
      return res.status(400).json({ message: "Буруу роль" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true },
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "Хэрэглэгч олдсонгүй" });
    }

    res.json({
      message: "Роль амжилттай өөрчлөгдлөө",
      user,
    });
  } catch (err) {
    console.error("Change user role error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 8. Хэрэглэгч идэвхигүй/идэвхитэй болгох
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Хэрэглэгч олдсонгүй" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `Хэрэглэгч ${user.isActive ? "идэвхитэй" : "идэвхигүй"} болгогдлоо`,
      user: {
        _id: user._id,
        username: user.username,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    console.error("Toggle user status error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 9. Super admin үүсгэх
export const createSuperAdmin = async (req, res) => {
  try {
    const { username, password, phone, email } = req.body;

    // Шалгалт
    const existingUser = await User.findOne({
      $or: [{ username }, { phone }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username, phone эсвэл email давхцаж байна",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const superAdmin = await User.create({
      username,
      passwordHash,
      phone,
      email,
      role: "super_admin",
      isActive: true,
    });

    res.status(201).json({
      message: "Super admin амжилттай үүсгэгдлээ",
      user: {
        _id: superAdmin._id,
        username: superAdmin.username,
        email: superAdmin.email,
        role: superAdmin.role,
      },
    });
  } catch (err) {
    console.error("Create super admin error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ========================================
// СИСТЕМИЙН СТАТИСТИК
// ========================================

// 10. Нийт статистик
export const getSystemStats = async (req, res) => {
  try {
    const [
      totalOrganizations,
      activeOrganizations,
      totalUsers,
      totalCustomers,
      totalOrders,
      totalRevenue,
    ] = await Promise.all([
      Organization.countDocuments(),
      Organization.countDocuments({ status: "active" }),
      User.countDocuments(),
      Customer.countDocuments(),
      Order.countDocuments({ status: "PAID" }),
      Order.aggregate([
        { $match: { status: "PAID" } },
        { $group: { _id: null, total: { $sum: "$total_price" } } },
      ]),
    ]);

    res.json({
      system: {
        organizations: {
          total: totalOrganizations,
          active: activeOrganizations,
          inactive: totalOrganizations - activeOrganizations,
        },
        users: totalUsers,
        customers: totalCustomers,
        orders: totalOrders,
        revenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (err) {
    console.error("Get system stats error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 11. Байгууллагуудын орлогын харьцуулалт
export const getOrganizationsRevenue = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = { status: "PAID" };

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const result = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$organizationId",
          totalRevenue: { $sum: "$total_price" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "organizations",
          localField: "_id",
          foreignField: "_id",
          as: "organization",
        },
      },
      { $unwind: "$organization" },
      {
        $project: {
          organizationId: "$_id",
          organizationName: "$organization.name",
          totalRevenue: 1,
          orderCount: 1,
          _id: 0,
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    res.json(result);
  } catch (err) {
    console.error("Get organizations revenue error:", err);
    res.status(500).json({ message: err.message });
  }
};
