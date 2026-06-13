import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../utils/api'


const COMPANIES = [
  'All Companies',
  'Growth Overseas International Edutech',
  'Famous Visa Consultant',
  'Ocean Global Overseas'
]


const today = new Date().toISOString().split('T')[0]
const todayDisplay = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })


const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .ad-root {
    min-height: 100vh;
    background: #0b1120;
    font-family: 'DM Sans', sans-serif;
    color: #f1f5f9;
    overflow-x: hidden;
  }

  /* NAVBAR */
  .ad-nav {
    background: #111827; border-bottom: 1px solid #1e2d45;
    padding: 0 28px; height: 56px;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 100;
  }
  .ad-nav-brand { display: flex; align-items: center; gap: 10px; }
  .ad-nav-icon {
    width: 30px; height: 30px;
    background: rgba(59,130,246,0.15); border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; color: #3b82f6;
  }
  .ad-nav-title { font-size: 13px; font-weight: 700; color: #f1f5f9; }
  .ad-nav-sub { font-size: 11px; color: #64748b; }
  .ad-nav-right { display: flex; align-items: center; gap: 6px; }
  .ad-nav-btn {
    font-size: 13px; color: #64748b;
    padding: 6px 14px; border-radius: 8px;
    border: none; background: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-weight: 500; transition: all 0.2s;
  }
  .ad-nav-btn:hover { background: #1a2235; color: #f1f5f9; }
  .ad-nav-btn.active { background: rgba(59,130,246,0.15); color: #3b82f6; }
  .ad-logout {
    font-size: 13px; color: #ef4444;
    padding: 6px 14px; border-radius: 8px;
    border: 1px solid rgba(239,68,68,0.25);
    background: rgba(239,68,68,0.08);
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    font-weight: 600; transition: all 0.2s;
    display: flex; align-items: center; gap: 6px;
  }
  .ad-logout:hover { background: rgba(239,68,68,0.15); }

  /* Mobile Menu */
  .ad-mobile-menu-btn {
    display: none;
    font-size: 20px; color: #f1f5f9;
    background: none; border: none; cursor: pointer;
    padding: 4px;
  }
  .ad-mobile-menu {
    display: none;
    position: absolute;
    top: 56px; left: 0; right: 0;
    background: #111827;
    border-bottom: 1px solid #1e2d45;
    padding: 12px 16px;
    flex-direction: column; gap: 8px;
    z-index: 99;
  }
  .ad-mobile-menu.active { display: flex; }
  .ad-mobile-menu button {
    width: 100%; text-align: left;
    padding: 10px 12px; border-radius: 8px;
    border: none; background: none;
    color: #64748b; font-family: 'DM Sans', sans-serif;
    font-size: 13px; cursor: pointer;
  }
  .ad-mobile-menu button:hover { background: #1a2235; color: #f1f5f9; }
  .ad-mobile-menu button.active { background: rgba(59,130,246,0.15); color: #3b82f6; }
  .ad-mobile-logout {
    width: 100%; text-align: left;
    padding: 10px 12px; border-radius: 8px;
    border: 1px solid rgba(239,68,68,0.25);
    background: rgba(239,68,68,0.08);
    color: #ef4444; font-family: 'DM Sans', sans-serif;
    font-size: 13px; cursor: pointer;
    display: flex; align-items: center; gap: 6px;
  }

  /* PAGE HEADER */
  .ad-page-header {
    background: #111827; border-bottom: 1px solid #1e2d45;
    padding: 18px 28px;
    display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;
  }
  .ad-page-label { font-size: 10px; color: #3b82f6; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 3px; }
  .ad-page-title { font-family: 'DM Serif Display', serif; font-size: 1.5rem; font-weight: 400; }
  .ad-page-date { font-size: 12px; color: #64748b; }

  /* CONTENT */
  .ad-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 22px 24px 60px;
    display: flex; flex-direction: column; gap: 16px;
  }

  /* STAT CARDS */
  .ad-stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
  .ad-stat {
    background: #111827; border: 1px solid #1e2d45;
    border-radius: 14px; padding: 16px;
  }
  .ad-stat-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .ad-stat-label { font-size: 11px; color: #64748b; font-weight: 600; }
  .ad-stat-icon { font-size: 16px; }
  .ad-stat-val { font-size: 26px; font-weight: 700; }

  /* CHARTS ROW */
  .ad-charts-row { display: grid; grid-template-columns: 1.4fr 1fr; gap: 14px; }

  /* COMPANY COMPARISON */
  .ad-company-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .ad-company-card {
    background: #1a2235; border: 1px solid #1e2d45;
    border-radius: 12px; padding: 14px;
  }
  .ad-company-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
  .ad-company-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .ad-company-name { font-size: 12px; font-weight: 700; color: #f1f5f9; }
  .ad-company-sub { font-size: 10px; color: #64748b; }
  .ad-company-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #1e2d45; }
  .ad-company-row:last-child { border-bottom: none; }
  .ad-company-row-label { font-size: 11px; color: #64748b; }
  .ad-company-row-val { font-size: 13px; font-weight: 700; }

  /* CARD */
  .ad-card { background: #111827; border: 1px solid #1e2d45; border-radius: 14px; padding: 18px 20px; }
  .ad-card-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.1rem; font-weight: 400; margin-bottom: 4px; color: #f1f5f9;
  }
  .ad-card-sub { font-size: 11px; color: #64748b; margin-bottom: 16px; }

  /* FILTERS */
  .ad-filter-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: flex-end; margin-bottom: 16px; }
  .ad-filter-item { display: flex; flex-direction: column; gap: 5px; }
  .ad-filter-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.7px; }
  .ad-input {
    padding: 8px 12px;
    background: #1a2235; border: 1px solid #1e2d45;
    border-radius: 9px; color: #f1f5f9;
    font-family: 'DM Sans', sans-serif; font-size: 13px;
    outline: none; transition: all 0.2s; height: 36px;
    width: 100%;
  }
  .ad-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .ad-input option { background: #1a2235; }
  .ad-date-row { display: flex; gap: 6px; }
  .ad-date-btn {
    padding: 8px 14px; border-radius: 9px; height: 36px;
    font-family: 'DM Sans', sans-serif; font-size: 12px;
    cursor: pointer; transition: all 0.2s; text-transform: capitalize;
    border: 1px solid #1e2d45; background: #1a2235; color: #64748b;
  }
  .ad-date-btn.active { border-color: #3b82f6; background: rgba(59,130,246,0.1); color: #3b82f6; font-weight: 600; }
  .ad-filter-actions { display: flex; gap: 8px; align-items: flex-end; }
  .ad-reset {
    height: 36px; padding: 0 14px;
    background: transparent; color: #64748b;
    border: 1px solid #1e2d45; border-radius: 9px;
    font-family: 'DM Sans', sans-serif; font-size: 12px; cursor: pointer; transition: all 0.2s;
    white-space: nowrap;
  }
  .ad-reset:hover { background: #1a2235; color: #f1f5f9; }
  .ad-export {
    height: 36px; padding: 0 16px;
    background: rgba(16,185,129,0.12); color: #10b981;
    border: 1px solid rgba(16,185,129,0.25); border-radius: 9px;
    font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 700;
    cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s;
    white-space: nowrap;
  }
  .ad-export:hover { background: rgba(16,185,129,0.2); }

  /* TABLE */
  .ad-table-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px; }
  .ad-count { background: rgba(59,130,246,0.12); color: #3b82f6; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 100px; margin-left: 8px; }
  .ad-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .ad-table { width: 100%; border-collapse: collapse; min-width: 1000px; }
  .ad-table th {
    padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.8px; color: #64748b;
    border-bottom: 1px solid #1e2d45; background: #1a2235; white-space: nowrap;
  }
  .ad-table td { padding: 11px 12px; border-bottom: 1px solid #1e2d45; font-size: 13px; white-space: nowrap; }
  .ad-table tbody tr:hover { background: rgba(59,130,246,0.02); }
  .ad-table tbody tr:last-child td { border-bottom: none; }
  .ad-pill { padding: 3px 10px; border-radius: 100px; font-size: 12px; font-weight: 700; }
  .ad-del {
    padding: 5px 12px; background: rgba(239,68,68,0.1); color: #ef4444;
    border: 1px solid rgba(239,68,68,0.25); border-radius: 8px;
    font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
  }
  .ad-del:hover { background: rgba(239,68,68,0.2); }
  .ad-empty { text-align: center; padding: 50px 20px; color: #64748b; }
  .ad-loading { text-align: center; padding: 40px; color: #64748b; }

  /* ASSIGN LEADS */
  .ad-assign-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .ad-assign-date-leads { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .ad-assign-table { width: 100%; border-collapse: collapse; margin-top: 14px; table-layout: fixed; }
  .ad-assign-table th {
    padding: 9px 8px; text-align: left; font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.7px; color: #64748b;
    border-bottom: 1px solid #1e2d45; background: #1a2235; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis;
  }
  .ad-assign-table td { padding: 10px 8px; border-bottom: 1px solid #1e2d45; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ad-assign-table tbody tr:last-child td { border-bottom: none; }
  .ad-success { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: #10b981; padding: 10px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 14px; }
  .ad-err { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #ef4444; padding: 10px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 14px; }

  /* LABEL */
  .ad-label { font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 4px; display: block; }

  /* RESPONSIVE BREAKPOINTS */
  
  /* Tablet (768px - 1024px) */
  @media (max-width: 1024px) {
    .ad-stats { grid-template-columns: repeat(3, 1fr); }
    .ad-charts-row { grid-template-columns: 1fr; }
    .ad-company-grid { grid-template-columns: 1fr 1fr; }
    .ad-assign-grid { grid-template-columns: 1fr; }
  }

  /* Mobile (481px - 767px) */
  @media (max-width: 768px) {
    .ad-nav { padding: 0 16px; }
    .ad-mobile-menu-btn { display: block; }
    .ad-nav-btn { display: none; }
    .ad-logout { display: none; }
    
    .ad-page-header { padding: 14px 16px; }
    .ad-page-title { font-size: 1.2rem; }
    .ad-content { padding: 16px 14px 40px; }
    
    .ad-stats { grid-template-columns: repeat(2, 1fr); }
    .ad-company-grid { grid-template-columns: 1fr; }
    
    .ad-filter-row { flex-direction: column; align-items: stretch; }
    .ad-filter-item { width: 100%; }
    .ad-input { width: 100%; }
    .ad-date-row { width: 100%; }
    .ad-date-btn { flex: 1; }
    .ad-filter-actions { width: 100%; flex-direction: row; }
    .ad-reset, .ad-export { flex: 1; }
    
    .ad-assign-date-leads { grid-template-columns: 1fr; }
    
    .ad-table { min-width: 700px; }
  }

  /* Small Mobile (320px - 480px) */
  @media (max-width: 480px) {
    .ad-nav { padding: 0 12px; height: 52px; }
    .ad-nav-icon { width: 26px; height: 26px; font-size: 13px; }
    .ad-nav-title { font-size: 11px; }
    .ad-nav-sub { font-size: 9px; }
    .ad-mobile-menu-btn { font-size: 18px; }
    
    .ad-page-header { padding: 12px 14px; }
    .ad-page-title { font-size: 1rem; }
    .ad-page-label { font-size: 9px; }
    .ad-page-date { font-size: 10px; }
    
    .ad-content { padding: 12px 12px 30px; gap: 12px; }
    
    .ad-stats { grid-template-columns: 1fr 1fr; gap: 8px; }
    .ad-stat { padding: 12px; }
    .ad-stat-val { font-size: 20px; }
    .ad-stat-label { font-size: 10px; }
    .ad-stat-icon { font-size: 14px; }
    
    .ad-card { padding: 14px 16px; }
    .ad-card-title { font-size: 1rem; }
    .ad-card-sub { font-size: 10px; }
    
    .ad-company-card { padding: 12px; }
    .ad-company-name { font-size: 11px; }
    .ad-company-sub { font-size: 9px; }
    .ad-company-row-label { font-size: 10px; }
    .ad-company-row-val { font-size: 12px; }
    
    .ad-input { height: 34px; padding: 7px 10px; font-size: 12px; }
    .ad-date-btn { height: 34px; padding: 7px 10px; font-size: 11px; }
    .ad-reset, .ad-export { height: 34px; font-size: 11px; padding: 0 12px; }
    
    .ad-table { min-width: 600px; }
    .ad-table th { font-size: 9px; padding: 8px 10px; }
    .ad-table td { font-size: 11px; padding: 9px 10px; }
    .ad-pill { font-size: 10px; padding: 2px 8px; }
    .ad-del { font-size: 10px; padding: 4px 10px; }
    
    .ad-assign-table th { font-size: 9px; padding: 8px 6px; }
    .ad-assign-table td { font-size: 11px; padding: 9px 6px; }
    
    .ad-success, .ad-err { font-size: 12px; padding: 8px 12px; }
    
    .ad-loading, .ad-empty { padding: 30px 15px; font-size: 13px; }
  }

  /* Large Desktop (1441px+) */
  @media (min-width: 1441px) {
    .ad-content { max-width: 1600px; padding: 28px 32px 70px; }
    .ad-nav { padding: 0 36px; }
    .ad-page-header { padding: 22px 36px; }
  }

  /* Landscape Mobile */
  @media (max-width: 390px) and (orientation: landscape) {
    .ad-content { padding: 10px 10px 20px; }
    .ad-stats { grid-template-columns: 1fr 1fr; }
  }
`


export default function AdminDashboard() {
  const [reports, setReports] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ company: '', agentName: '', date: today, startDate: '', endDate: '' })
  const [dateMode, setDateMode] = useState('single')
  const [assignForm, setAssignForm] = useState({ agentName: '', company: '', assignedDate: today, leadsAssigned: '', note: '' })
  const [assignedLeads, setAssignedLeads] = useState([])
  const [assignLoading, setAssignLoading] = useState(false)
  const [assignSuccess, setAssignSuccess] = useState(false)
  const [assignError, setAssignError] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const barRef = useRef(null)
  const pieRef = useRef(null)
  const barChart = useRef(null)
  const pieChart = useRef(null)


  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.company) params.company = filters.company
      if (filters.agentName) params.agentName = filters.agentName
      if (dateMode === 'single' && filters.date) params.date = filters.date
      if (dateMode === 'range' && filters.startDate && filters.endDate) {
        params.startDate = filters.startDate
        params.endDate = filters.endDate
      }
      const res = await API.get('/api/reports', { params })
      setReports(res.data.reports)
      setSummary(res.data.summary)
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken')
        navigate('/admin')
      }
    } finally {
      setLoading(false)
    }
  }, [filters, dateMode, navigate])


  useEffect(() => { fetchReports() }, [fetchReports])


  // Build charts from real data
  useEffect(() => {
    if (!window.Chart) return
    const Chart = window.Chart


    // PIE chart — response breakdown
    if (pieRef.current) {
      if (pieChart.current) pieChart.current.destroy()
      const totalInt = reports.reduce((s, r) => s + (r.interested || 0), 0)
      const totalNotInt = reports.reduce((s, r) => s + (r.notInterested || 0), 0)
      const totalNoPass = reports.reduce((s, r) => s + (r.noPassport || 0), 0)
      const totalNotPick = reports.reduce((s, r) => s + (r.notPickCalls || 0), 0)
      pieChart.current = new Chart(pieRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Interested', 'Not Interested', 'No Passport', 'Not Pick'],
          datasets: [{
            data: [totalInt, totalNotInt, totalNoPass, totalNotPick],
            backgroundColor: ['#10b981', '#ef4444', '#8b5cf6', '#f97316'],
            borderWidth: 0, hoverOffset: 4
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          cutout: '65%'
        }
      })
    }


    // BAR chart — calls per agent (top 6)
    if (barRef.current) {
      if (barChart.current) barChart.current.destroy()
      const agentMap = {}
      reports.forEach(r => {
        agentMap[r.agentName] = (agentMap[r.agentName] || 0) + (r.totalCalls || 0)
      })
      const sorted = Object.entries(agentMap).sort((a, b) => b[1] - a[1]).slice(0, 6)
      barChart.current = new Chart(barRef.current, {
        type: 'bar',
        data: {
          labels: sorted.map(([name]) => name.split(' ')[0]),
          datasets: [{
            label: 'Calls',
            data: sorted.map(([, val]) => val),
            backgroundColor: 'rgba(59,130,246,0.75)',
            borderRadius: 6, borderSkipped: false,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 11 } } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 11 } } }
          }
        }
      })
    }
  }, [reports])


  // Load Chart.js
  useEffect(() => {
    if (window.Chart) return
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js'
    script.onload = () => fetchReports()
    document.head.appendChild(script)
  }, [])


  const handleDelete = async (id) => {
    if (!confirm('Delete this report?')) return
    await API.delete(`/api/reports/${id}`)
    fetchReports()
  }


  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    navigate('/admin')
  }


  // ✅ Assigned leads fetch karo
  const fetchAssignedLeads = useCallback(async () => {
    try {
      const res = await API.get('/api/assigned-leads/all', {
        params: { assignedDate: today }
      })
      setAssignedLeads(res.data.leads)
    } catch {}
  }, [])


  useEffect(() => { fetchAssignedLeads() }, [fetchAssignedLeads])


  // ✅ Admin leads assign kare
  const handleAssignSubmit = async (e) => {
    e.preventDefault()
    if (!assignForm.agentName || !assignForm.company || !assignForm.leadsAssigned) {
      return setAssignError('Naam, company aur leads count zaroori hai')
    }
    setAssignLoading(true)
    setAssignError('')
    try {
      await API.post('/api/assigned-leads', {
        ...assignForm,
        leadsAssigned: parseInt(assignForm.leadsAssigned)
      })
      setAssignSuccess(true)
      setAssignForm({ agentName: '', company: '', assignedDate: today, leadsAssigned: '', note: '' })
      fetchAssignedLeads()
      setTimeout(() => setAssignSuccess(false), 3000)
    } catch (err) {
      setAssignError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setAssignLoading(false)
    }
  }


  const handleDeleteAssigned = async (id) => {
    if (!confirm('Delete this assigned lead?')) return
    await API.delete(`/api/assigned-leads/${id}`)
    fetchAssignedLeads()
  }


  const exportCSV = () => {
    if (!reports.length) return alert('No data to export!')
    const header = 'Date,Company,Agent,Total Calls,Total Leads,Interested,Not Interested,No Passport,Docs Received,Not Pick Calls,Other,Add Review'
    const rows = reports.map(r =>
      `"${r.reportDate}","${r.company}","${r.agentName}",${r.totalCalls},${r.totalLeadsReceived ?? 0},${r.interested},${r.notInterested},${r.noPassport},${r.docsReceived},${r.notPickCalls},"${r.other ?? ''}","${r.addReview ?? ''}"`
    )
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `revert_${today}.csv` })
    a.click()
  }


  // Company wise summary
  const companySummary = COMPANIES.slice(1).map(name => {
    const co = reports.filter(r => r.company === name)
    return {
      name: name.split(' ').slice(0, 2).join(' '),
      full: name,
      calls: co.reduce((s, r) => s + (r.totalCalls || 0), 0),
      interested: co.reduce((s, r) => s + (r.interested || 0), 0),
      docs: co.reduce((s, r) => s + (r.docsReceived || 0), 0),
      leads: co.reduce((s, r) => s + (r.totalLeadsReceived || 0), 0),
    }
  })


  const coColors = ['#3b82f6', '#10b981', '#8b5cf6']


  const pill = (val, color, bg) => (
    <span className="ad-pill" style={{ color, background: bg }}>{val ?? 0}</span>
  )


  return (
    <>
      <style>{styles}</style>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />


      <div className="ad-root">


        {/* NAVBAR */}
        <nav className="ad-nav">
          <div className="ad-nav-brand">
            <div className="ad-nav-icon">
              <i className="ti ti-world" aria-hidden="true"></i>
            </div>
            <div>
              <div className="ad-nav-title">Arbaj Technology</div>
              <div className="ad-nav-sub">Revert System</div>
            </div>
          </div>
          <div className="ad-nav-right">
            <button className="ad-nav-btn active">Dashboard</button>
            <button className="ad-nav-btn" onClick={() => navigate('/')}>Agent Form</button>
            <button className="ad-logout" onClick={handleLogout}>
              <i className="ti ti-logout" aria-hidden="true"></i>
              Logout
            </button>
            <button className="ad-mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <i className={mobileMenuOpen ? "ti ti-close" : "ti ti-menu"} aria-hidden="true"></i>
            </button>
          </div>
        </nav>

        {/* MOBILE MENU */}
        <div className={`ad-mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <button className="active" onClick={() => { navigate('/admin/dashboard'); setMobileMenuOpen(false); }}>Dashboard</button>
          <button onClick={() => { navigate('/'); setMobileMenuOpen(false); }}>Agent Form</button>
          <button className="ad-mobile-logout" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
            <i className="ti ti-logout" aria-hidden="true"></i>
            Logout
          </button>
        </div>


        {/* PAGE HEADER */}
        <div className="ad-page-header">
          <div>
            <div className="ad-page-label">Admin Panel</div>
            <div className="ad-page-title">Dashboard</div>
          </div>
          <div className="ad-page-date">{todayDisplay}</div>
        </div>


        <div className="ad-content">


          {/* STAT CARDS */}
          <div className="ad-stats">
            {[
              { label: 'Total Reports', val: summary.totalReports ?? 0, color: '#f1f5f9', icon: 'ti-file-text' },
              { label: 'Total Calls', val: summary.totalCalls ?? 0, color: '#3b82f6', icon: 'ti-phone' },
              { label: 'Interested', val: summary.totalInterested ?? 0, color: '#10b981', icon: 'ti-check' },
              { label: 'Docs Received', val: summary.totalDocs ?? 0, color: '#06b6d4', icon: 'ti-file-check' },
              { label: 'Conversion Rate', val: summary.conversionRate ? summary.conversionRate + '%' : '0%', color: '#f59e0b', icon: 'ti-trending-up' },
            ].map(s => (
              <div className="ad-stat" key={s.label}>
                <div className="ad-stat-top">
                  <span className="ad-stat-label">{s.label}</span>
                  <i className={`ti ${s.icon} ad-stat-icon`} style={{ color: s.color }} aria-hidden="true"></i>
                </div>
                <div className="ad-stat-val" style={{ color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>


          {/* CHARTS ROW */}
          <div className="ad-charts-row">


            {/* BAR CHART */}
            <div className="ad-card">
              <div className="ad-card-title">Top Agents by Calls</div>
              <div className="ad-card-sub">Based on filtered data</div>
              <div style={{ position: 'relative', height: 200 }}>
                <canvas ref={barRef} role="img" aria-label="Bar chart showing top agents by total calls">Agent call counts</canvas>
              </div>
            </div>


            {/* PIE CHART */}
            <div className="ad-card">
              <div className="ad-card-title">Response Breakdown</div>
              <div className="ad-card-sub">Filtered data distribution</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {[
                  ['#10b981', 'Interested'],
                  ['#ef4444', 'Not Interested'],
                  ['#8b5cf6', 'No Passport'],
                  ['#f97316', 'Not Pick'],
                ].map(([color, label]) => (
                  <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748b' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: 'inline-block' }}></span>
                    {label}
                  </span>
                ))}
              </div>
              <div style={{ position: 'relative', height: 160 }}>
                <canvas ref={pieRef} role="img" aria-label="Doughnut chart showing response breakdown">Response distribution</canvas>
              </div>
            </div>
          </div>


          {/* COMPANY COMPARISON */}
          <div className="ad-card">
            <div className="ad-card-title">Company Comparison</div>
            <div className="ad-card-sub">Based on filtered data</div>
            <div className="ad-company-grid">
              {companySummary.map((co, i) => (
                <div className="ad-company-card" key={co.full}>
                  <div className="ad-company-header">
                    <div className="ad-company-dot" style={{ background: coColors[i] }}></div>
                    <div>
                      <div className="ad-company-name">{co.name}</div>
                      <div className="ad-company-sub">{co.full.split(' ').slice(2).join(' ')}</div>
                    </div>
                  </div>
                  {[
                    ['Total Calls', co.calls, coColors[i]],
                    ['Total Leads', co.leads, '#f59e0b'],
                    ['Interested', co.interested, '#10b981'],
                    ['Docs Received', co.docs, '#06b6d4'],
                  ].map(([label, val, color]) => (
                    <div className="ad-company-row" key={label}>
                      <span className="ad-company-row-label">{label}</span>
                      <span className="ad-company-row-val" style={{ color }}>{val}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>


          {/* ASSIGN LEADS SECTION */}
          <div className="ad-card">
            <div className="ad-card-title" style={{ marginBottom: 16 }}>
              <i className="ti ti-target" style={{ fontSize: 16, color: '#3b82f6' }} aria-hidden="true"></i>
              Assign Leads to Agent
            </div>
            <div className="ad-assign-grid">


              {/* LEFT — ASSIGN FORM */}
              <div>
                <div className="ad-card-sub" style={{ marginBottom: 14 }}>Agent ko aaj kitni leads bheji — yahan record karo</div>
                {assignSuccess && <div className="ad-success">✅ Leads assigned successfully!</div>}
                {assignError && <div className="ad-err">⚠️ {assignError}</div>}
                <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <span className="ad-label">Agent Name *</span>
                    <input className="ad-input" style={{ width: '100%' }} type="text" placeholder="Enter agent name exactly..." value={assignForm.agentName} onChange={e => setAssignForm(p => ({ ...p, agentName: e.target.value }))} required />
                  </div>
                  <div>
                    <span className="ad-label">Company *</span>
                    <select className="ad-input" style={{ width: '100%' }} value={assignForm.company} onChange={e => setAssignForm(p => ({ ...p, company: e.target.value }))} required>
                      <option value="">Select company...</option>
                      {['Growth Overseas International Edutech', 'Famous Visa Consultant', 'Ocean Global Overseas'].map(c => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="ad-assign-date-leads">
                    <div>
                      <span className="ad-label">Date *</span>
                      <input className="ad-input" style={{ width: '100%' }} type="date" value={assignForm.assignedDate} onChange={e => setAssignForm(p => ({ ...p, assignedDate: e.target.value }))} required />
                    </div>
                    <div>
                      <span className="ad-label">Leads Count *</span>
                      <input className="ad-input" style={{ width: '100%' }} type="number" min="1" placeholder="e.g. 50" value={assignForm.leadsAssigned} onChange={e => setAssignForm(p => ({ ...p, leadsAssigned: e.target.value }))} required />
                    </div>
                  </div>
                  <div>
                    <span className="ad-label">Note (optional)</span>
                    <input className="ad-input" style={{ width: '100%' }} type="text" placeholder="e.g. WhatsApp se bheje gaye..." value={assignForm.note} onChange={e => setAssignForm(p => ({ ...p, note: e.target.value }))} />
                  </div>
                  <button type="submit" style={{ padding: '11px 20px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', border: 'none', borderRadius: 10, fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, width: 'fit-content' }} disabled={assignLoading}>
                    <i className="ti ti-send" aria-hidden="true"></i>
                    {assignLoading ? 'Assigning...' : 'Assign Leads'}
                  </button>
                </form>
              </div>


              {/* RIGHT — TODAY'S ASSIGNED LIST */}
              <div>
                <div className="ad-card-sub" style={{ marginBottom: 10 }}>Aaj assign ki gayi leads — {today}</div>
                {assignedLeads.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 20px', color: '#64748b', background: '#1a2235', borderRadius: 12 }}>
                    <i className="ti ti-inbox" style={{ fontSize: 28, display: 'block', marginBottom: 8 }} aria-hidden="true"></i>
                    <p style={{ fontSize: 13 }}>Aaj koi leads assign nahi ki gayi</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="ad-assign-table">
                      <thead>
                        <tr>
                          <th>Agent</th>
                          <th>Company</th>
                          <th>Leads</th>
                          <th>Note</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignedLeads.map(a => (
                          <tr key={a._id}>
                            <td style={{ fontWeight: 600 }}>{a.agentName}</td>
                            <td style={{ color: '#64748b', fontSize: 12, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.company}</td>
                            <td><span style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6', padding: '3px 10px', borderRadius: 100, fontSize: 13, fontWeight: 700 }}>{a.leadsAssigned}</span></td>
                            <td style={{ color: '#64748b', fontSize: 12 }}>{a.note || '—'}</td>
                            <td>
                              <button onClick={() => handleDeleteAssigned(a._id)} style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* FILTERS + TABLE */}
          <div className="ad-card">
            <div className="ad-card-title" style={{ marginBottom: 14 }}>
              All Reports
              <span className="ad-count">{reports.length} entries</span>
            </div>


            {/* FILTERS */}
            <div className="ad-filter-row">
              <div className="ad-filter-item">
                <span className="ad-filter-label">Company</span>
                <select className="ad-input" style={{ minWidth: 180 }} value={filters.company || 'All Companies'} onChange={e => setFilters(p => ({ ...p, company: e.target.value === 'All Companies' ? '' : e.target.value }))}>
                  {COMPANIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>


              <div className="ad-filter-item">
                <span className="ad-filter-label">Agent Name</span>
                <input className="ad-input" style={{ minWidth: 150 }} type="text" placeholder="Search agent..." value={filters.agentName} onChange={e => setFilters(p => ({ ...p, agentName: e.target.value }))} />
              </div>


              <div className="ad-filter-item">
                <span className="ad-filter-label">Date Mode</span>
                <div className="ad-date-row">
                  {['single', 'range'].map(m => (
                    <button key={m} className={`ad-date-btn ${dateMode === m ? 'active' : ''}`} onClick={() => setDateMode(m)}>{m}</button>
                  ))}
                </div>
              </div>


              {dateMode === 'single' && (
                <div className="ad-filter-item">
                  <span className="ad-filter-label">Date</span>
                  <input className="ad-input" type="date" value={filters.date} onChange={e => setFilters(p => ({ ...p, date: e.target.value }))} />
                </div>
              )}


              {dateMode === 'range' && (
                <>
                  <div className="ad-filter-item">
                    <span className="ad-filter-label">From</span>
                    <input className="ad-input" type="date" value={filters.startDate} onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))} />
                  </div>
                  <div className="ad-filter-item">
                    <span className="ad-filter-label">To</span>
                    <input className="ad-input" type="date" value={filters.endDate} onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))} />
                  </div>
                </>
              )}


              <div className="ad-filter-actions">
                <button className="ad-reset" onClick={() => { setFilters({ company: '', agentName: '', date: today, startDate: '', endDate: '' }); setDateMode('single') }}>
                  Reset
                </button>
                <button className="ad-export" onClick={exportCSV}>
                  <i className="ti ti-download" aria-hidden="true"></i>
                  Export CSV
                </button>
              </div>
            </div>


            {/* TABLE */}
            {loading ? (
              <div className="ad-loading">Loading...</div>
            ) : reports.length === 0 ? (
              <div className="ad-empty">
                <div style={{ fontSize: '2rem', marginBottom: 10 }}>📋</div>
                <p>No reports found for selected filters.</p>
              </div>
            ) : (
              <div className="ad-scroll">
                <table className="ad-table">
                  <thead>
                    <tr>
                      {['Date', 'Company', 'Agent', 'Calls', 'Leads', 'Interested', 'Not Int.', 'No Pass.', 'Docs', 'Not Pick', 'Other', 'Review', 'Action'].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(r => (
                      <tr key={r._id}>
                        <td style={{ fontWeight: 600 }}>{r.reportDate}</td>
                        <td style={{ color: '#64748b', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.company}</td>
                        <td>{r.agentName}</td>
                        <td>{pill(r.totalCalls, '#3b82f6', 'rgba(59,130,246,0.12)')}</td>
                        <td>{pill(r.totalLeadsReceived, '#f59e0b', 'rgba(245,158,11,0.12)')}</td>
                        <td>{pill(r.interested, '#10b981', 'rgba(16,185,129,0.12)')}</td>
                        <td>{pill(r.notInterested, '#ef4444', 'rgba(239,68,68,0.12)')}</td>
                        <td>{pill(r.noPassport, '#8b5cf6', 'rgba(139,92,246,0.12)')}</td>
                        <td>{pill(r.docsReceived, '#06b6d4', 'rgba(6,182,212,0.12)')}</td>
                        <td>{pill(r.notPickCalls, '#f97316', 'rgba(249,115,22,0.12)')}</td>
                        <td style={{ color: '#64748b', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.other || '—'}</td>
                        <td style={{ color: '#06b6d4', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.addReview || '—'}</td>
                        <td>
                          <button className="ad-del" onClick={() => handleDelete(r._id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>


        </div>
      </div>
    </>
  )
}