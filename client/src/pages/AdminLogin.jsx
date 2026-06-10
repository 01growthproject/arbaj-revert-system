import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../utils/api'

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .al-root {
    min-height: 100vh;
    background: #0b1120;
    font-family: 'DM Sans', sans-serif;
    display: flex; flex-direction: column;
  }

  /* NAVBAR */
  .al-nav {
    background: #111827;
    border-bottom: 1px solid #1e2d45;
    padding: 0 32px; height: 56px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .al-nav-brand { display: flex; align-items: center; gap: 10px; }
  .al-nav-icon {
    width: 32px; height: 32px;
    background: rgba(59,130,246,0.15); border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; color: #3b82f6;
  }
  .al-nav-title { font-size: 14px; font-weight: 700; color: #f1f5f9; }
  .al-nav-sub { font-size: 11px; color: #64748b; }
  .al-nav-back {
    font-size: 13px; color: #64748b;
    text-decoration: none; font-weight: 500;
    padding: 6px 14px; border-radius: 8px;
    border: 1px solid #1e2d45; transition: all 0.2s;
  }
  .al-nav-back:hover { background: #1a2235; color: #f1f5f9; }

  /* CENTER */
  .al-center {
    flex: 1; display: flex;
    align-items: center; justify-content: center;
    padding: 40px 20px;
  }

  /* CARD */
  .al-card {
    width: 100%; max-width: 400px;
    background: #111827;
    border: 1px solid #1e2d45;
    border-radius: 18px;
    padding: 36px 32px;
    position: relative; overflow: hidden;
  }
  .al-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, #3b82f6, #06b6d4);
    border-radius: 18px 18px 0 0;
  }
  .al-icon-wrap {
    width: 56px; height: 56px;
    background: rgba(59,130,246,0.12);
    border: 1px solid rgba(59,130,246,0.2);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; color: #3b82f6;
    margin: 0 auto 20px;
  }
  .al-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.6rem; font-weight: 400;
    text-align: center; color: #f1f5f9; margin-bottom: 6px;
  }
  .al-sub { text-align: center; color: #64748b; font-size: 13px; margin-bottom: 28px; }
  .al-label {
    display: block; font-size: 11px; font-weight: 700;
    color: #64748b; text-transform: uppercase;
    letter-spacing: 0.8px; margin-bottom: 7px;
  }
  .al-input {
    width: 100%; padding: 12px 14px;
    background: #1a2235; border: 1px solid #1e2d45;
    border-radius: 10px; color: #f1f5f9;
    font-family: 'DM Sans', sans-serif; font-size: 15px;
    letter-spacing: 0.08em; outline: none; transition: all 0.2s;
    margin-bottom: 20px;
  }
  .al-input:focus {
    border-color: #3b82f6;
    background: rgba(59,130,246,0.05);
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }
  .al-input::placeholder { color: #475569; letter-spacing: 0; }
  .al-btn {
    width: 100%; padding: 13px;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white; border: none; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 700;
    cursor: pointer; transition: all 0.25s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .al-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(59,130,246,0.3); }
  .al-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .al-error {
    background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
    color: #ef4444; padding: 11px 14px; border-radius: 10px;
    font-size: 13px; font-weight: 600; margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    .al-nav { padding: 0 16px; }
    .al-card { padding: 28px 20px; }
  }
`

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // ✅ Pehle se token hai toh seedha dashboard pe bhejo
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) navigate('/admin/dashboard', { replace: true })
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await API.post('/api/admin/login', { password })
      localStorage.setItem('adminToken', res.data.token)
      navigate('/admin/dashboard')
    } catch {
      setError('Invalid password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{styles}</style>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />

      <div className="al-root">

        {/* NAVBAR */}
        <nav className="al-nav">
          <div className="al-nav-brand">
            <div className="al-nav-icon">
              <i className="ti ti-world" aria-hidden="true"></i>
            </div>
            <div>
              <div className="al-nav-title">Arbaj Technology</div>
              <div className="al-nav-sub">Revert System</div>
            </div>
          </div>
          <a href="/" className="al-nav-back">
            <i className="ti ti-arrow-left" style={{ fontSize: 13, marginRight: 5 }} aria-hidden="true"></i>
            Agent Form
          </a>
        </nav>

        {/* LOGIN CARD */}
        <div className="al-center">
          <div className="al-card">
            <div className="al-icon-wrap">
              <i className="ti ti-lock" aria-hidden="true"></i>
            </div>
            <h1 className="al-title">Admin Panel</h1>
            <p className="al-sub">Arbaj Technology — Revert System</p>

            {error && <div className="al-error">⚠️ {error}</div>}

            <form onSubmit={handleLogin}>
              <label className="al-label">Password</label>
              <input
                className="al-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required autoFocus
              />
              <button type="submit" className="al-btn" disabled={loading}>
                <i className="ti ti-login" aria-hidden="true"></i>
                {loading ? 'Logging in...' : 'Login to Dashboard'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </>
  )
}