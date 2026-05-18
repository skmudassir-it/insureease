import { Link } from 'react-router-dom'
import { Shield, Users, FileText, Bell, BarChart3, ArrowRight, CheckCircle } from 'lucide-react'

const features = [
  { icon: Users, title: 'Client Management', desc: 'Organize leads, active clients, and policyholders in one place with full contact history.' },
  { icon: FileText, title: 'Policy Tracking', desc: 'Track life, health, auto, home, and commercial policies with renewal dates and documents.' },
  { icon: Bell, title: 'Renewal Alerts', desc: 'Automated daily scans notify your team about expiring policies 30, 15, and 7 days ahead.' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'KPIs, client status charts, agent performance metrics — all at a glance.' },
  { icon: Shield, title: 'Secure & Private', desc: 'JWT authentication, role-based access control, and encrypted document storage.' },
  { icon: CheckCircle, title: 'Task Kanban', desc: 'Drag-and-drop task management with priorities, due dates, and team assignments.' },
]

const roles = [
  { title: 'Admin', desc: 'Full system control — manage users, view all data, configure settings.' },
  { title: 'Agent', desc: 'Manage your clients, policies, tasks, and events. Your daily command center.' },
  { title: 'Client', desc: 'View your policies, documents, and renewal status in a self-service portal.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Nav */}
      <nav className="border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-emerald-400" />
          <span className="text-xl font-bold text-emerald-400">InsureEase</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-zinc-400 hover:text-white transition">Sign In</Link>
          <Link to="/register" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-medium mb-6">
          <CheckCircle className="w-3 h-3" /> Production Ready
        </div>
        <h1 className="text-5xl font-bold leading-tight mb-4">
          Insurance CRM <br />
          <span className="text-emerald-400">Built for Agents</span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
          Manage clients, track policies, automate renewal reminders, and grow your book of business — 
          all from one clean dashboard. No AI gimmicks, just solid CRM.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/register" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition flex items-center gap-2">
            Start Free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login" className="px-6 py-3 border border-zinc-700 hover:border-zinc-500 text-zinc-300 rounded-lg font-medium transition">
            Sign In
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-2">Everything You Need</h2>
        <p className="text-zinc-400 text-center mb-10">A complete CRM toolkit for insurance professionals.</p>
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="p-5 border border-zinc-800 rounded-xl hover:border-zinc-700 transition">
                <Icon className="w-8 h-8 text-emerald-400 mb-3" />
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-zinc-400">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Roles */}
      <section className="px-6 py-16 max-w-5xl mx-auto border-t border-zinc-800">
        <h2 className="text-2xl font-bold text-center mb-2">Three Roles, One Platform</h2>
        <p className="text-zinc-400 text-center mb-10">Designed for everyone in the insurance workflow.</p>
        <div className="grid md:grid-cols-3 gap-4">
          {roles.map((r) => (
            <div key={r.title} className="p-5 border border-zinc-800 rounded-xl text-center">
              <h3 className="text-lg font-semibold text-emerald-400 mb-1">{r.title}</h3>
              <p className="text-sm text-zinc-400">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 max-w-3xl mx-auto text-center border-t border-zinc-800">
        <h2 className="text-2xl font-bold mb-3">Ready to streamline your agency?</h2>
        <p className="text-zinc-400 mb-6">Create your account in 30 seconds. Choose your role and get started.</p>
        <Link to="/register" className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition inline-flex items-center gap-2">
          Create Free Account <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-6 text-center text-sm text-zinc-500">
        InsureEase CRM — Built for insurance agents, by insurance agents.
      </footer>
    </div>
  )
}
