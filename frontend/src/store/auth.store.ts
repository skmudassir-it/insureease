import { create } from 'zustand'
import { apiClient } from '../api/client'

interface User {
  id: string
  name: string
  email: string
  role: string
  company_id?: string
  client_id?: string
  is_approved?: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  registerAdmin: (data: {
    name: string; email: string; password: string;
    agency_name: string; agency_type: string;
    phone?: string; address_street?: string; address_city?: string;
    address_state?: string; address_zip?: string;
  }) => Promise<void>
  registerAgent: (data: {
    name: string; email: string; password: string;
    phone?: string; license_number?: string;
    license_state?: string; license_expiry?: string;
    company_id: string;
  }) => Promise<{ message: string; company_name: string }>
  logout: () => void
  loadUser: () => void
  getRedirectPath: () => string
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  loading: false,

  login: async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password })
    const { user, access_token } = res.data
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token: access_token })
    return user as User
  },

  registerAdmin: async (data) => {
    const res = await apiClient.post('/auth/register/admin', data)
    const { user, access_token } = res.data
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token: access_token })
  },

  registerAgent: async (data) => {
    const res = await apiClient.post('/auth/register/agent', data)
    return res.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  },

  loadUser: () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    const token = localStorage.getItem('token')
    set({ user, token })
  },

  getRedirectPath: () => {
    const { user } = get()
    if (!user) return '/login'
    switch (user.role) {
      case 'admin': return '/admin/dashboard'
      case 'agent': return '/agent/dashboard'
      case 'client': return '/client/dashboard'
      default: return '/dashboard'
    }
  },
}))
