import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AgentForm from './pages/AgentForm'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import MyReports from './pages/MyReports.jsx'

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken')
  return token ? children : <Navigate to="/admin" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AgentForm />} />
        <Route path="/my-reports" element={<MyReports />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}