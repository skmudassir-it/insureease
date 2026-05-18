import { create } from 'zustand'
import { apiClient } from '../api/client'
import type { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (data: Record<string, unknown>) => Promise<void>
  agentApply: (data: Record<string, unknown>) => Promise<void>
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

  register: async (data) => {
    const res = await apiClient.post('/auth/register', data)
    const { user, access_token } = res.data
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token: access_token })
  },

  agentApply: async (data) => {
    await apiClient.post('/auth/agent-apply', data)
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
