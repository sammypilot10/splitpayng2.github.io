// src/types/supabase.ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; email: string; role: 'admin' | 'host' | 'member'; ndpr_consent: boolean; created_at: string; balance: number; username: string | null; whatsapp_number: string | null; account_name: string | null; account_number: string | null; bank_code: string | null; bank_name: string | null }
        Insert: { id: string; email: string; role?: 'admin' | 'host' | 'member'; ndpr_consent?: boolean; created_at?: string; balance?: number; username?: string | null; whatsapp_number?: string | null; account_name?: string | null; account_number?: string | null; bank_code?: string | null; bank_name?: string | null }
        Update: { role?: 'admin' | 'host' | 'member'; ndpr_consent?: boolean; balance?: number; username?: string | null; whatsapp_number?: string | null; account_name?: string | null; account_number?: string | null; bank_code?: string | null; bank_name?: string | null }
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
        Row: {
          id: string;
          pool_id: string;
          member_id: string;
          status: 'escrow' | 'active' | 'past_due' | 'cancelled' | 'closed';
          escrow_status: 'pending' | 'confirmed' | 'disputed' | 'refunded';
          escrow_expires_at: string;
          joined_at: string;
          next_billing_date: string | null;
          paystack_auth_code: string | null;
          retry_count: number;
          reminder_sent_at: string | null;
        }
        Insert: {
          id?: string;
          pool_id: string;
          member_id: string;
          status?: 'escrow' | 'active' | 'past_due' | 'cancelled' | 'closed';
          escrow_status?: 'pending' | 'confirmed' | 'disputed' | 'refunded';
          escrow_expires_at: string;
          joined_at?: string;
          next_billing_date?: string | null;
          paystack_auth_code?: string | null;
          retry_count?: number;
          reminder_sent_at?: string | null;
        }
        Update: {
          status?: 'escrow' | 'active' | 'past_due' | 'cancelled' | 'closed';
          escrow_status?: 'pending' | 'confirmed' | 'disputed' | 'refunded';
          escrow_expires_at?: string;
          next_billing_date?: string | null;
          paystack_auth_code?: string | null;
          retry_count?: number;
          reminder_sent_at?: string | null;
        }
        Relationships: []
      }
      transactions: {
        Row: {
          id: string;
          pool_id: string | null;
          user_id: string;
          amount: number;
          status: string;
          reference: string | null;
          created_at: string;
        }
        Insert: {
          id?: string;
          pool_id?: string | null;
          user_id: string;
          amount: number;
          status?: string;
          reference?: string | null;
          created_at?: string;
        }
        Update: {
          status?: string;
        }
        Relationships: []
      }
      payouts: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          status: string;
          reference: string | null;
          created_at: string;
        }
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          status?: string;
          reference?: string | null;
          created_at?: string;
        }
        Update: {
          status?: string;
        }
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