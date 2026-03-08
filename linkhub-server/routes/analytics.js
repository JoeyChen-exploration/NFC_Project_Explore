const express = require("express");
const { query } = require("../db/setup");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

// GET /api/analytics  — summary stats
router.get("/", (req, res) => {
  try {
    const userId = req.user.id;

    // Total page views
    const pageViews = query(
      "SELECT COUNT(*) as total FROM analytics WHERE user_id = ? AND event = 'page_view'",
      [userId]
    );

    // Total link clicks
    const linkClicks = query(
      "SELECT COUNT(*) as total FROM analytics WHERE user_id = ? AND event = 'link_click'",
      [userId]
    );

    // Clicks per link (last 30 days)
    const clicksPerLink = query(
      `SELECT l.label, l.url, COUNT(a.id) as clicks
       FROM links l
       LEFT JOIN analytics a ON a.link_id = l.id AND a.event = 'link_click'
         AND a.created_at >= datetime('now', '-30 days')
       WHERE l.user_id = ?
       GROUP BY l.id
       ORDER BY clicks DESC`,
      [userId]
    );

    // Page views over last 7 days
    const dailyViews = query(
      `SELECT date(created_at) as date, COUNT(*) as count
       FROM analytics
       WHERE user_id = ? AND event = 'page_view'
         AND created_at >= datetime('now', '-7 days')
       GROUP BY date(created_at)
       ORDER BY date ASC`,
      [userId]
    );

    res.json({
      summary: {
        total_page_views: pageViews[0].total,
        total_link_clicks: linkClicks[0].total,
      },
      clicks_per_link: clicksPerLink,
      daily_views_7d: dailyViews,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: "获取数据失败" });
  }
});

module.exports = router;
