import { useAuthStore } from '../store/auth.store'

export function useAuth() {
  const store = useAuthStore()
  return {
    user: store.user,
    token: store.token,
    loading: store.loading,
    login: store.login,
    registerAdmin: store.registerAdmin,
    registerAgent: store.registerAgent,
    logout: store.logout,
    loadUser: store.loadUser,
    getRedirectPath: store.getRedirectPath,
    isAuthenticated: !!store.token && !!store.user,
    isAdmin: store.user?.role === 'admin',
    isAgent: store.user?.role === 'agent',
    isClient: store.user?.role === 'client',
    isApproved: store.user?.is_approved !== false,
  }
}
