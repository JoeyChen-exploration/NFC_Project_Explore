const express = require('express');
const { query } = require('../db/setup');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// GET /api/analytics  — summary stats
router.get('/', (req, res) => {
  try {
    const userId = req.user.id;

    // 合并查询：获取总览数据（减少数据库往返）
    const overview = query(
      `SELECT 
         (SELECT COUNT(*) FROM analytics WHERE user_id = ? AND event = 'page_view') as total_page_views,
         (SELECT COUNT(*) FROM analytics WHERE user_id = ? AND event = 'link_click') as total_link_clicks,
         (SELECT COUNT(*) FROM links WHERE user_id = ? AND active = 1) as active_links
      `,
      [userId, userId, userId],
    );

    const totalPageViews = overview[0]?.total_page_views || 0;
    const totalLinkClicks = overview[0]?.total_link_clicks || 0;
    const activeLinks = overview[0]?.active_links || 0;

    // Clicks per link (last 30 days)
    const clicksPerLink = query(
      `SELECT l.label, l.url, COUNT(a.id) as clicks
       FROM links l
       LEFT JOIN analytics a ON a.link_id = l.id AND a.event = 'link_click'
         AND a.created_at >= datetime('now', '-30 days')
       WHERE l.user_id = ?
       GROUP BY l.id
       ORDER BY clicks DESC`,
      [userId],
    );

    // Page views over last 7 days
    const dailyViews = query(
      `SELECT date(created_at) as date, COUNT(*) as count
       FROM analytics
       WHERE user_id = ? AND event = 'page_view'
         AND created_at >= datetime('now', '-7 days')
       GROUP BY date(created_at)
       ORDER BY date ASC`,
      [userId],
    );

    res.json({
      summary: {
        total_page_views: totalPageViews,
        total_link_clicks: totalLinkClicks,
        active_links: activeLinks,
      },
      clicks_per_link: clicksPerLink,
      daily_views_7d: dailyViews,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: '获取数据失败' });
  }
});

module.exports = router;
