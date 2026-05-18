import { useLocation, Link } from 'react-router-dom'
import { Clock, Shield } from 'lucide-react'

export default function WaitingApprovalPage() {
  const location = useLocation()
  const agencyName = (location.state as any)?.agencyName || 'the agency'

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Application Submitted</h1>
          <p className="text-zinc-400 mt-2">
            Your application has been sent to <span className="text-white font-medium">{agencyName}</span>.
          </p>
        </div>
        <div className="p-5 border border-zinc-800 rounded-xl bg-zinc-900 text-left space-y-3">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-white">What happens next?</h3>
              <p className="text-sm text-zinc-400 mt-1">
                The agency admin will review your application. Once approved, you'll be able to log in and access your agent dashboard.
              </p>
            </div>
          </div>
          <div className="border-t border-zinc-800 pt-3">
            <p className="text-xs text-zinc-500">
              You will not be able to log in until your application is approved. This usually takes 1-2 business days.
            </p>
          </div>
        </div>
        <Link to="/" className="inline-block text-sm text-emerald-400 hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}
