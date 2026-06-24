import { useState, useCallback } from 'react'
import API from '../utils/api'

const today = new Date().toISOString().split('T')[0]
const todayDisplay = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .mr-root {
    min-height: 100vh;
    background: #0b1120;
    font-family: 'DM Sans', sans-serif;
    color: #f1f5f9;
  }

  .mr-nav {
    background: #111827; border-bottom: 1px solid #1e2d45;
    padding: 0 28px; height: 56px;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 100;
  }
  .mr-nav-brand { display: flex; align-items: center; gap: 10px; }
  .mr-nav-icon {
    width: 30px; height: 30px;
    background: rgba(59,130,246,0.15); border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; color: #3b82f6;
  }
  .mr-nav-title { font-size: 13px; font-weight: 700; color: #f1f5f9; }
  .mr-nav-sub { font-size: 11px; color: #64748b; }
  .mr-nav-links { display: flex; align-items: center; gap: 6px; }
  .mr-nav-btn {
    font-size: 13px; color: #64748b;
    padding: 6px 14px; border-radius: 8px;
    border: none; background: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-weight: 500;
    transition: all 0.2s; text-decoration: none;
  }
  .mr-nav-btn:hover { background: #1a2235; color: #f1f5f9; }
  .mr-nav-btn.active { background: rgba(59,130,246,0.15); color: #3b82f6; }
  .mr-nav-admin {
    font-size: 12px; color: #64748b;
    padding: 6px 14px; border-radius: 8px;
    border: 1px solid #1e2d45;
    text-decoration: none; font-weight: 500;
    transition: all 0.2s;
  }
  .mr-nav-admin:hover { background: #1a2235; color: #f1f5f9; }

  .mr-hamburger { display: none; background: none; border: none; color: #f1f5f9; font-size: 22px; cursor: pointer; padding: 6px 8px; line-height: 1; align-items: center; justify-content: center; min-width: 36px; min-height: 36px; }
  .mr-mob-menu { display: none; flex-direction: column; background: #111827; border-bottom: 1px solid #1e2d45; padding: 8px 16px 12px; gap: 4px; }
  .mr-mob-menu.open { display: flex; }
  .mr-mob-link { font-size: 13px; color: #64748b; padding: 8px 12px; border-radius: 8px; text-decoration: none; font-weight: 500; }
  .mr-mob-link.active { background: rgba(59,130,246,0.15); color: #3b82f6; }

  .mr-page-header {
    background: #111827; border-bottom: 1px solid #1e2d45;
    padding: 18px 28px;
  }
  .mr-page-label { font-size: 10px; color: #3b82f6; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 3px; }
  .mr-page-title { font-family: 'DM Serif Display', serif; font-size: 1.5rem; font-weight: 400; }
  .mr-page-sub { font-size: 12px; color: #64748b; margin-top: 3px; }

  .mr-content {
    max-width: 1100px;
    margin: 0 auto;
    padding: 24px 24px 60px;
    display: flex; flex-direction: column; gap: 16px;
  }

  .mr-card { background: #111827; border: 1px solid #1e2d45; border-radius: 14px; padding: 18px 20px; }
  .mr-card-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.1rem; font-weight: 400; margin-bottom: 14px; color: #f1f5f9;
    display: flex; align-items: center; gap: 8px;
  }

  .mr-search-grid { display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px; align-items: flex-end; }
  .mr-field { display: flex; flex-direction: column; gap: 6px; }
  .mr-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.7px; }
  .mr-input {
    width: 100%; padding: 10px 13px; height: 38px;
    background: #1a2235; border: 1px solid #1e2d45;
    border-radius: 10px; color: #f1f5f9;
    font-family: 'DM Sans', sans-serif; font-size: 13px;
    outline: none; transition: all 0.2s;
  }
  .mr-input:focus { border-color: #3b82f6; background: rgba(59,130,246,0.05); box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .mr-input::placeholder { color: #475569; }
  .mr-btn-search {
    height: 38px; padding: 0 20px;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white; border: none; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700;
    cursor: pointer; transition: all 0.25s;
    display: flex; align-items: center; gap: 7px; white-space: nowrap;
  }
  .mr-btn-search:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(59,130,246,0.3); }
  .mr-btn-search:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .mr-stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
  .mr-stat {
    background: #1a2235; border: 1px solid #1e2d45;
    border-radius: 12px; padding: 12px 14px;
  }
  .mr-stat-label { font-size: 10px; color: #64748b; font-weight: 600; margin-bottom: 7px; display: flex; align-items: center; gap: 5px; }
  .mr-stat-val { font-size: 22px; font-weight: 700; }

  .mr-table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px; }
  .mr-count { background: rgba(59,130,246,0.12); color: #3b82f6; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 100px; margin-left: 8px; }
  .mr-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .mr-table { width: 100%; border-collapse: collapse; min-width: 800px; }
  .mr-table th {
    padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.8px; color: #64748b;
    border-bottom: 1px solid #1e2d45; background: #1a2235; white-space: nowrap;
  }
  .mr-table td { padding: 11px 12px; border-bottom: 1px solid #1e2d45; font-size: 13px; white-space: nowrap; }
  .mr-table tbody tr:hover { background: rgba(59,130,246,0.02); }
  .mr-table tbody tr:last-child td { border-bottom: none; }
  .mr-pill { padding: 3px 10px; border-radius: 100px; font-size: 12px; font-weight: 700; }

  .mr-empty { text-align: center; padding: 50px 20px; color: #64748b; }
  .mr-initial { text-align: center; padding: 50px 20px; color: #64748b; }
  .mr-loading { text-align: center; padding: 40px; color: #64748b; }
  .mr-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #ef4444; padding: 11px 15px; border-radius: 10px; font-size: 14px; font-weight: 600; }

  .mr-readonly-badge {
    background: rgba(245,158,11,0.12); color: #f59e0b;
    border: 1px solid rgba(245,158,11,0.25);
    font-size: 11px; font-weight: 600;
    padding: 4px 10px; border-radius: 100px;
    display: flex; align-items: center; gap: 5px;
  }

  @media (max-width: 900px) {
    .mr-nav { padding: 0 16px; }
    .mr-nav-links { display: none; }
    .mr-hamburger { display: flex; }
    .mr-page-header { padding: 14px 16px; }
    .mr-content { padding: 16px 14px 50px; }
    .mr-search-grid { grid-template-columns: 1fr; }
    .mr-stats { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 480px) {
    .mr-stats { grid-template-columns: 1fr 1fr; }
  }
`

export default function MyReports() {
  const [agentName, setAgentName] = useState('')
  const [date, setDate] = useState('')
  const [reports, setReports] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSearch = useCallback(async (e) => {
    e?.preventDefault()
    if (!agentName.trim()) return setError('Please enter your name')
    setError('')
    setLoading(true)
    try {
      // ✅ Sirf naam aur date — company ka koi role nahi
      const params = { agentName: agentName.trim() }
      if (date) params.date = date
      const res = await API.get('/api/reports', { params })
      setReports(res.data.reports)
      setSummary(res.data.summary)
      setSearched(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [agentName, date])

  const pill = (val, color, bg) => (
    <span className="mr-pill" style={{ color, background: bg }}>{val ?? 0}</span>
  )

  return (
    <>
      <style>{styles}</style>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />

      <div className="mr-root">

        {/* NAVBAR */}
        <nav className="mr-nav">
          <div className="mr-nav-brand">
            <div className="mr-nav-icon">
              <i className="ti ti-world" aria-hidden="true"></i>
            </div>
            <div>
              <div className="mr-nav-title">Arbaj Technology</div>
              <div className="mr-nav-sub">Revert System</div>
            </div>
          </div>
          <div className="mr-nav-links">
            <a href="/" className="mr-nav-btn">Daily Form</a>
            <span className="mr-nav-btn active">My Reports</span>
            <a href="/admin" className="mr-nav-admin">
              <i className="ti ti-lock" style={{ fontSize: 12, marginRight: 5 }} aria-hidden="true"></i>
              Admin
            </a>
          </div>
          <button className="mr-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
            {menuOpen ? '✕' : '☰'}
          </button>
        </nav>

        {/* Mobile menu */}
        <div className={`mr-mob-menu ${menuOpen ? 'open' : ''}`}>
          <a href="/" className="mr-mob-link">Daily Form</a>
          <span className="mr-mob-link active">My Reports</span>
          <a href="/admin" className="mr-mob-link">Admin Panel</a>
        </div>

        {/* PAGE HEADER */}
        <div className="mr-page-header">
          <div className="mr-page-label">Agent Portal</div>
          <div className="mr-page-title">My Reports</div>
          <div className="mr-page-sub">{todayDisplay} — View your submitted reports</div>
        </div>

        <div className="mr-content">

          {/* SEARCH CARD */}
          <div className="mr-card">
            <div className="mr-card-title">
              <i className="ti ti-search" style={{ fontSize: 16, color: '#3b82f6' }} aria-hidden="true"></i>
              Find My Reports
              <span className="mr-readonly-badge" style={{ marginLeft: 'auto' }}>
                <i className="ti ti-eye" style={{ fontSize: 12 }} aria-hidden="true"></i>
                Read Only
              </span>
            </div>

            {error && <div className="mr-error" style={{ marginBottom: 14 }}>⚠️ {error}</div>}

            <form onSubmit={handleSearch}>
              {/* ✅ Sirf naam + date — company filter nahi */}
              <div className="mr-search-grid">
                <div className="mr-field">
                  <span className="mr-label">Your Name *</span>
                  <input
                    className="mr-input"
                    type="text"
                    placeholder="Enter your name exactly..."
                    value={agentName}
                    onChange={e => setAgentName(e.target.value)}
                    required
                  />
                </div>
                <div className="mr-field">
                  <span className="mr-label">Date (optional)</span>
                  <input
                    className="mr-input"
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    max={today}
                  />
                </div>
                <button type="submit" className="mr-btn-search" disabled={loading}>
                  <i className="ti ti-search" aria-hidden="true"></i>
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>
          </div>

          {/* INITIAL STATE */}
          {!searched && !loading && (
            <div className="mr-card">
              <div className="mr-initial">
                <i className="ti ti-file-search" style={{ fontSize: '3rem', color: '#1e2d45', display: 'block', marginBottom: 12 }} aria-hidden="true"></i>
                <p style={{ fontSize: '0.95rem', marginBottom: 6 }}>Enter your name to view your reports</p>
                <p style={{ fontSize: '0.82rem', color: '#475569' }}>Your submitted reports will appear here</p>
              </div>
            </div>
          )}

          {/* RESULTS */}
          {searched && summary && (
            <>
              {/* SUMMARY STATS */}
              <div className="mr-stats">
                {[
                  { label: 'Total Reports', val: summary.totalReports ?? 0, color: '#f1f5f9', icon: 'ti-file-text' },
                  { label: 'Total Calls', val: summary.totalCalls ?? 0, color: '#3b82f6', icon: 'ti-phone' },
                  { label: 'Interested', val: summary.totalInterested ?? 0, color: '#10b981', icon: 'ti-check' },
                  { label: 'Docs Received', val: summary.totalDocs ?? 0, color: '#06b6d4', icon: 'ti-file-check' },
                  { label: 'Conversion', val: summary.conversionRate ? summary.conversionRate + '%' : '0%', color: '#f59e0b', icon: 'ti-trending-up' },
                ].map(s => (
                  <div className="mr-stat" key={s.label}>
                    <div className="mr-stat-label">
                      <i className={`ti ${s.icon}`} style={{ fontSize: 12, color: s.color }} aria-hidden="true"></i>
                      {s.label}
                    </div>
                    <div className="mr-stat-val" style={{ color: s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* TABLE */}
              <div className="mr-card">
                <div className="mr-table-header">
                  <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.1rem', fontWeight: 400, display: 'flex', alignItems: 'center' }}>
                    Reports for "{agentName}"
                    <span className="mr-count">{reports.length} entries</span>
                  </div>
                </div>

                {reports.length === 0 ? (
                  <div className="mr-empty">
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📋</div>
                    <p>No reports found for "{agentName}"</p>
                    <p style={{ fontSize: '0.82rem', marginTop: 6, color: '#475569' }}>Make sure your name matches exactly as submitted</p>
                  </div>
                ) : (
                  <div className="mr-scroll">
                    <table className="mr-table">
                      <thead>
                        <tr>
                          {['Date', 'Company', 'Calls', 'Leads', 'Interested', 'Not Int.', 'No Pass.', 'Docs', 'Not Pick', 'Other'].map(h => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {reports.map(r => (
                          <tr key={r._id}>
                            <td style={{ fontWeight: 600 }}>{r.reportDate}</td>
                            <td style={{ color: '#64748b', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.company}</td>
                            <td>{pill(r.totalCalls, '#3b82f6', 'rgba(59,130,246,0.12)')}</td>
                            <td>{pill(r.totalLeadsReceived, '#f59e0b', 'rgba(245,158,11,0.12)')}</td>
                            <td>{pill(r.interested, '#10b981', 'rgba(16,185,129,0.12)')}</td>
                            <td>{pill(r.notInterested, '#ef4444', 'rgba(239,68,68,0.12)')}</td>
                            <td>{pill(r.noPassport, '#8b5cf6', 'rgba(139,92,246,0.12)')}</td>
                            <td>{pill(r.docsReceived, '#06b6d4', 'rgba(6,182,212,0.12)')}</td>
                            <td>{pill(r.notPickCalls, '#f97316', 'rgba(249,115,22,0.12)')}</td>
                            <td style={{ color: '#64748b', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.other || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </>
  )
}