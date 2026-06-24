import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import API from '../utils/api'

const COMPANIES = [
  { id: 'growth', name: 'Growth Overseas', sub: 'Intl. Edutech', full: 'Growth Overseas International Edutech' },
  { id: 'famous', name: 'Famous Visa', sub: 'Consultant', full: 'Famous Visa Consultant' },
  { id: 'ocean', name: 'Ocean Global', sub: 'Overseas', full: 'Ocean Global Overseas' },
]

const COMPANY_MAP = {
  'growth': 'Growth Overseas International Edutech',
  'famous': 'Famous Visa Consultant',
  'ocean': 'Ocean Global Overseas',
}

const today = new Date().toISOString().split('T')[0]
const todayDisplay = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })

const defaultForm = {
  company: '', agentName: '', reportDate: today,
  totalCalls: 0, interested: 0, notInterested: 0,
  noPassport: 0, docsReceived: 0, notPickCalls: 0,
  totalLeadsReceived: 0, other: '', addReview: ''
}

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { margin: 0; }

  .af-root {
    min-height: 100vh;
    background: #0b1120;
    font-family: 'DM Sans', sans-serif;
    color: #f1f5f9;
  }

  /* NAVBAR */
  .af-nav {
    background: #111827;
    border-bottom: 1px solid #1e2d45;
    padding: 0 32px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .af-nav-brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .af-nav-icon {
    width: 32px; height: 32px;
    background: rgba(59,130,246,0.15);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; color: #3b82f6;
  }
  .af-nav-title { font-size: 14px; font-weight: 700; color: #f1f5f9; }
  .af-nav-sub { font-size: 11px; color: #64748b; }
  .af-nav-links {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .af-nav-link {
    font-size: 13px;
    color: #64748b;
    padding: 6px 14px;
    border-radius: 8px;
    text-decoration: none;
    transition: all 0.2s;
    font-weight: 500;
    border: none;
    background: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
  }
  .af-nav-link:hover { background: #1a2235; color: #f1f5f9; }
  .af-nav-link.active {
    background: rgba(59,130,246,0.15);
    color: #3b82f6;
  }
  .af-nav-admin {
    font-size: 12px; color: #64748b;
    padding: 6px 14px; border-radius: 8px;
    border: 1px solid #1e2d45;
    text-decoration: none; font-weight: 500;
    transition: all 0.2s;
  }
  .af-nav-admin:hover { background: #1a2235; color: #f1f5f9; }

  /* HAMBURGER */
  .af-hamburger {
    display: none;
    background: none; border: none;
    color: #f1f5f9; font-size: 22px;
    cursor: pointer; padding: 6px 8px;
    line-height: 1; align-items: center; justify-content: center;
    min-width: 36px; min-height: 36px;
  }
  .af-mob-menu {
    display: none;
    flex-direction: column;
    background: #111827;
    border-bottom: 1px solid #1e2d45;
    padding: 8px 16px 12px;
    gap: 4px;
  }
  .af-mob-menu.open { display: flex; }
  .af-mob-link {
    font-size: 13px; color: #64748b;
    padding: 8px 12px; border-radius: 8px;
    text-decoration: none; font-weight: 500;
  }
  .af-mob-link.active { background: rgba(59,130,246,0.15); color: #3b82f6; }

  /* PAGE HEADER */
  .af-page-header {
    background: #111827;
    border-bottom: 1px solid #1e2d45;
    padding: 20px 32px;
  }
  .af-page-label {
    font-size: 11px; color: #3b82f6; font-weight: 700;
    text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 4px;
  }
  .af-page-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.6rem; font-weight: 400; color: #f1f5f9;
    margin-bottom: 4px;
  }
  .af-page-sub { font-size: 13px; color: #64748b; }

  /* CONTENT */
  .af-content {
    max-width: 1300px;
    margin: 0 auto;
    padding: 24px 28px 60px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .af-two-panel {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 16px;
    align-items: start;
  }
  .af-left { display: flex; flex-direction: column; gap: 14px; }
  .af-right { display: flex; flex-direction: column; gap: 14px; position: sticky; top: 72px; }

  /* CARDS */
  .af-card {
    background: #111827;
    border: 1px solid #1e2d45;
    border-radius: 14px;
    padding: 18px 20px;
  }
  .af-card-label {
    font-size: 11px; font-weight: 700; color: #64748b;
    text-transform: uppercase; letter-spacing: 0.8px;
    margin-bottom: 12px;
  }

  /* COMPANY */
  .af-company-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
  }
  .af-company-item {
    border: 1px solid #1e2d45;
    background: #1a2235;
    border-radius: 12px;
    padding: 14px;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
  }
  .af-company-item:hover { border-color: #3b82f6; }
  .af-company-item.selected {
    border-color: #3b82f6;
    background: rgba(59,130,246,0.08);
  }
  .af-co-icon {
    font-size: 18px; color: #64748b;
    display: block; margin-bottom: 7px;
  }
  .af-company-item.selected .af-co-icon { color: #3b82f6; }
  .af-co-name { font-size: 12px; font-weight: 700; color: #94a3b8; }
  .af-company-item.selected .af-co-name { color: #3b82f6; }
  .af-co-sub { font-size: 11px; color: #475569; margin-top: 2px; }

  /* INPUTS */
  .af-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .af-field-label {
    font-size: 11px; font-weight: 700; color: #64748b;
    text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 7px;
  }
  .af-input {
    width: 100%; padding: 10px 13px;
    background: #1a2235; border: 1px solid #1e2d45;
    border-radius: 10px; color: #f1f5f9;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    outline: none; transition: all 0.2s;
  }
  .af-input:focus {
    border-color: #3b82f6;
    background: rgba(59,130,246,0.05);
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }
  .af-input::placeholder { color: #475569; }
  input[type="date"].af-input::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }

  /* NUM GRID */
  .af-num-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }
  .af-num-item {
    background: #1a2235; border: 1px solid #1e2d45;
    border-radius: 12px; padding: 12px 8px; text-align: center;
  }
  .af-num-icon { font-size: 17px; margin-bottom: 5px; display: block; }
  .af-num-label {
    font-size: 10px; color: #64748b; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px;
    display: block;
  }
  .af-num-input {
    width: 100%; background: transparent; border: none;
    text-align: center; font-size: 20px; font-weight: 700;
    font-family: 'DM Sans', sans-serif; outline: none;
  }

  /* TEXTAREA */
  .af-textarea {
    width: 100%; padding: 10px 13px;
    background: #1a2235; border: 1px solid #1e2d45;
    border-radius: 10px; color: #f1f5f9;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    outline: none; transition: all 0.2s; resize: vertical; line-height: 1.5;
  }
  .af-textarea:focus {
    border-color: #3b82f6;
    background: rgba(59,130,246,0.05);
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }
  .af-textarea::placeholder { color: #475569; }

  /* BUTTONS */
  .af-btn-row { display: flex; gap: 10px; align-items: center; }
  .af-btn-submit {
    padding: 11px 28px;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white; border: none; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 700;
    cursor: pointer; transition: all 0.25s;
    display: flex; align-items: center; gap: 7px;
  }
  .af-btn-submit:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(59,130,246,0.3); }
  .af-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .af-btn-clear {
    padding: 11px 20px;
    background: transparent; color: #64748b;
    border: 1px solid #1e2d45; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
  }
  .af-btn-clear:hover { background: #1a2235; color: #f1f5f9; }

  /* MESSAGES */
  .af-success {
    background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3);
    color: #10b981; padding: 11px 15px; border-radius: 10px;
    font-size: 14px; font-weight: 600;
  }
  .af-error {
    background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
    color: #ef4444; padding: 11px 15px; border-radius: 10px;
    font-size: 14px; font-weight: 600;
  }

  /* RESPONSIVE */
  @media (max-width: 1024px) {
    .af-two-panel { grid-template-columns: 1fr; }
    .af-right { position: static; }
  }
  @media (max-width: 768px) {
    .af-nav { padding: 0 16px; }
    .af-nav-links { display: none; }
    .af-hamburger { display: flex; }
    .af-page-header { padding: 16px; }
    .af-page-title { font-size: 1.3rem; }
    .af-content { padding: 16px 14px 50px; }
    .af-company-grid { grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
    .af-num-grid { grid-template-columns: repeat(2, 1fr); }
    .af-two-col { grid-template-columns: 1fr; gap: 10px; }
  }
  @media (max-width: 480px) {
    .af-company-grid { grid-template-columns: 1fr; }
    .af-btn-row { flex-wrap: wrap; }
  }
`

export default function AgentForm() {
  const [searchParams] = useSearchParams()

  // ✅ FIX: URL param mile tो sessionStorage mein save karo
  // Nahi mila toh sessionStorage se read karo (admin se wapas aane pe bhi kaam karega)
  const companyParam = searchParams.get('company')?.toLowerCase()

  useEffect(() => {
    if (companyParam && COMPANY_MAP[companyParam]) {
      // Naya param aaya — save karo
      sessionStorage.setItem('lockedCompanyParam', companyParam)
    }
  }, [companyParam])

  // URL param pehle check karo, phir sessionStorage
  const activeParam = companyParam || sessionStorage.getItem('lockedCompanyParam') || null
  const lockedCompany = activeParam ? COMPANY_MAP[activeParam] : null

  const [form, setForm] = useState({
    ...defaultForm,
    company: lockedCompany || ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [assignedLeads, setAssignedLeads] = useState(null)
  const [leadsLoading, setLeadsLoading] = useState(false)

  const fetchAssignedLeads = async (name, company, date) => {
    if (!name.trim() || !company || !date) return
    setLeadsLoading(true)
    try {
      const res = await API.get('/api/assigned-leads', {
        params: { agentName: name.trim(), company, assignedDate: date }
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

  useEffect(() => {
    const name = form.agentName.trim()
    const company = form.company
    const date = form.reportDate
    if (name && company && date) {
      fetchAssignedLeads(name, company, date)
    } else {
      setAssignedLeads(null)
    }
  }, [form.agentName, form.company, form.reportDate]) // eslint-disable-line

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.company) return setError('Please select a company')
    if (!form.agentName.trim()) return setError('Please enter your name')
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
    { key: 'totalCalls', label: 'Total Calls', icon: 'ti-phone', color: '#3b82f6' },
    { key: 'totalLeadsReceived', label: 'Total Leads', icon: 'ti-target', color: '#f59e0b' },
    { key: 'interested', label: 'Interested', icon: 'ti-check', color: '#10b981' },
    { key: 'notInterested', label: 'Not Interested', icon: 'ti-x', color: '#ef4444' },
    { key: 'noPassport', label: 'No Passport', icon: 'ti-ban', color: '#8b5cf6' },
    { key: 'docsReceived', label: 'Docs Received', icon: 'ti-file-check', color: '#06b6d4' },
    { key: 'notPickCalls', label: 'Not Pick', icon: 'ti-phone-off', color: '#f97316' },
  ]

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

          {/* Desktop links */}
          <div className="af-nav-links">
            <span className="af-nav-link active">Daily Form</span>
            <a href="/my-reports" className="af-nav-link">My Reports</a>
            <a href="/admin" className="af-nav-admin">
              <i className="ti ti-lock" style={{ fontSize: 12, marginRight: 5 }} aria-hidden="true"></i>
              Admin
            </a>
          </div>

          {/* Mobile hamburger */}
          <button className="af-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
            {menuOpen ? '✕' : '☰'}
          </button>
        </nav>

        {/* Mobile menu */}
        <div className={`af-mob-menu ${menuOpen ? 'open' : ''}`}>
          <span className="af-mob-link active">Daily Form</span>
          <a href="/my-reports" className="af-mob-link">My Reports</a>
          <a href="/admin" className="af-mob-link">Admin Panel</a>
        </div>

        {/* PAGE HEADER */}
        <div className="af-page-header">
          <div className="af-page-label">Daily Report</div>
          <div className="af-page-title">Daily Revert Form</div>
          <div className="af-page-sub">{todayDisplay} — Client Response Tracking</div>
        </div>

        {/* CONTENT */}
        <div className="af-content">

          <form onSubmit={handleSubmit}>
          <div className="af-two-panel">

            {/* LEFT COLUMN */}
            <div className="af-left">

            {/* COMPANY */}
            <div className="af-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div className="af-card-label" style={{ marginBottom: 0 }}>Company</div>
                {lockedCompany && (
                  <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <i className="ti ti-lock" style={{ fontSize: 11 }} aria-hidden="true"></i>
                    Assigned by Admin
                  </span>
                )}
              </div>

              {lockedCompany ? (
                <div style={{ background: 'rgba(59,130,246,0.08)', border: '2px solid rgba(59,130,246,0.3)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <i className="ti ti-building" style={{ fontSize: 22, color: '#3b82f6', flexShrink: 0 }} aria-hidden="true"></i>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#3b82f6' }}>{lockedCompany}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>You can only submit reports for this company</div>
                  </div>
                </div>
              ) : (
                <div className="af-company-grid">
                  {COMPANIES.map(c => (
                    <div
                    key={c.id}
                    className={`af-company-item ${form.company === c.full ? 'selected' : ''}`}
                    onClick={() => setForm(prev => ({ ...prev, company: c.full }))}
                    >
                      <i className="ti ti-building af-co-icon" aria-hidden="true"></i>
                      <div className="af-co-name">{c.name}</div>
                      <div className="af-co-sub">{c.sub}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* NAME + DATE */}
            <div className="af-card">
              <div className="af-two-col">
                <div>
                  <div className="af-field-label">YOUR Name *</div>
                  <input className="af-input" type="text" name="agentName" value={form.agentName} onChange={handleChange} placeholder="Enter your name" required />
                </div>
                <div>
                  <div className="af-field-label">Date</div>
                  <input className="af-input" type="date" name="reportDate" value={form.reportDate} onChange={handleChange} required />
                </div>
              </div>
            </div>

            {/* ASSIGNED LEADS BANNER */}
            {form.company && form.agentName.trim() && (
              leadsLoading ? (
                <div style={{ background: '#1a2235', border: '1px solid #1e2d45', borderRadius: 14, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <i className="ti ti-loader" style={{ fontSize: 16, color: '#64748b' }} aria-hidden="true"></i>
                  <span style={{ fontSize: 13, color: '#64748b' }}>Checking assigned leads...</span>
                </div>
              ) : assignedLeads?.found ? (
                <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 14, padding: '14px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <i className="ti ti-shield-check" style={{ fontSize: 24, color: '#3b82f6', flexShrink: 0 }} aria-hidden="true"></i>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 4 }}>
                          You have been assigned <span style={{ fontSize: 18, color: '#3b82f6' }}>{assignedLeads.leadsAssigned} leads</span> for today
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          This record is saved in the system and verified by the admin.
                          {assignedLeads.note && <span style={{ marginLeft: 6, color: '#94a3b8' }}>Note: {assignedLeads.note}</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ background: '#111827', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8, padding: '5px 14px', fontSize: 12, color: '#3b82f6', fontWeight: 600, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <i className="ti ti-lock" style={{ fontSize: 13 }} aria-hidden="true"></i>
                      Admin Verified
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: '#1a2235', border: '1px solid #1e2d45', borderRadius: 14, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <i className="ti ti-info-circle" style={{ fontSize: 16, color: '#64748b' }} aria-hidden="true"></i>
                  <span style={{ fontSize: 13, color: '#64748b' }}>No leads have been assigned to you for today.</span>
                </div>
              )
            )}

            {/* NUM FIELDS */}
            <div className="af-card">
              <div className="af-card-label">Response Count</div>
              <div className="af-num-grid">
                {numFields.map(f => (
                  <div className="af-num-item" key={f.key}>
                    <i className={`ti ${f.icon} af-num-icon`} style={{ color: f.color }} aria-hidden="true"></i>
                    <span className="af-num-label">{f.label}</span>
                    <input
                      className="af-num-input"
                      type="number" name={f.key} min="0"
                      value={form[f.key]}
                      onChange={handleChange}
                      onFocus={e => { if (e.target.value === '0') setForm(prev => ({ ...prev, [f.key]: '' })) }}
                      onBlur={e => { if (e.target.value === '') setForm(prev => ({ ...prev, [f.key]: 0 })) }}
                      style={{ color: f.color }}
                      />
                  </div>
                ))}
              </div>
            </div>

            {/* OTHER + REVIEW */}
            <div className="af-card">
              <div className="af-two-col">
                <div>
                  <div className="af-field-label">Other</div>
                  <textarea className="af-textarea" name="other" value={form.other} onChange={handleChange} placeholder="Write other details here..." rows={3} />
                </div>
              </div>
            </div>

            {/* Messages */}
            {success && <div className="af-success">✅ Report submitted successfully!</div>}
            {error && <div className="af-error">⚠️ {error}</div>}

            {/* BUTTONS */}
            <div className="af-btn-row">
              <button type="submit" className="af-btn-submit" disabled={loading}>
                <i className="ti ti-send" aria-hidden="true"></i>
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
              <button type="button" className="af-btn-clear" onClick={() => setForm({ ...defaultForm, company: form.company })}>
                Clear
              </button>
            </div>

            </div>{/* end af-left */}

            {/* RIGHT COLUMN */}
            <div className="af-right">

              {/* HOW TO FILL */}
              <div className="af-card">
                <div className="af-card-label">How to fill</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    ['1', 'ti-building', 'Select your company'],
                    ['2', 'ti-user', 'Enter your name'],
                    ['3', 'ti-phone', 'Fill call data'],
                    ['4', 'ti-notes', 'Add review if any'],
                    ['5', 'ti-send', 'Submit the report'],
                  ].map(([n, icon, text]) => (
                    <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: '#1a2235', borderRadius: 10 }}>
                      <span style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>{n}</span>
                      <i className={`ti ${icon}`} style={{ fontSize: 14, color: '#64748b', flexShrink: 0 }} aria-hidden="true"></i>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* TODAY STATS */}
              <div className="af-card">
                <div className="af-card-label">Today's Count</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    ['📞 Total Calls', form.totalCalls, '#3b82f6'],
                    ['🎯 Total Leads', form.totalLeadsReceived, '#f59e0b'],
                    ['✅ Interested', form.interested, '#10b981'],
                    ['❌ Not Interested', form.notInterested, '#ef4444'],
                    ['📄 Docs Received', form.docsReceived, '#06b6d4'],
                  ].map(([label, val, color]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: '#1a2235', borderRadius: 10 }}>
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{label}</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color }}>{val || 0}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ADMIN LINK */}
              <div className="af-card" style={{ textAlign: 'center' }}>
                <p style={{ color: '#64748b', fontSize: '0.78rem', marginBottom: 10 }}>Admin Panel</p>
                <a href="/admin" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', background: '#1a2235', border: '1px solid #1e2d45', borderRadius: 10, color: '#64748b', textDecoration: 'none', fontSize: '0.85rem', transition: 'all 0.2s' }}>
                  <i className="ti ti-lock" style={{ fontSize: 14 }} aria-hidden="true"></i>
                  Go to Admin Dashboard
                </a>
              </div>

            </div>{/* end af-right */}
          </div>{/* end af-two-panel */}
          </form>
        </div>
      </div>
    </>
  )
}