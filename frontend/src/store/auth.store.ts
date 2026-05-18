import { create } from 'zustand'
import { apiClient } from '../api/client'

interface User { id: string; name: string; email: string; role: string }

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role?: string) => Promise<void>
  logout: () => void
  loadUser: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  loading: false,
  login: async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password })
    const { user, access_token } = res.data
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token: access_token })
  },
  register: async (name, email, password, role = 'agent') => {
    const res = await apiClient.post('/auth/register', { name, email, password, role })
    const { user, access_token } = res.data
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token: access_token })
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
}))
