const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { query, run, transaction } = require('../db/setup');
const { authMiddleware } = require('../middleware/auth');
const { isValidUrl, sanitizeForDisplay, sanitizeUserInput } = require('../utils/validation');

const router = express.Router();

// ── Avatar upload setup ────────────────────────────────────────────────────

const UPLOADS_DIR = path.join(__dirname, '../public/uploads/avatars');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${req.user.id}${ext}`);
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

// All routes require auth
router.use(authMiddleware);

// POST /api/profile/avatar
router.post('/avatar', uploadAvatar.single('avatar'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    run('UPDATE profiles SET avatar_url = ? WHERE user_id = ?', [avatarUrl, req.user.id]);
    res.json({ avatar_url: avatarUrl });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// GET /api/profile  — get full profile for logged-in user
router.get('/', (req, res) => {
  try {
    const userId = req.user.id;

    const profiles = query('SELECT * FROM profiles WHERE user_id = ?', [userId]);
    const socials = query('SELECT * FROM socials WHERE user_id = ?', [userId]);
    const links = query(
      'SELECT * FROM links WHERE user_id = ? ORDER BY sort_order ASC, created_at ASC',
      [userId],
    );

    const profile = profiles[0] || {};
    const social = socials[0] || {};

    res.json({
      profile: {
        name: profile.name || '',
        bio: profile.bio || '',
        avatar_seed: profile.avatar_seed || 1,
        avatar_url: profile.avatar_url || '',
        theme_id: profile.theme_id || 'midnight',
        embed_url: profile.embed_url || '',
        show_embed: !!profile.show_embed,
      },
      socials: {
        instagram: social.instagram || '',
        twitter: social.twitter || '',
        github: social.github || '',
        youtube: social.youtube || '',
        tiktok: social.tiktok || '',
        website: social.website || '',
      },
      links: links.map(l => ({
        id: l.id,
        label: l.label,
        url: l.url,
        active: !!l.active,
        sort_order: l.sort_order,
      })),
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: '获取资料失败' });
  }
});

// PUT /api/profile  — update profile info
router.put('/', (req, res) => {
  try {
    const userId = req.user.id;

    // Sanitize and validate input
    const sanitizedInput = sanitizeUserInput(req.body);
    let { name, bio, avatar_seed, theme_id, embed_url, show_embed } = sanitizedInput;

    // Validate embed_url if provided
    if (embed_url && embed_url.trim() !== '') {
      if (!isValidUrl(embed_url)) {
        return res.status(400).json({ error: '嵌入URL格式无效' });
      }
      // Sanitize URL for display
      embed_url = sanitizeForDisplay(embed_url);
    }

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
      [
        name,
        bio,
        avatar_seed,
        theme_id,
        embed_url,
        show_embed != null ? (show_embed ? 1 : 0) : null,
        userId,
      ],
    );

    res.json({ message: '资料已更新' });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: '更新失败' });
  }
});

// PUT /api/profile/socials
router.put('/socials', (req, res) => {
  try {
    const userId = req.user.id;

    // Sanitize and validate input
    const sanitizedInput = sanitizeUserInput(req.body);
    let { instagram, twitter, github, youtube, tiktok, website } = sanitizedInput;

    // Validate URLs
    const socialUrls = {
      website: website,
      instagram: instagram,
      twitter: twitter,
      github: github,
      youtube: youtube,
      tiktok: tiktok,
    };

    for (const [platform, url] of Object.entries(socialUrls)) {
      if (url && url.trim() !== '') {
        if (!isValidUrl(url)) {
          return res.status(400).json({ error: `${platform} URL格式无效` });
        }
        // Sanitize URL for display
        socialUrls[platform] = sanitizeForDisplay(url);
      }
    }

    run(
      `UPDATE socials SET
        instagram = COALESCE(?, instagram),
        twitter = COALESCE(?, twitter),
        github = COALESCE(?, github),
        youtube = COALESCE(?, youtube),
        tiktok = COALESCE(?, tiktok),
        website = COALESCE(?, website)
       WHERE user_id = ?`,
      [
        socialUrls.instagram,
        socialUrls.twitter,
        socialUrls.github,
        socialUrls.youtube,
        socialUrls.tiktok,
        socialUrls.website,
        userId,
      ],
    );

    res.json({ message: '社交账号已更新' });
  } catch (err) {
    console.error('Update socials error:', err);
    res.status(500).json({ error: '更新失败' });
  }
});

// POST /api/profile/links  — add a new link
router.post('/links', (req, res) => {
  try {
    const userId = req.user.id;
    const sanitizedInput = sanitizeUserInput(req.body);
    let { label = '', url = '' } = sanitizedInput;

    if (url && !isValidUrl(url)) {
      return res.status(400).json({ error: '链接URL格式无效' });
    }
    url = url ? sanitizeForDisplay(url) : '';
    label = label ? sanitizeForDisplay(label) : '';

    const existingLinks = query('SELECT COUNT(*) as cnt FROM links WHERE user_id = ?', [userId]);
    if (existingLinks[0].cnt >= 20) {
      return res.status(400).json({ error: '最多添加 20 个链接' });
    }

    const id = uuidv4();
    const sortOrder = existingLinks[0].cnt;
    run('INSERT INTO links (id, user_id, label, url, sort_order) VALUES (?, ?, ?, ?, ?)', [
      id,
      userId,
      label,
      url,
      sortOrder,
    ]);

    res
      .status(201)
      .json({
        message: '链接已添加',
        link: { id, label, url, active: true, sort_order: sortOrder },
      });
  } catch (err) {
    console.error('Add link error:', err);
    res.status(500).json({ error: '添加失败' });
  }
});

// GET /api/profile/links/analytics  — per-link click stats (must be before /:linkId)
router.get('/links/analytics', (req, res) => {
  try {
    const userId = req.user.id;
    const links = query(
      `SELECT l.id, l.label, l.url, l.active,
         COUNT(a.id) as click_count,
         MAX(a.created_at) as last_click_at
       FROM links l
       LEFT JOIN analytics a ON a.link_id = l.id AND a.event = 'link_click'
       WHERE l.user_id = ?
       GROUP BY l.id
       ORDER BY click_count DESC`,
      [userId],
    );
    res.json({
      links: links.map(l => ({
        id: l.id,
        label: l.label,
        url: l.url,
        active: !!l.active,
        click_count: l.click_count || 0,
        last_click_at: l.last_click_at || null,
      })),
    });
  } catch (err) {
    console.error('Link analytics error:', err);
    res.status(500).json({ error: '获取分析数据失败' });
  }
});

// PUT /api/profile/links/reorder  — must be before /:linkId to avoid route shadowing
router.put('/links/reorder', (req, res) => {
  try {
    const userId = req.user.id;
    const { order } = req.body;
    if (!Array.isArray(order)) {
      return res.status(400).json({ error: 'order 必须是数组' });
    }
    transaction(({ run }) => {
      order.forEach((linkId, index) => {
        run('UPDATE links SET sort_order = ? WHERE id = ? AND user_id = ?', [
          index,
          linkId,
          userId,
        ]);
      });
    });
    res.json({ message: '排序已更新' });
  } catch (err) {
    console.error('Reorder error:', err);
    res.status(500).json({ error: '排序失败' });
  }
});

// PUT /api/profile/links/batch/toggle  — batch toggle active state
router.put('/links/batch/toggle', (req, res) => {
  try {
    const userId = req.user.id;
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids 必须是非空数组' });
    }
    if (ids.length > 20) {
      return res.status(400).json({ error: '每次最多批量操作 20 个链接' });
    }

    const results = transaction(({ run, query }) => {
      return ids.map(id => {
        const rows = query('SELECT id, active FROM links WHERE id = ? AND user_id = ?', [
          id,
          userId,
        ]);
        if (rows.length === 0) return { id, success: false };
        const newActive = rows[0].active ? 0 : 1;
        run('UPDATE links SET active = ? WHERE id = ? AND user_id = ?', [newActive, id, userId]);
        return { id, success: true, active: !!newActive };
      });
    });

    res.json({ success: true, toggled: results.filter(r => r.success).length, results });
  } catch (err) {
    console.error('Batch toggle error:', err);
    res.status(500).json({ error: '批量切换失败' });
  }
});

// DELETE /api/profile/links/batch  — batch delete (must be before /:linkId)
router.delete('/links/batch', (req, res) => {
  try {
    const userId = req.user.id;
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids 必须是非空数组' });
    }
    if (ids.length > 20) {
      return res.status(400).json({ error: '每次最多批量删除 20 个链接' });
    }

    const results = transaction(({ run, query }) => {
      return ids.map(id => {
        const rows = query('SELECT id FROM links WHERE id = ? AND user_id = ?', [id, userId]);
        if (rows.length === 0) return { id, success: false };
        run('DELETE FROM links WHERE id = ? AND user_id = ?', [id, userId]);
        return { id, success: true };
      });
    });

    res.json({ success: true, deleted: results.filter(r => r.success).length, results });
  } catch (err) {
    console.error('Batch delete error:', err);
    res.status(500).json({ error: '批量删除失败' });
  }
});

// PUT /api/profile/links/:linkId/toggle  — toggle single link active state
router.put('/links/:linkId/toggle', (req, res) => {
  try {
    const userId = req.user.id;
    const { linkId } = req.params;
    const existing = query(
      'SELECT id, label, url, active FROM links WHERE id = ? AND user_id = ?',
      [linkId, userId],
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: '链接不存在' });
    }
    const newActive = existing[0].active ? 0 : 1;
    run('UPDATE links SET active = ? WHERE id = ? AND user_id = ?', [newActive, linkId, userId]);
    res.json({
      success: true,
      link: { id: linkId, label: existing[0].label, url: existing[0].url, active: !!newActive },
    });
  } catch (err) {
    console.error('Toggle link error:', err);
    res.status(500).json({ error: '切换失败' });
  }
});

// PUT /api/profile/links/:linkId  — update a link
router.put('/links/:linkId', (req, res) => {
  try {
    const userId = req.user.id;
    const { linkId } = req.params;
    const sanitizedInput = sanitizeUserInput(req.body);
    let { label, url, active } = sanitizedInput;

    const existing = query('SELECT id FROM links WHERE id = ? AND user_id = ?', [linkId, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: '链接不存在' });
    }
    if (url && url.trim() !== '') {
      if (!isValidUrl(url)) {
        return res.status(400).json({ error: '链接URL格式无效' });
      }
      url = sanitizeForDisplay(url);
    }
    if (label && label.trim() !== '') {
      label = sanitizeForDisplay(label);
    }

    run(
      `UPDATE links SET
        label = COALESCE(?, label),
        url = COALESCE(?, url),
        active = COALESCE(?, active)
       WHERE id = ? AND user_id = ?`,
      [label, url, active != null ? (active ? 1 : 0) : null, linkId, userId],
    );

    res.json({ message: '链接已更新' });
  } catch (err) {
    console.error('Update link error:', err);
    res.status(500).json({ error: '更新失败' });
  }
});

// DELETE /api/profile/links/:linkId
router.delete('/links/:linkId', (req, res) => {
  try {
    const userId = req.user.id;
    const { linkId } = req.params;
    const existing = query('SELECT id FROM links WHERE id = ? AND user_id = ?', [linkId, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: '链接不存在' });
    }
    run('DELETE FROM links WHERE id = ? AND user_id = ?', [linkId, userId]);
    res.json({ message: '链接已删除' });
  } catch (err) {
    console.error('Delete link error:', err);
    res.status(500).json({ error: '删除失败' });
  }
});

module.exports = router;
