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

module.exports = router;
