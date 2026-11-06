require("dotenv").config();
const express = require("express");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || "./data/invitations.sqlite";
const SESSION_SECRET = process.env.SESSION_SECRET;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
  throw new Error("SESSION_SECRET must be at least 32 characters.");
}
if (!ADMIN_USERNAME || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
  throw new Error("Set ADMIN_USERNAME and ADMIN_PASSWORD (at least 12 characters) in environment variables.");
}

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`);

const getSetting = db.prepare("SELECT value FROM settings WHERE key = ?");
const setSetting = db.prepare("INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value");

const adminHash = bcrypt.hashSync(ADMIN_PASSWORD, 12);
const existingAdmin = db.prepare("SELECT id FROM users WHERE username = ?").get(ADMIN_USERNAME);
if (!existingAdmin) {
  db.prepare("INSERT INTO users(username,password_hash,display_name,active) VALUES(?,?,?,1)")
    .run(ADMIN_USERNAME, adminHash, "Quản trị viên");
} else {
  db.prepare("UPDATE users SET password_hash=?, active=1 WHERE username=?").run(adminHash, ADMIN_USERNAME);
}

const defaults = {
  title: "THƯ MỜI KỶ YẾU",
  subtitle: "Một chương thanh xuân sắp khép lại...",
  body: "Hãy cùng chúng mình lưu giữ những khoảnh khắc đáng nhớ của tuổi học trò. Sự hiện diện của bạn sẽ làm ngày đặc biệt này trọn vẹn hơn!",
  date: "Ngày tổ chức: Sẽ được cập nhật",
  location: "Địa điểm: Sẽ được cập nhật",
  closing: "Hẹn gặp bạn tại ngày hội thanh xuân!"
};
for (const [k, v] of Object.entries(defaults)) {
  if (!getSetting.get(k)) setSetting.run(k, v);
}

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));
app.use(express.urlencoded({ extended: false, limit: "20kb" }));
app.use(express.json({ limit: "20kb" }));
app.use(session({
  store: new SQLiteStore({ db: "sessions.sqlite", dir: path.dirname(DB_PATH) }),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 8
  }
}));
app.use(express.static(path.join(__dirname, "public")));

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: "draft-7", legacyHeaders: false });
const adminLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: "draft-7", legacyHeaders: false });

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "Vui lòng đăng nhập." });
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.username.toLowerCase() !== ADMIN_USERNAME.toLowerCase()) {
    return res.status(403).json({ error: "Bạn không có quyền thực hiện thao tác này." });
  }
  next();
}
function safeUser(row) {
  return { id: row.id, username: row.username, displayName: row.display_name, active: !!row.active, createdAt: row.created_at };
}

app.post("/api/login", loginLimiter, (req, res) => {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");
  const user = db.prepare("SELECT * FROM users WHERE username = ? COLLATE NOCASE").get(username);
  if (!user || !user.active || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Tên đăng nhập hoặc mật khẩu không đúng." });
  }
  req.session.regenerate(err => {
    if (err) return res.status(500).json({ error: "Không thể tạo phiên đăng nhập." });
    req.session.user = safeUser(user);
    res.json({ user: req.session.user, isAdmin: user.username.toLowerCase() === ADMIN_USERNAME.toLowerCase() });
  });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get("/api/me", (req, res) => {
  if (!req.session.user) return res.json({ loggedIn: false });
  const row = db.prepare("SELECT * FROM users WHERE id=?").get(req.session.user.id);
  if (!row || !row.active) {
    req.session.destroy(() => {});
    return res.json({ loggedIn: false });
  }
  req.session.user = safeUser(row);
  res.json({ loggedIn: true, user: req.session.user, isAdmin: row.username.toLowerCase() === ADMIN_USERNAME.toLowerCase() });
});

app.get("/api/invitation", requireAuth, (req, res) => {
  const settings = Object.fromEntries(db.prepare("SELECT key,value FROM settings").all().map(x => [x.key, x.value]));
  res.json({ guestName: req.session.user.displayName, settings });
});

app.get("/api/admin/users", requireAdmin, (req, res) => {
  const rows = db.prepare("SELECT * FROM users ORDER BY created_at DESC").all();
  res.json(rows.map(safeUser));
});

app.post("/api/admin/users", adminLimiter, requireAdmin, (req, res) => {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");
  const displayName = String(req.body.displayName || "").trim();
  if (!/^[a-zA-Z0-9_.-]{3,32}$/.test(username)) return res.status(400).json({ error: "Tên tài khoản cần 3–32 ký tự: chữ, số, dấu chấm, gạch dưới hoặc gạch ngang." });
  if (password.length < 10 || password.length > 128) return res.status(400).json({ error: "Mật khẩu cần từ 10 đến 128 ký tự." });
  if (!displayName || displayName.length > 80) return res.status(400).json({ error: "Tên người được mời không hợp lệ (tối đa 80 ký tự)." });
  try {
    const hash = bcrypt.hashSync(password, 12);
    const result = db.prepare("INSERT INTO users(username,password_hash,display_name) VALUES(?,?,?)").run(username, hash, displayName);
    res.json({ user: safeUser(db.prepare("SELECT * FROM users WHERE id=?").get(result.lastInsertRowid)) });
  } catch (e) {
    if (String(e.message).includes("UNIQUE")) return res.status(409).json({ error: "Tên tài khoản đã tồn tại." });
    res.status(500).json({ error: "Không thể tạo tài khoản." });
  }
});

app.patch("/api/admin/users/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const target = db.prepare("SELECT * FROM users WHERE id=?").get(id);
  if (!target) return res.status(404).json({ error: "Không tìm thấy tài khoản." });
  if (target.username.toLowerCase() === ADMIN_USERNAME.toLowerCase()) return res.status(400).json({ error: "Không thể khóa tài khoản quản trị." });
  db.prepare("UPDATE users SET active=? WHERE id=?").run(req.body.active ? 1 : 0, id);
  res.json({ ok: true });
});

app.delete("/api/admin/users/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const target = db.prepare("SELECT * FROM users WHERE id=?").get(id);
  if (!target) return res.status(404).json({ error: "Không tìm thấy tài khoản." });
  if (target.username.toLowerCase() === ADMIN_USERNAME.toLowerCase()) return res.status(400).json({ error: "Không thể xóa tài khoản quản trị." });
  db.prepare("DELETE FROM users WHERE id=?").run(id);
  res.json({ ok: true });
});

app.put("/api/admin/settings", requireAdmin, (req, res) => {
  const allowed = ["title", "subtitle", "body", "date", "location", "closing"];
  for (const key of allowed) {
    if (typeof req.body[key] === "string" && req.body[key].length <= 1200) setSetting.run(key, req.body[key]);
  }
  res.json({ ok: true });
});

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, () => console.log(`Dragon Invitation running on port ${PORT}`));
