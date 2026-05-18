import { apiClient } from './client'
import type {
  Agency, AgentApplication, Client, Policy, Task, CalendarEvent,
  AdminStats, RenewalAlert, AgencySettings, Activity,
} from '../types'

// --- Agencies ---
export const adminApi = {
  // Stats
  getStats: () => apiClient.get<AdminStats>('/admin/stats').then(r => r.data),

  // Agents
  getPendingApplications: () => apiClient.get<AgentApplication[]>('/admin/agent-applications').then(r => r.data),
  getAgents: () => apiClient.get<AgentApplication[]>('/admin/agents').then(r => r.data),
  approveAgent: (applicationId: string) => apiClient.post(`/admin/agent-applications/${applicationId}/approve`),
  rejectAgent: (applicationId: string) => apiClient.post(`/admin/agent-applications/${applicationId}/reject`),
  deactivateAgent: (agentId: string) => apiClient.post(`/admin/agents/${agentId}/deactivate`),
  getAgentProfile: (agentId: string) => apiClient.get(`/admin/agents/${agentId}`).then(r => r.data),

  // Clients
  getClients: (params?: { agent_id?: string; status?: string; search?: string }) =>
    apiClient.get<Client[]>('/admin/clients', { params }).then(r => r.data),
  reassignClient: (clientId: string, agentId: string) =>
    apiClient.post(`/admin/clients/${clientId}/reassign`, { agent_id: agentId }),
  getClientDetail: (clientId: string) => apiClient.get<Client>(`/admin/clients/${clientId}`).then(r => r.data),

  // Policies
  getPolicies: (params?: { agent_id?: string; status?: string }) =>
    apiClient.get<Policy[]>('/admin/policies', { params }).then(r => r.data),

  // Renewals
  getRenewals: (params?: { agent_id?: string; type?: string; urgency?: string }) =>
    apiClient.get<RenewalAlert[]>('/admin/renewals', { params }).then(r => r.data),

  // Activity
  getActivity: () => apiClient.get<Activity[]>('/admin/activity').then(r => r.data),

  // Settings
  getSettings: () => apiClient.get<AgencySettings>('/admin/settings').then(r => r.data),
  updateSettings: (data: Partial<AgencySettings>) =>
    apiClient.put<AgencySettings>('/admin/settings', data).then(r => r.data),

  // Events
  getEvents: () => apiClient.get<CalendarEvent[]>('/admin/events').then(r => r.data),
  createEvent: (data: Partial<CalendarEvent>) =>
    apiClient.post<CalendarEvent>('/admin/events', data).then(r => r.data),

  // Tasks
  getTasks: () => apiClient.get<Task[]>('/admin/tasks').then(r => r.data),
}
