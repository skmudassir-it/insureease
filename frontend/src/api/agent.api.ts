import { apiClient } from './client'
import type {
  Agency, Client, Policy, Task, CalendarEvent,
  AgentStats, RenewalAlert, Activity,
} from '../types'

export const agentApi = {
  // Stats
  getStats: () => apiClient.get<AgentStats>('/agent/stats').then(r => r.data),

  // Profile
  getProfile: () => apiClient.get('/agent/profile').then(r => r.data),
  updateProfile: (data: Record<string, unknown>) =>
    apiClient.put('/agent/profile', data).then(r => r.data),

  // Clients
  getClients: (params?: { status?: string; search?: string }) =>
    apiClient.get<Client[]>('/agent/clients', { params }).then(r => r.data),
  getClientDetail: (clientId: string) =>
    apiClient.get<Client>(`/agent/clients/${clientId}`).then(r => r.data),
  createClient: (data: Record<string, unknown>) =>
    apiClient.post<Client>('/agent/clients', data).then(r => r.data),
  updateClient: (clientId: string, data: Record<string, unknown>) =>
    apiClient.put<Client>(`/agent/clients/${clientId}`, data).then(r => r.data),
  sendPortalInvite: (clientId: string) =>
    apiClient.post(`/agent/clients/${clientId}/invite`),

  // Policies (for a client)
  getClientPolicies: (clientId: string) =>
    apiClient.get<Policy[]>(`/agent/clients/${clientId}/policies`).then(r => r.data),
  getMyPolicies: (params?: { status?: string }) =>
    apiClient.get<Policy[]>('/agent/policies', { params }).then(r => r.data),

  // Tasks
  getTasks: (params?: { status?: string }) =>
    apiClient.get<Task[]>('/agent/tasks', { params }).then(r => r.data),
  createTask: (data: Partial<Task>) =>
    apiClient.post<Task>('/agent/tasks', data).then(r => r.data),
  updateTask: (taskId: string, data: Partial<Task>) =>
    apiClient.put<Task>(`/agent/tasks/${taskId}`, data).then(r => r.data),
  deleteTask: (taskId: string) =>
    apiClient.delete(`/agent/tasks/${taskId}`),

  // Events
  getEvents: () => apiClient.get<CalendarEvent[]>('/agent/events').then(r => r.data),
  createEvent: (data: Partial<CalendarEvent>) =>
    apiClient.post<CalendarEvent>('/agent/events', data).then(r => r.data),
  updateEvent: (eventId: string, data: Partial<CalendarEvent>) =>
    apiClient.put<CalendarEvent>(`/agent/events/${eventId}`, data).then(r => r.data),
  deleteEvent: (eventId: string) =>
    apiClient.delete(`/agent/events/${eventId}`),

  // Renewals
  getRenewals: (params?: { urgency?: string }) =>
    apiClient.get<RenewalAlert[]>('/agent/renewals', { params }).then(r => r.data),

  // Activity
  getActivity: () => apiClient.get<Activity[]>('/agent/activity').then(r => r.data),

  // Agency search (for registration)
  searchAgencies: (query: string) =>
    apiClient.get<Agency[]>('/auth/agencies', { params: { search: query } }).then(r => r.data),
}
