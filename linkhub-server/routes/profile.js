const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { query, run } = require("../db/setup");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// All routes require auth
router.use(authMiddleware);

// GET /api/profile  — get full profile for logged-in user
router.get("/", (req, res) => {
  try {
    const userId = req.user.id;

    const profiles = query("SELECT * FROM profiles WHERE user_id = ?", [userId]);
    const socials = query("SELECT * FROM socials WHERE user_id = ?", [userId]);
    const links = query(
      "SELECT * FROM links WHERE user_id = ? ORDER BY sort_order ASC, created_at ASC",
      [userId]
    );

    const profile = profiles[0] || {};
    const social = socials[0] || {};

    res.json({
      profile: {
        name: profile.name || "",
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
        active: !!l.active,
        sort_order: l.sort_order,
      })),
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "获取资料失败" });
  }
});

// PUT /api/profile  — update profile info
router.put("/", (req, res) => {
  try {
    const userId = req.user.id;
    const { name, bio, avatar_seed, theme_id, embed_url, show_embed } = req.body;

    run(
      `UPDATE profiles SET
        name = COALESCE(?, name),
        bio = COALESCE(?, bio),
        avatar_seed = COALESCE(?, avatar_seed),
        theme_id = COALESCE(?, theme_id),
        embed_url = COALESCE(?, embed_url),
        show_embed = COALESCE(?, show_embed),
        updated_at = datetime('now')
       WHERE user_id = ?`,
      [name, bio, avatar_seed, theme_id, embed_url, show_embed != null ? (show_embed ? 1 : 0) : null, userId]
    );

    res.json({ message: "资料已更新" });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "更新失败" });
  }
});

// PUT /api/profile/socials
router.put("/socials", (req, res) => {
  try {
    const userId = req.user.id;
    const { instagram, twitter, github, youtube, tiktok, website } = req.body;

    run(
      `UPDATE socials SET
        instagram = COALESCE(?, instagram),
        twitter = COALESCE(?, twitter),
        github = COALESCE(?, github),
        youtube = COALESCE(?, youtube),
        tiktok = COALESCE(?, tiktok),
        website = COALESCE(?, website)
       WHERE user_id = ?`,
      [instagram, twitter, github, youtube, tiktok, website, userId]
    );

    res.json({ message: "社交账号已更新" });
  } catch (err) {
    console.error("Update socials error:", err);
    res.status(500).json({ error: "更新失败" });
  }
});

// POST /api/profile/links  — add a new link
router.post("/links", (req, res) => {
  try {
    const userId = req.user.id;
    const { label, url } = req.body;

    if (!label || !url) {
      return res.status(400).json({ error: "标题和链接不能为空" });
    }

    const existingLinks = query("SELECT COUNT(*) as cnt FROM links WHERE user_id = ?", [userId]);
    if (existingLinks[0].cnt >= 20) {
      return res.status(400).json({ error: "最多添加 20 个链接" });
    }

    const id = uuidv4();
    const sortOrder = existingLinks[0].cnt;

    run("INSERT INTO links (id, user_id, label, url, sort_order) VALUES (?, ?, ?, ?, ?)", [
      id, userId, label, url, sortOrder,
    ]);

    res.status(201).json({ message: "链接已添加", link: { id, label, url, active: true, sort_order: sortOrder } });
  } catch (err) {
    console.error("Add link error:", err);
    res.status(500).json({ error: "添加失败" });
  }
});

// PUT /api/profile/links/:linkId  — update a link
router.put("/links/:linkId", (req, res) => {
  try {
    const userId = req.user.id;
    const { linkId } = req.params;
    const { label, url, active } = req.body;

    const existing = query("SELECT id FROM links WHERE id = ? AND user_id = ?", [linkId, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "链接不存在" });
    }

    run(
      `UPDATE links SET
        label = COALESCE(?, label),
        url = COALESCE(?, url),
        active = COALESCE(?, active)
       WHERE id = ? AND user_id = ?`,
      [label, url, active != null ? (active ? 1 : 0) : null, linkId, userId]
    );

    res.json({ message: "链接已更新" });
  } catch (err) {
    console.error("Update link error:", err);
    res.status(500).json({ error: "更新失败" });
  }
});

// DELETE /api/profile/links/:linkId
router.delete("/links/:linkId", (req, res) => {
  try {
    const userId = req.user.id;
    const { linkId } = req.params;

    const existing = query("SELECT id FROM links WHERE id = ? AND user_id = ?", [linkId, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "链接不存在" });
    }

    run("DELETE FROM links WHERE id = ? AND user_id = ?", [linkId, userId]);
    res.json({ message: "链接已删除" });
  } catch (err) {
    console.error("Delete link error:", err);
    res.status(500).json({ error: "删除失败" });
  }
});

// PUT /api/profile/links/reorder  — drag-and-drop reorder
router.put("/links/reorder", (req, res) => {
  try {
    const userId = req.user.id;
    const { order } = req.body; // array of link IDs in new order

    if (!Array.isArray(order)) {
      return res.status(400).json({ error: "order 必须是数组" });
    }

    order.forEach((linkId, index) => {
      run("UPDATE links SET sort_order = ? WHERE id = ? AND user_id = ?", [index, linkId, userId]);
    });

    res.json({ message: "排序已更新" });
  } catch (err) {
    console.error("Reorder error:", err);
    res.status(500).json({ error: "排序失败" });
  }
});

module.exports = router;
