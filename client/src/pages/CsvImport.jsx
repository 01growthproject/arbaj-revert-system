import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import API from '../utils/api';
import { downloadCsvTemplate, parseCsv } from '../utils/csv';

const today = new Date().toISOString().slice(0, 10);

const styles = `
  *,*::before,*::after{box-sizing:border-box}body{margin:0}
  .csv-root{--bg:#0b1120;--surface:#111827;--raised:#1a2235;--border:#22314b;--text:#f1f5f9;--muted:#7c8ba5;--accent:#3b82f6;--success:#10b981;--danger:#ef4444;min-height:100vh;background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif}
  .csv-nav{min-height:58px;padding:9px 28px;display:flex;align-items:center;justify-content:space-between;gap:16px;background:var(--surface);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:10}.csv-brand{display:flex;align-items:center;gap:10px}.csv-logo{width:34px;height:34px;display:grid;place-items:center;border-radius:9px;background:rgba(59,130,246,.15);color:var(--accent)}.csv-brand strong,.csv-brand small{display:block}.csv-brand small{margin-top:2px;color:var(--muted);font-size:10px}.csv-actions{display:flex;gap:7px;flex-wrap:wrap}
  .csv-btn{min-height:36px;padding:8px 14px;border:1px solid var(--border);border-radius:8px;background:var(--raised);color:var(--text);font:600 12px 'DM Sans',sans-serif;cursor:pointer}.csv-btn:hover{border-color:var(--accent)}.csv-btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}.csv-btn.danger{color:var(--danger);border-color:rgba(239,68,68,.35);background:rgba(239,68,68,.08)}.csv-btn:disabled{opacity:.5;cursor:not-allowed}
  .csv-header{padding:22px 28px 18px;background:var(--surface);border-bottom:1px solid var(--border)}.csv-header h1{margin:0 0 5px;font:400 1.65rem 'DM Serif Display',serif}.csv-header p{margin:0;color:var(--muted);font-size:13px}.csv-content{max-width:1200px;margin:0 auto;padding:24px;display:grid;gap:16px}
  .csv-card{position:relative;padding:20px;background:var(--surface);border:1px solid var(--border);border-radius:14px}.csv-label{display:block;margin-bottom:7px;color:var(--muted);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em}.csv-select{width:100%;min-height:42px;padding:9px 12px;border:1px solid var(--border);border-radius:9px;outline:none;background:var(--raised);color:var(--text);font:400 14px 'DM Sans',sans-serif}.csv-select:focus{border-color:var(--accent)}.csv-select:disabled{opacity:.6;cursor:not-allowed}
  .csv-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.csv-import h2{margin:0 0 6px;font-size:17px}.csv-import>p{min-height:42px;margin:0 0 16px;color:var(--muted);font-size:12px;line-height:1.6}.csv-columns{margin-bottom:16px;padding:12px;border:1px solid var(--border);border-radius:9px;background:var(--raised)}.csv-columns strong{display:block;margin-bottom:7px;font-size:11px;color:#93c5fd}.csv-columns code{color:#cbd5e1;font-size:11px;word-break:break-word}.csv-steps{margin:0 0 18px;padding-left:19px;color:var(--muted);font-size:12px;line-height:1.8}.csv-buttons{display:flex;gap:9px;flex-wrap:wrap}.csv-message{margin-top:14px;padding:11px 12px;border-radius:9px;color:var(--success);background:rgba(16,185,129,.09);border:1px solid rgba(16,185,129,.25);font-size:12px;line-height:1.6}.csv-message.error{color:var(--danger);background:rgba(239,68,68,.09);border-color:rgba(239,68,68,.25)}.csv-note{padding:13px 15px;border-radius:10px;color:#fbbf24;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);font-size:12px;line-height:1.6}
  @media(max-width:800px){.csv-grid{grid-template-columns:1fr}.csv-import>p{min-height:0}}@media(max-width:620px){.csv-nav,.csv-header{padding-left:14px;padding-right:14px}.csv-content{padding:14px}.csv-card{padding:15px}.csv-actions .hide-mobile{display:none}.csv-buttons{display:grid}.csv-btn{width:100%}}
`;

