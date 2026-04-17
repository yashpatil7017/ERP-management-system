import bcrypt from "bcryptjs";
import User from "../models/user.js";

function sanitizeUser(userDoc) {
  const user = userDoc?.toObject ? userDoc.toObject() : { ...(userDoc || {}) };
  delete user.password;
  return user;
}

// GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const search = String(req.query.search || "").trim();
    const role = String(req.query.role || "").toLowerCase();
    const status = String(req.query.status || "").toLowerCase();

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role && role !== "all") query.role = role;
    if (status && status !== "all") query.status = status;

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return res.status(200).json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      users: users.map((u) => ({
        ...u,
        role: String(u.role || "").toLowerCase(),
        status: u.status || (u.isActive === false ? "inactive" : "active"),
      })),
    });
  } catch (error) {
    console.error("GET_USERS_ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// POST /api/users
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "name, email, password and role are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const normalizedRole = String(role).toLowerCase().trim();

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
      status: "active",
    });

    return res.status(201).json({
      message: "User created successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("CREATE_USER_ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const updates = {};
    if (email) {
      const normalizedEmail = String(email).toLowerCase().trim();
      const duplicate = await User.findOne({ email: normalizedEmail, _id: { $ne: id } });
      if (duplicate) return res.status(400).json({ message: "Email already in use" });
      updates.email = normalizedEmail;
    }
    if (name) updates.name = String(name).trim();
    if (role) updates.role = String(role).toLowerCase().trim();

    const updated = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!updated) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: "User updated successfully",
      user: sanitizeUser(updated),
    });
  } catch (error) {
    console.error("UPDATE_USER_ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// PATCH /api/users/:id/status
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const normalizedStatus = String(status || "").toLowerCase().trim();

    if (!["active", "inactive"].includes(normalizedStatus)) {
      return res.status(400).json({ message: "status must be active or inactive" });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      {
        status: normalizedStatus,
        isActive: normalizedStatus === "active",
      },
      { new: true, runValidators: true }
    ).select("-password");
    if (!updated) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: "User status updated successfully",
      user: sanitizeUser(updated),
    });
  } catch (error) {
    console.error("UPDATE_USER_STATUS_ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

export { getAllUsers, createUser, updateUser, updateUserStatus };

