/**
 * Input validation and sanitization utilities
 */

// DOMPurify for XSS protection
const { JSDOM } = require('jsdom');
const DOMPurify = require('dompurify')(new JSDOM('').window);

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// URL validation regex - fallback for http/https (允许 https:// 这样的占位符)
const URL_REGEX = /^(https?:\/\/)([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$|^https?:\/\/$/;

const MAX_URL_LENGTH = 2048;
const ALLOWED_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

// XSS prevention - using DOMPurify for complete protection
function sanitizeHtml(input) {
  if (typeof input !== 'string') return input;

  // 使用DOMPurify进行完整的HTML清理
  // ALLOWED_TAGS: [] 表示移除所有HTML标签，只保留纯文本
  // ALLOWED_ATTR: [] 表示移除所有属性
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
  });
}

// Sanitize for display (允许安全的HTML，移除危险内容)
function sanitizeForDisplay(input) {
  if (typeof input !== 'string') return input;

  // 允许基本的HTML标签用于显示，但移除危险内容
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout'],
  });
}

// Validate email format
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
}

// Validate URL format — supports http, https, mailto, tel
function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (url.trim() === '') return true;
  if (url.length > MAX_URL_LENGTH) return false;

  try {
    const urlObj = new URL(url);
    return ALLOWED_PROTOCOLS.includes(urlObj.protocol);
  } catch {
    return URL_REGEX.test(url.trim());
  }
}

// Validate username (letters, numbers, underscores, 3-20 chars)
function isValidUsername(username) {
  if (!username || typeof username !== 'string') return false;
  return /^[a-zA-Z0-9_]{3,20}$/.test(username.trim());
}

// Validate password strength
function isValidPassword(password) {
  if (!password || typeof password !== 'string') return false;

  // At least 8 characters
  if (password.length < 8) return false;

  // At least one uppercase letter
  if (!/[A-Z]/.test(password)) return false;

  // At least one lowercase letter
  if (!/[a-z]/.test(password)) return false;

  // At least one number
  if (!/\d/.test(password)) return false;

  return true;
}

// Sanitize user input object
function sanitizeUserInput(input) {
  if (!input || typeof input !== 'object') return input;

  const sanitized = {};

  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'string') {
      // Different sanitization based on field type
      if (key.includes('url') || key.includes('website') || key.includes('link')) {
        sanitized[key] = sanitizeForDisplay(value.trim());
      } else if (key.includes('email') || key.includes('username')) {
        sanitized[key] = value.trim();
      } else {
        sanitized[key] = sanitizeHtml(value.trim());
      }
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

module.exports = {
  sanitizeHtml,
  sanitizeForDisplay,
  isValidEmail,
  isValidUrl,
  isValidUsername,
  isValidPassword,
  sanitizeUserInput,
};
