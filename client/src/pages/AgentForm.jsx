import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../utils/api'

const today = new Date().toISOString().split('T')[0]
const todayDisplay = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })

const defaultForm = {
  company: '', agentId: '', agentName: '', reportDate: today,
  totalCalls: 0, interested: 0, notInterested: 0,
  noPassport: 0, docsReceived: 0, notPickCalls: 0,
  totalLeadsReceived: 0, other: ''
}

const OTHER_MAX_LENGTH = 50

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { overflow-x: hidden; }
  body { margin: 0; }

  .af-root {
    --bg: #0b1120;
    --surface: #111827;
    --surface-raised: #1a2235;
    --border: #1e2d45;
    --text: #f1f5f9;
    --text-muted: #64748b;
    --text-faint: #475569;
    --accent: #3b82f6;
    --accent-dark: #1d4ed8;
    --success: #10b981;
    --danger: #ef4444;
    --warning: #f59e0b;

    min-height: 100vh;
    background: var(--bg);
    font-family: 'DM Sans', sans-serif;
    color: var(--text);
  }

  /* NAVBAR */
  .af-nav {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 0 32px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .af-nav-brand { display: flex; align-items: center; gap: 10px; }
  .af-nav-icon {
    width: 32px; height: 32px;
    background: rgba(59,130,246,0.15);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; color: var(--accent);
  }
  .af-nav-title { font-size: 14px; font-weight: 700; color: var(--text); }
  .af-nav-sub { font-size: 11px; color: var(--text-muted); }
  .af-nav-links { display: flex; align-items: center; gap: 4px; }
  .af-nav-link {
    font-size: 13px; color: var(--text-muted);
    padding: 6px 14px; border-radius: 8px;
    text-decoration: none; transition: background 0.15s, color 0.15s;
    font-weight: 500; border: none; background: none;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
  }
  .af-nav-link:hover { background: var(--surface-raised); color: var(--text); }
  .af-nav-link.active { background: rgba(59,130,246,0.15); color: var(--accent); }
  .af-nav-admin {
    font-size: 12px; color: var(--text-muted);
    padding: 6px 14px; border-radius: 8px;
    border: 1px solid var(--border);
    text-decoration: none; font-weight: 500;
    transition: background 0.15s, color 0.15s; cursor: pointer;
    background: none; font-family: 'DM Sans', sans-serif;
  }
  .af-nav-admin:hover { background: var(--surface-raised); color: var(--text); }

  .af-hamburger {
    display: none; background: none; border: none;
    color: var(--text); font-size: 22px; cursor: pointer;
    padding: 6px 8px; line-height: 1;
    align-items: center; justify-content: center;
    min-width: 36px; min-height: 36px;
  }
  .af-mob-menu {
    display: none; flex-direction: column;
    background: var(--surface); border-bottom: 1px solid var(--border);
    padding: 8px 16px 12px; gap: 4px;
  }
  .af-mob-menu.open { display: flex; }
  .af-mob-link {
    font-size: 13px; color: var(--text-muted);
    padding: 8px 12px; border-radius: 8px;
    text-decoration: none; font-weight: 500;
    border: none; background: none; text-align: left;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
  }
  .af-mob-link.active { background: rgba(59,130,246,0.15); color: var(--accent); }

  /* PAGE HEADER */
  .af-page-header {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 22px 32px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
  }
  .af-page-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.55rem; font-weight: 400; color: var(--text);
    margin-bottom: 4px;
  }
  .af-page-sub { font-size: 13px; color: var(--text-muted); }
  .af-page-date {
    font-size: 12px; color: var(--text-muted);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 6px 12px;
    white-space: nowrap;
  }

  /* CONTENT */
  .af-content {
    width: 100%;
    max-width: 1500px;
    margin: 0 auto;
    padding: 28px 30px 60px;
  }
  .af-two-panel {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 360px;
    gap: 24px;
    align-items: start;
  }
  .af-left { display: flex; flex-direction: column; gap: 16px; }
  .af-right { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 76px; }

  .af-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 22px 26px;
  }
  .af-card-title {
    font-size: 13px; font-weight: 700; color: var(--text);
    margin-bottom: 4px;
  }
  .af-card-desc { font-size: 12px; color: var(--text-muted); margin-bottom: 16px; }
  .af-card-header-row {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }

  /* AGENT + COMPANY ROW */
  .af-agent-row {
    display: grid;
    grid-template-columns: minmax(260px, 1.15fr) minmax(210px, .8fr) minmax(280px, 1fr);
    gap: 18px;
    align-items: end;
  }
  .af-field-label {
    font-size: 12px; font-weight: 600; color: var(--text-muted);
    margin-bottom: 7px;
  }
  .af-input {
    width: 100%; min-height: 48px; padding: 12px 15px;
    background: var(--surface-raised); border: 1px solid var(--border);
    border-radius: 9px; color: var(--text);
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    outline: none; transition: border-color 0.15s, background 0.15s;
  }
  .af-input:focus {
    border-color: var(--accent);
    background: rgba(59,130,246,0.05);
  }
  .af-input::placeholder { color: var(--text-faint); }
  input[type="date"].af-input::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }

  .af-company-pill {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 16px;
    background: rgba(59,130,246,0.08);
    border: 1px solid rgba(59,130,246,0.3);
    border-radius: 9px;
    min-width: 0;
    min-height: 48px;
  }
  .af-company-pill .ti { font-size: 15px; color: var(--accent); }
  .af-company-name { font-size: 13px; font-weight: 700; color: var(--accent); line-height: 1.25; overflow-wrap: anywhere; }
  .af-company-tag { font-size: 10px; color: var(--text-muted); line-height: 1.1; margin-top: 1px; }

  /* ASSIGNED LEADS BANNER */
  .af-banner {
    border-radius: 12px;
    padding: 14px 18px;
    display: flex; align-items: center; gap: 10px;
  }
  .af-banner-muted { background: var(--surface); border: 1px solid var(--border); }
  .af-banner-active {
    background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.25);
    justify-content: space-between; flex-wrap: wrap;
  }
  .af-banner-icon { font-size: 16px; color: var(--text-muted); flex-shrink: 0; }
  .af-banner-text { font-size: 13px; color: var(--text-muted); }
  .af-banner-lead-count { font-size: 17px; color: var(--accent); font-weight: 700; }
  .af-banner-badge {
    background: var(--bg); border: 1px solid rgba(59,130,246,0.3);
    border-radius: 8px; padding: 5px 12px; font-size: 11px;
    color: var(--accent); font-weight: 600; white-space: nowrap;
    display: flex; align-items: center; gap: 6px; flex-shrink: 0;
  }

  /* METRICS LIST (replaces boxed grid) */
  .af-metric-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 0 40px; }
  .af-metric-row {
    display: flex; align-items: center; justify-content: space-between;
    gap: 18px;
    min-height: 72px;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
  }
  .af-metric-col:last-child .af-metric-row:last-child,
  .af-metric-col .af-metric-row:last-child { border-bottom: none; }
  .af-metric-label {
    display: flex; align-items: center; gap: 10px;
    font-size: 13px; color: var(--text); font-weight: 500;
  }
  .af-metric-icon-dot {
    width: 26px; height: 26px; border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; flex-shrink: 0;
  }
  .af-metric-input {
    width: 118px; min-width: 118px; min-height: 48px; text-align: center;
    background: var(--surface-raised); border: 1px solid var(--border);
    border-radius: 9px; padding: 10px 14px;
    font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 700;
    outline: none; transition: border-color 0.15s;
  }
  .af-metric-input:focus { border-color: var(--accent); }

  /* TEXTAREA */
  .af-textarea {
    width: 100%; min-height: 118px; padding: 13px 15px;
    background: var(--surface-raised); border: 1px solid var(--border);
    border-radius: 9px; color: var(--text);
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    outline: none; transition: border-color 0.15s; resize: vertical; line-height: 1.5;
  }
  .af-textarea:focus { border-color: var(--accent); }
  .af-char-counter { font-size: 11px; color: var(--text-faint); margin-top: 5px; text-align: right; }
  .af-char-counter.near-limit { color: var(--warning); }

  /* BUTTONS */
  .af-btn-row { display: flex; gap: 10px; align-items: center; }
  .af-btn-submit {
    padding: 12px 30px;
    background: var(--accent);
    color: white; border: none; border-radius: 9px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 700;
    cursor: pointer; transition: background 0.15s;
    display: flex; align-items: center; gap: 7px;
  }
  .af-btn-submit:hover { background: var(--accent-dark); }
  .af-btn-submit:disabled { opacity: 0.55; cursor: not-allowed; }
  .af-btn-clear {
    padding: 12px 22px;
    background: transparent; color: var(--text-muted);
    border: 1px solid var(--border); border-radius: 9px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: background 0.15s, color 0.15s;
  }
  .af-btn-clear:hover { background: var(--surface-raised); color: var(--text); }

  /* MESSAGES */
  .af-success {
    background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3);
    color: var(--success); padding: 12px 15px; border-radius: 9px;
    font-size: 14px; font-weight: 600;
  }
  .af-error {
    background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
    color: var(--danger); padding: 12px 15px; border-radius: 9px;
    font-size: 14px; font-weight: 600;
  }

  /* SIDEBAR: STEPS */
  .af-step {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 0;
    border-bottom: 1px solid var(--border);
  }
  .af-step:last-child { border-bottom: none; }
  .af-step-num {
    width: 20px; height: 20px; border-radius: 6px;
    background: rgba(59,130,246,0.15); color: var(--accent);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; flex-shrink: 0;
  }
  .af-step-text { font-size: 13px; color: var(--text-muted); }

  /* SIDEBAR: SUMMARY */
  .af-summary-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 9px 0; border-bottom: 1px solid var(--border);
  }
  .af-summary-row:last-child { border-bottom: none; }
  .af-summary-label { font-size: 13px; color: var(--text-muted); }
  .af-summary-value { font-size: 14px; font-weight: 700; color: var(--text); }
  .af-conv-bar-track {
    height: 5px; border-radius: 3px; background: var(--surface-raised);
    margin-top: 10px; overflow: hidden;
  }
  .af-conv-bar-fill { height: 100%; background: var(--accent); border-radius: 3px; transition: width 0.3s; }

  .af-logout-btn {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;
    padding: 10px; background: var(--surface-raised); border: 1px solid var(--border);
    border-radius: 9px; color: var(--text-muted); font-size: 13px;
    transition: background 0.15s, color 0.15s; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
  }
  .af-logout-btn:hover { background: var(--bg); color: var(--text); }

  /* RESPONSIVE */
  @media (max-width: 1280px) {
    .af-two-panel { grid-template-columns: 1fr; }
    .af-right { position: static; }
  }
  @media (max-width: 1100px) {
    .af-agent-row { grid-template-columns: 1fr 1fr; }
    .af-company-pill { grid-column: 1 / -1; }
  }
  @media (max-width: 900px) {
    .af-metric-cols { grid-template-columns: 1fr; }
  }
  @media (max-width: 768px) {
    .af-nav { padding: 0 16px; }
    .af-nav-links { display: none; }
    .af-hamburger { display: flex; }
    .af-page-header { padding: 16px; }
    .af-page-title { font-size: 1.3rem; }
    .af-content { padding: 18px 14px 50px; }
    .af-agent-row { grid-template-columns: 1fr; }
    .af-company-pill { grid-column: auto; }
    .af-metric-cols { grid-template-columns: 1fr; }
    .af-metric-input { width: 104px; min-width: 104px; }
    .af-card { padding: 18px 16px; }
  }
  @media (max-width: 420px) {
    .af-content { padding-left: 10px; padding-right: 10px; }
    .af-metric-input { width: 92px; min-width: 92px; }
    .af-metric-label { gap: 8px; font-size: 12px; }
  }
