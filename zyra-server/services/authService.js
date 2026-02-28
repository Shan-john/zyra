const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { db } = require("../config/firebase");
const { ref, get, set, child } = require("firebase/database");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/env");

const ADMIN_SEED = {
  id: "user-admin",
  name: "Admin User",
  email: "admin@zyra.com",
  password: "", // will be set below with bcrypt hash
  role: "admin",
  department: "Management",
  lastLogin: null,
  createdAt: new Date().toISOString(),
};

// ─── JWT ──────────────────────────────────────────────────────────────────────
const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET || "zyra_secret_fallback",
    { expiresIn: JWT_EXPIRES_IN || "7d" }
  );

// ─── Seed admin user on first run ─────────────────────────────────────────────
const ensureAdminExists = async () => {
  const snap = await get(child(ref(db), "users/user-admin"));
  if (!snap.exists()) {
    const hash = await bcrypt.hash("Admin@123", 10);
    await set(ref(db, "users/user-admin"), { ...ADMIN_SEED, password: hash });
  }
};

// ─── Register ─────────────────────────────────────────────────────────────────
exports.register = async ({ name, email, password, role, department }) => {
  await ensureAdminExists();
  const snap = await get(child(ref(db), "users"));
  const users = snap.exists() ? Object.values(snap.val()) : [];
  if (users.find(u => u.email === email)) {
    throw Object.assign(new Error("Email already registered"), { statusCode: 409 });
  }
  const id = `user-${Date.now()}`;
  const hash = await bcrypt.hash(password, 10);
  const user = { id, name, email, password: hash, role: role || "staff", department: department || "", createdAt: new Date().toISOString() };
  await set(ref(db, `users/${id}`), user);
  const { password: _p, ...safeUser } = user;
  const token = generateToken(safeUser);
  return { user: safeUser, token };
};

// ─── Login ────────────────────────────────────────────────────────────────────
exports.login = async ({ email, password }) => {
  await ensureAdminExists();
  const snap = await get(child(ref(db), "users"));
  if (!snap.exists()) throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });
  const users = Object.values(snap.val());
  const user = users.find(u => u.email === email);
  if (!user) throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

  user.lastLogin = new Date().toISOString();
  await set(ref(db, `users/${user.id}`), user);

  const { password: _p, ...safeUser } = user;
  const token = generateToken(safeUser);
  return { user: safeUser, token };
};

// ─── Get Profile ──────────────────────────────────────────────────────────────
exports.getProfile = async (userId) => {
  const snap = await get(ref(db, `users/${userId}`));
  if (!snap.exists()) throw Object.assign(new Error("User not found"), { statusCode: 404 });
  const { password: _p, ...safeUser } = snap.val();
  return safeUser;
};
