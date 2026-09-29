export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          name?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      transfers: {
        Row: {
          id: string;
          user_id: string;
          corridor_id: string;
          currency_in: string;
          currency_out: string;
          amount_in: number;
          amount_out: number;
          fee: number;
          fx_rate: number;
          recipient_name: string;
          recipient_msisdn: string;
          status: string;
          provider: string;
          idempotency_key: string;
          momo_reference: string | null;
          error_message: string | null;
          quote_path_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          corridor_id: string;
          currency_in: string;
          currency_out: string;
          amount_in: number;
          amount_out: number;
          fee: number;
          fx_rate: number;
          recipient_name: string;
          recipient_msisdn: string;
          status?: string;
          provider?: string;
          idempotency_key: string;
          momo_reference?: string | null;
          error_message?: string | null;
          quote_path_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          corridor_id?: string;
          currency_in?: string;
          currency_out?: string;
          amount_in?: number;
          amount_out?: number;
          fee?: number;
          fx_rate?: number;
          recipient_name?: string;
          recipient_msisdn?: string;
          status?: string;
          provider?: string;
          idempotency_key?: string;
          momo_reference?: string | null;
          error_message?: string | null;
          quote_path_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type TransferRow = Database["public"]["Tables"]["transfers"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
