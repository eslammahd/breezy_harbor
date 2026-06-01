import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Slot = {
  id: string;
  slot_date: string;
  slot_time: string;
  duration_minutes: number;
  is_available: boolean;
  created_at: string;
};

export type Booking = {
  id: string;
  patient_name: string;
  phone: string;
  session_type: 'therapy' | 'psychiatry';
  slot_id: string;
  confirmation_code: string;
  payment_status: 'pending' | 'confirmed';
  notes: string | null;
  created_at: string;
};
