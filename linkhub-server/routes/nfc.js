const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { query, run } = require('../db/setup');
const { authMiddleware } = require('../middleware/auth');
const { sanitizeUserInput } = require('../utils/validation');

const router = express.Router();

const CARD_LIMIT = 20;

// ── 卡片管理 (需要认证) ──────────────────────────────────────────────────

// GET /api/nfc/cards — 获取用户所有卡片
router.get('/cards', authMiddleware, (req, res) => {
  try {
    const cards = query(
      `SELECT id, card_serial, card_name, activated_at, last_used_at,
              scan_count, active, created_at, updated_at
       FROM nfc_cards WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id],
    );
    res.json({ cards });
  } catch (err) {
    console.error('NFC get cards error:', err);
    res.status(500).json({ error: '获取卡片列表失败' });
  }
});

// POST /api/nfc/cards — 绑定新卡片
router.post('/cards', authMiddleware, (req, res) => {
  try {
    const { card_serial, card_name } = sanitizeUserInput(req.body);

    if (!card_serial) {
      return res.status(400).json({ error: '卡片序列号不能为空' });
    }
    if (!/^[a-fA-F0-9:]{4,32}$/.test(card_serial.trim())) {
      return res.status(400).json({ error: '卡片序列号格式无效（支持十六进制，4-32位）' });
    }

    const existing = query('SELECT id FROM nfc_cards WHERE user_id = ?', [req.user.id]);
    if (existing.length >= CARD_LIMIT) {
      return res.status(400).json({ error: `最多绑定 ${CARD_LIMIT} 张卡片` });
    }

    const serial = card_serial.trim().toUpperCase();
    const taken = query('SELECT id FROM nfc_cards WHERE card_serial = ?', [serial]);
    if (taken.length > 0) {
      return res.status(400).json({ error: '该卡片已被绑定' });
    }

    const id = uuidv4();
    const name = (card_name || '').trim().slice(0, 50) || '我的NFC名片';
    const now = new Date().toISOString();

    run(
      `INSERT INTO nfc_cards (id, user_id, card_serial, card_name, activated_at, active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [id, req.user.id, serial, name, now],
    );

    const card = query('SELECT * FROM nfc_cards WHERE id = ?', [id])[0];
    res.status(201).json({ message: '卡片绑定成功', card });
  } catch (err) {
    console.error('NFC bind card error:', err);
    res.status(500).json({ error: '绑定卡片失败' });
  }
});

// GET /api/nfc/cards/:id — 获取单张卡片详情
router.get('/cards/:id', authMiddleware, (req, res) => {
  try {
    const cards = query('SELECT * FROM nfc_cards WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.user.id,
    ]);
    if (cards.length === 0) return res.status(404).json({ error: '卡片不存在' });
    res.json({ card: cards[0] });
  } catch (err) {
    console.error('NFC get card error:', err);
    res.status(500).json({ error: '获取卡片失败' });
  }
});

// PUT /api/nfc/cards/:id — 更新卡片（名称、状态）
router.put('/cards/:id', authMiddleware, (req, res) => {
  try {
    const cards = query('SELECT id FROM nfc_cards WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.user.id,
    ]);
    if (cards.length === 0) return res.status(404).json({ error: '卡片不存在' });

    const { card_name, active } = sanitizeUserInput(req.body);
    const updates = [];
    const params = [];

    if (card_name !== undefined) {
      updates.push('card_name = ?');
      params.push(card_name.trim().slice(0, 50));
    }
    if (active !== undefined) {
      updates.push('active = ?');
      params.push(active ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: '没有可更新的字段' });
    }

    updates.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(req.params.id);

    run(`UPDATE nfc_cards SET ${updates.join(', ')} WHERE id = ?`, params);

    const card = query('SELECT * FROM nfc_cards WHERE id = ?', [req.params.id])[0];
    res.json({ message: '更新成功', card });
  } catch (err) {
    console.error('NFC update card error:', err);
    res.status(500).json({ error: '更新卡片失败' });
  }
});

// DELETE /api/nfc/cards/:id — 解绑卡片
router.delete('/cards/:id', authMiddleware, (req, res) => {
  try {
    const cards = query('SELECT id FROM nfc_cards WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.user.id,
    ]);
    if (cards.length === 0) return res.status(404).json({ error: '卡片不存在' });

    run('DELETE FROM nfc_cards WHERE id = ?', [req.params.id]);
    res.json({ message: '卡片已解绑' });
  } catch (err) {
    console.error('NFC delete card error:', err);
    res.status(500).json({ error: '解绑卡片失败' });
  }
});

