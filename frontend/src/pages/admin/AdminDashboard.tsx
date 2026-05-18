import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'
import { adminApi } from '../../api/admin.api'
import { Toaster } from 'sonner'
import { Users, UserCheck, Shield, DollarSign, AlertTriangle, Activity, ArrowRight, LayoutDashboard, LogOut } from 'lucide-react'
import type { AdminStats, Activity as ActivityType } from '../../types'

export default function AdminDashboard() {
  const { user, token, logout } = useAuthStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState<AdminStats>({ total_clients: 0, total_agents: 0, active_policies: 0, total_premium: 0, pending_approvals: 0 })
  const [activity, setActivity] = useState<ActivityType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token || user?.role !== 'admin') { navigate('/login'); return }
    Promise.all([
      adminApi.getStats().catch(() => null),
      adminApi.getActivity().catch(() => []),
    ]).then(([s, a]) => {
      if (s) setStats(s)
      setActivity(a || [])
    }).finally(() => setLoading(false))
  }, [token, user, navigate])

  const handleLogout = () => { logout(); navigate('/') }

  const kpis = [
    { label: 'Total Clients', value: stats.total_clients, icon: Users, color: 'emerald' },
    { label: 'Total Agents', value: stats.total_agents, icon: UserCheck, color: 'blue' },
    { label: 'Active Policies', value: stats.active_policies, icon: Shield, color: 'purple' },
    { label: 'Total Premium', value: `$${(stats.total_premium || 0).toLocaleString()}`, icon: DollarSign, color: 'amber' },
  ]

  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Toaster position="top-right" theme="dark" />
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-6 h-6 text-emerald-400" />
          <h1 className="text-xl font-bold text-emerald-400">InsureEase</h1>
          <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">Admin</span>
        </div>
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
          <span className="text-sm text-zinc-400 ml-3 mr-2">{user?.name}</span>
          <button onClick={handleLogout} className="p-2 hover:bg-zinc-800 rounded-lg transition">
            <LogOut className="w-4 h-4 text-zinc-400" />
          </button>
        </nav>
      </header>

      <main className="p-6 max-w-6xl mx-auto space-y-6">
        <h2 className="text-2xl font-semibold">Agency Dashboard</h2>

        {/* Pending Approvals Banner */}
        {stats.pending_approvals > 0 && (
          <Link to="/admin/agents" className="flex items-center gap-3 p-4 border border-amber-500/20 bg-amber-500/5 rounded-xl hover:border-amber-500/40 transition">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <div className="flex-1">
              <span className="font-medium text-amber-400">{stats.pending_approvals} agent application{stats.pending_approvals !== 1 ? 's' : ''} pending approval</span>
              <span className="text-sm text-zinc-400 ml-2">Review and approve new agents</span>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </Link>
        )}

        {/* KPI Cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 border border-zinc-800 rounded-xl animate-pulse bg-zinc-900" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map(k => {
              const Icon = k.icon
              return (
                <div key={k.label} className={`p-4 rounded-xl border ${colorMap[k.color]}`}>
                  <div className="flex items-center gap-2 text-sm opacity-80">
                    <Icon className="w-4 h-4" />{k.label}
                  </div>
                  <p className="text-2xl font-bold mt-1">{k.value}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* Recent Activity */}
        <div className="border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-zinc-400" />
            <h3 className="text-lg font-semibold">Recent Activity</h3>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-10 bg-zinc-900 rounded animate-pulse" />)}
            </div>
          ) : activity.length === 0 ? (
            <p className="text-zinc-500 text-sm">No recent activity.</p>
          ) : (
            <div className="space-y-2">
              {activity.slice(0, 10).map(a => (
                <div key={a.id} className="flex items-center gap-3 py-2 border-b border-zinc-800 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-white">{a.description}</span>
                    <span className="text-xs text-zinc-500 ml-2">by {a.user_name}</span>
                  </div>
                  <span className="text-xs text-zinc-600 flex-shrink-0">{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
