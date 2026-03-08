const express = require("express");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { query, run } = require("../db/setup");
const { signToken } = require("../middleware/auth");

const router = express.Router();

// Validate username: letters, numbers, underscores, 3-20 chars
function isValidUsername(u) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(u);
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: "邮箱、用户名和密码不能为空" });
    }
    if (!isValidUsername(username)) {
      return res.status(400).json({ error: "用户名只能包含字母、数字、下划线，长度 3-20 位" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "密码至少 6 位" });
    }

    // Check duplicates
    const existingEmail = query("SELECT id FROM users WHERE email = ?", [email]);
    if (existingEmail.length > 0) {
      return res.status(400).json({ error: "该邮箱已被注册" });
    }
    const existingUsername = query("SELECT id FROM users WHERE username = ?", [username.toLowerCase()]);
    if (existingUsername.length > 0) {
      return res.status(400).json({ error: "该用户名已被占用" });
    }

    const id = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);
    const lowerUsername = username.toLowerCase();

    // Create user
    run("INSERT INTO users (id, email, username, password_hash) VALUES (?, ?, ?, ?)", [
      id, email, lowerUsername, passwordHash,
    ]);

    // Create default profile
    run("INSERT INTO profiles (user_id, name) VALUES (?, ?)", [id, username]);

    // Create empty socials record
    run("INSERT INTO socials (user_id) VALUES (?)", [id]);

    const token = signToken({ id, email, username: lowerUsername });

    res.status(201).json({
      message: "注册成功 🎉",
      token,
      user: { id, email, username: lowerUsername },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "注册失败，请稍后重试" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "邮箱和密码不能为空" });
    }

    const users = query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: "邮箱或密码错误" });
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "邮箱或密码错误" });
    }

    const token = signToken({ id: user.id, email: user.email, username: user.username });

    res.json({
      message: "登录成功",
      token,
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "登录失败，请稍后重试" });
  }
});

// GET /api/auth/me  (验证 token，获取当前用户)
router.get("/me", require("../middleware/auth").authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "请输入邮箱" });

    const users = query("SELECT id FROM users WHERE email = ?", [email]);
    // Always return success to prevent email enumeration
    if (users.length === 0) {
      return res.json({ message: "如果该邮箱已注册，重置链接已发送到你的邮箱" });
    }

    const token = uuidv4().replace(/-/g, "");
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    run("UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?", [
      token, expires, users[0].id,
    ]);

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}`;
    console.log(`\n🔑 [密码重置链接] ${resetUrl}\n`);

    const resp = { message: "如果该邮箱已注册，重置链接已发送到你的邮箱" };
    // In dev mode, return the URL directly so the feature is usable without email setup
    if (process.env.NODE_ENV !== "production") {
      resp.dev_reset_url = resetUrl;
      resp.dev_token = token;
    }
    res.json(resp);
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "操作失败，请稍后重试" });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: "参数不完整" });
    if (newPassword.length < 6) return res.status(400).json({ error: "新密码至少 6 位" });

    const users = query(
      "SELECT id, reset_expires FROM users WHERE reset_token = ?", [token]
    );
    if (users.length === 0) {
      return res.status(400).json({ error: "重置链接无效或已过期" });
    }

    if (new Date(users[0].reset_expires) < new Date()) {
      return res.status(400).json({ error: "重置链接已过期，请重新申请" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    run(
      "UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?",
      [passwordHash, users[0].id]
    );

    res.json({ message: "密码已重置，请用新密码登录" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "重置失败，请稍后重试" });
  }
});

// PUT /api/auth/change-password  (requires auth)
router.put("/change-password", require("../middleware/auth").authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "请填写当前密码和新密码" });
    }
    if (newPassword.length < 6) return res.status(400).json({ error: "新密码至少 6 位" });

    const users = query("SELECT password_hash FROM users WHERE id = ?", [req.user.id]);
    if (users.length === 0) return res.status(404).json({ error: "用户不存在" });

    const valid = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!valid) return res.status(400).json({ error: "当前密码不正确" });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    run("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, req.user.id]);

    res.json({ message: "密码已修改成功" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "修改失败，请稍后重试" });
  }
});

module.exports = router;
