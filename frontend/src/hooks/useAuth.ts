import { useAuthStore } from '../store/auth.store'

export function useAuth() {
  const store = useAuthStore()
  return {
    user: store.user,
    token: store.token,
    loading: store.loading,
    login: store.login,
    register: store.register,
    logout: store.logout,
    loadUser: store.loadUser,
    isAuthenticated: !!store.token && !!store.user,
    isAdmin: store.user?.role === 'admin',
    isAgent: store.user?.role === 'agent',
    isClient: store.user?.role === 'client',
    isApproved: store.user?.is_approved !== false,
  }
}
