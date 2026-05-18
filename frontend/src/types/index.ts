// Auth & User types
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'agent' | 'client'
  is_approved?: boolean
  company_name?: string
  agency_id?: string
  phone?: string
  license_number?: string
  license_state?: string
  license_expiry?: string
}

export interface Agency {
  id: string
  name: string
  type: string
  address: string
  phone: string
  logo_url?: string
  approval_required?: boolean
}

export interface AgentApplication {
  id: string
  name: string
  email: string
  phone: string
  license_number: string
  license_state: string
  license_expiry: string
  agency_name: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

// Client types
export interface Client {
  id: string
  company_name: string
  contact_name: string
  email: string
  phone: string
  address: string
  industry: string
  status: 'active' | 'inactive' | 'pending'
  agent_id: string
  agent_name?: string
  portal_enabled?: boolean
  policies_count?: number
  created_at: string
}

// Policy types
export interface Policy {
  id: string
  policy_number: string
  type: string
  coverage_amount: number
  premium: number
  status: 'active' | 'expired' | 'cancelled' | 'pending'
  start_date: string
  end_date: string
  client_id: string
  client_name?: string
  agent_id: string
  agent_name?: string
  days_until_expiry?: number
  documents?: PolicyDocument[]
}

export interface PolicyDocument {
  id: string
  name: string
  url: string
  type: string
  uploaded_at: string
}

// Task types
export interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  due_date: string
  client_id?: string
  client_name?: string
  assigned_to: string
  created_at: string
}

// Event types
export interface CalendarEvent {
  id: string
  title: string
  description: string
  date: string
  time?: string
  type: 'meeting' | 'call' | 'deadline' | 'other'
  client_id?: string
  client_name?: string
  created_at: string
}

// Activity types
export interface Activity {
  id: string
  action: string
  description: string
  user_name: string
  created_at: string
}

// Dashboard stats
export interface AdminStats {
  total_clients: number
  total_agents: number
  active_policies: number
  total_premium: number
  pending_approvals: number
}

export interface AgentStats {
  my_clients: number
  my_active_policies: number
  my_tasks: number
  my_premium: number
}

// Renewal types
export interface RenewalAlert {
  id: string
  policy_number: string
  client_name: string
  agent_name: string
  type: string
  premium: number
  expires_at: string
  days_until_expiry: number
  urgency: 'critical' | 'warning' | 'info'
}

// Payment types
export interface Payment {
  id: string
  policy_id: string
  policy_number: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  due_date: string
  paid_at?: string
  method?: string
}

// Agency settings
export interface AgencySettings {
  name: string
  logo_url: string
  address: string
  phone: string
  approval_required: boolean
  portal_enabled: boolean
  portal_custom_domain?: string
}
