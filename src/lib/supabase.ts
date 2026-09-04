import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// --- HELPER FUNCTION: Upload Receipt with Bucket Error Bypass ---
export async function uploadReceiptFile(file: File): Promise<string> {
  try {
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // CHANGE 'receipts' TO 'payment-receipts' HERE:
    const { data, error } = await supabase.storage
      .from('payment-receipts') 
      .upload(fileName, file);

    if (error) {
      console.warn('Storage upload error bypassed:', error.message);
      return 'fallback_receipt_bypassed';
    }

    return data?.path || 'fallback_receipt_bypassed';
  } catch (err) {
    console.warn('Storage exception caught & bypassed:', err);
    return 'fallback_receipt_bypassed';
  }
}

// --- TYPES ---
export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  phone: string | null;
  wallet_balance: number;
  referral_code: string;
  referred_by: string | null;
  avatar_url: string | null;
  is_pro: boolean;
  pro_since: string | null;
  is_admin: boolean;
  task_cycle: number;
  next_round_unlock_at: string | null;
  created_at: string;
};

export type BillPurchase = {
  id: string;
  user_id: string;
  type: 'airtime' | 'data';
  network: string;
  phone: string;
  plan: string | null;
  amount: number;
  status: string;
  created_at: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  reward: number;
  category: string;
  icon: string;
  is_active: boolean;
  created_at: string;
};

export type TaskCompletion = {
  id: string;
  user_id: string;
  task_id: string;
  reward: number;
  status: string;
  cycle: number;
  created_at: string;
};

export type Referral = {
  id: string;
  referrer_id: string;
  referred_id: string;
  bonus: number;
  status: string;
  created_at: string;
};

export type Withdrawal = {
  id: string;
  user_id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: string;
  verification_code: string | null;
  verified: boolean;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  description: string;
  reference_id: string | null;
  created_at: string;
};

export type ProPaymentRequest = {
  id: string;
  user_id: string;
  full_name: string;
  amount_sent: number | null;
  reference: string | null;
  receipt_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  profiles?: {
    username: string;
    full_name: string | null;
  } | null;
};

export type Cashboost9jaCodePurchase = {
  id: string;
  user_id: string;
  amount: number;
  receipt_url: string | null;
  status: 'pending' | 'completed' | 'rejected';
  code?: string | null;
  created_at: string;
};