// ── 分析数据 (需要认证) ──────────────────────────────────────────────────

// GET /api/nfc/analytics — 汇总统计
router.get('/analytics', authMiddleware, (req, res) => {
  try {
    const cards = query(
      `SELECT c.id, c.card_serial, c.card_name, c.scan_count, c.active,
              c.activated_at, c.last_used_at,
              COUNT(s.id) AS recent_scans
       FROM nfc_cards c
       LEFT JOIN nfc_scans s ON s.card_id = c.id
         AND s.created_at >= datetime('now', '-30 days')
       WHERE c.user_id = ?
       GROUP BY c.id
       ORDER BY c.scan_count DESC`,
      [req.user.id],
    );

    const total_scans = cards.reduce((sum, c) => sum + (c.scan_count || 0), 0);
    const active_cards = cards.filter(c => c.active).length;

    // 过去7天每日扫描趋势（跨所有卡片）
    const daily = query(
      `SELECT date(s.created_at) AS date, COUNT(*) AS count
       FROM nfc_scans s
       JOIN nfc_cards c ON c.id = s.card_id
       WHERE c.user_id = ? AND s.created_at >= datetime('now', '-7 days')
       GROUP BY date(s.created_at)
       ORDER BY date`,
      [req.user.id],
    );

    res.json({
      summary: { total_scans, active_cards, total_cards: cards.length },
      cards,
      daily_scans_7d: daily,
    });
  } catch (err) {
    console.error('NFC analytics error:', err);
    res.status(500).json({ error: '获取分析数据失败' });
  }
});

// GET /api/nfc/cards/:id/analytics — 单张卡片详细扫描记录
router.get('/cards/:id/analytics', authMiddleware, (req, res) => {
  try {
    const cards = query(
      'SELECT id, card_serial, card_name, scan_count FROM nfc_cards WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id],
    );
    if (cards.length === 0) return res.status(404).json({ error: '卡片不存在' });

    const scans = query(
      `SELECT id, created_at FROM nfc_scans
       WHERE card_id = ? ORDER BY created_at DESC LIMIT 100`,
      [req.params.id],
    );

    const daily = query(
      `SELECT date(created_at) AS date, COUNT(*) AS count
       FROM nfc_scans WHERE card_id = ? AND created_at >= datetime('now', '-30 days')
       GROUP BY date(created_at) ORDER BY date`,
      [req.params.id],
    );

    res.json({ card: cards[0], recent_scans: scans, daily_30d: daily });
  } catch (err) {
    console.error('NFC card analytics error:', err);
    res.status(500).json({ error: '获取卡片分析数据失败' });
  }
});

// ── NFC 扫描重定向 (公开，挂载在根路由) ─────────────────────────────────
// 注意：此处理函数由 index.js 以 router.scanRedirect 方式导出

router.scanRedirect = function (req, res) {
  const serial = (req.params.cardSerial || '').toUpperCase();
  if (!serial) return res.status(400).send('无效的卡片序列号');

  try {
    const cards = query(
      `SELECT c.id, c.active, c.user_id, u.username
       FROM nfc_cards c JOIN users u ON u.id = c.user_id
       WHERE c.card_serial = ?`,
      [serial],
    );

    if (cards.length === 0 || !cards[0].active) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(302, `${frontendUrl}/404`);
    }

    const card = cards[0];

    // 异步记录扫描（不阻塞重定向）
    setImmediate(() => {
      try {
        const scanId = uuidv4();
        const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        // 匿名化：只保留前三段 IP
        const ip = rawIp.split('.').slice(0, 3).join('.') + '.0';
        const userAgent = (req.headers['user-agent'] || '').slice(0, 200);

        run('INSERT INTO nfc_scans (id, card_id, user_agent, ip) VALUES (?, ?, ?, ?)', [
          scanId,
          card.id,
          userAgent,
          ip,
        ]);
        run('UPDATE nfc_cards SET scan_count = scan_count + 1, last_used_at = ? WHERE id = ?', [
          new Date().toISOString(),
          card.id,
        ]);
      } catch (e) {
        console.error('NFC scan record error:', e);
      }
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(302, `${frontendUrl}/${card.username}`);
  } catch (err) {
    console.error('NFC scan redirect error:', err);
    res.status(500).send('服务器错误');
  }
};

module.exports = router;
