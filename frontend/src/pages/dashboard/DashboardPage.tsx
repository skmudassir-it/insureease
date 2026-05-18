import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'
import { apiClient } from '../../api/client'
import { Toaster, toast } from 'sonner'
import { Shield, Users, FileText, Bell, LogOut, LayoutDashboard } from 'lucide-react'

interface Stats { clients: number; policies: number; tasks: number; notifications: number }

export default function DashboardPage() {
  const { user, token, logout } = useAuthStore()
  const navigate = useNavigate()
  const [stats] = useState<Stats>({ clients: 0, policies: 0, tasks: 0, notifications: 0 })

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    apiClient.get('/auth/me').then(r => {
      useAuthStore.setState({ user: r.data })
    }).catch(() => { logout(); navigate('/login') })
  }, [token, navigate, logout])

  const handleLogout = () => { logout(); navigate('/login') }

  const cards = [
    { label: 'Clients', value: stats.clients, icon: Users, color: 'emerald' },
    { label: 'Policies', value: stats.policies, icon: Shield, color: 'blue' },
    { label: 'Tasks', value: stats.tasks, icon: FileText, color: 'purple' },
    { label: 'Alerts', value: stats.notifications, icon: Bell, color: 'amber' },
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
      <header className="border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-6 h-6 text-emerald-400" />
          <h1 className="text-xl font-bold text-emerald-400">InsureEase</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400">{user?.name || 'Agent'}</span>
          <button onClick={handleLogout} className="p-2 hover:bg-zinc-800 rounded-lg transition">
            <LogOut className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </header>
      <main className="p-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Dashboard</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.label} className={`p-4 rounded-xl border ${colorMap[card.color]}`}>
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span className="text-sm opacity-80">{card.label}</span>
                </div>
                <p className="text-2xl font-bold mt-2">{card.value}</p>
              </div>
            )
          })}
        </div>
        <div className="mt-8 p-6 border border-zinc-800 rounded-xl">
          <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
          <p className="text-zinc-400 text-sm">
            Your InsureEase CRM is ready. Use the sidebar to manage clients, policies, tasks, and events. 
            The renewal scanner runs daily to alert you about expiring policies.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs">MongoDB</span>
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs">FastAPI</span>
            <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs">React 18</span>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs">Redis</span>
          </div>
        </div>
      </main>
    </div>
  )
}
