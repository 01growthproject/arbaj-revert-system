import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import API from '../utils/api';

const today = new Date().toISOString().slice(0, 10);
const TEAM_PAGE_SIZE = 8;
const AGENT_PAGE_SIZE = 10;

const styles = `
  *,*::before,*::after{box-sizing:border-box}body{margin:0}
  .op-root{--bg:#0b1120;--surface:#111827;--raised:#1a2235;--border:#22314b;--text:#f1f5f9;--muted:#7c8ba5;--accent:#3b82f6;--success:#10b981;--danger:#ef4444;--warning:#f59e0b;min-height:100vh;background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif}
  .op-nav{min-height:58px;padding:9px 28px;display:flex;align-items:center;justify-content:space-between;gap:16px;background:var(--surface);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:10}.op-brand{display:flex;align-items:center;gap:10px}.op-logo{width:34px;height:34px;display:grid;place-items:center;border-radius:9px;background:rgba(59,130,246,.15);color:var(--accent)}.op-brand strong,.op-brand small{display:block}.op-brand small{margin-top:2px;color:var(--muted);font-size:10px}.op-actions{display:flex;gap:7px;flex-wrap:wrap}
  .op-btn{min-height:35px;padding:7px 13px;border:1px solid var(--border);border-radius:8px;background:var(--raised);color:var(--text);font:600 12px 'DM Sans',sans-serif;cursor:pointer}.op-btn:hover{border-color:var(--accent)}.op-btn.primary{background:var(--accent);border-color:var(--accent);color:white}.op-btn.danger{color:var(--danger);border-color:rgba(239,68,68,.35);background:rgba(239,68,68,.08)}.op-btn:disabled{opacity:.5;cursor:not-allowed}
  .op-header{padding:22px 28px 18px;background:var(--surface);border-bottom:1px solid var(--border)}.op-header h1{margin:0 0 5px;font:400 1.65rem 'DM Serif Display',serif}.op-header p{margin:0;color:var(--muted);font-size:13px}.op-content{max-width:1500px;margin:0 auto;padding:22px 24px 60px;display:grid;gap:16px}
  .op-toolbar,.op-card{padding:17px;background:var(--surface);border:1px solid var(--border);border-radius:13px}.op-toolbar{display:grid;grid-template-columns:minmax(180px,1fr) minmax(180px,1fr) auto;gap:12px;align-items:end}.op-field{display:grid;gap:6px}.op-label{color:var(--muted);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em}.op-input{width:100%;min-height:40px;padding:9px 11px;border:1px solid var(--border);border-radius:8px;outline:none;background:var(--raised);color:var(--text);font:400 13px 'DM Sans',sans-serif}.op-input:focus{border-color:var(--accent)}
  .op-stats{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px}.op-stat{padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:12px}.op-stat span{display:block;color:var(--muted);font-size:11px}.op-stat strong{display:block;margin-top:7px;font-size:22px}.op-stat em{font-style:normal;color:var(--muted);font-size:10px}
  .op-title{margin:0 0 4px;font-size:18px}.op-sub{margin:0 0 16px;color:var(--muted);font-size:12px}.op-scroll{position:relative;overflow:auto;max-height:520px;scrollbar-gutter:stable;border:1px solid var(--border);border-radius:10px}.op-scroll.loading{min-height:300px}.op-table{width:100%;border-collapse:collapse;min-width:820px}.op-table th{position:sticky;top:0;z-index:2;padding:13px 16px;text-align:left;background:var(--raised);color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.04em}.op-table td{padding:15px 16px;border-top:1px solid var(--border);font-size:13px}.op-table tr:hover td{background:rgba(59,130,246,.04)}.op-pill{display:inline-block;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700}.op-pill.ok{color:var(--success);background:rgba(16,185,129,.12)}.op-pill.warn{color:var(--warning);background:rgba(245,158,11,.12)}
  .op-empty{padding:35px;text-align:center;color:var(--muted);font-size:12px}.op-result{margin-top:10px;padding:9px;border-radius:8px;color:var(--danger);background:rgba(239,68,68,.08);font-size:11px;line-height:1.5}
  .op-section-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap}.op-summary-pill{padding:7px 11px;border-radius:9px;color:var(--accent);background:rgba(59,130,246,.1);font-size:12px;font-weight:700}.op-progress{width:120px;height:7px;margin-top:6px;overflow:hidden;border-radius:999px;background:var(--raised)}.op-progress span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--accent),#22d3ee)}
  .op-ai{position:relative;overflow:hidden;background:linear-gradient(135deg,var(--surface),#111d35)}.op-ai::before{content:'';position:absolute;inset:0 auto 0 0;width:3px;background:linear-gradient(var(--accent),#22d3ee)}.op-ai-output{margin-top:14px;padding:16px;border:1px solid var(--border);border-radius:10px;background:rgba(11,17,32,.55);color:#dbeafe;font-size:13px;line-height:1.75;white-space:pre-wrap}.op-ai-meta{margin-top:9px;color:var(--muted);font-size:10px}
  .op-pagination{min-height:50px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:12px}.op-page-info{color:var(--muted);font-size:12px}.op-page-actions{display:flex;align-items:center;gap:8px}.op-page-current{min-width:100px;text-align:center;color:var(--muted);font-size:12px}.op-loader{position:absolute;inset:0;z-index:4;display:grid;place-items:center;background:rgba(11,17,32,.75);backdrop-filter:blur(2px);color:var(--muted);font-size:13px}.op-spinner{width:22px;height:22px;margin:0 auto 8px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:op-spin .7s linear infinite}@keyframes op-spin{to{transform:rotate(360deg)}}
  @media(max-width:1050px){.op-stats{grid-template-columns:repeat(3,1fr)}}@media(max-width:700px){.op-nav,.op-header{padding-left:14px;padding-right:14px}.op-content{padding:14px}.op-toolbar{grid-template-columns:1fr}.op-stats{grid-template-columns:repeat(2,1fr)}.op-card{padding:14px}.op-actions .hide-mobile{display:none}.op-pagination{align-items:flex-start;flex-direction:column}.op-page-actions{width:100%}.op-page-actions .op-btn{flex:1}.op-page-current{min-width:82px}}
`;

