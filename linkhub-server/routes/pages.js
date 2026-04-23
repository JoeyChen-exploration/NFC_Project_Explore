const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { query, run } = require('../db/setup');

const router = express.Router();

/**
 * IP地址匿名化函数
 * 移除IPv4地址的最后一段（如 192.168.1.100 → 192.168.1.0）
 * 对于IPv6或其他格式，返回 'anonymous'
 * @param {string} ip - 原始IP地址
 * @returns {string} 匿名化的IP地址
 */
function anonymizeIp(ip) {
  if (!ip || ip === 'unknown') {
    return 'anonymous';
  }

  // 处理IPv4地址
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      // 移除最后一段
      parts[3] = '0';
      return parts.join('.');
    }
  }

  // 处理IPv6地址（简化处理）
  if (ip.includes(':')) {
    return 'ipv6:anonymous';
  }

  // 其他格式返回匿名标识
  return 'anonymous';
}

// GET /api/p/:username  — public-facing page data (no auth needed)
router.get('/:username', (req, res) => {
  try {
    const username = req.params.username.toLowerCase();

    const users = query('SELECT id FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const userId = users[0].id;

    const publishedProfiles = query('SELECT * FROM published_profiles WHERE user_id = ?', [userId]);
    const publishedSocials = query('SELECT * FROM published_socials WHERE user_id = ?', [userId]);
    const publishedLinks = query(
      'SELECT * FROM published_links WHERE user_id = ? AND active = 1 ORDER BY sort_order ASC',
      [userId],
    );

    // Fallback for legacy data: if no published snapshot exists yet, read draft tables.
    const shouldFallbackToDraft = publishedProfiles.length === 0;
    const profiles = shouldFallbackToDraft
      ? query('SELECT * FROM profiles WHERE user_id = ?', [userId])
      : publishedProfiles;
    const socials = shouldFallbackToDraft
      ? query('SELECT * FROM socials WHERE user_id = ?', [userId])
      : publishedSocials;
    const links = shouldFallbackToDraft
      ? query('SELECT * FROM links WHERE user_id = ? AND active = 1 ORDER BY sort_order ASC', [
          userId,
        ])
      : publishedLinks;

    const profile = profiles[0] || {};
    const social = socials[0] || {};

    // Record a page view
    // 获取IP地址并匿名化处理（移除最后一段）
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const anonymizedIp = anonymizeIp(ip);

    run('INSERT INTO analytics (id, user_id, event, ip) VALUES (?, ?, ?, ?)', [
      uuidv4(),
      userId,
      'page_view',
      anonymizedIp,
    ]);

    res.json({
      username,
      profile: {
        name: profile.name || username,
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
      })),
    });
  } catch (err) {
    console.error('Get page error:', err);
    res.status(500).json({ error: '加载页面失败' });
  }
});

// POST /api/p/:username/click  — track a link click
router.post('/:username/click', (req, res) => {
  try {
    const username = req.params.username.toLowerCase();
    const { link_id } = req.body;

    const users = query('SELECT id FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const userId = users[0].id;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    run('INSERT INTO analytics (id, user_id, link_id, event, ip) VALUES (?, ?, ?, ?, ?)', [
      uuidv4(),
      userId,
      link_id || null,
      'link_click',
      ip,
    ]);

    res.json({ ok: true });
  } catch (err) {
    console.error('Track click error:', err);
    res.status(500).json({ error: '记录失败' });
  }
});

module.exports = router;
