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
      users: {
        Row: {
          id: string
          auth_id: string
          username: string
          email: string
          is_online: boolean
          created_at: string
          last_seen: string
        }
        Insert: {
          id?: string
          auth_id: string
          username: string
          email: string
          is_online?: boolean
          created_at?: string
          last_seen?: string
        }
        Update: {
          id?: string
          auth_id?: string
          username?: string
          email?: string
          is_online?: boolean
          created_at?: string
          last_seen?: string
        }
      }
      game_invitations: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
        }
      }
      games: {
        Row: {
          id: string
          player1_id: string
          player2_id: string
          current_turn: string
          board_state: Json
          player1_matches: string[]
          player2_matches: string[]
          status: 'active' | 'completed'
          winner_id: string | null
          last_updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          player1_id: string
          player2_id: string
          current_turn: string
          board_state: Json
          player1_matches?: string[]
          player2_matches?: string[]
          status?: 'active' | 'completed'
          winner_id?: string | null
          last_updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          player1_id?: string
          player2_id?: string
          current_turn?: string
          board_state?: Json
          player1_matches?: string[]
          player2_matches?: string[]
          status?: 'active' | 'completed'
          winner_id?: string | null
          last_updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
