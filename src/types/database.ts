export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string
          code: string
          created_at: string
          expires_at: string
          is_confirmed: boolean
          confirmation_date: string | null
          confirmation_location: string | null
          confirmation_memo: string | null
        }
        Insert: {
          id?: string
          code: string
          created_at?: string
          expires_at?: string
          is_confirmed?: boolean
          confirmation_date?: string | null
          confirmation_location?: string | null
          confirmation_memo?: string | null
        }
        Update: {
          id?: string
          code?: string
          created_at?: string
          expires_at?: string
          is_confirmed?: boolean
          confirmation_date?: string | null
          confirmation_location?: string | null
          confirmation_memo?: string | null
        }
      }
      room_users: {
        Row: {
          id: string
          room_id: string
          user_id: string
          name: string
          color: string
          joined_at: string
          last_seen_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          name: string
          color: string
          joined_at?: string
          last_seen_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          name?: string
          color?: string
          joined_at?: string
          last_seen_at?: string
        }
      }
      time_selections: {
        Row: {
          id: string
          room_id: string
          user_id: string
          date: string
          is_all_day: boolean
          start_time: string | null
          end_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          date: string
          is_all_day?: boolean
          start_time?: string | null
          end_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          date?: string
          is_all_day?: boolean
          start_time?: string | null
          end_time?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
