export interface Contract {
  id: string

  // Basic contract information
  contract_number: string
  description: string
  contractor: string
  value: number
  start_date: string
  end_date: string
  status: string

  // Additional UENP fields
  category: string | null
  gms_number: string | null
  modality: string | null
  process_number: string | null
  observations: string | null

  manager_name: string | null
  manager_contact: string | null
  manager_appointment: string | null
  inspector_name: string | null
  inspector_contact: string | null
  inspector_appointment: string | null

  // Extension and alerts
  extension_forecast: string | null
  alert_30_days: string | null
  alert_60_days: string | null
  alert_90_days: string | null

  // Metadata
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  totalContracts: number
  totalValue: number
  activeContracts: number
  completedContracts: number
}
