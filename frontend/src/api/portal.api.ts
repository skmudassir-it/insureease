import { apiClient } from './client'
import type { Client, Policy, Payment, Activity } from '../types'

export const portalApi = {
  // Profile / company info
  getProfile: () => apiClient.get<Client>('/portal/profile').then(r => r.data),
  updateProfile: (data: Record<string, unknown>) =>
    apiClient.put<Client>('/portal/profile', data).then(r => r.data),

  // Policies
  getPolicies: () => apiClient.get<Policy[]>('/portal/policies').then(r => r.data),
  getPolicyDetail: (policyId: string) =>
    apiClient.get<Policy>(`/portal/policies/${policyId}`).then(r => r.data),
  requestRenewal: (policyId: string) =>
    apiClient.post(`/portal/policies/${policyId}/renew`),

  // Payments
  getPayments: () => apiClient.get<Payment[]>('/portal/payments').then(r => r.data),
  getPaymentHistory: () => apiClient.get<Payment[]>('/portal/payments/history').then(r => r.data),
  createPayment: (policyId: string, amount: number) =>
    apiClient.post('/portal/payments', { policy_id: policyId, amount }),
  // TODO: Stripe integration — placeholder
  createStripePaymentIntent: (policyId: string, amount: number) =>
    apiClient.post('/portal/payments/stripe-intent', { policy_id: policyId, amount }),

  // Agent contact
  getAgentContact: () => apiClient.get('/portal/agent-contact').then(r => r.data),
  sendMessage: (message: string) =>
    apiClient.post('/portal/messages', { message }),

  // Notifications
  getNotifications: () => apiClient.get('/portal/notifications').then(r => r.data),
  updateNotificationPrefs: (prefs: Record<string, boolean>) =>
    apiClient.put('/portal/notification-prefs', prefs),

  // Activity
  getActivity: () => apiClient.get<Activity[]>('/portal/activity').then(r => r.data),

  // Setup (password setup for invite)
  setupPassword: (token: string, password: string) =>
    apiClient.post('/portal/setup', { token, password }),
}
