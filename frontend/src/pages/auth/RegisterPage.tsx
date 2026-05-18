import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'
import { Toaster, toast } from 'sonner'
import { Shield, UserCheck, Users, ArrowRight, ArrowLeft, Search } from 'lucide-react'

const AGENCY_TYPES = [
  'Independent Agency',
  'Captive Agency',
  'Brokerage',
  'MGA / Wholesaler',
  'Direct Writer',
]

export default function RegisterPage() {
  const [step, setStep] = useState<'role' | 'admin-form' | 'agent-form'>('role')
  const [selectedRole, setSelectedRole] = useState<'admin' | 'agent' | 'client' | null>(null)
  const [loading, setLoading] = useState(false)

  // Admin fields
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [agencyType, setAgencyType] = useState(AGENCY_TYPES[0])
  const [adminPhone, setAdminPhone] = useState('')
  const [adminAddress, setAdminAddress] = useState('')

  // Agent fields
  const [agentName, setAgentName] = useState('')
  const [agentEmail, setAgentEmail] = useState('')
  const [agentPassword, setAgentPassword] = useState('')
  const [agentPhone, setAgentPhone] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [licenseState, setLicenseState] = useState('')
  const [licenseExpiry, setLicenseExpiry] = useState('')

  // Agency search for agent
  const [agencySearch, setAgencySearch] = useState('')
  const [agencies, setAgencies] = useState<Array<{ id: string; name: string; type: string; address: string }>>([])
  const [selectedAgencyId, setSelectedAgencyId] = useState('')
  const [searchingAgency, setSearchingAgency] = useState(false)

  const { registerAdmin, registerAgent } = useAuthStore()
  const navigate = useNavigate()

  const handleRoleSelect = (role: 'admin' | 'agent' | 'client') => {
    if (role === 'client') {
      setSelectedRole(role)
      return
    }
    setSelectedRole(role)
    setStep(role === 'admin' ? 'admin-form' : 'agent-form')
  }

  const handleAdminRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await registerAdmin({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        agency_name: agencyName,
        agency_type: agencyType,
        phone: adminPhone,
      })
      toast.success('Agency account created!')
      navigate('/admin/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleAgencySearch = async (query: string) => {
    setAgencySearch(query)
    if (query.length < 2) { setAgencies([]); return }
    setSearchingAgency(true)
    try {
      const { apiClient } = await import('../../api/client')
      const res = await apiClient.get('/auth/agencies', { params: { search: query } })
      setAgencies(res.data || [])
    } catch {
      setAgencies([])
    } finally {
      setSearchingAgency(false)
    }
  }

  const handleAgentApply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAgencyId) {
      toast.error('Please select an agency')
      return
    }
    setLoading(true)
    try {
      const result = await registerAgent({
        name: agentName,
        email: agentEmail,
        password: agentPassword,
        phone: agentPhone,
        license_number: licenseNumber,
        license_state: licenseState,
        license_expiry: licenseExpiry,
        company_id: selectedAgencyId,
      })
      toast.success('Application submitted!')
      navigate('/waiting', { state: { agencyName: result.company_name || 'the agency' } })
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Application failed')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none placeholder:text-zinc-600'

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Toaster position="top-right" theme="dark" />
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-emerald-400">InsureEase</h1>
          <p className="text-zinc-400 mt-1">
            {step === 'role' ? 'What describes you best?' : 'Create your account'}
          </p>
        </div>

        {/* --- STEP: Role Selector --- */}
        {step === 'role' && (
          <div className="space-y-4">
            <button
              onClick={() => handleRoleSelect('admin')}
              className="w-full p-4 border border-zinc-800 rounded-xl bg-zinc-900 hover:border-emerald-500/50 hover:bg-zinc-900/80 transition text-left flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="font-medium text-white">I'm an Agency / Admin</div>
                <div className="text-sm text-zinc-400">I run an insurance agency and need to manage agents, clients, and policies</div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-600 ml-auto" />
            </button>

            <button
              onClick={() => handleRoleSelect('agent')}
              className="w-full p-4 border border-zinc-800 rounded-xl bg-zinc-900 hover:border-emerald-500/50 hover:bg-zinc-900/80 transition text-left flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="font-medium text-white">I'm an Agent</div>
                <div className="text-sm text-zinc-400">I work at an agency and need to manage my own clients and policies</div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-600 ml-auto" />
            </button>

            <button
              onClick={() => handleRoleSelect('client')}
              className="w-full p-4 border border-zinc-800 rounded-xl bg-zinc-900 hover:border-emerald-500/50 hover:bg-zinc-900/80 transition text-left flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="font-medium text-white">I'm a Client</div>
                <div className="text-sm text-zinc-400">I have insurance policies and want to view them in a self-service portal</div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-600 ml-auto" />
            </button>

            {selectedRole === 'client' && (
              <div className="p-5 border border-zinc-800 rounded-xl bg-zinc-900 text-center">
                <Users className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-white mb-2">Client Access</h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Client accounts are created by your insurance agent. Please contact your agent to receive your portal invitation.
                </p>
                <p className="text-xs text-zinc-500">
                  Once you receive an invite link, you can set up your password and access your portal.
                </p>
              </div>
            )}
          </div>
        )}

        {/* --- STEP: Admin Form --- */}
        {step === 'admin-form' && (
          <form onSubmit={handleAdminRegister} className="space-y-4">
            <button type="button" onClick={() => setStep('role')} className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition mb-2">
              <ArrowLeft className="w-3 h-3" /> Back
            </button>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Your Full Name</label>
              <input type="text" value={adminName} onChange={e => setAdminName(e.target.value)}
                className={inputClass} placeholder="Jane Smith" required />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Email</label>
              <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)}
                className={inputClass} placeholder="admin@agency.com" required />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Password</label>
              <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)}
                className={inputClass} placeholder="Min 6 characters" required minLength={6} />
            </div>
            <div className="border-t border-zinc-800 pt-4">
              <h3 className="text-sm font-medium text-zinc-300 mb-3">Agency Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Agency Name</label>
                  <input type="text" value={agencyName} onChange={e => setAgencyName(e.target.value)}
                    className={inputClass} placeholder="Smith Insurance Group" required />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Agency Type</label>
                  <select value={agencyType} onChange={e => setAgencyType(e.target.value)}
                    className={inputClass}>
                    {AGENCY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Phone</label>
                  <input type="tel" value={adminPhone} onChange={e => setAdminPhone(e.target.value)}
                    className={inputClass} placeholder="(555) 123-4567" />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Address</label>
                  <input type="text" value={adminAddress} onChange={e => setAdminAddress(e.target.value)}
                    className={inputClass} placeholder="123 Main St, City, State" />
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-medium transition">
              {loading ? 'Creating...' : 'Create Agency Account'}
            </button>
          </form>
        )}

        {/* --- STEP: Agent Form --- */}
        {step === 'agent-form' && (
          <form onSubmit={handleAgentApply} className="space-y-4">
            <button type="button" onClick={() => setStep('role')} className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition mb-2">
              <ArrowLeft className="w-3 h-3" /> Back
            </button>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Full Name</label>
              <input type="text" value={agentName} onChange={e => setAgentName(e.target.value)}
                className={inputClass} placeholder="John Doe" required />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Email</label>
              <input type="email" value={agentEmail} onChange={e => setAgentEmail(e.target.value)}
                className={inputClass} placeholder="agent@agency.com" required />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Password</label>
              <input type="password" value={agentPassword} onChange={e => setAgentPassword(e.target.value)}
                className={inputClass} placeholder="Min 6 characters" required minLength={6} />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Phone</label>
              <input type="tel" value={agentPhone} onChange={e => setAgentPhone(e.target.value)}
                className={inputClass} placeholder="(555) 123-4567" />
            </div>

            <div className="border-t border-zinc-800 pt-4">
              <h3 className="text-sm font-medium text-zinc-300 mb-3">License Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">License Number</label>
                  <input type="text" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)}
                    className={inputClass} placeholder="LIC-123456" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">State</label>
                    <input type="text" value={licenseState} onChange={e => setLicenseState(e.target.value)}
                      className={inputClass} placeholder="CA" required maxLength={2} />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Expiry Date</label>
                    <input type="date" value={licenseExpiry} onChange={e => setLicenseExpiry(e.target.value)}
                      className={inputClass} required />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-4">
              <h3 className="text-sm font-medium text-zinc-300 mb-3">Find Your Agency</h3>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={agencySearch}
                  onChange={e => handleAgencySearch(e.target.value)}
                  className={`${inputClass} pl-10`}
                  placeholder="Search agencies by name..."
                />
              </div>
              {searchingAgency && <p className="text-xs text-zinc-500 mb-2">Searching...</p>}
              {agencies.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {agencies.map(a => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setSelectedAgencyId(a.id)}
                      className={`w-full p-3 rounded-lg border text-left transition ${
                        selectedAgencyId === a.id
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                      }`}
                    >
                      <div className="font-medium text-white text-sm">{a.name}</div>
                      <div className="text-xs text-zinc-400">{a.type} · {a.address}</div>
                    </button>
                  ))}
                </div>
              )}
              {agencySearch.length > 0 && !searchingAgency && agencies.length === 0 && (
                <p className="text-xs text-zinc-500">No agencies found. Try a different search term.</p>
              )}
              {selectedAgencyId && (
                <p className="text-xs text-emerald-400 mt-2">
                  ✓ Selected: {agencies.find(a => a.id === selectedAgencyId)?.name}
                </p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-medium transition">
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-zinc-500">
          Already have an account? <Link to="/login" className="text-emerald-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
