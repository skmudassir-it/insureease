import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'
import { adminApi } from '../../api/admin.api'
import { Toaster, toast } from 'sonner'
import { UserCheck, Shield, XCircle, CheckCircle, ArrowLeft, LogOut, LayoutDashboard } from 'lucide-react'
import { StatusBadge } from '../../components/StatusBadge'
import type { AgentApplication } from '../../types'

export default function AdminAgents() {
  const { user, token, logout } = useAuthStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'pending' | 'active'>('pending')
  const [pending, setPending] = useState<AgentApplication[]>([])
  const [active, setActive] = useState<AgentApplication[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    const [p, a] = await Promise.all([
      adminApi.getPendingApplications().catch(() => []),
      adminApi.getAgents().catch(() => []),
    ])
    setPending(p)
    setActive(a)
    setLoading(false)
  }

  useEffect(() => {
    if (!token || user?.role !== 'admin') { navigate('/login'); return }
    fetchData()
  }, [token, user, navigate])

  const handleApprove = async (id: string) => {
    try {
      await adminApi.approveAgent(id)
      toast.success('Agent approved!')
      fetchData()
    } catch { toast.error('Failed to approve agent') }
  }

  const handleReject = async (id: string) => {
    try {
      await adminApi.rejectAgent(id)
      toast.success('Agent rejected')
      fetchData()
    } catch { toast.error('Failed to reject') }
  }

  const handleDeactivate = async (id: string) => {
    try {
      await adminApi.deactivateAgent(id)
      toast.success('Agent deactivated')
      fetchData()
    } catch { toast.error('Failed to deactivate') }
  }

  const handleLogout = () => { logout(); navigate('/') }

  const AdminNav = () => (
    <nav className="flex items-center gap-1">
      {[
        { to: '/admin/dashboard', label: 'Dashboard' },
        { to: '/admin/agents', label: 'Agents' },
        { to: '/admin/clients', label: 'Clients' },
        { to: '/admin/renewals', label: 'Renewals' },
        { to: '/admin/settings', label: 'Settings' },
      ].map(l => (
        <Link key={l.to} to={l.to} className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition">
          {l.label}
        </Link>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Toaster position="top-right" theme="dark" />
      <header className="border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="p-1 hover:bg-zinc-800 rounded-lg transition"><ArrowLeft className="w-5 h-5 text-zinc-400" /></Link>
          <LayoutDashboard className="w-6 h-6 text-emerald-400" />
          <h1 className="text-xl font-bold text-emerald-400">InsureEase</h1>
          <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <AdminNav />
          <span className="text-sm text-zinc-400">{user?.name}</span>
          <button onClick={handleLogout} className="p-2 hover:bg-zinc-800 rounded-lg transition">
            <LogOut className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Agent Management</h2>
          <p className="text-zinc-400 text-sm mt-1">Review applications and manage active agents</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-900 rounded-lg p-1 w-fit">
          <button
            onClick={() => setTab('pending')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              tab === 'pending' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Pending Approvals {pending.length > 0 && `(${pending.length})`}
          </button>
          <button
            onClick={() => setTab('active')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              tab === 'active' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Active Agents {active.length > 0 && `(${active.length})`}
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 border border-zinc-800 rounded-xl animate-pulse bg-zinc-900" />)}
          </div>
        ) : tab === 'pending' ? (
          <div className="space-y-3">
            {pending.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
                <p>No pending applications</p>
              </div>
            ) : (
              pending.map(a => (
                <div key={a.id} className="p-4 border border-zinc-800 rounded-xl bg-zinc-900 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <UserCheck className="w-4 h-4 text-zinc-400" />
                      <h3 className="font-medium text-white">{a.name}</h3>
                      <StatusBadge status="pending" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-zinc-400 mt-2">
                      <span>📧 {a.email}</span>
                      <span>📋 {a.license_number} ({a.license_state})</span>
                      <span>📅 Expires: {a.license_expiry}</span>
                      <span>🏢 {a.agency_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => handleApprove(a.id)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => handleReject(a.id)} className="px-4 py-2 border border-zinc-700 hover:border-red-500/50 hover:text-red-400 text-zinc-400 rounded-lg text-sm font-medium transition flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900">
                  <th className="text-left p-3 text-zinc-400 font-medium">Agent</th>
                  <th className="text-left p-3 text-zinc-400 font-medium">Email</th>
                  <th className="text-left p-3 text-zinc-400 font-medium">License</th>
                  <th className="text-left p-3 text-zinc-400 font-medium">Status</th>
                  <th className="text-right p-3 text-zinc-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {active.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-zinc-500">No active agents</td></tr>
                ) : active.map(a => (
                  <tr key={a.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-900/50">
                    <td className="p-3 text-white font-medium">{a.name}</td>
                    <td className="p-3 text-zinc-400">{a.email}</td>
                    <td className="p-3 text-zinc-400">{a.license_number} ({a.license_state})</td>
                    <td className="p-3"><StatusBadge status="approved" /></td>
                    <td className="p-3 text-right">
                      <button onClick={() => handleDeactivate(a.id)} className="text-xs text-red-400 hover:text-red-300 transition px-2 py-1 rounded hover:bg-red-500/10">
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
