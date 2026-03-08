const BASE = '/api'

function getToken() {
  return localStorage.getItem('lh_token')
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '请求失败')
  return data
}

export const api = {
  // Auth
  register: (body) => request('POST', '/auth/register', body),
  login:    (body) => request('POST', '/auth/login', body),
  me:       ()     => request('GET',  '/auth/me'),

  // Profile (authed)
  getProfile:    ()     => request('GET',  '/profile'),
  updateProfile: (body) => request('PUT',  '/profile', body),
  updateSocials: (body) => request('PUT',  '/profile/socials', body),
  addLink:       (body) => request('POST', '/profile/links', body),
  updateLink:    (id, body) => request('PUT',  `/profile/links/${id}`, body),
  deleteLink:    (id)       => request('DELETE', `/profile/links/${id}`),
  reorderLinks:  (order)    => request('PUT',  '/profile/links/reorder', { order }),

  // Public page
  getPublicPage: (username) => request('GET', `/p/${username}`),
  trackClick:    (username, link_id) => request('POST', `/p/${username}/click`, { link_id }),

  // Password
  forgotPassword: (body)        => request('POST', '/auth/forgot-password', body),
  resetPassword:  (body)        => request('POST', '/auth/reset-password', body),
  changePassword: (body)        => request('PUT',  '/auth/change-password', body),

  // Analytics
  getAnalytics: () => request('GET', '/analytics'),
}
