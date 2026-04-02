export interface AdminMechanic {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  created_at: string | null;
  skilled_trades_bc_id: string | null;
  is_verified: boolean;
  is_online: boolean;
  city: string | null;
  province: string | null;
  has_driver_license: boolean;
  has_garage_liability_insurance: boolean;
  has_driver_insurance: boolean;
}

export interface DocumentUrlsResponse {
  urls: string[];
}

export interface LandingPageEntry {
  id: number;
  phone_number: string | null;
  email: string | null;
  created_at: string | null;
}

export interface AppConfig {
  maintenance_mode: boolean;
  min_app_version: string;
  maintenance_message: string | null;
  updated_at: string;
}
