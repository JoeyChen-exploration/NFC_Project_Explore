import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api'
import ProfilePreview from '../components/ProfilePreview'

export default function PublicPage() {
  const { username } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getPublicPage(username)
      .then(setData)
      .catch(e => setError(e.message))
  }, [username])

  function handleLinkClick(linkId) {
    api.trackClick(username, linkId).catch(() => {})
  }

  if (error) return (
    <div style={{
      minHeight: '100vh', background: '#080808',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif", color: '#555',
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>404</div>
      <div style={{ fontSize: 16, marginBottom: 8 }}>找不到用户 <strong style={{ color: '#8b5cf6' }}>@{username}</strong></div>
      <div style={{ fontSize: 13, color: '#3a3a3a' }}>也许他们还没注册？</div>
      <a href="/login" style={{ marginTop: 24, fontSize: 13, color: '#8b5cf6', textDecoration: 'none' }}>创建你自己的主页 →</a>
    </div>
  )

  if (!data) return (
    <div style={{
      minHeight: '100vh', background: '#080808',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%', background: '#333',
            animation: `pulse 1.2s ${i * 0.2}s ease-in-out infinite`,
          }} />
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:.2} 50%{opacity:1} }`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1 }}>
        <ProfilePreview data={data} onLinkClick={handleLinkClick} />
      </div>
    </div>
  )
}
