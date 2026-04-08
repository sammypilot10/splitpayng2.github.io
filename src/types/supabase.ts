// src/types/supabase.ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; email: string; role: 'admin' | 'host' | 'member'; ndpr_consent: boolean; created_at: string; balance: number; username: string | null; whatsapp_number: string | null; account_name: string | null; account_number: string | null; bank_code: string | null }
        Insert: { id: string; email: string; role?: 'admin' | 'host' | 'member'; ndpr_consent?: boolean; created_at?: string; balance?: number; username?: string | null; whatsapp_number?: string | null; account_name?: string | null; account_number?: string | null; bank_code?: string | null }
        Update: { role?: 'admin' | 'host' | 'member'; ndpr_consent?: boolean; balance?: number; username?: string | null; whatsapp_number?: string | null; account_name?: string | null; account_number?: string | null; bank_code?: string | null }
        Relationships: []
      }
      pools: {
        Row: { id: string; host_id: string; host_username: string | null; host_whatsapp: string | null; service_name: string; category: string; price_per_seat: number; max_seats: number; current_seats: number; is_public: boolean; status: 'active' | 'full' | 'closed'; created_at: string; invite_token: string | null }
        Insert: { id?: string; host_id: string; host_username?: string | null; host_whatsapp?: string | null; service_name: string; category: string; price_per_seat: number; max_seats: number; current_seats?: number; is_public?: boolean; status?: 'active' | 'full' | 'closed'; created_at?: string; invite_token?: string | null }
        Update: { service_name?: string; category?: string; price_per_seat?: number; max_seats?: number; current_seats?: number; is_public?: boolean; status?: 'active' | 'full' | 'closed'; host_username?: string | null; host_whatsapp?: string | null; invite_token?: string | null }
        Relationships: []
      }
      pool_credentials: {
        Row: { pool_id: string; encrypted_data: string; iv: string; created_at: string }
        Insert: { pool_id: string; encrypted_data: string; iv: string; created_at?: string }
        Update: { encrypted_data?: string; iv?: string }
        Relationships: []
      }
      pool_members: {
        Row: { id: string; pool_id: string; member_id: string; escrow_status: 'pending' | 'confirmed' | 'disputed' | 'refunded'; escrow_expires_at: string; joined_at: string; status: 'active' | 'past_due' | 'cancelled' | 'closed' }
        Insert: { id?: string; pool_id: string; member_id: string; escrow_status?: 'pending' | 'confirmed' | 'disputed' | 'refunded'; escrow_expires_at: string; joined_at?: string; status?: 'active' | 'past_due' | 'cancelled' | 'closed' }
        Update: { escrow_status?: 'pending' | 'confirmed' | 'disputed' | 'refunded'; escrow_expires_at?: string; status?: 'active' | 'past_due' | 'cancelled' | 'closed' }
        Relationships: []
      }
    }
    Functions: {
      adjust_profile_balance: {
        Args: {
          p_user_id: string
          p_amount_delta: number
        }
        Returns: number
      }
    }
  }
}