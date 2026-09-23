import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

const TEAM_PAGE_SIZE = 8;

const styles = `
  *,*::before,*::after{box-sizing:border-box} body{margin:0}
  .tam-root{--bg:#0b1120;--surface:#111827;--raised:#1a2235;--border:#22314b;--text:#f1f5f9;--muted:#7c8ba5;--accent:#3b82f6;--success:#10b981;--danger:#ef4444;min-height:100vh;background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif}
  .tam-nav{min-height:64px;padding:10px 28px;display:flex;align-items:center;justify-content:space-between;gap:16px;background:var(--surface);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:10}
  .tam-brand{display:flex;align-items:center;gap:10px}.tam-brand-icon{width:36px;height:36px;display:grid;place-items:center;border-radius:10px;color:var(--accent);background:rgba(59,130,246,.15)}.tam-brand strong,.tam-brand small{display:block}.tam-brand small{color:var(--muted);font-size:11px;margin-top:2px}
  .tam-actions{display:flex;gap:8px}.tam-btn{min-height:36px;padding:7px 13px;border:1px solid var(--border);border-radius:8px;background:var(--raised);color:var(--text);font:600 12px 'DM Sans',sans-serif;cursor:pointer}.tam-btn:hover{border-color:var(--accent)}.tam-btn.primary{background:var(--accent);border-color:var(--accent);color:white}.tam-btn.danger{color:var(--danger);border-color:rgba(239,68,68,.35);background:rgba(239,68,68,.08)}.tam-btn:disabled{opacity:.5;cursor:not-allowed}
  .tam-header{padding:22px 28px 18px;background:var(--surface);border-bottom:1px solid var(--border)}.tam-header h1{margin:0 0 5px;font:400 1.7rem 'DM Serif Display',serif}.tam-header p{margin:0;color:var(--muted);font-size:13px}.tam-content{max-width:1280px;margin:0 auto;padding:22px 24px 40px}
  .tam-company{padding:16px;margin-bottom:16px;background:var(--surface);border:1px solid var(--border);border-radius:14px}.tam-label{display:block;margin-bottom:7px;color:var(--muted);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em}.tam-input{width:100%;min-height:40px;padding:9px 11px;border:1px solid var(--border);border-radius:9px;outline:none;background:var(--raised);color:var(--text);font:400 14px 'DM Sans',sans-serif}.tam-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(59,130,246,.1)}
  .tam-layout{display:grid;grid-template-columns:310px minmax(0,1fr);gap:16px;align-items:start}.tam-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:16px}.tam-card+.tam-card{margin-top:14px}.tam-card h2{margin:0 0 4px;font-size:15px}.tam-sub{margin:0 0 14px;color:var(--muted);font-size:12px;line-height:1.5}
  .tam-team-list{display:grid;gap:7px}.tam-team{width:100%;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:8px;padding:11px;border:1px solid transparent;border-radius:10px;background:var(--raised);color:var(--text);cursor:pointer;text-align:left}.tam-team:hover{border-color:var(--border)}.tam-team.selected{border-color:var(--accent);background:rgba(59,130,246,.12)}.tam-team-name{display:block;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:13px;font-weight:700}.tam-team-meta{display:block;margin-top:3px;color:var(--muted);font-size:10px}.tam-count{min-width:25px;padding:3px 7px;text-align:center;border-radius:999px;color:var(--accent);background:rgba(59,130,246,.14);font-size:11px;font-weight:700}.tam-team-tools{display:flex;gap:6px;margin:5px 0 3px 10px}.tam-mini{padding:4px 7px;min-height:27px;font-size:10px}
  .tam-form-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(180px,.7fr) auto;gap:9px;align-items:end}.tam-work-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px}.tam-work-title{margin:0 0 4px;font-size:18px}.tam-status{color:var(--success);font-size:10px;font-weight:700}.tam-status.off{color:var(--danger)}
  .tam-agent-list{display:grid;gap:8px}.tam-agent{display:grid;grid-template-columns:minmax(170px,1fr) minmax(150px,190px) auto;align-items:center;gap:10px;padding:11px 12px;border:1px solid var(--border);border-radius:10px;background:var(--raised)}.tam-agent-name{font-size:13px;font-weight:700}.tam-agent-team{margin-top:4px;color:var(--muted);font-size:11px}.tam-agent-actions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.tam-empty{padding:42px 15px;color:var(--muted);text-align:center;font-size:13px}.tam-alert{padding:10px 12px;margin-bottom:13px;border-radius:9px;font-size:12px}.tam-alert.error{color:var(--danger);background:rgba(239,68,68,.09);border:1px solid rgba(239,68,68,.25)}.tam-alert.success{color:var(--success);background:rgba(16,185,129,.09);border:1px solid rgba(16,185,129,.25)}
  .tam-company-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,.7fr);gap:14px;align-items:end}.tam-add-team-form{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:end}
  .tam-list-toolbar{margin:16px 0 12px;display:grid;grid-template-columns:minmax(220px,1fr) auto;align-items:end;gap:12px}.tam-list-count{color:var(--muted);font-size:12px;white-space:nowrap}.tam-accordion-list{display:grid;gap:10px;min-height:300px}.tam-group{overflow:hidden;background:var(--surface);border:1px solid var(--border);border-radius:13px}.tam-group.open{border-color:rgba(59,130,246,.65);box-shadow:0 0 0 2px rgba(59,130,246,.06)}
  .tam-group-head{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:12px;padding:13px 14px}.tam-group-toggle{display:flex;align-items:center;gap:12px;min-width:0;border:0;background:none;color:var(--text);text-align:left;cursor:pointer}.tam-chevron{width:28px;height:28px;display:grid;place-items:center;border-radius:8px;background:var(--raised);color:var(--muted);font-size:14px;transition:transform .15s}.tam-group.open .tam-chevron{transform:rotate(90deg);color:var(--accent)}
  .tam-group-title{display:block;font-size:14px;font-weight:700}.tam-group-info{display:block;margin-top:3px;color:var(--muted);font-size:11px}.tam-group-actions{display:flex;align-items:center;gap:7px;flex-wrap:wrap;justify-content:flex-end}.tam-group-body{padding:0 14px 14px;border-top:1px solid var(--border)}
  .tam-add-member{margin:14px 0;padding:13px;background:rgba(59,130,246,.06);border:1px solid rgba(59,130,246,.18);border-radius:10px}.tam-add-member.tam-form-row{grid-template-columns:minmax(0,1fr) auto}.tam-member-list{display:grid;gap:7px;max-height:480px;overflow:auto;scrollbar-gutter:stable;padding-right:3px}.tam-member{display:grid;grid-template-columns:minmax(170px,1fr) minmax(150px,190px) auto;align-items:center;gap:10px;padding:10px 11px;background:var(--raised);border-radius:9px}.tam-disabled-note{margin:14px 0 0;padding:11px;border-radius:9px;color:#f59e0b;background:rgba(245,158,11,.08);font-size:12px}
  .tam-pagination{min-height:50px;margin-top:14px;padding:12px 2px 0;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:12px}.tam-page-actions{display:flex;align-items:center;gap:8px}.tam-page-current{min-width:100px;text-align:center;color:var(--muted);font-size:12px}.tam-loading-list{min-height:300px;display:grid;place-items:center;color:var(--muted);font-size:13px}.tam-spinner{width:24px;height:24px;margin:0 auto 9px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:tam-spin .7s linear infinite}@keyframes tam-spin{to{transform:rotate(360deg)}}
  @media(max-width:900px){.tam-layout{grid-template-columns:1fr}.tam-team-list{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:680px){.tam-nav,.tam-header{padding-left:14px;padding-right:14px}.tam-content{padding:14px}.tam-form-row,.tam-agent{grid-template-columns:1fr}.tam-agent-actions{justify-content:flex-start}}@media(max-width:480px){.tam-team-list{grid-template-columns:1fr}.tam-dashboard-text{display:none}}
  @media(max-width:760px){.tam-company-row,.tam-group-head,.tam-member,.tam-add-member.tam-form-row{grid-template-columns:1fr}.tam-add-team-form,.tam-list-toolbar{grid-template-columns:1fr}.tam-group-actions,.tam-agent-actions{justify-content:flex-start}.tam-pagination{align-items:flex-start;flex-direction:column}.tam-page-actions{width:100%}.tam-page-actions .tam-btn{flex:1}.tam-page-current{min-width:80px}}
`;

