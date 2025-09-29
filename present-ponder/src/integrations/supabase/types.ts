export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          accumulated_notes: string | null
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          accumulated_notes?: string | null
          created_at?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          accumulated_notes?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      gift_profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          relationship: string
          gender: string
          age: number
          interest: string
          notes: any
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          relationship: string
          gender: string
          age: number
          interest: string
          notes?: any
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          relationship?: string
          gender?: string
          age?: number
          interest?: string
          notes?: any
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          id: string
          user_id: string
          profile_id: string
          occasion: string
          occasion_date: string | null
          occasion_notes: string | null
          recommendations: any
          generated_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          profile_id: string
          occasion: string
          occasion_date?: string | null
          occasion_notes?: string | null
          recommendations: any
          generated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          profile_id?: string
          occasion?: string
          occasion_date?: string | null
          occasion_notes?: string | null
          recommendations?: any
          generated_at?: string | null
          created_at?: string | null
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
