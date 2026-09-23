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
const REPORTS_PER_PAGE = 10


const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .ad-root {
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
    --purple: #8b5cf6;
    --cyan: #06b6d4;
    --orange: #f97316;

    min-height: 100vh;
    background: var(--bg);
    font-family: 'DM Sans', sans-serif;
    color: var(--text);
    overflow-x: hidden;
  }

  /* NAVBAR */
  .ad-nav {
    background: var(--surface); border-bottom: 1px solid var(--border);
    padding: 0 28px; height: 76px;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 100;
  }
  .ad-nav-brand { display: flex; align-items: center; gap: 10px; }
  .ad-nav-icon {
    width: 30px; height: 35px;
    background: rgba(59,130,246,0.15); border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; color: var(--accent);
  }
  .ad-nav-title { font-size: 17px; font-weight: 700; color: var(--text); }
  .ad-nav-sub { font-size: 13px; color: var(--text-muted); }
  .ad-nav-right { display: flex; align-items: center; gap: 10px; }
  .ad-nav-btn {
    font-size: 13px; color: var(--text-muted);
    padding: 6px 14px; border-radius: 8px;
    border: none; background: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-weight: 500; transition: background 0.15s, color 0.15s;
  }
  .ad-nav-btn:hover { background: var(--surface-raised); color: var(--text); }
  .ad-nav-btn.active { background: rgba(59,130,246,0.15); color: var(--accent); }
  .ad-logout {
    font-size: 13px; color: var(--danger);
    padding: 6px 14px; border-radius: 8px;
    border: 1px solid rgba(239,68,68,0.25);
    background: rgba(239,68,68,0.08);
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    font-weight: 600; transition: background 0.15s;
    display: flex; align-items: center; gap: 6px;
  }
  .ad-logout:hover { background: rgba(239,68,68,0.15); }

  /* Mobile Menu */
  .ad-mobile-menu-btn {
    display: none;
    font-size: 22px; color: var(--text);
    background: none; border: none; cursor: pointer;
    padding: 4px; line-height: 1;
    align-items: center; justify-content: center;
  }
  .ad-mobile-menu {
    display: none;
    position: absolute;
    top: 56px; left: 0; right: 0;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 12px 16px;
    flex-direction: column; gap: 8px;
    z-index: 99;
  }
  .ad-mobile-menu.active { display: flex; }
  .ad-mobile-menu button {
    width: 100%; text-align: left;
    padding: 10px 12px; border-radius: 8px;
    border: none; background: none;
    color: var(--text-muted); font-family: 'DM Sans', sans-serif;
    font-size: 13px; cursor: pointer;
  }
  .ad-mobile-menu button:hover { background: var(--surface-raised); color: var(--text); }
  .ad-mobile-menu button.active { background: rgba(59,130,246,0.15); color: var(--accent); }
  .ad-mobile-logout {
    width: 100%; text-align: left;
    padding: 10px 12px; border-radius: 8px;
    border: 1px solid rgba(239,68,68,0.25);
    background: rgba(239,68,68,0.08);
    color: var(--danger); font-family: 'DM Sans', sans-serif;
    font-size: 13px; cursor: pointer;
    display: flex; align-items: center; gap: 6px;
  }

  /* PAGE HEADER */
  .ad-page-header {
    background: var(--surface); border-bottom: 1px solid var(--border);
    padding: 20px 28px;
    display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 10px;
  }
  .ad-page-title { font-family: 'DM Serif Display', serif; font-size: 1.5rem; font-weight: 400; margin-bottom: 4px; }
  .ad-page-sub { font-size: 13px; color: var(--text-muted); }
  .ad-page-date {
    font-size: 12px; color: var(--text-muted);
    border: 1px solid var(--border); border-radius: 8px; padding: 6px 12px;
    white-space: nowrap;
  }

  /* CONTENT */
  .ad-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px 24px 60px;
    display: flex; flex-direction: column; gap: 16px;
  }

  /* STAT CARDS */
  .ad-stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
  .ad-stat {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 16px;
  }
  .ad-stat-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .ad-stat-label { font-size: 12px; color: var(--text-muted); font-weight: 600; }
  .ad-stat-icon {
    width: 26px; height: 26px; border-radius: 7px;
    display: flex; align-items: center; justify-content: center; font-size: 13px;
  }
  .ad-stat-val { font-size: 26px; font-weight: 700; }

  /* CHARTS ROW */
  .ad-charts-row { display: grid; grid-template-columns: 1.4fr 1fr; gap: 14px; }

  /* COMPANY COMPARISON */
  .ad-company-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .ad-company-card {
    background: var(--surface-raised); border: 1px solid var(--border);
    border-radius: 12px; padding: 16px;
  }
  .ad-company-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
  .ad-company-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .ad-company-name { font-size: 13px; font-weight: 700; color: var(--text); }
  .ad-company-sub { font-size: 11px; color: var(--text-muted); }
  .ad-company-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-bottom: 1px solid var(--border); }
  .ad-company-row:last-child { border-bottom: none; }
  .ad-company-row-label { font-size: 12px; color: var(--text-muted); }
  .ad-company-row-val { font-size: 13px; font-weight: 700; }

  /* CARD */
  .ad-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px 22px; }
  .ad-card-title {
    font-size: 14px; font-weight: 700; margin-bottom: 4px; color: var(--text);
    display: flex; align-items: center; gap: 8px;
  }
  .ad-card-sub { font-size: 12px; color: var(--text-muted); margin-bottom: 16px; }

  /* FILTERS */
  .ad-filter-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end; margin-bottom: 16px; }
  .ad-filter-item { display: flex; flex-direction: column; gap: 6px; }
  .ad-filter-label { font-size: 12px; font-weight: 600; color: var(--text-muted); }
  .ad-input {
    padding: 8px 12px;
    background: var(--surface-raised); border: 1px solid var(--border);
    border-radius: 8px; color: var(--text);
    font-family: 'DM Sans', sans-serif; font-size: 13px;
    outline: none; transition: border-color 0.15s; height: 36px;
    width: 100%;
  }
  .ad-input:focus { border-color: var(--accent); }
  .ad-input option { background: var(--surface-raised); }
  .ad-date-row { display: flex; gap: 6px; }
  .ad-date-btn {
    padding: 8px 14px; border-radius: 8px; height: 36px;
    font-family: 'DM Sans', sans-serif; font-size: 12px;
    cursor: pointer; transition: all 0.15s; text-transform: capitalize;
    border: 1px solid var(--border); background: var(--surface-raised); color: var(--text-muted);
  }
  .ad-date-btn.active { border-color: var(--accent); background: rgba(59,130,246,0.1); color: var(--accent); font-weight: 600; }
  .ad-filter-actions { display: flex; gap: 8px; align-items: flex-end; }
  .ad-reset {
    height: 36px; padding: 0 14px;
    background: transparent; color: var(--text-muted);
    border: 1px solid var(--border); border-radius: 8px;
    font-family: 'DM Sans', sans-serif; font-size: 12px; cursor: pointer; transition: background 0.15s, color 0.15s;
    white-space: nowrap;
  }
  .ad-reset:hover { background: var(--surface-raised); color: var(--text); }
  .ad-export {
    height: 36px; padding: 0 16px;
    background: rgba(16,185,129,0.12); color: var(--success);
    border: 1px solid rgba(16,185,129,0.25); border-radius: 8px;
    font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 700;
    cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background 0.15s;
    white-space: nowrap;
  }
  .ad-export:hover { background: rgba(16,185,129,0.2); }

  /* TABLE */
  .ad-table-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px; }
  .ad-count { background: rgba(59,130,246,0.12); color: var(--accent); font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 100px; margin-left: 8px; }
  .ad-scroll {
    position: relative;
    height: 500px;
    overflow: auto;
    scrollbar-gutter: stable;
    -webkit-overflow-scrolling: touch;
    border: 1px solid var(--border);
    border-radius: 10px;
  }
  .ad-scroll.is-loading { pointer-events: none; }
  .ad-table-loader { position: sticky; left: 0; top: 0; z-index: 5; width: 100%; height: 100%; min-height: 498px; margin-bottom: -498px; display: grid; place-items: center; background: rgba(11,17,32,.74); backdrop-filter: blur(2px); color: var(--text-muted); font-size: 12px; }
  .ad-spinner { width: 24px; height: 24px; margin: 0 auto 9px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: ad-spin .7s linear infinite; }
  @keyframes ad-spin { to { transform: rotate(360deg); } }
  .ad-table { width: 100%; border-collapse: collapse; min-width: 1000px; }
  .ad-table th {
    position: sticky; top: 0; z-index: 2;
    padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700;
    color: var(--text-muted);
    border-bottom: 1px solid var(--border); background: var(--surface-raised); white-space: nowrap;
  }
  .ad-table td { padding: 11px 12px; border-bottom: 1px solid var(--border); font-size: 13px; white-space: nowrap; }
  .ad-table tbody tr:hover { background: rgba(59,130,246,0.03); }
  .ad-table tbody tr:last-child td { border-bottom: none; }
  .ad-pill { padding: 3px 10px; border-radius: 100px; font-size: 12px; font-weight: 700; }
  .ad-del {
    padding: 5px 12px; background: rgba(239,68,68,0.1); color: var(--danger);
    border: 1px solid rgba(239,68,68,0.25); border-radius: 7px;
    font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600;
    cursor: pointer; transition: background 0.15s;
  }
  .ad-del:hover { background: rgba(239,68,68,0.2); }
  .ad-del:disabled { opacity: 0.55; cursor: not-allowed; }
  .ad-delete-all {
    padding: 7px 12px;
    background: rgba(239,68,68,0.12);
    color: var(--danger);
    border: 1px solid rgba(239,68,68,0.35);
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .ad-delete-all:hover { background: rgba(239,68,68,0.2); }
  .ad-delete-all:disabled { opacity: 0.5; cursor: not-allowed; }
  .ad-empty, .ad-loading { text-align: center; padding: 50px 20px; color: var(--text-muted); }
  .ad-empty-icon { font-size: 22px; color: var(--text-faint); margin-bottom: 10px; }
  .ad-pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding-top: 14px;
    margin-top: 4px;
    border-top: 1px solid var(--border);
  }
  .ad-pagination-info { font-size: 12px; color: var(--text-muted); }
  .ad-pagination-actions { display: flex; align-items: center; gap: 8px; }
  .ad-page-btn {
    min-width: 82px;
    height: 34px;
    padding: 0 12px;
    background: var(--surface-raised);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }
  .ad-page-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
  .ad-page-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .ad-page-current {
    min-width: 92px;
    text-align: center;
    color: var(--text-muted);
    font-size: 12px;
  }

  /* ASSIGN LEADS */
  .ad-assign-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .ad-assign-date-leads { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .ad-assign-form { display: flex; flex-direction: column; gap: 12px; }
  .ad-assign-table { width: 100%; border-collapse: collapse; margin-top: 14px; table-layout: fixed; }
  .ad-assign-table th {
    padding: 9px 8px; text-align: left; font-size: 11px; font-weight: 700;
    color: var(--text-muted);
    border-bottom: 1px solid var(--border); background: var(--surface-raised); white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis;
  }
  .ad-assign-table td { padding: 10px 8px; border-bottom: 1px solid var(--border); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ad-assign-table tbody tr:last-child td { border-bottom: none; }
  .ad-assign-empty {
    text-align: center; padding: 28px 20px; color: var(--text-muted);
    background: var(--surface-raised); border-radius: 10px;
  }
  .ad-assign-submit {
    padding: 11px 22px; background: var(--accent); color: white; border: none;
    border-radius: 9px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700;
    cursor: pointer; display: flex; align-items: center; gap: 7px; width: fit-content;
    transition: background 0.15s;
  }
  .ad-assign-submit:hover { background: var(--accent-dark); }
  .ad-assign-submit:disabled { opacity: 0.55; cursor: not-allowed; }
  .ad-assign-del {
    padding: 4px 10px; background: rgba(239,68,68,0.1); color: var(--danger);
    border: 1px solid rgba(239,68,68,0.25); border-radius: 7px;
    font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; cursor: pointer;
    transition: background 0.15s;
  }
  .ad-assign-del:hover { background: rgba(239,68,68,0.2); }
  .ad-lead-pill { background: rgba(59,130,246,0.12); color: var(--accent); padding: 3px 10px; border-radius: 100px; font-size: 13px; font-weight: 700; }

  .ad-success { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: var(--success); padding: 10px 14px; border-radius: 9px; font-size: 13px; font-weight: 600; margin-bottom: 14px; }
  .ad-err { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: var(--danger); padding: 10px 14px; border-radius: 9px; font-size: 13px; font-weight: 600; margin-bottom: 14px; }

  .ad-label { font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 5px; display: block; }

  /* MODAL */
  .ad-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 999; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .ad-modal { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px 24px; max-width: 480px; width: 100%; }
  .ad-modal-title { font-size: 12px; font-weight: 700; color: var(--text-muted); margin-bottom: 10px; }
  .ad-modal-text { font-size: 14px; color: var(--text); line-height: 1.7; word-break: break-word; }
  .ad-modal-close {
    margin-top: 18px; padding: 8px 18px; background: rgba(59,130,246,0.12); color: var(--accent);
    border: 1px solid rgba(59,130,246,0.25); border-radius: 8px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer;
    transition: background 0.15s;
  }
  .ad-modal-close:hover { background: rgba(59,130,246,0.2); }

  /* RESPONSIVE BREAKPOINTS */
  @media (max-width: 1024px) {
    .ad-stats { grid-template-columns: repeat(3, 1fr); }
    .ad-charts-row { grid-template-columns: 1fr; }
    .ad-company-grid { grid-template-columns: 1fr 1fr; }
    .ad-assign-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 768px) {
    .ad-nav { padding: 0 16px; }
    .ad-mobile-menu-btn { display: flex; align-items: center; justify-content: center; }
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
    .ad-scroll { min-height: 500px; }
    .ad-pagination { align-items: flex-start; flex-direction: column; }
    .ad-pagination-actions { width: 100%; }
    .ad-page-btn { flex: 1; }
    .ad-page-current { min-width: 80px; }
  }

  @media (max-width: 480px) {
    .ad-nav { padding: 0 12px; height: 52px; }
    .ad-nav-icon { width: 26px; height: 26px; font-size: 13px; }
    .ad-nav-title { font-size: 11px; }
    .ad-nav-sub { font-size: 9px; }
    .ad-mobile-menu-btn { font-size: 18px; }

    .ad-page-header { padding: 12px 14px; }
    .ad-page-title { font-size: 1rem; }
    .ad-page-date { font-size: 10px; }

    .ad-content { padding: 12px 12px 30px; gap: 12px; }

    .ad-stats { grid-template-columns: 1fr 1fr; gap: 8px; }
    .ad-stat { padding: 12px; }
    .ad-stat-val { font-size: 20px; }
    .ad-stat-label { font-size: 11px; }

    .ad-card { padding: 14px 16px; }
    .ad-card-title { font-size: 13px; }
    .ad-card-sub { font-size: 11px; }

    .ad-company-card { padding: 12px; }
    .ad-company-name { font-size: 12px; }
    .ad-company-sub { font-size: 10px; }
    .ad-company-row-label { font-size: 11px; }
    .ad-company-row-val { font-size: 12px; }

    .ad-input { height: 34px; padding: 7px 10px; font-size: 12px; }
    .ad-date-btn { height: 34px; padding: 7px 10px; font-size: 11px; }
    .ad-reset, .ad-export { height: 34px; font-size: 11px; padding: 0 12px; }

    .ad-table { min-width: 600px; }
    .ad-table th { font-size: 10px; padding: 8px 10px; }
    .ad-table td { font-size: 11px; padding: 9px 10px; }
    .ad-pill { font-size: 10px; padding: 2px 8px; }
    .ad-del { font-size: 10px; padding: 4px 10px; }

    .ad-assign-table th { font-size: 10px; padding: 8px 6px; }
    .ad-assign-table td { font-size: 11px; padding: 9px 6px; }

    .ad-success, .ad-err { font-size: 12px; padding: 8px 12px; }
    .ad-loading, .ad-empty { padding: 30px 15px; font-size: 13px; }
  }

  @media (min-width: 1441px) {
    .ad-content { max-width: 1600px; padding: 28px 32px 70px; }
    .ad-nav { padding: 0 36px; }
    .ad-page-header { padding: 22px 36px; }
  }

  @media (max-width: 390px) and (orientation: landscape) {
    .ad-content { padding: 10px 10px 20px; }
    .ad-stats { grid-template-columns: 1fr 1fr; }
  }
`


export default function AdminDashboard() {
  const [reports, setReports] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(false)
  const [reportsError, setReportsError] = useState('')
  const [filters, setFilters] = useState({ company: '', companyId: '', teamId: '', agentId: '', date: today, startDate: '', endDate: '' })
  const [dateMode, setDateMode] = useState('single')
  const [assignForm, setAssignForm] = useState({ companyId: '', agentId: '', assignedDate: today, leadsAssigned: '', note: '' })
  const [companies, setCompanies] = useState([])
  const [assignAgents, setAssignAgents] = useState([])
  const [filterTeams, setFilterTeams] = useState([])
  const [filterAgents, setFilterAgents] = useState([])
  const [assignedLeads, setAssignedLeads] = useState([])
  const [assignLoading, setAssignLoading] = useState(false)
  const [assignSuccess, setAssignSuccess] = useState(false)
  const [assignError, setAssignError] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [modal, setModal] = useState(null) // { title, text }
  const [deletingId, setDeletingId] = useState(null)
  const [deleteAllLoading, setDeleteAllLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  })
  const navigate = useNavigate()
  const barRef = useRef(null)
  const pieRef = useRef(null)
  const barChart = useRef(null)
  const pieChart = useRef(null)
  const reportsScrollRef = useRef(null)


  const fetchReports = useCallback(async () => {
    setLoading(true)
    setReportsError('')
    try {
      const params = {}
      if (filters.company) params.company = filters.company
      if (filters.agentId) params.agentId = filters.agentId
      if (filters.teamId) params.teamId = filters.teamId
      if (dateMode === 'single' && filters.date) params.date = filters.date
      if (dateMode === 'range' && filters.startDate && filters.endDate) {
        params.startDate = filters.startDate
        params.endDate = filters.endDate
      }
      params.page = page
      params.limit = REPORTS_PER_PAGE

      const res = await API.get('/api/reports', { params })
      setReports(res.data.reports)
      setSummary(res.data.summary)
      setPagination(res.data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalRecords: res.data.reports?.length || 0,
        hasPreviousPage: false,
        hasNextPage: false,
      })
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
        localStorage.removeItem('adminToken')
        navigate('/', { replace: true })
      } else {
        setReportsError(err.response?.data?.message || 'Unable to load reports')
      }
    } finally {
      setLoading(false)
    }
  }, [filters, dateMode, navigate, page])


  useEffect(() => { fetchReports() }, [fetchReports])

  useEffect(() => {
    if (reportsScrollRef.current) {
      reportsScrollRef.current.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }
  }, [page])

  useEffect(() => {
    setPage(1)
  }, [
    filters.company,
    filters.companyId,
    filters.teamId,
    filters.agentId,
    filters.date,
    filters.startDate,
    filters.endDate,
    dateMode,
  ])

  useEffect(() => {
    API.get('/api/companies')
      .then(res => setCompanies((res.data.companies || []).filter(company => company.isActive)))
      .catch(() => setCompanies([]))
  }, [])

  useEffect(() => {
    if (!assignForm.companyId) {
      setAssignAgents([])
      return
    }

    API.get('/api/agents', { params: { companyId: assignForm.companyId, isActive: true } })
      .then(res => setAssignAgents(res.data.agents || []))
      .catch(() => setAssignAgents([]))
  }, [assignForm.companyId])

  useEffect(() => {
    if (!filters.companyId) {
      setFilterTeams([])
      setFilterAgents([])
      return
    }

    Promise.all([
      API.get('/api/teams', { params: { companyId: filters.companyId, isActive: true } }),
      API.get('/api/agents', { params: { companyId: filters.companyId, isActive: true } }),
    ])
      .then(([teamRes, agentRes]) => {
        setFilterTeams(teamRes.data.teams || [])
        setFilterAgents(agentRes.data.agents || [])
      })
      .catch(() => {
        setFilterTeams([])
        setFilterAgents([])
      })
  }, [filters.companyId])


  // Build charts from real data
  useEffect(() => {
    if (!window.Chart) return
    const Chart = window.Chart

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
    if (!window.confirm('Delete this report permanently?')) return

    setDeletingId(id)
    try {
      await API.delete(`/api/reports/${id}`)
      if (reports.length === 1 && page > 1) {
        setPage(currentPage => currentPage - 1)
      } else {
        await fetchReports()
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to delete report')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteAll = async () => {
    const typed = window.prompt(
      'This will permanently delete ALL reports from every company and date. Type DELETE ALL to continue.'
    )

    if (typed !== 'DELETE ALL') return

    setDeleteAllLoading(true)
    try {
      const response = await API.delete('/api/reports', {
        data: { confirmation: 'DELETE_ALL_REPORTS' }
      })
      alert(response.data.message)
      if (page !== 1) {
        setPage(1)
      } else {
        await fetchReports()
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to delete reports')
    } finally {
      setDeleteAllLoading(false)
    }
  }


  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    localStorage.removeItem('adminToken')
    sessionStorage.removeItem('lockedCompanyParam')
    navigate('/', { replace: true })
  }

  const fetchAssignedLeads = useCallback(async () => {
    try {
      const res = await API.get('/api/assigned-leads/all', {
        params: { assignedDate: today }
      })
      setAssignedLeads(res.data.leads)
    } catch {}
  }, [])

  useEffect(() => { fetchAssignedLeads() }, [fetchAssignedLeads])

  const handleAssignSubmit = async (e) => {
    e.preventDefault()
    if (!assignForm.agentId || !assignForm.companyId || !assignForm.leadsAssigned) {
      return setAssignError('Company, agent aur leads count zaroori hai')
    }
    setAssignLoading(true)
    setAssignError('')
    try {
      await API.post('/api/assigned-leads', {
        agentId: assignForm.agentId,
        assignedDate: assignForm.assignedDate,
        note: assignForm.note,
        leadsAssigned: parseInt(assignForm.leadsAssigned)
      })
      setAssignSuccess(true)
      setAssignForm({ companyId: '', agentId: '', assignedDate: today, leadsAssigned: '', note: '' })
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
    const header = 'Date,Company,Team,Agent,Total Calls,Total Leads,Interested,Not Interested,No Passport,Docs Received,Not Pick Calls,Other,Add Review'
    const rows = reports.map(r =>
      `"${r.reportDate}","${r.company}","${r.teamName || 'Individual'}","${r.agentName}",${r.totalCalls},${r.totalLeadsReceived ?? 0},${r.interested},${r.notInterested},${r.noPassport},${r.docsReceived},${r.notPickCalls},"${r.other ?? ''}","${r.addReview ?? ''}"`
    )
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `revert_${today}.csv` })
    a.click()
  }

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

  const statCards = [
    { label: 'Total reports', val: summary.totalReports ?? 0, color: '#f1f5f9', icon: 'ti-clipboard-list' },
    { label: 'Total calls',   val: summary.totalCalls ?? 0,   color: '#3b82f6', icon: 'ti-phone' },
    { label: 'Interested',    val: summary.totalInterested ?? 0, color: '#10b981', icon: 'ti-check' },
    { label: 'Docs received', val: summary.totalDocs ?? 0,    color: '#06b6d4', icon: 'ti-file-check' },
    { label: 'Conversion rate', val: summary.conversionRate ? summary.conversionRate + '%' : '0%', color: '#f59e0b', icon: 'ti-trending-up' },
  ]

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
            <button className="ad-nav-btn" type="button" onClick={() => navigate('/admin/operations')}>Daily Operations</button>
            <button className="ad-nav-btn" type="button" onClick={() => navigate('/admin/team-agents')}>Teams & Agents</button>
            <button type="button" onClick={handleLogout} className="ad-logout">
              <i className="ti ti-logout" style={{ fontSize: 13 }} aria-hidden="true"></i>
              Logout
            </button>
            <button
              className="ad-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </nav>

        {/* MOBILE MENU */}
        <div className={`ad-mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <button className="active" onClick={() => { navigate('/admin/dashboard'); setMobileMenuOpen(false) }}>Dashboard</button>
          <button onClick={() => { navigate('/admin/operations'); setMobileMenuOpen(false) }}>Daily Operations</button>
          <button onClick={() => { navigate('/admin/team-agents'); setMobileMenuOpen(false) }}>Teams & Agents</button>
          <button className="ad-mobile-logout" onClick={() => { handleLogout(); setMobileMenuOpen(false) }}>
            <i className="ti ti-logout" aria-hidden="true"></i>
            Logout
          </button>
        </div>

        {/* PAGE HEADER */}
        <div className="ad-page-header">
          <div>
            <div className="ad-page-title">Dashboard</div>
            <div className="ad-page-sub">Overview of all agent reports and assigned leads</div>
          </div>
          <div className="ad-page-date">{todayDisplay}</div>
        </div>

        <div className="ad-content">

          {/* STAT CARDS */}
          <div className="ad-stats">
            {statCards.map(s => (
              <div className="ad-stat" key={s.label}>
                <div className="ad-stat-top">
                  <span className="ad-stat-label">{s.label}</span>
                  <span className="ad-stat-icon" style={{ background: `${s.color}22`, color: s.color }}>
                    <i className={`ti ${s.icon}`} aria-hidden="true"></i>
                  </span>
                </div>
                <div className="ad-stat-val" style={{ color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* CHARTS ROW */}
          <div className="ad-charts-row">
            <div className="ad-card">
              <div className="ad-card-title">Top agents by calls</div>
              <div className="ad-card-sub">Based on filtered data</div>
              <div style={{ position: 'relative', height: 200 }}>
                <canvas ref={barRef} role="img" aria-label="Bar chart showing top agents by total calls" />
              </div>
            </div>

            <div className="ad-card">
              <div className="ad-card-title">Response breakdown</div>
              <div className="ad-card-sub">Filtered data distribution</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {[['#10b981','Interested'],['#ef4444','Not interested'],['#8b5cf6','No passport'],['#f97316','Not pick']].map(([color, label]) => (
                  <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: 'inline-block' }}></span>
                    {label}
                  </span>
                ))}
              </div>
              <div style={{ position: 'relative', height: 160 }}>
                <canvas ref={pieRef} role="img" aria-label="Doughnut chart showing response breakdown" />
              </div>
            </div>
          </div>

          {/* COMPANY COMPARISON */}
          <div className="ad-card">
            <div className="ad-card-title">Company comparison</div>
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
                    ['Total calls', co.calls, coColors[i]],
                    ['Total leads', co.leads, '#f59e0b'],
                    ['Interested', co.interested, '#10b981'],
                    ['Docs received', co.docs, '#06b6d4'],
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
            <div className="ad-card-title">
              <i className="ti ti-target" style={{ color: 'var(--accent)' }} aria-hidden="true"></i>
              Assign leads to agent
            </div>
            <div className="ad-assign-grid">

              {/* LEFT — ASSIGN FORM */}
              <div>
                <div className="ad-card-sub">Record how many leads were sent to an agent today</div>
                {assignSuccess && <div className="ad-success">Leads assigned successfully.</div>}
                {assignError && <div className="ad-err">{assignError}</div>}
                <form onSubmit={handleAssignSubmit} className="ad-assign-form">
                  <div>
                    <span className="ad-label">Company *</span>
                    <select className="ad-input" value={assignForm.companyId} onChange={e => setAssignForm(p => ({ ...p, companyId: e.target.value, agentId: '' }))} required>
                      <option value="">Select company…</option>
                      {companies.map(company => <option key={company._id} value={company._id}>{company.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <span className="ad-label">Agent *</span>
                    <select className="ad-input" value={assignForm.agentId} onChange={e => setAssignForm(p => ({ ...p, agentId: e.target.value }))} disabled={!assignForm.companyId} required>
                      <option value="">{assignForm.companyId ? 'Select agent…' : 'Select company first…'}</option>
                      {assignAgents.map(agent => (
                        <option key={agent._id} value={agent._id}>{agent.name} — {agent.team?.name || 'Individual'}</option>
                      ))}
                    </select>
                  </div>
                  <div className="ad-assign-date-leads">
                    <div>
                      <span className="ad-label">Date *</span>
                      <input className="ad-input" type="date" value={assignForm.assignedDate} onChange={e => setAssignForm(p => ({ ...p, assignedDate: e.target.value }))} required />
                    </div>
                    <div>
                      <span className="ad-label">Leads count *</span>
                      <input className="ad-input" type="number" min="1" placeholder="e.g. 50" value={assignForm.leadsAssigned} onChange={e => setAssignForm(p => ({ ...p, leadsAssigned: e.target.value }))} required />
                    </div>
                  </div>
                  <div>
                    <span className="ad-label">Note (optional)</span>
                    <input className="ad-input" type="text" placeholder="e.g. Sent via WhatsApp" value={assignForm.note} onChange={e => setAssignForm(p => ({ ...p, note: e.target.value }))} />
                  </div>
                  <button type="submit" className="ad-assign-submit" disabled={assignLoading}>
                    <i className="ti ti-send" aria-hidden="true"></i>
                    {assignLoading ? 'Assigning…' : 'Assign leads'}
                  </button>
                </form>
              </div>

              {/* RIGHT — TODAY'S ASSIGNED LIST */}
              <div>
                <div className="ad-card-sub">Leads assigned today — {today}</div>
                {assignedLeads.length === 0 ? (
                  <div className="ad-assign-empty">
                    <i className="ti ti-inbox" style={{ fontSize: 26, display: 'block', marginBottom: 8, color: 'var(--text-faint)' }} aria-hidden="true"></i>
                    <p style={{ fontSize: 13 }}>No leads assigned yet today</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="ad-assign-table">
                      <thead>
                        <tr>
                          <th>Agent</th><th>Team</th><th>Company</th><th>Leads</th><th>Note</th><th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignedLeads.map(a => (
                          <tr key={a._id}>
                            <td style={{ fontWeight: 600 }}>{a.agentName}</td>
                            <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{a.teamName || 'Individual'}</td>
                            <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{a.company}</td>
                            <td><span className="ad-lead-pill">{a.leadsAssigned}</span></td>
                            <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{a.note || '—'}</td>
                            <td>
                              <button className="ad-assign-del" onClick={() => handleDeleteAssigned(a._id)}>Delete</button>
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
            <div className="ad-table-top">
              <div className="ad-card-title" style={{ marginBottom: 0 }}>
                All reports
                <span className="ad-count">{pagination.totalRecords} entries</span>
              </div>
              <button
                type="button"
                className="ad-delete-all"
                onClick={handleDeleteAll}
                disabled={deleteAllLoading || loading}
              >
                <i className="ti ti-trash" aria-hidden="true"></i>
                {deleteAllLoading ? 'Deleting...' : 'Delete All Reports'}
              </button>
            </div>

            {/* FILTERS */}
            <div className="ad-filter-row" style={{ marginTop: 14 }}>
              <div className="ad-filter-item">
                <span className="ad-filter-label">Company</span>
                <select className="ad-input" style={{ minWidth: 180 }} value={filters.companyId} onChange={e => {
                  const companyId = e.target.value
                  const company = companies.find(item => item._id === companyId)
                  setFilters(p => ({ ...p, companyId, company: company?.name || '', teamId: '', agentId: '' }))
                }}>
                  <option value="">All Companies</option>
                  {companies.map(company => <option key={company._id} value={company._id}>{company.name}</option>)}
                </select>
              </div>

              <div className="ad-filter-item">
                <span className="ad-filter-label">Team</span>
                <select className="ad-input" style={{ minWidth: 150 }} value={filters.teamId} disabled={!filters.companyId} onChange={e => setFilters(p => ({ ...p, teamId: e.target.value, agentId: '' }))}>
                  <option value="">All Teams</option>
                  <option value="individual">Individual</option>
                  {filterTeams.map(team => <option key={team._id} value={team._id}>{team.name}</option>)}
                </select>
              </div>

              <div className="ad-filter-item">
                <span className="ad-filter-label">Agent</span>
                <select className="ad-input" style={{ minWidth: 170 }} value={filters.agentId} disabled={!filters.companyId} onChange={e => setFilters(p => ({ ...p, agentId: e.target.value }))}>
                  <option value="">All Agents</option>
                  {filterAgents
                    .filter(agent => !filters.teamId || (filters.teamId === 'individual' ? !agent.team : agent.team?._id === filters.teamId))
                    .map(agent => <option key={agent._id} value={agent._id}>{agent.name} — {agent.team?.name || 'Individual'}</option>)}
                </select>
              </div>

              <div className="ad-filter-item">
                <span className="ad-filter-label">Date mode</span>
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
                <button type="button" className="ad-reset" onClick={() => { setFilters({ company: '', companyId: '', teamId: '', agentId: '', date: today, startDate: '', endDate: '' }); setDateMode('single') }}>
                  Reset
                </button>
                <button className="ad-export" onClick={exportCSV}>
                  <i className="ti ti-download" aria-hidden="true"></i>
                  Export CSV
                </button>
              </div>
            </div>

            {/* TABLE */}
            {reportsError && <div className="ad-err" style={{ marginBottom: 12 }}>{reportsError}</div>}
            {loading && reports.length === 0 ? (
              <div className="ad-loading"><div className="ad-spinner" />Loading reports…</div>
            ) : reports.length === 0 ? (
              <div className="ad-empty">
                <i className="ti ti-clipboard-list ad-empty-icon" aria-hidden="true"></i>
                <p>No reports found for the selected filters.</p>
              </div>
            ) : (
              <>
                <div ref={reportsScrollRef} className={`ad-scroll${loading ? ' is-loading' : ''}`} aria-busy={loading}>
                  {loading && <div className="ad-table-loader"><div><div className="ad-spinner" />Loading page…</div></div>}
                  <table className="ad-table">
                  <thead>
                    <tr>
                      {['Date','Company','Team','Agent','Calls','Leads','Interested','Not int.','No pass.','Docs','Not pick','Other','Review','Action'].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(r => (
                      <tr key={r._id}>
                        <td style={{ fontWeight: 600 }}>{r.reportDate}</td>
                        <td style={{ color: 'var(--text-muted)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.company}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{r.teamName || 'Individual'}</td>
                        <td>{r.agentName}</td>
                        <td>{pill(r.totalCalls, '#3b82f6', 'rgba(59,130,246,0.12)')}</td>
                        <td>{pill(r.totalLeadsReceived, '#f59e0b', 'rgba(245,158,11,0.12)')}</td>
                        <td>{pill(r.interested, '#10b981', 'rgba(16,185,129,0.12)')}</td>
                        <td>{pill(r.notInterested, '#ef4444', 'rgba(239,68,68,0.12)')}</td>
                        <td>{pill(r.noPassport, '#8b5cf6', 'rgba(139,92,246,0.12)')}</td>
                        <td>{pill(r.docsReceived, '#06b6d4', 'rgba(6,182,212,0.12)')}</td>
                        <td>{pill(r.notPickCalls, '#f97316', 'rgba(249,115,22,0.12)')}</td>
                        <td
                          title={r.other || ''}
                          style={{ color: 'var(--text-muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', cursor: r.other ? 'pointer' : 'default' }}
                          onClick={() => r.other && setModal({ title: 'Other', text: r.other })}
                        >{r.other || '—'}</td>
                        <td
                          title={r.addReview || ''}
                          style={{ color: 'var(--cyan)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', cursor: r.addReview ? 'pointer' : 'default' }}
                          onClick={() => r.addReview && setModal({ title: 'Add review', text: r.addReview })}
                        >{r.addReview || '—'}</td>
                        <td>
                          <button
                            type="button"
                            className="ad-del"
                            onClick={() => handleDelete(r._id)}
                            disabled={deletingId === r._id || deleteAllLoading}
                          >
                            {deletingId === r._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>

                <div className="ad-pagination">
                  <div className="ad-pagination-info">
                    Showing {((pagination.currentPage - 1) * REPORTS_PER_PAGE) + 1}–{Math.min(pagination.currentPage * REPORTS_PER_PAGE, pagination.totalRecords)} of {pagination.totalRecords}
                  </div>
                  <div className="ad-pagination-actions">
                    <button
                      type="button"
                      className="ad-page-btn"
                      onClick={() => setPage(currentPage => Math.max(currentPage - 1, 1))}
                      disabled={!pagination.hasPreviousPage || loading}
                    >
                      Previous
                    </button>
                    <span className="ad-page-current" aria-live="polite">
                      {loading ? 'Loading…' : `Page ${pagination.currentPage} of ${pagination.totalPages}`}
                    </span>
                    <button
                      type="button"
                      className="ad-page-btn"
                      onClick={() => setPage(currentPage => Math.min(currentPage + 1, pagination.totalPages))}
                      disabled={!pagination.hasNextPage || loading}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>

        {/* TEXT MODAL — Other / Review full text */}
        {modal && (
          <div className="ad-modal-overlay" onClick={() => setModal(null)}>
            <div className="ad-modal" onClick={e => e.stopPropagation()}>
              <div className="ad-modal-title">{modal.title}</div>
              <p className="ad-modal-text">{modal.text}</p>
              <button className="ad-modal-close" onClick={() => setModal(null)}>Close</button>
            </div>
          </div>
        )}

      </div>
    </>
  )
}