export default function TeamAgentManagement() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState('');
  const [teams, setTeams] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [teamName, setTeamName] = useState('');
  const [agentForm, setAgentForm] = useState({ name: '', teamId: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const showMessage = (type, value) => {
    setMessage({ type, value });
    window.setTimeout(() => setMessage(null), 3500);
  };

  const loadCompanies = useCallback(async () => {
    const response = await API.get('/api/companies');
    const active = (response.data.companies || []).filter(company => company.isActive);
    setCompanies(active);
    setCompanyId(current => current || active[0]?._id || '');
  }, []);

  const loadData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [teamResponse, agentResponse] = await Promise.all([
        API.get('/api/teams', { params: { companyId } }),
        API.get('/api/agents', { params: { companyId } }),
      ]);
      setTeams(teamResponse.data.teams || []);
      setAgents(agentResponse.data.agents || []);
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Unable to load data');
    } finally { setLoading(false); }
  }, [companyId]);

  useEffect(() => {
    loadCompanies().catch(error => {
      setLoading(false);
      showMessage('error', error.response?.data?.message || 'Unable to load companies');
    });
  }, [loadCompanies]);

  useEffect(() => {
    setSelectedGroup('');
    setAgentForm({ name: '', teamId: '' });
    setSearch('');
    setPage(1);
    loadData();
  }, [loadData]);

  const selectGroup = group => {
    const nextGroup = selectedGroup === group ? '' : group;
    setSelectedGroup(nextGroup);
    const team = teams.find(item => item._id === nextGroup);
    setAgentForm(current => ({
      ...current,
      teamId: nextGroup === 'individual' ? '' : (team?.isActive ? nextGroup : ''),
    }));
  };

  const createTeam = async event => {
    event.preventDefault();
    if (!teamName.trim()) return;
    setSaving(true);
    try {
      const response = await API.post('/api/teams', { companyId, name: teamName.trim() });
      setTeamName('');
      await loadData();
      setSelectedGroup(response.data.team._id);
      setAgentForm(current => ({ ...current, teamId: response.data.team._id }));
      showMessage('success', 'Team created successfully');
    } catch (error) { showMessage('error', error.response?.data?.message || 'Unable to create team'); }
    finally { setSaving(false); }
  };

  const createAgent = async event => {
    event.preventDefault();
    if (!agentForm.name.trim()) return;
    setSaving(true);
    try {
      await API.post('/api/agents', { companyId, name: agentForm.name.trim(), teamId: agentForm.teamId || null });
      setAgentForm(current => ({ ...current, name: '' }));
      await loadData();
      showMessage('success', 'Agent added successfully');
    } catch (error) { showMessage('error', error.response?.data?.message || 'Unable to add agent'); }
    finally { setSaving(false); }
  };

  const updateTeam = async (team, changes) => {
    try { await API.patch(`/api/teams/${team._id}`, changes); await loadData(); showMessage('success', 'Team updated'); }
    catch (error) { showMessage('error', error.response?.data?.message || 'Unable to update team'); }
  };

  const updateAgent = async (agent, changes) => {
    try { await API.patch(`/api/agents/${agent._id}`, changes); await loadData(); showMessage('success', 'Agent updated'); }
    catch (error) { showMessage('error', error.response?.data?.message || 'Unable to update agent'); }
  };

  const renameTeam = team => {
    const name = window.prompt('Enter team name', team.name);
    if (name?.trim() && name.trim() !== team.name) updateTeam(team, { name: name.trim() });
  };
  const renameAgent = agent => {
    const name = window.prompt('Enter agent name', agent.name);
    if (name?.trim() && name.trim() !== agent.name) updateAgent(agent, { name: name.trim() });
  };

  const deleteTeam = async team => {
    if (!window.confirm(`Delete ${team.name}? Used teams cannot be deleted.`)) return;
    try { await API.delete(`/api/teams/${team._id}`); setSelectedGroup(''); await loadData(); showMessage('success', 'Team deleted'); }
    catch (error) { showMessage('error', error.response?.data?.message || 'Unable to delete team'); }
  };
  const deleteAgent = async agent => {
    if (!window.confirm(`Delete ${agent.name}? Agents with reports cannot be deleted.`)) return;
    try { await API.delete(`/api/agents/${agent._id}`); await loadData(); showMessage('success', 'Agent deleted'); }
    catch (error) { showMessage('error', error.response?.data?.message || 'Unable to delete agent'); }
  };

  const logout = () => {
    localStorage.removeItem('authToken'); localStorage.removeItem('authUser'); localStorage.removeItem('adminToken');
    navigate('/', { replace: true });
  };

  const groups = [
    { _id: 'individual', name: 'Individual Agents', isActive: true, isIndividual: true },
    ...teams,
  ];
  const filteredGroups = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return groups;
    return groups.filter(group => {
      const members = group.isIndividual
        ? agents.filter(agent => !agent.team)
        : agents.filter(agent => agent.team?._id === group._id);
      return group.name.toLowerCase().includes(term)
        || members.some(agent => agent.name.toLowerCase().includes(term));
    });
  }, [groups, agents, search]);
  const totalPages = Math.max(Math.ceil(filteredGroups.length / TEAM_PAGE_SIZE), 1);
  const visibleGroups = filteredGroups.slice((page - 1) * TEAM_PAGE_SIZE, page * TEAM_PAGE_SIZE);

  useEffect(() => { setPage(1); setSelectedGroup(''); }, [search]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <>
      <style>{styles}</style>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />

      <div className="tam-root">
        <nav className="tam-nav">
          <div className="tam-brand">
            <div className="tam-brand-icon"><i className="ti ti-users" /></div>
            <div><strong>Arbaj Technology</strong><small>Teams & Agents</small></div>
          </div>
          <div className="tam-actions">
            <button type="button" className="tam-btn" onClick={() => navigate('/admin/dashboard')}><span className="tam-dashboard-text">Dashboard</span></button>
            <button type="button" className="tam-btn danger" onClick={logout}>Logout</button>
          </div>
        </nav>

        <header className="tam-header">
          <h1>Team & Agent Management</h1>
          <p>Select a team to view its members directly below it.</p>
        </header>

        <main className="tam-content">
          {message && <div className={`tam-alert ${message.type}`}>{message.value}</div>}

          <section className="tam-company">
            <div className="tam-company-row">
              <div>
                <label className="tam-label" htmlFor="company">Manage company</label>
                <select id="company" className="tam-input" value={companyId} onChange={event => setCompanyId(event.target.value)}>
                  {companies.map(company => <option key={company._id} value={company._id}>{company.name}</option>)}
                </select>
              </div>

              <form className="tam-add-team-form" onSubmit={createTeam}>
                <div>
                  <label className="tam-label">Create new team</label>
                  <input className="tam-input" value={teamName} onChange={event => setTeamName(event.target.value)} placeholder="Enter team name" required />
                </div>
                <button className="tam-btn primary" disabled={saving || !companyId}>Add Team</button>
              </form>
            </div>
          </section>

          <section className="tam-list-toolbar">
            <label>
              <span className="tam-label">Search team or agent</span>
              <input className="tam-input" value={search} onChange={event => setSearch(event.target.value)} placeholder="Type a team or agent name" />
            </label>
            <div className="tam-list-count">{filteredGroups.length} section{filteredGroups.length === 1 ? '' : 's'} · {agents.length} agents</div>
          </section>

          {loading && teams.length === 0 && agents.length === 0 ? (
            <div className="tam-loading-list"><div><div className="tam-spinner" />Loading teams and agents…</div></div>
          ) : <div className="tam-accordion-list">
            {visibleGroups.map(group => {
              const isOpen = selectedGroup === group._id;
              const members = group.isIndividual
                ? agents.filter(agent => !agent.team)
                : agents.filter(agent => agent.team?._id === group._id);

              return (
                <section className={`tam-group ${isOpen ? 'open' : ''}`} key={group._id}>
                  <div className="tam-group-head">
                    <button type="button" className="tam-group-toggle" onClick={() => selectGroup(group._id)}>
                      <span className="tam-chevron">›</span>
                      <span>
                        <span className="tam-group-title">{group.name}</span>
                        <span className="tam-group-info">
                          {members.length} member{members.length === 1 ? '' : 's'}
                          {!group.isIndividual && <> · <span className={`tam-status ${group.isActive ? '' : 'off'}`}>{group.isActive ? 'Active' : 'Inactive'}</span></>}
                        </span>
                      </span>
                    </button>

                    {!group.isIndividual && (
                      <div className="tam-group-actions">
                        <button type="button" className="tam-btn tam-mini" onClick={() => renameTeam(group)}>Rename</button>
                        <button type="button" className="tam-btn tam-mini" onClick={() => updateTeam(group, { isActive: !group.isActive })}>{group.isActive ? 'Deactivate' : 'Activate'}</button>
                        <button type="button" className="tam-btn tam-mini danger" onClick={() => deleteTeam(group)}>Delete</button>
                      </div>
                    )}
                  </div>

                  {isOpen && (
                    <div className="tam-group-body">
                      {(group.isIndividual || group.isActive) ? (
                        <form className="tam-add-member tam-form-row" onSubmit={createAgent}>
                          <div>
                            <label className="tam-label">Add member to {group.name}</label>
                            <input className="tam-input" value={agentForm.name} onChange={event => setAgentForm(current => ({ ...current, name: event.target.value }))} placeholder="Official agent name" required />
                          </div>
                          <button className="tam-btn primary" disabled={saving || !companyId}>Add Agent</button>
                        </form>
                      ) : (
                        <div className="tam-disabled-note">Activate this team before adding new members.</div>
                      )}

                      {loading ? (
                        <div className="tam-empty">Loading members…</div>
                      ) : members.length === 0 ? (
                        <div className="tam-empty">No members added in {group.name}</div>
                      ) : (
                        <div className="tam-member-list">
                          {members.map(agent => (
                            <div className="tam-member" key={agent._id}>
                              <div>
                                <div className="tam-agent-name">{agent.name}</div>
                                <div className="tam-agent-team">
                                  {agent.team?.name || 'Individual'} · <span className={`tam-status ${agent.isActive ? '' : 'off'}`}>{agent.isActive ? 'Active' : 'Inactive'}</span>
                                </div>
                              </div>

                              <select className="tam-input" value={agent.team?._id || ''} disabled={!agent.isActive} onChange={event => updateAgent(agent, { teamId: event.target.value || null })}>
                                <option value="">Individual</option>
                                {teams.filter(team => team.isActive).map(team => <option key={team._id} value={team._id}>{team.name}</option>)}
                              </select>

                              <div className="tam-agent-actions">
                                <button type="button" className="tam-btn tam-mini" onClick={() => renameAgent(agent)}>Rename</button>
                                <button type="button" className="tam-btn tam-mini" onClick={() => updateAgent(agent, { isActive: !agent.isActive })}>{agent.isActive ? 'Deactivate' : 'Activate'}</button>
                                <button type="button" className="tam-btn tam-mini danger" onClick={() => deleteAgent(agent)}>Delete</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
            {!visibleGroups.length && <div className="tam-empty">No matching team or agent found.</div>}
          </div>}

          {!loading && filteredGroups.length > 0 && (
            <div className="tam-pagination">
              <span className="tam-list-count">Showing {(page - 1) * TEAM_PAGE_SIZE + 1}–{Math.min(page * TEAM_PAGE_SIZE, filteredGroups.length)} of {filteredGroups.length}</span>
              <div className="tam-page-actions">
                <button className="tam-btn" disabled={page === 1} onClick={() => setPage(current => Math.max(current - 1, 1))}>Previous</button>
                <span className="tam-page-current">Page {page} of {totalPages}</span>
                <button className="tam-btn" disabled={page === totalPages} onClick={() => setPage(current => Math.min(current + 1, totalPages))}>Next</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