export default function CsvImport() {
  const navigate = useNavigate();
  const agentFileRef = useRef(null);
  const leadFileRef = useRef(null);
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState('');
  const [importing, setImporting] = useState('');
  const [messages, setMessages] = useState({ agents: '', leads: '' });
  const [companiesLoading, setCompaniesLoading] = useState(true);

  useEffect(() => {
    API.get('/api/companies')
      .then(response => setCompanies((response.data.companies || []).filter(company => company.isActive)))
      .catch(error => setMessages(current => ({
        ...current,
        agents: `Error: ${error.response?.data?.message || 'Unable to load companies'}`,
      })))
      .finally(() => setCompaniesLoading(false));
  }, []);

  const runImport = async (type, file) => {
    if (!companyId) {
      setMessages(current => ({ ...current, [type]: 'Error: Select a company first.' }));
      return;
    }
    if (!file) return;

    setImporting(type);
    setMessages(current => ({ ...current, [type]: '' }));

    try {
      const rows = parseCsv(await file.text());
      if (!rows.length) throw new Error('CSV must contain headers and at least one data row');

      const endpoint = type === 'agents'
        ? '/api/agents/bulk-import'
        : '/api/assigned-leads/bulk-import';
      const response = await API.post(endpoint, { companyId, rows });
      const result = response.data.result;
      const saved = type === 'agents'
        ? (result.created || 0) + (result.updated || 0)
        : result.imported || 0;
      const errorText = result.errors?.length
        ? ` Failed rows: ${result.errors.slice(0, 5).map(item => `Row ${item.row}: ${item.message}`).join(' | ')}`
        : '';

      setMessages(current => ({
        ...current,
        [type]: `Import completed. ${saved} row(s) saved.${errorText}`,
      }));
    } catch (error) {
      setMessages(current => ({
        ...current,
        [type]: `Error: ${error.response?.data?.message || error.message}`,
      }));
    } finally {
      setImporting('');
      if (agentFileRef.current) agentFileRef.current.value = '';
      if (leadFileRef.current) leadFileRef.current.value = '';
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('adminToken');
    navigate('/', { replace: true });
  };

  return (
    <>
      <style>{styles}</style>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />
      <div className="csv-root">
        <nav className="csv-nav">
          <div className="csv-brand"><div className="csv-logo">⇧</div><div><strong>Arbaj Technology</strong><small>CSV Bulk Import</small></div></div>
          <div className="csv-actions">
            <button className="csv-btn hide-mobile" onClick={() => navigate('/admin/dashboard')}>Dashboard</button>
            <button className="csv-btn hide-mobile" onClick={() => navigate('/admin/operations')}>Team Performance</button>
            <button className="csv-btn danger" onClick={logout}>Logout</button>
          </div>
        </nav>

        <header className="csv-header">
          <h1>CSV Bulk Import</h1>
          <p>Multiple teams, agents and daily lead assignments ek saath upload karein.</p>
        </header>

        <main className="csv-content">
          <section className="csv-card">
            <label className="csv-label" htmlFor="csv-company">Import into company</label>
            <select id="csv-company" className="csv-select" value={companyId} disabled={companiesLoading || importing !== ''} onChange={event => { setCompanyId(event.target.value); setMessages({ agents: '', leads: '' }); }}>
              <option value="">{companiesLoading ? 'Loading companies…' : 'Select company...'}</option>
              {companies.map(company => <option key={company._id} value={company._id}>{company.name}</option>)}
            </select>
          </section>

          {!companyId && <div className="csv-note">Template download kar sakte ho, lekin CSV import karne se pehle company select karna zaroori hai.</div>}

          <section className="csv-grid">
            <article className="csv-card csv-import">
              <h2>Teams + Agents</h2>
              <p>Nayi teams automatically create hongi. Existing agent dobara aaye to uska active status update hoga.</p>
              <div className="csv-columns"><strong>Required CSV columns</strong><code>agentName, teamName, isActive</code></div>
              <ol className="csv-steps"><li>Template download karo</li><li>Agent aur team details fill karo</li><li>CSV format mein save karke import karo</li></ol>
              <div className="csv-buttons">
                <button className="csv-btn" onClick={() => downloadCsvTemplate('teams-agents-template.csv', ['agentName', 'teamName', 'isActive'], [{ agentName: 'Priyanka', teamName: 'Kavya Team', isActive: 'true' }, { agentName: 'Kirti Sharma', teamName: 'Individual', isActive: 'true' }])}>Download template</button>
                <button className="csv-btn primary" disabled={!companyId || importing === 'agents'} onClick={() => agentFileRef.current?.click()}>{importing === 'agents' ? 'Importing...' : 'Select & import CSV'}</button>
                <input hidden ref={agentFileRef} type="file" accept=".csv,text/csv" onChange={event => runImport('agents', event.target.files?.[0])} />
              </div>
              {messages.agents && <div className={`csv-message ${messages.agents.startsWith('Error') ? 'error' : ''}`}>{messages.agents}</div>}
            </article>

            <article className="csv-card csv-import">
              <h2>Daily Assigned Leads</h2>
              <p>Ek date par multiple agents ki assigned leads save ya update hongi. Correct team name dena zaroori hai.</p>
              <div className="csv-columns"><strong>Required CSV columns</strong><code>agentName, teamName, assignedDate, leadsAssigned, note</code></div>
              <ol className="csv-steps"><li>Template download karo</li><li>Date YYYY-MM-DD format mein fill karo</li><li>Lead counts add karke CSV import karo</li></ol>
              <div className="csv-buttons">
                <button className="csv-btn" onClick={() => downloadCsvTemplate('assigned-leads-template.csv', ['agentName', 'teamName', 'assignedDate', 'leadsAssigned', 'note'], [{ agentName: 'Priyanka', teamName: 'Kavya Team', assignedDate: today, leadsAssigned: '50', note: 'WhatsApp list' }])}>Download template</button>
                <button className="csv-btn primary" disabled={!companyId || importing === 'leads'} onClick={() => leadFileRef.current?.click()}>{importing === 'leads' ? 'Importing...' : 'Select & import CSV'}</button>
                <input hidden ref={leadFileRef} type="file" accept=".csv,text/csv" onChange={event => runImport('leads', event.target.files?.[0])} />
              </div>
              {messages.leads && <div className={`csv-message ${messages.leads.startsWith('Error') ? 'error' : ''}`}>{messages.leads}</div>}
            </article>
          </section>
        </main>
      </div>
    </>
  );
}