`

export default function AgentForm() {
  const navigate = useNavigate()

  let loggedInUser = null
  try {
    loggedInUser = JSON.parse(localStorage.getItem('authUser') || 'null')
  } catch {
    loggedInUser = null
  }

  const lockedCompany = loggedInUser?.company?.name || ''

  const [form, setForm] = useState({ ...defaultForm, company: lockedCompany || '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [assignedLeads, setAssignedLeads] = useState(null)
  const [leadsLoading, setLeadsLoading] = useState(false)
  const [agents, setAgents] = useState([])
  const [agentsLoading, setAgentsLoading] = useState(true)

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    localStorage.removeItem('adminToken')
    sessionStorage.removeItem('lockedCompanyParam')
    navigate('/', { replace: true })
  }

  useEffect(() => {
    let active = true

    API.get('/api/agents')
      .then(res => {
        if (active) setAgents(res.data.agents || [])
      })
      .catch(err => {
        if (active) setError(err.response?.data?.message || 'Unable to load agents')
      })
      .finally(() => {
        if (active) setAgentsLoading(false)
      })

    return () => { active = false }
  }, [])

  const fetchAssignedLeads = async (agentId, date) => {
    if (!agentId || !date) return
    setLeadsLoading(true)
    try {
      const res = await API.get('/api/assigned-leads', {
        params: { agentId, assignedDate: date }
      })
      setAssignedLeads(res.data)
    } catch (err) {
      setAssignedLeads({ found: false })
    } finally {
      setLeadsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleAgentChange = (e) => {
    const agentId = e.target.value
    const selectedAgent = agents.find(agent => agent._id === agentId)
    setForm(prev => ({
      ...prev,
      agentId,
      agentName: selectedAgent?.name || '',
    }))
  }

  const handleOtherChange = (e) => {
    const raw = e.target.value
    const filtered = raw.replace(/[^a-zA-Z\s]/g, '')
    const limited = filtered.slice(0, OTHER_MAX_LENGTH)
    setForm(prev => ({ ...prev, other: limited }))
  }

  useEffect(() => {
    const date = form.reportDate
    if (form.agentId && date) {
      fetchAssignedLeads(form.agentId, date)
    } else {
      setAssignedLeads(null)
    }
  }, [form.agentId, form.reportDate]) // eslint-disable-line

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.company) return setError('Please select a company')
    if (!form.agentId) return setError('Please select your name')
    setLoading(true)
    setError('')
    try {
      await API.post('/api/reports', form)
      setSuccess(true)
      setForm({ ...defaultForm, company: form.company })
      setTimeout(() => setSuccess(false), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const numFields = [
    { key: 'totalCalls', label: 'Total calls', icon: 'ti-phone', color: '#3b82f6' },
    { key: 'totalLeadsReceived', label: 'Total leads', icon: 'ti-target', color: '#f59e0b' },
    { key: 'interested', label: 'Interested', icon: 'ti-check', color: '#10b981' },
    { key: 'notInterested', label: 'Not interested', icon: 'ti-x', color: '#ef4444' },
    { key: 'noPassport', label: 'No passport', icon: 'ti-ban', color: '#8b5cf6' },
    { key: 'docsReceived', label: 'Docs received', icon: 'ti-file-check', color: '#06b6d4' },
    { key: 'notPickCalls', label: 'Not picked', icon: 'ti-phone-off', color: '#f97316' },
  ]

  const leftCol = numFields.slice(0, 4)
  const rightCol = numFields.slice(4)

  const conversionRate = useMemo(() => {
    const calls = Number(form.totalCalls) || 0
    const interested = Number(form.interested) || 0
    if (!calls) return 0
    return Math.round((interested / calls) * 100)
  }, [form.totalCalls, form.interested])

  const renderMetricInput = (f) => (
    <div className="af-metric-row" key={f.key}>
      <div className="af-metric-label">
        <span className="af-metric-icon-dot" style={{ background: `${f.color}22`, color: f.color }}>
          <i className={`ti ${f.icon}`} aria-hidden="true"></i>
        </span>
        {f.label}
      </div>
      <input
        className="af-metric-input"
        type="number" name={f.key} min="0"
        value={form[f.key]}
        onChange={handleChange}
        onFocus={e => { if (e.target.value === '0') setForm(prev => ({ ...prev, [f.key]: '' })) }}
        onBlur={e => { if (e.target.value === '') setForm(prev => ({ ...prev, [f.key]: 0 })) }}
        style={{ color: f.color }}
      />
    </div>
  )

  return (
    <>
      <style>{styles}</style>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />

      <div className="af-root">

        {/* NAVBAR */}
        <nav className="af-nav">
          <div className="af-nav-brand">
            <div className="af-nav-icon">
              <i className="ti ti-world" aria-hidden="true"></i>
            </div>
            <div>
              <div className="af-nav-title">Arbaj Technology</div>
              <div className="af-nav-sub">Revert System</div>
            </div>
          </div>

          <div className="af-nav-links">
            <span className="af-nav-link active">Daily form</span>
            <a href="/company/reports" className="af-nav-link">My reports</a>
            <button type="button" onClick={handleLogout} className="af-nav-admin">
              <i className="ti ti-logout" style={{ fontSize: 12, marginRight: 5 }} aria-hidden="true"></i>
              Logout
            </button>
          </div>

          <button className="af-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
            {menuOpen ? '✕' : '☰'}
          </button>
        </nav>

        <div className={`af-mob-menu ${menuOpen ? 'open' : ''}`}>
          <span className="af-mob-link active">Daily form</span>
          <a href="/company/reports" className="af-mob-link">My reports</a>
          <button type="button" onClick={handleLogout} className="af-mob-link">Logout</button>
        </div>

        {/* PAGE HEADER */}
        <div className="af-page-header">
          <div>
            <div className="af-page-title">Daily revert form</div>
            <div className="af-page-sub">Client response tracking for your assigned leads</div>
          </div>
          <div className="af-page-date">{todayDisplay}</div>
        </div>

        {/* CONTENT */}
        <div className="af-content">
          <form onSubmit={handleSubmit}>
            <div className="af-two-panel">

              {/* LEFT COLUMN */}
              <div className="af-left">

                {/* AGENT + DATE + COMPANY */}
                <div className="af-card">
                  <div className="af-card-title">Your details</div>
                  <div className="af-card-desc">Company is set automatically from your account.</div>

                  {!lockedCompany && (
                    <div className="af-error" style={{ marginBottom: 14 }}>
                      Your account isn't connected to a company yet. Contact your administrator before submitting.
                    </div>
                  )}

                  <div className="af-agent-row">
                    <div>
                      <div className="af-field-label">Your name *</div>
                      <select className="af-input" name="agentId" value={form.agentId} onChange={handleAgentChange} disabled={agentsLoading || !lockedCompany} required>
                        <option value="">{agentsLoading ? 'Loading agents…' : 'Select your name…'}</option>
                        {agents.map(agent => (
                          <option key={agent._id} value={agent._id}>
                            {agent.name} — {agent.team?.name || 'Individual'}
                          </option>
                        ))}
                      </select>
                      {!agentsLoading && agents.length === 0 && lockedCompany && (
                        <div style={{ color: 'var(--warning)', fontSize: 11, marginTop: 6 }}>
                          No active agents found. Ask admin to add an agent.
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="af-field-label">Date</div>
                      <input className="af-input" type="date" name="reportDate" value={form.reportDate} onChange={handleChange} required />
                    </div>
                    {lockedCompany && (
                      <div className="af-company-pill">
                        <i className="ti ti-building" aria-hidden="true"></i>
                        <div>
                          <div className="af-company-name">{lockedCompany}</div>
                          <div className="af-company-tag">Assigned by admin</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ASSIGNED LEADS BANNER */}
                {form.company && form.agentId && (
                  leadsLoading ? (
                    <div className="af-banner af-banner-muted">
                      <i className="ti ti-loader af-banner-icon" aria-hidden="true"></i>
                      <span className="af-banner-text">Checking assigned leads…</span>
                    </div>
                  ) : assignedLeads?.found ? (
                    <div className="af-banner af-banner-active">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <i className="ti ti-shield-check" style={{ fontSize: 22, color: 'var(--accent)' }} aria-hidden="true"></i>
                        <div>
                          <div style={{ fontSize: 13, color: 'var(--text)' }}>
                            You've been assigned <span className="af-banner-lead-count">{assignedLeads.leadsAssigned} leads</span> for today
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                            Verified by admin.{assignedLeads.note && ` Note: ${assignedLeads.note}`}
                          </div>
                        </div>
                      </div>
                      <div className="af-banner-badge">
                        <i className="ti ti-lock" aria-hidden="true"></i>
                        Admin verified
                      </div>
                    </div>
                  ) : (
                    <div className="af-banner af-banner-muted">
                      <i className="ti ti-info-circle af-banner-icon" aria-hidden="true"></i>
                      <span className="af-banner-text">No leads have been assigned to you for today.</span>
                    </div>
                  )
                )}

                {/* METRICS */}
                <div className="af-card">
                  <div className="af-card-title">Call activity</div>
                  <div className="af-card-desc">Enter today's call outcomes.</div>
                  <div className="af-metric-cols">
                    <div className="af-metric-col">{leftCol.map(renderMetricInput)}</div>
                    <div className="af-metric-col">{rightCol.map(renderMetricInput)}</div>
                  </div>
                </div>

                {/* OTHER */}
                <div className="af-card">
                  <div className="af-card-title">Notes</div>
                  <div className="af-card-desc">Optional — letters only, up to {OTHER_MAX_LENGTH} characters.</div>
                  <textarea
                    className="af-textarea"
                    name="other"
                    value={form.other}
                    onChange={handleOtherChange}
                    placeholder="Any additional context for today's calls"
                    rows={3}
                    maxLength={OTHER_MAX_LENGTH}
                  />
                  <div className={`af-char-counter ${form.other.length >= OTHER_MAX_LENGTH - 5 ? 'near-limit' : ''}`}>
                    {form.other.length}/{OTHER_MAX_LENGTH}
                  </div>
                </div>

                {success && <div className="af-success">Report submitted successfully.</div>}
                {error && <div className="af-error">{error}</div>}

                <div className="af-btn-row">
                  <button type="submit" className="af-btn-submit" disabled={loading}>
                    <i className="ti ti-send" aria-hidden="true"></i>
                    {loading ? 'Submitting…' : 'Submit report'}
                  </button>
                  <button type="button" className="af-btn-clear" disabled={loading} onClick={() => setForm({ ...defaultForm, company: form.company })}>
                    Clear
                  </button>
                </div>

              </div>

              {/* RIGHT COLUMN */}
              <div className="af-right">

                {/* <div className="af-card">
                  <div className="af-card-title">How to fill</div>
                  <div style={{ marginTop: 4 }}>
                    {[
                      'Company is assigned automatically',
                      'Select your verified name',
                      'Fill in call activity',
                      'Add a note if needed',
                      'Submit the report',
                    ].map((text, i) => (
                      <div className="af-step" key={text}>
                        <span className="af-step-num">{i + 1}</span>
                        <span className="af-step-text">{text}</span>
                      </div>
                    ))}
                  </div>
                </div> */}

                <div className="af-card">
                  <div className="af-card-title">Today's summary</div>
                  <div style={{ marginTop: 4 }}>
                    <div className="af-summary-row">
                      <span className="af-summary-label">Total calls</span>
                      <span className="af-summary-value">{form.totalCalls || 0}</span>
                    </div>
                    <div className="af-summary-row">
                      <span className="af-summary-label">Leads assigned</span>
                      <span className="af-summary-value">{form.totalLeadsReceived || 0}</span>
                    </div>
                    <div className="af-summary-row">
                      <span className="af-summary-label">Interested</span>
                      <span className="af-summary-value" style={{ color: 'var(--success)' }}>{form.interested || 0}</span>
                    </div>
                    <div className="af-summary-row">
                      <span className="af-summary-label">Docs received</span>
                      <span className="af-summary-value" style={{ color: '#06b6d4' }}>{form.docsReceived || 0}</span>
                    </div>
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <div className="af-summary-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                      <span className="af-summary-label">Conversion rate</span>
                      <span className="af-summary-value">{conversionRate}%</span>
                    </div>
                    <div className="af-conv-bar-track">
                      <div className="af-conv-bar-fill" style={{ width: `${Math.min(conversionRate, 100)}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="af-card" style={{ textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 10 }}>Account</p>
                  <button type="button" onClick={handleLogout} className="af-logout-btn">
                    <i className="ti ti-logout" style={{ fontSize: 14 }} aria-hidden="true"></i>
                    Logout securely
                  </button>
                </div>

              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
