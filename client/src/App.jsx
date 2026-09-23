import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import MyReports from './pages/MyReports.jsx';
import AgentForm from './pages/AgentForm';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import TeamAgentManagement from './pages/TeamAgentManagement';
import DailyOperations from './pages/DailyOperations';
import CsvImport from './pages/CsvImport';
import AppLayout from './components/AppLayout';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); }, [pathname]);
  return null;
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('authToken');
  const savedUser = localStorage.getItem('authUser');

  if (!token || !savedUser) return <Navigate to="/" replace />;

  let user;
  try {
    user = JSON.parse(savedUser);
  } catch {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'super_admin' ? '/admin/dashboard' : '/company/form'} replace />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/company/form" element={<ProtectedRoute allowedRoles={['company_user']}><AppLayout><AgentForm /></AppLayout></ProtectedRoute>} />
        <Route path="/company/reports" element={<ProtectedRoute allowedRoles={['company_user']}><AppLayout><MyReports /></AppLayout></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/admin/team-agents" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout><TeamAgentManagement /></AppLayout></ProtectedRoute>} />
        <Route path="/admin/operations" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout><DailyOperations /></AppLayout></ProtectedRoute>} />
        <Route path="/admin/csv-import" element={<ProtectedRoute allowedRoles={['super_admin']}><AppLayout><CsvImport /></AppLayout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
