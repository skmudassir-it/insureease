export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-emerald-400">InsureEase</h1>
        <p className="text-zinc-400 text-lg">Insurance CRM Platform</p>
        <div className="flex gap-3 justify-center">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm border border-emerald-500/20">MongoDB</span>
          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm border border-blue-500/20">FastAPI</span>
          <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-sm border border-purple-500/20">React</span>
        </div>
      </div>
    </div>
  )
}
