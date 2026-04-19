const jwt = require('jsonwebtoken');

// Validate JWT_SECRET in production
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production');
    }
    console.warn(
      '⚠️  WARNING: Using default JWT secret. Set JWT_SECRET environment variable for production.',
    );
    return 'dev-secret-change-in-production';
  }

  // Validate secret strength in production
  if (process.env.NODE_ENV === 'production' && secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long in production');
  }

  return secret;
}

const JWT_SECRET = getJwtSecret();

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录，请先登录' });
  }

  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, username }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token 已过期或无效，请重新登录' });
  }
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

module.exports = { authMiddleware, signToken };
