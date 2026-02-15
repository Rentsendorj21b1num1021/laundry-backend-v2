import Organization from "../models/organization.js";
import User from "../models/User.js";

// Байгууллага үүсгэх
export const createOrganization = async (req, res) => {
  try {
    const {
      name,
      address,
      phone,
      email,
      bonusPercentage,
      orderPrefix,
      businessType,
    } = req.body;

    const ownerId = req.user.id;

    if (!name) {
      return res.status(400).json({ message: "Нэр шаардлагатай" });
    }

    // Байгууллага үүсгэх
    const organization = await Organization.create({
      name,
      address,
      phone,
      email,
      bonusPercentage: bonusPercentage || 0.05,
      orderPrefix: orderPrefix || "ORD",
      businessType: businessType || "laundry",
      ownerId,
    });

    // Хэрэглэгчийн organizations массивд нэмэх
    const user = await User.findById(ownerId);

    user.organizations.push({
      organizationId: organization._id,
      role: "owner",
    });

    // Хэрвээ анхны байгууллага бол default болгох
    if (!user.defaultOrganization) {
      user.defaultOrganization = organization._id;
    }

    await user.save();

    res.status(201).json({
      message: "Байгууллага амжилттай үүсгэгдлээ",
      organization,
    });
  } catch (err) {
    console.error("Create organization error:", err);
    res.status(500).json({ message: "Server алдаа", error: err.message });
  }
};

// Хэрэглэгчийн бүх байгууллагууд
export const getUserOrganizations = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate({
        path: "organizations.organizationId",
        select: "name address phone status businessType",
      })
      .populate("defaultOrganization", "name");

    const activeOrganizations = user.organizations.filter(
      (org) => org.isActive && org.organizationId?.status === "active",
    );

    res.json({
      organizations: activeOrganizations,
      defaultOrganization: user.defaultOrganization,
    });
  } catch (err) {
    console.error("Get user organizations error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Байгууллага солих
export const switchOrganization = async (req, res) => {
  try {
    const { organizationId } = req.body;
    const userId = req.user.id;

    if (!organizationId) {
      return res.status(400).json({ message: "organizationId шаардлагатай" });
    }

    const user = await User.findById(userId);

    // Хандах эрх шалгах
    const hasAccess = user.organizations.some(
      (org) => org.organizationId.toString() === organizationId && org.isActive,
    );

    if (!hasAccess) {
      return res.status(403).json({
        message: "Та энэ байгууллагад хандах эрхгүй",
      });
    }

    // Default organization солих
    user.defaultOrganization = organizationId;
    await user.save();

    res.json({
      message: "Байгууллага амжилттай солигдлоо",
      organizationId,
    });
  } catch (err) {
    console.error("Switch organization error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Хэрэглэгч нэмэх
export const addUserToOrganization = async (req, res) => {
  try {
    const { userId, role = "employee", permissions = [] } = req.body;
    const organizationId = req.organizationId;

    // Зөвхөн owner/manager хэрэглэгч нэмэх эрхтэй
    if (!["owner", "manager"].includes(req.userOrgRole)) {
      return res.status(403).json({
        message: "Зөвхөн owner эсвэл manager хэрэглэгч нэмэх эрхтэй",
      });
    }

    if (!userId) {
      return res.status(400).json({ message: "userId шаардлагатай" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Хэрэглэгч олдсонгүй" });
    }

    // Аль хэдийн нэмэгдсэн эсэхийг шалгах
    const alreadyAdded = user.organizations.some(
      (org) => org.organizationId.toString() === organizationId,
    );

    if (alreadyAdded) {
      return res.status(400).json({
        message: "Хэрэглэгч аль хэдийн энэ байгууллагад нэмэгдсэн байна",
      });
    }

    // Нэмэх
    user.organizations.push({
      organizationId,
      role,
      permissions,
    });

    // Хэрвээ default байгууллага байхгүй бол энийг default болгох
    if (!user.defaultOrganization) {
      user.defaultOrganization = organizationId;
    }

    await user.save();

    res.json({
      message: "Хэрэглэгч амжилттай нэмэгдлээ",
      user: {
        _id: user._id,
        username: user.username,
        organizations: user.organizations,
      },
    });
  } catch (err) {
    console.error("Add user to organization error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Хэрэглэгч хасах
export const removeUserFromOrganization = async (req, res) => {
  try {
    const { userId } = req.body;
    const organizationId = req.organizationId;

    // Зөвхөн owner хасах эрхтэй
    if (req.userOrgRole !== "owner") {
      return res.status(403).json({
        message: "Зөвхөн owner хэрэглэгч хасах эрхтэй",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Хэрэглэгч олдсонгүй" });
    }

    // Organizations массиваас хасах
    user.organizations = user.organizations.filter(
      (org) => org.organizationId.toString() !== organizationId,
    );

    // Хэрвээ default organization байвал өөрчлөх
    if (user.defaultOrganization?.toString() === organizationId) {
      user.defaultOrganization = user.organizations[0]?.organizationId || null;
    }

    await user.save();

    res.json({ message: "Хэрэглэгч амжилттай хасагдлаа" });
  } catch (err) {
    console.error("Remove user error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Байгууллагын тохиргоо шинэчлэх
export const updateOrganizationSettings = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    const updates = req.body;

    // Зөвхөн owner эсвэл manager
    if (!["owner", "manager"].includes(req.userOrgRole)) {
      return res.status(403).json({
        message: "Зөвхөн owner/manager тохиргоо өөрчлөх эрхтэй",
      });
    }

    // OwnerId өөрчлөхийг хориглох
    delete updates.ownerId;

    const organization = await Organization.findByIdAndUpdate(
      organizationId,
      updates,
      { new: true, runValidators: true },
    );

    if (!organization) {
      return res.status(404).json({ message: "Байгууллага олдсонгүй" });
    }

    res.json({
      message: "Тохиргоо амжилттай шинэчлэгдлээ",
      organization,
    });
  } catch (err) {
    console.error("Update organization error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Байгууллагын дэлгэрэнгүй мэдээлэл
export const getOrganizationDetails = async (req, res) => {
  try {
    const organizationId = req.organizationId;

    const organization = await Organization.findById(organizationId).populate(
      "ownerId",
      "username name email",
    );

    if (!organization) {
      return res.status(404).json({ message: "Байгууллага олдсонгүй" });
    }

    res.json(organization);
  } catch (err) {
    console.error("Get organization details error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Байгууллагын ажилчдын жагсаалт
export const getOrganizationEmployees = async (req, res) => {
  try {
    const organizationId = req.organizationId;

    const users = await User.find({
      "organizations.organizationId": organizationId,
      "organizations.isActive": true,
    }).select("username name email phone organizations");

    const employees = users.map((user) => {
      const orgAccess = user.organizations.find(
        (org) => org.organizationId.toString() === organizationId,
      );

      return {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: orgAccess?.role,
        joinedAt: orgAccess?.joinedAt,
        permissions: orgAccess?.permissions,
      };
    });

    res.json({ employees });
  } catch (err) {
    console.error("Get employees error:", err);
    res.status(500).json({ message: err.message });
  }
};
