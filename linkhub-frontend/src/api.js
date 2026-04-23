const BASE = '/api';
const DEFAULT_TIMEOUT = 10000; // 10秒超时

function getToken() {
  return localStorage.getItem('lh_token');
}

/**
 * 带超时的fetch请求
 * @param {string} url - 请求URL
 * @param {Object} options - fetch选项
 * @param {number} timeout - 超时时间（毫秒）
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, options = {}, timeout = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`请求超时（${timeout}ms），请检查网络连接或稍后重试`);
    }
    throw error;
  }
}

async function request(method, path, body, timeout = DEFAULT_TIMEOUT) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetchWithTimeout(
    `${BASE}${path}`,
    {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    },
    timeout,
  );

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : {};
  if (!res.ok) throw new Error(data.error || '请求失败');
  return data;
}

export const api = {
  get: (path, timeout) => request('GET', path.replace(/^\/api/, ''), undefined, timeout),
  post: (path, body, timeout) => request('POST', path.replace(/^\/api/, ''), body, timeout),
  put: (path, body, timeout) => request('PUT', path.replace(/^\/api/, ''), body, timeout),
  delete: (path, body, timeout) => request('DELETE', path.replace(/^\/api/, ''), body, timeout),

  // Auth
  register: body => request('POST', '/auth/register', body),
  login: body => request('POST', '/auth/login', body),
  me: () => request('GET', '/auth/me'),

  // Profile (authed)
  getProfile: () => request('GET', '/profile'),
  updateProfile: body => request('PUT', '/profile', body),
  updateSocials: body => request('PUT', '/profile/socials', body),
  uploadAvatar: async file => {
    const formData = new FormData();
    formData.append('avatar', file);
    const token = localStorage.getItem('lh_token');
    const res = await fetch('/api/profile/avatar', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },
  addLink: body => request('POST', '/profile/links', body),
  updateLink: (id, body) => request('PUT', `/profile/links/${id}`, body),
  toggleLink: id => request('PUT', `/profile/links/${id}/toggle`),
  deleteLink: id => request('DELETE', `/profile/links/${id}`),
  reorderLinks: order => request('PUT', '/profile/links/reorder', { order }),
  batchToggleLinks: ids => request('PUT', '/profile/links/batch/toggle', { ids }),
  batchDeleteLinks: ids => request('DELETE', '/profile/links/batch', { ids }),
  getLinkAnalytics: () => request('GET', '/profile/links/analytics'),

  // Public page
  getPublicPage: username => request('GET', `/p/${username}`),
  trackClick: (username, link_id) => request('POST', `/p/${username}/click`, { link_id }),

  // Password
  forgotPassword: body => request('POST', '/auth/forgot-password', body),
  resetPassword: body => request('POST', '/auth/reset-password', body),
  changePassword: body => request('PUT', '/auth/change-password', body),

  // Analytics
  getAnalytics: () => request('GET', '/analytics'),

  // NFC Cards
  getNfcCards: () => request('GET', '/nfc/cards'),
  bindNfcCard: body => request('POST', '/nfc/cards', body),
  getNfcCard: id => request('GET', `/nfc/cards/${id}`),
  updateNfcCard: (id, body) => request('PUT', `/nfc/cards/${id}`, body),
  deleteNfcCard: id => request('DELETE', `/nfc/cards/${id}`),
  getNfcAnalytics: () => request('GET', '/nfc/analytics'),
  getNfcCardAnalytics: id => request('GET', `/nfc/cards/${id}/analytics`),
};
