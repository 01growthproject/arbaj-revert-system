import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

const pageDetails = {
  '/admin/dashboard': {
    title: 'Admin Dashboard',
    subtitle: 'Reports, filters, lead assignment and performance overview.',
  },
  '/admin/team-agents': {
    title: 'Teams & Agents',
    subtitle: 'Create teams and manage verified agents.',
  },
  '/admin/operations': {
    title: 'Team Performance',
    subtitle: 'Daily team performance, lead completion and AI summary.',
  },
  '/admin/csv-import': {
    title: 'CSV Bulk Import',
    subtitle: 'Import teams, agents and daily assigned leads.',
  },
  '/company/form': {
    title: 'Daily Revert Form',
    subtitle: 'Submit your daily calls and client response report.',
  },
  '/company/reports': {
    title: 'My Reports',
    subtitle: 'Review your previously submitted reports.',
  },
};

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/admin/team-agents', label: 'Teams & Agents', icon: '♙' },
  { to: '/admin/operations', label: 'Team Performance', icon: '↗' },
  { to: '/admin/csv-import', label: 'CSV Bulk Import', icon: '⇧' },
];

const companyLinks = [
  { to: '/company/form', label: 'Daily Form', icon: '▤' },
  { to: '/company/reports', label: 'My Reports', icon: '▥' },
];