export default function DailyOperations() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [date, setDate] = useState(today);
  const [companyId, setCompanyId] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [aiGeneratedAt, setAiGeneratedAt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [teamPage, setTeamPage] = useState(1);
  const [agentPage, setAgentPage] = useState(1);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get('/api/analytics/daily', {
        params: { date, ...(companyId ? { companyId } : {}) },
      });
      setAnalytics(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load daily operations');
    } finally {
      setLoading(false);
    }
  }, [date, companyId]);

  useEffect(() => {
    API.get('/api/companies')
      .then(response => setCompanies((response.data.companies || []).filter(item => item.isActive)))
      .catch(requestError => setError(requestError.response?.data?.message || 'Unable to load companies'));
  }, []);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  useEffect(() => {
    setTeamPage(1);
    setAgentPage(1);
    setAiSummary('');
    setAiGeneratedAt('');
    setAiError('');
  }, [date, companyId]);

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('adminToken');
    navigate('/', { replace: true });
  };

  const generateAiSummary = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const response = await API.post('/api/analytics/daily-summary', {
        date,
        ...(companyId ? { companyId } : {}),
      });
      setAiSummary(response.data.summary || '');
      setAiGeneratedAt(response.data.generatedAt || '');
    } catch (requestError) {
      setAiError(requestError.response?.data?.message || 'Unable to generate AI summary');
    } finally {
      setAiLoading(false);
    }
  };

  const totals = analytics?.totals || {};
  const teams = analytics?.teamPerformance || [];
  const agents = analytics?.tracker || [];
  const teamPages = Math.max(Math.ceil(teams.length / TEAM_PAGE_SIZE), 1);
  const agentPages = Math.max(Math.ceil(agents.length / AGENT_PAGE_SIZE), 1);
  const visibleTeams = useMemo(
    () => teams.slice((teamPage - 1) * TEAM_PAGE_SIZE, teamPage * TEAM_PAGE_SIZE),
    [teams, teamPage]
  );
  const visibleAgents = useMemo(
    () => agents.slice((agentPage - 1) * AGENT_PAGE_SIZE, agentPage * AGENT_PAGE_SIZE),
    [agents, agentPage]
  );
  const statCards = [
    ['Active agents', totals.totalAgents || 0, ''],
    ['Submitted', totals.submittedAgents || 0, `${totals.submissionRate || 0}%`],
    ['Pending forms', totals.pendingAgents || 0, ''],
    ['Total calls', totals.completedCalls || 0, ''],
    ['Interested', totals.interested || 0, ''],
    ['Docs received', totals.docsReceived || 0, ''],
  ];

  return (
    <>
      <style>{styles}</style>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />
      <div className="op-root">
        <nav className="op-nav">
          <div className="op-brand"><div className="op-logo">◎</div><div><strong>Arbaj Technology</strong><small>Team Performance</small></div></div>
          <div className="op-actions">
            <button className="op-btn hide-mobile" onClick={() => navigate('/admin/dashboard')}>Dashboard</button>
            <button className="op-btn hide-mobile" onClick={() => navigate('/admin/team-agents')}>Teams &amp; Agents</button>
            <button className="op-btn hide-mobile" onClick={() => navigate('/admin/csv-import')}>CSV Import</button>
            <button className="op-btn danger" onClick={logout}>Logout</button>
          </div>
        </nav>
        <header className="op-header"><h1>Team Performance</h1><p>Compare team-wise submissions, calls, interested clients and documents.</p></header>
        <main className="op-content">
          <section className="op-toolbar">
            <label className="op-field"><span className="op-label">Date</span><input className="op-input" type="date" value={date} onChange={event => setDate(event.target.value)} /></label>
            <label className="op-field"><span className="op-label">Company</span><select className="op-input" value={companyId} onChange={event => setCompanyId(event.target.value)}><option value="">All companies</option>{companies.map(company => <option key={company._id} value={company._id}>{company.name}</option>)}</select></label>
            <button className="op-btn primary" onClick={loadAnalytics} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</button>
          </section>

          {error && <div className="op-result error">{error}</div>}
          <section className="op-stats">{statCards.map(([label, value, note]) => <div className="op-stat" key={label}><span>{label}</span><strong>{value}</strong>{note && <em>{note}</em>}</div>)}</section>

          <section className="op-card op-ai">
            <div className="op-section-head">
              <div>
                <h2 className="op-title">AI Daily Summary</h2>
                <p className="op-sub">Selected date aur company ke verified performance numbers se management summary.</p>
              </div>
              <button className="op-btn primary" onClick={generateAiSummary} disabled={aiLoading || loading}>
                {aiLoading ? 'Generating…' : aiSummary ? 'Regenerate Summary' : 'Generate Summary'}
              </button>
            </div>
            {aiError && <div className="op-result">{aiError}</div>}
            {aiSummary && <div className="op-ai-output">{aiSummary}</div>}
            {aiGeneratedAt && <div className="op-ai-meta">Generated: {new Date(aiGeneratedAt).toLocaleString()}</div>}
          </section>

          <section className="op-card">
            <h2 className="op-title">Team-wise performance</h2>
            <p className="op-sub">Selected date aur company ke according har team ka complete result.</p>
            <div className={`op-scroll ${loading ? 'loading' : ''}`} aria-busy={loading}>
              {loading && <div className="op-loader"><div><div className="op-spinner" />Loading performance…</div></div>}
              <table className="op-table">
                <thead>
                  <tr><th>Team</th><th>Company</th><th>Forms</th><th>Submission</th><th>Total calls</th><th>Interested</th><th>Docs received</th></tr>
                </thead>
                <tbody>
                  {visibleTeams.map((team, index) => {
                    const rate = team.totalAgents > 0
                      ? Math.round((team.submittedAgents / team.totalAgents) * 100)
                      : 0;

                    return (
                      <tr key={team.teamId || `individual-${index}`}>
                        <td><strong>{team.teamName}</strong></td>
                        <td style={{ color: 'var(--muted)' }}>{team.companyName}</td>
                        <td>{team.submittedAgents}/{team.totalAgents}</td>
                        <td><span className={`op-pill ${rate >= 80 ? 'ok' : 'warn'}`}>{rate}%</span></td>
                        <td><strong>{team.completedCalls}</strong></td>
                        <td>{team.interested}</td>
                        <td>{team.docsReceived}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!loading && !teams.length && (
                <div className="op-empty">No team performance data found.</div>
              )}
            </div>
            {!!teams.length && <div className="op-pagination"><span className="op-page-info">Showing {(teamPage - 1) * TEAM_PAGE_SIZE + 1}–{Math.min(teamPage * TEAM_PAGE_SIZE, teams.length)} of {teams.length} teams</span><div className="op-page-actions"><button className="op-btn" disabled={teamPage === 1 || loading} onClick={() => setTeamPage(page => Math.max(page - 1, 1))}>Previous</button><span className="op-page-current">Page {teamPage} of {teamPages}</span><button className="op-btn" disabled={teamPage === teamPages || loading} onClick={() => setTeamPage(page => Math.min(page + 1, teamPages))}>Next</button></div></div>}
          </section>

          <section className="op-card">
            <div className="op-section-head">
              <div>
                <h2 className="op-title">Assigned vs completed leads</h2>
                <p className="op-sub">Agent ko assign hui leads aur selected date par complete hui calls ka comparison.</p>
              </div>
              <div className="op-summary-pill">
                Overall: {totals.completedCalls || 0} / {totals.assignedLeads || 0}
              </div>
            </div>

            <div className={`op-scroll ${loading ? 'loading' : ''}`} aria-busy={loading}>
              {loading && <div className="op-loader"><div><div className="op-spinner" />Loading agents…</div></div>}
              <table className="op-table">
                <thead>
                  <tr><th>Agent</th><th>Team</th><th>Company</th><th>Assigned</th><th>Completed calls</th><th>Remaining</th><th>Completion</th></tr>
                </thead>
                <tbody>
                  {visibleAgents.map(item => {
                    const progressWidth = Math.min(item.completionRate || 0, 100);

                    return (
                      <tr key={item.agentId}>
                        <td><strong>{item.agentName}</strong></td>
                        <td>{item.teamName}</td>
                        <td style={{ color: 'var(--muted)' }}>{item.companyName}</td>
                        <td>{item.assignedLeads}</td>
                        <td><strong>{item.completedCalls}</strong></td>
                        <td>{item.pendingLeads}</td>
                        <td>
                          {item.assignedLeads > 0 ? (
                            <>
                              <span className={`op-pill ${item.completionRate >= 80 ? 'ok' : 'warn'}`}>
                                {item.completionRate}%
                              </span>
                              <div className="op-progress"><span style={{ width: `${progressWidth}%` }} /></div>
                            </>
                          ) : (
                            <span style={{ color: 'var(--muted)' }}>Not assigned</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!loading && !agents.length && (
                <div className="op-empty">No agent data found.</div>
              )}
            </div>
            {!!agents.length && <div className="op-pagination"><span className="op-page-info">Showing {(agentPage - 1) * AGENT_PAGE_SIZE + 1}–{Math.min(agentPage * AGENT_PAGE_SIZE, agents.length)} of {agents.length} agents</span><div className="op-page-actions"><button className="op-btn" disabled={agentPage === 1 || loading} onClick={() => setAgentPage(page => Math.max(page - 1, 1))}>Previous</button><span className="op-page-current">Page {agentPage} of {agentPages}</span><button className="op-btn" disabled={agentPage === agentPages || loading} onClick={() => setAgentPage(page => Math.min(page + 1, agentPages))}>Next</button></div></div>}
          </section>

        </main>
      </div>
    </>
  );
}
