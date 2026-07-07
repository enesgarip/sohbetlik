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
          invite_code: string
          status: 'waiting' | 'answering' | 'completed'
          selected_level: number
          question_count: number
          created_by: string
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          invite_code: string
          status?: 'waiting' | 'answering' | 'completed'
          selected_level?: number
          question_count?: number
          created_by?: string
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          invite_code?: string
          status?: 'waiting' | 'answering' | 'completed'
          selected_level?: number
          question_count?: number
          completed_at?: string | null
        }
      }
      participants: {
        Row: {
          id: string
          room_id: string
          user_id: string
          display_name: string
          seat: number
          is_host: boolean
          joined_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id?: string
          display_name: string
          seat: number
          is_host?: boolean
          joined_at?: string
        }
        Update: {
          display_name?: string
          seat?: number
          is_host?: boolean
        }
      }
      questions: {
        Row: {
          id: string
          category: string
          level: number
          type: 'choice' | 'either_or' | 'slider'
          prompt: string
          options: Json
          is_active: boolean
          created_at: string
        }
        Insert: never
        Update: never
      }
      answers: {
        Row: {
          id: string
          room_id: string
          participant_id: string
          question_id: string
          answer_value: Json
          answered_at: string
        }
        Insert: {
          id?: string
          room_id: string
          participant_id: string
          question_id: string
          answer_value: Json
          answered_at?: string
        }
        Update: {
          answer_value?: Json
          answered_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