const styles = `
  *,*::before,*::after{box-sizing:border-box}
  html,body,#root{margin:0;min-height:100%;background:#0b1120}
  body{overflow:hidden}
  .al-shell{--al-bg:#0b1120;--al-surface:#111827;--al-raised:#1a2235;--al-border:#22314b;--al-text:#f1f5f9;--al-muted:#94a3b8;--al-accent:#3b82f6;--al-danger:#ef4444;width:100%;height:100vh;display:flex;overflow:hidden;background:var(--al-bg);color:var(--al-text);font-family:Arial,'DM Sans',sans-serif}
  .al-sidebar{width:240px;min-width:240px;height:100vh;display:flex!important;flex-direction:column;padding:18px 14px;background:#111827!important;border-right:1px solid #22314b;overflow-y:auto;z-index:50;color:#f1f5f9!important;visibility:visible!important;opacity:1!important}
  .al-sidebar *{visibility:visible!important;opacity:1}
  .al-brand{display:flex!important;align-items:center;gap:11px;padding:2px 8px 20px;color:#f8fafc!important}.al-brand-icon{width:38px;height:38px;min-width:38px;display:grid;place-items:center;border-radius:11px;color:#60a5fa!important;background:rgba(59,130,246,.14);font-size:18px}.al-brand-copy{display:block!important;min-width:0;color:#f8fafc!important}.al-brand strong,.al-brand small{display:block!important}.al-brand strong{color:#f8fafc!important;font-size:14px!important;line-height:1.3}.al-brand small{margin-top:3px;color:#94a3b8!important;font-size:10px!important;line-height:1.3}
  .al-section-label{display:block!important;padding:10px 10px 8px;color:#64748b!important;font-size:9px!important;font-weight:800;text-transform:uppercase;letter-spacing:.12em}.al-links{display:grid!important;gap:5px}.al-link{width:100%;min-height:42px;padding:10px 11px;display:flex!important;align-items:center;gap:11px;border:1px solid transparent;border-radius:9px;color:#cbd5e1!important;text-decoration:none!important;font-size:12px!important;font-weight:600;line-height:1.3;transition:.15s}.al-link-icon{width:20px;min-width:20px;display:inline-flex!important;align-items:center;justify-content:center;color:#94a3b8!important;font-size:17px!important}.al-link-label{display:inline-block!important;color:inherit!important;font-size:12px!important;white-space:nowrap}.al-link:hover{color:#fff!important;background:#1a2235;border-color:#22314b}.al-link.active{color:#fff!important;background:rgba(59,130,246,.16);border-color:rgba(59,130,246,.35)}.al-link.active .al-link-icon{color:#60a5fa!important}
  .al-spacer{flex:1}.al-account{display:block!important;margin-top:18px;padding:12px;border-top:1px solid #22314b;color:#f8fafc!important}.al-account-name{display:block!important;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#f8fafc!important;font-size:12px!important;font-weight:700}.al-account-role{display:block!important;margin-top:3px;color:#94a3b8!important;font-size:10px!important;text-transform:capitalize}.al-logout{width:100%;min-height:38px;margin-top:11px;padding:8px 10px;display:flex!important;align-items:center;justify-content:center;gap:8px;border:1px solid rgba(239,68,68,.3);border-radius:8px;color:#f87171!important;background:rgba(239,68,68,.07);font:600 12px Arial,sans-serif;cursor:pointer}.al-logout:hover{background:rgba(239,68,68,.14)}
  .al-main{height:100vh;min-width:0;flex:1;overflow-y:auto;overflow-x:hidden;scrollbar-gutter:stable;background:#0b1120}.al-mobile-bar{display:none}.al-page-head{position:sticky;top:0;z-index:40;min-height:72px;padding:15px 28px;display:flex;align-items:center;justify-content:space-between;gap:16px;background:rgba(17,24,39,.96);border-bottom:1px solid #22314b;backdrop-filter:blur(12px);color:#f8fafc!important}.al-page-head h1{margin:0;color:#f8fafc!important;font:400 1.5rem Georgia,serif}.al-page-head p{margin:4px 0 0;color:#94a3b8!important;font-size:12px}.al-role-pill{padding:5px 10px;border-radius:999px;color:#93c5fd!important;background:rgba(59,130,246,.11);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em}.al-content{width:100%;min-width:0;overflow-x:hidden}
  .al-content .ad-nav,.al-content .op-nav,.al-content .tam-nav,.al-content .csv-nav,.al-content .af-nav,.al-content .mr-nav,.al-content .ad-page-header,.al-content .op-header,.al-content .tam-header,.al-content .csv-header,.al-content .af-page-header,.al-content .mr-page-header,.al-content .af-mob-menu,.al-content .mr-mob-menu{display:none!important}
  .al-content .ad-root,.al-content .op-root,.al-content .tam-root,.al-content .csv-root,.al-content .af-root,.al-content .mr-root{min-height:calc(100vh - 72px)}
  .al-overlay{display:none}
  @media(max-width:1024px){body{overflow:auto}.al-shell{height:100vh;display:block}.al-sidebar{position:fixed;inset:0 auto 0 0;width:min(280px,86vw);min-width:0;transform:translateX(-105%);transition:transform .2s ease;box-shadow:18px 0 45px rgba(0,0,0,.38)}.al-sidebar.open{transform:translateX(0)}.al-overlay{position:fixed;inset:0;z-index:45;display:block;border:0;background:rgba(2,6,23,.68);backdrop-filter:blur(2px)}.al-main{width:100%;height:100vh}.al-mobile-bar{position:sticky;top:0;z-index:39;min-height:56px;padding:9px 14px;display:flex!important;align-items:center;justify-content:space-between;background:#111827;border-bottom:1px solid #22314b;color:#f8fafc!important}.al-mobile-brand{display:flex!important;align-items:center;gap:9px;color:#f8fafc!important;font-size:13px!important;font-weight:700}.al-menu-btn{width:38px;height:38px;display:grid;place-items:center;border:1px solid #22314b;border-radius:9px;background:#1a2235;color:#f8fafc!important;font-size:21px;cursor:pointer}.al-page-head{position:relative;min-height:auto;padding:15px 14px}.al-page-head h1{font-size:1.3rem}.al-page-head p{font-size:11px}.al-role-pill{display:none}.al-content .ad-root,.al-content .op-root,.al-content .tam-root,.al-content .csv-root,.al-content .af-root,.al-content .mr-root{min-height:calc(100vh - 120px)}}
`;

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('authUser') || 'null');
  } catch {
    user = null;
  }

  const isAdmin = user?.role === 'super_admin';
  const links = isAdmin ? adminLinks : companyLinks;
  const details = pageDetails[location.pathname] || {
    title: 'Revert System',
    subtitle: 'Arbaj Technology operations portal.',
  };

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('adminToken');
    sessionStorage.removeItem('lockedCompanyParam');
    navigate('/', { replace: true });
  };

  return (
    <>
      <style>{styles}</style>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />
      <div className="al-shell">
        {open && <button className="al-overlay" aria-label="Close navigation" onClick={() => setOpen(false)} />}
        <aside className={`al-sidebar ${open ? 'open' : ''}`}>
          <div className="al-brand">
            <div className="al-brand-icon">◎</div>
            <div className="al-brand-copy"><strong>Arbaj Technology</strong><small>Revert System</small></div>
          </div>

          <div className="al-section-label">Navigation</div>
          <nav className="al-links" aria-label="Main navigation">
            {links.map(link => (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => `al-link ${isActive ? 'active' : ''}`}>
                <span className="al-link-icon" aria-hidden="true">{link.icon}</span>
                <span className="al-link-label">{link.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="al-spacer" />
          <div className="al-account">
            <div className="al-account-name">{user?.name || user?.username || 'Account'}</div>
            <div className="al-account-role">{isAdmin ? 'Super Admin' : user?.company?.name || 'Company User'}</div>
            <button type="button" className="al-logout" onClick={logout}><span aria-hidden="true">↪</span> Logout</button>
          </div>
        </aside>

        <section className="al-main">
          <div className="al-mobile-bar">
            <div className="al-mobile-brand"><span className="al-brand-icon" style={{ width: 34, height: 34 }}>◎</span>Arbaj Technology</div>
            <button type="button" className="al-menu-btn" aria-label="Open navigation" onClick={() => setOpen(true)}>☰</button>
          </div>
          <header className="al-page-head">
            <div><h1>{details.title}</h1><p>{details.subtitle}</p></div>
            <span className="al-role-pill">{isAdmin ? 'Admin Portal' : 'Company Portal'}</span>
          </header>
          <main className="al-content">{children}</main>
        </section>
      </div>
    </>
  );
}
