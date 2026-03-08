const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { query, run } = require("../db/setup");

const router = express.Router();

// GET /api/p/:username  — public-facing page data (no auth needed)
router.get("/:username", (req, res) => {
  try {
    const username = req.params.username.toLowerCase();

    const users = query("SELECT id FROM users WHERE username = ?", [username]);
    if (users.length === 0) {
      return res.status(404).json({ error: "用户不存在" });
    }

    const userId = users[0].id;

    const profiles = query("SELECT * FROM profiles WHERE user_id = ?", [userId]);
    const socials = query("SELECT * FROM socials WHERE user_id = ?", [userId]);
    const links = query(
      "SELECT * FROM links WHERE user_id = ? AND active = 1 ORDER BY sort_order ASC",
      [userId]
    );

    const profile = profiles[0] || {};
    const social = socials[0] || {};

    // Record a page view
    run("INSERT INTO analytics (id, user_id, event) VALUES (?, ?, ?)", [
      uuidv4(), userId, "page_view",
    ]);

    res.json({
      username,
      profile: {
        name: profile.name || username,
        bio: profile.bio || "",
        avatar_seed: profile.avatar_seed || 1,
        theme_id: profile.theme_id || "midnight",
        embed_url: profile.embed_url || "",
        show_embed: !!profile.show_embed,
      },
      socials: {
        instagram: social.instagram || "",
        twitter: social.twitter || "",
        github: social.github || "",
        youtube: social.youtube || "",
        tiktok: social.tiktok || "",
        website: social.website || "",
      },
      links: links.map((l) => ({
        id: l.id,
        label: l.label,
        url: l.url,
      })),
    });
  } catch (err) {
    console.error("Get page error:", err);
    res.status(500).json({ error: "加载页面失败" });
  }
});

// POST /api/p/:username/click  — track a link click
router.post("/:username/click", (req, res) => {
  try {
    const username = req.params.username.toLowerCase();
    const { link_id } = req.body;

    const users = query("SELECT id FROM users WHERE username = ?", [username]);
    if (users.length === 0) {
      return res.status(404).json({ error: "用户不存在" });
    }

    const userId = users[0].id;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    run("INSERT INTO analytics (id, user_id, link_id, event, ip) VALUES (?, ?, ?, ?, ?)", [
      uuidv4(), userId, link_id || null, "link_click", ip,
    ]);

    res.json({ ok: true });
  } catch (err) {
    console.error("Track click error:", err);
    res.status(500).json({ error: "记录失败" });
  }
});

module.exports = router;
