import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'
import { Toaster, toast } from 'sonner'
import { Shield, UserCheck, Users } from 'lucide-react'

const ROLES = [
  { value: 'admin', label: 'Admin', icon: Shield, desc: 'Full system access & management' },
  { value: 'agent', label: 'Agent', icon: UserCheck, desc: 'Manage clients & policies' },
  { value: 'client', label: 'Client', icon: Users, desc: 'View policies & documents' },
]

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('agent')
  const [loading, setLoading] = useState(false)
  const register = useAuthStore((s) => s.register)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(name, email, password, role)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Toaster position="top-right" theme="dark" />
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-emerald-400">InsureEase</h1>
          <p className="text-zinc-400 mt-1">Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              placeholder="John Doe" required />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              placeholder="agent@insureease.com" required />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              placeholder="Min 6 characters" required />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Account Type</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => {
                const Icon = r.icon
                const selected = role === r.value
                return (
                  <button key={r.value} type="button"
                    onClick={() => setRole(r.value)}
                    className={`p-3 rounded-lg border text-center transition ${
                      selected
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                    }`}>
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs font-medium block">{r.label}</span>
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-zinc-500 mt-1">{ROLES.find(r => r.value === role)?.desc}</p>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-medium transition">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-zinc-500">
          Already have an account? <Link to="/login" className="text-emerald-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
