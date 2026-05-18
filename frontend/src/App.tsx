import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import WaitingApprovalPage from './pages/auth/WaitingApprovalPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAgents from './pages/admin/AdminAgents'

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/waiting" element={<WaitingApprovalPage />} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/agents" element={<AdminAgents />} />
      <Route path="/admin/clients" element={<PlaceholderPage title="All Clients" />} />
      <Route path="/admin/renewals" element={<PlaceholderPage title="Renewals" />} />
      <Route path="/admin/settings" element={<PlaceholderPage title="Agency Settings" />} />

      {/* Agent */}
      <Route path="/agent/dashboard" element={<PlaceholderPage title="Agent Dashboard" />} />
      <Route path="/agent/clients" element={<PlaceholderPage title="My Clients" />} />
      <Route path="/agent/tasks" element={<PlaceholderPage title="Task Kanban" />} />
      <Route path="/agent/events" element={<PlaceholderPage title="Events" />} />
      <Route path="/agent/profile" element={<PlaceholderPage title="Profile" />} />

      {/* Client Portal */}
      <Route path="/client/dashboard" element={<PlaceholderPage title="My Portal" />} />
      <Route path="/client/policies" element={<PlaceholderPage title="My Policies" />} />
      <Route path="/client/payments" element={<PlaceholderPage title="Payments" />} />
      <Route path="/client/profile" element={<PlaceholderPage title="Company Profile" />} />
      <Route path="/client/contact" element={<PlaceholderPage title="Contact Agent" />} />
      <Route path="/client/setup" element={<PlaceholderPage title="Account Setup" />} />

      {/* Legacy */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-emerald-400 mb-2">{title}</h1>
        <p className="text-zinc-400">Coming soon — this page is under construction.</p>
      </div>
    </div>
  )
}
