/*
# Cashboost9ja - Core Schema

## Overview
Creates the full database schema for Cashboost9ja, a Nigerian money-earning
platform where users complete micro-tasks, refer friends, and withdraw earnings.

## New Tables

1. `profiles`
   - Extends auth.users with public profile data.
   - `id` (uuid, PK, references auth.users)
   - `username` (text, unique) - display name
   - `full_name` (text)
   - `phone` (text)
   - `wallet_balance` (numeric, default 0) - current withdrawable balance in Naira
   - `referral_code` (text, unique) - each user's unique referral code
   - `referred_by` (uuid, nullable, references profiles.id) - who referred them
   - `avatar_url` (text, nullable)
   - `created_at` (timestamptz)

2. `tasks`
   - Available micro-tasks users can complete for earnings.
   - `id` (uuid, PK)
   - `title` (text)
   - `description` (text)
   - `reward` (numeric) - payout in Naira
   - `category` (text) - e.g. 'social', 'survey', 'app', 'content'
   - `icon` (text) - lucide icon name
   - `is_active` (boolean, default true)
   - `created_at` (timestamptz)

3. `task_completions`
   - Records of users completing tasks.
   - `id` (uuid, PK)
   - `user_id` (uuid, references profiles.id, default auth.uid())
   - `task_id` (uuid, references tasks.id)
   - `reward` (numeric) - snapshot of reward at completion time
   - `status` (text, default 'approved') - 'pending' | 'approved' | 'rejected'
   - `created_at` (timestamptz)
   - Unique constraint on (user_id, task_id) so a user can only complete a task once.

4. `referrals`
   - Tracks referral relationships and bonus payouts.
   - `id` (uuid, PK)
   - `referrer_id` (uuid, references profiles.id) - the person who shared the code
   - `referred_id` (uuid, references profiles.id) - the person who signed up
   - `bonus` (numeric, default 0) - referral bonus amount
   - `status` (text, default 'pending') - 'pending' | 'paid'
   - `created_at` (timestamptz)

5. `withdrawals`
   - Withdrawal requests from users.
   - `id` (uuid, PK)
   - `user_id` (uuid, references profiles.id, default auth.uid())
   - `amount` (numeric)
   - `bank_name` (text)
   - `account_number` (text)
   - `account_name` (text)
   - `status` (text, default 'pending') - 'pending' | 'approved' | 'rejected'
   - `created_at` (timestamptz)

6. `transactions`
   - Wallet transaction history (earnings, referrals, withdrawals).
   - `id` (uuid, PK)
   - `user_id` (uuid, references profiles.id, default auth.uid())
   - `type` (text) - 'earning' | 'referral' | 'withdrawal' | 'bonus'
   - `amount` (numeric) - positive for credit, negative for debit
   - `description` (text)
   - `reference_id` (uuid, nullable) - links to source record
   - `created_at` (timestamptz)

## Security (RLS)
- All tables have RLS enabled.
- `profiles`: users can read all profiles (for referral lookups) but only update their own.
- `tasks`: anyone authenticated can read active tasks; only service role can insert/update.
- `task_completions`: users CRUD only their own completions.
- `referrals`: users can read referrals where they are the referrer; inserts allowed for own rows.
- `withdrawals`: users can read/create their own withdrawals.
- `transactions`: users can read only their own transactions.
- Owner columns default to `auth.uid()` so inserts from the client succeed.

## Notes
1. A trigger function `handle_new_user` auto-creates a profile row when a new auth.user signs up, generating a unique referral code.
2. A trigger `credit_task_earnings` fires after a task_completion insert: credits the user's wallet and logs a transaction.
3. Referral bonus is credited on signup via the profile trigger when `referred_by` is set.
*/

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text,
  phone text,
  wallet_balance numeric(12,2) NOT NULL DEFAULT 0,
  referral_code text UNIQUE NOT NULL,
  referred_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  avatar_url text,
  is_admin boolean NOT NULL DEFAULT false,
  is_pro boolean NOT NULL DEFAULT false,
  pro_since timestamptz,
  task_cycle integer NOT NULL DEFAULT 0,
  next_round_unlock_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  reward numeric(12,2) NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'social',
  icon text NOT NULL DEFAULT 'MousePointerClick',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tasks_select_active" ON tasks;
CREATE POLICY "tasks_select_active" ON tasks FOR SELECT
  TO authenticated USING (is_active = true);

-- ============================================================
-- TASK COMPLETIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS task_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  reward numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'approved',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, task_id)
);

ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "completions_select_own" ON task_completions;
CREATE POLICY "completions_select_own" ON task_completions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "completions_insert_own" ON task_completions;
CREATE POLICY "completions_insert_own" ON task_completions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "completions_update_own" ON task_completions;
CREATE POLICY "completions_update_own" ON task_completions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "completions_delete_own" ON task_completions;
CREATE POLICY "completions_delete_own" ON task_completions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- REFERRALS
-- ============================================================
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bonus numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (referred_id)
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "referrals_select_own" ON referrals;
CREATE POLICY "referrals_select_own" ON referrals FOR SELECT
  TO authenticated USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

DROP POLICY IF EXISTS "referrals_insert_own" ON referrals;
CREATE POLICY "referrals_insert_own" ON referrals FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- ============================================================
-- WITHDRAWALS
-- ============================================================
CREATE TABLE IF NOT EXISTS withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  bank_name text NOT NULL,
  account_number text NOT NULL,
  account_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "withdrawals_select_own" ON withdrawals;
CREATE POLICY "withdrawals_select_own" ON withdrawals FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "withdrawals_insert_own" ON withdrawals;
CREATE POLICY "withdrawals_insert_own" ON withdrawals FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "withdrawals_update_own" ON withdrawals;
CREATE POLICY "withdrawals_update_own" ON withdrawals FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  amount numeric(12,2) NOT NULL,
  description text NOT NULL,
  reference_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transactions_select_own" ON transactions;
CREATE POLICY "transactions_select_own" ON transactions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "transactions_insert_own" ON transactions;
CREATE POLICY "transactions_insert_own" ON transactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- PRO PAYMENT REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS pro_payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  full_name text NOT NULL,
  amount_sent numeric(12,2),
  reference text,
  receipt_url text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_pro_payment_requests_user_id FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_pro_payment_requests_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE pro_payment_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pro_payment_requests_select_own" ON pro_payment_requests;
CREATE POLICY "pro_payment_requests_select_own" ON pro_payment_requests FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

DROP POLICY IF EXISTS "pro_payment_requests_insert_own" ON pro_payment_requests;
CREATE POLICY "pro_payment_requests_insert_own" ON pro_payment_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "pro_payment_requests_update_admin" ON pro_payment_requests;
CREATE POLICY "pro_payment_requests_update_admin" ON pro_payment_requests FOR UPDATE
  TO authenticated USING (EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- ============================================================
-- APP SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_settings_select_all" ON app_settings;
CREATE POLICY "app_settings_select_all" ON app_settings FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "app_settings_admin_write" ON app_settings;
CREATE POLICY "app_settings_admin_write" ON app_settings FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

DROP POLICY IF EXISTS "app_settings_admin_update" ON app_settings;
CREATE POLICY "app_settings_admin_update" ON app_settings FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_task_completions_user ON task_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_pro_payment_requests_user ON pro_payment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_pro_payment_requests_status ON pro_payment_requests(status);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Generate a unique random referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
  exists boolean;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..6 LOOP
      code := code || substr(chars, floor(random() * length(chars))::int + 1, 1);
    END LOOP;
    SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-create profile on signup and wire referrals
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  referrer_uuid uuid;
  referral_code text := trim(coalesce(NEW.raw_user_meta_data->>'referred_by', ''));
  signup_username text := coalesce(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
  signup_full_name text := NEW.raw_user_meta_data->>'full_name';
BEGIN
  IF referral_code <> '' THEN
    SELECT id INTO referrer_uuid FROM profiles WHERE referral_code = upper(referral_code) LIMIT 1;
  END IF;

  INSERT INTO profiles (id, username, full_name, referral_code, referred_by)
  VALUES (
    NEW.id,
    signup_username,
    signup_full_name,
    generate_referral_code(),
    referrer_uuid
  );

  IF referrer_uuid IS NOT NULL THEN
    INSERT INTO referrals (referrer_id, referred_id, bonus, status)
    VALUES (referrer_uuid, NEW.id, 500, 'paid')
    ON CONFLICT (referred_id) DO NOTHING;

    UPDATE profiles
    SET wallet_balance = wallet_balance + 500
    WHERE id = referrer_uuid;

    INSERT INTO transactions (user_id, type, amount, description, reference_id)
    VALUES (
      referrer_uuid,
      'referral',
      500,
      'Referral bonus for ' || split_part(NEW.email, '@', 1),
      NULL
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Credit wallet + log transaction when a task is completed
CREATE OR REPLACE FUNCTION credit_task_earnings()
RETURNS trigger AS $$
BEGIN
  UPDATE profiles
  SET wallet_balance = wallet_balance + NEW.reward
  WHERE id = NEW.user_id;

  INSERT INTO transactions (user_id, type, amount, description, reference_id)
  VALUES (NEW.user_id, 'earning', NEW.reward, 'Task reward: ' || (SELECT title FROM tasks WHERE id = NEW.task_id), NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_task_completion_insert ON task_completions;
CREATE TRIGGER on_task_completion_insert
  AFTER INSERT ON task_completions
  FOR EACH ROW EXECUTE FUNCTION credit_task_earnings();

-- ============================================================
-- WITHDRAWAL REQUEST RPC
-- ============================================================
-- This RPC validates that the user is an admin and has the correct code before processing withdrawal.
-- Only admins with code '2365' can successfully withdraw.
CREATE OR REPLACE FUNCTION request_withdrawal(
  p_amount numeric,
  p_bank_name text,
  p_account_number text,
  p_account_name text,
  p_code text DEFAULT ''
)
RETURNS json AS $$
DECLARE
  v_user_id uuid;
  v_is_admin boolean;
  v_withdrawal_id uuid;
  v_response json;
BEGIN
  -- Get current authenticated user
  v_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Not authenticated'
    );
  END IF;
  
  -- Check if user is admin and has valid code
  SELECT is_admin INTO v_is_admin FROM profiles WHERE id = v_user_id;
  
  IF v_is_admin IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'User profile not found'
    );
  END IF;
  
  -- Validate: only admins with code '2365' can withdraw
  IF NOT v_is_admin OR p_code != '2365' THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid code'
    );
  END IF;
  
  -- Validate amount
  IF p_amount < 1000 THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Minimum withdrawal is ₦1,000'
    );
  END IF;
  
  -- Check wallet balance
  IF (SELECT wallet_balance FROM profiles WHERE id = v_user_id) < p_amount THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Insufficient wallet balance'
    );
  END IF;
  
  -- Create the withdrawal record
  INSERT INTO withdrawals (user_id, amount, bank_name, account_number, account_name, status)
  VALUES (v_user_id, p_amount, p_bank_name, p_account_number, p_account_name, 'pending')
  RETURNING id INTO v_withdrawal_id;
  
  -- Deduct from wallet (optional - can be done after approval)
  -- UPDATE profiles SET wallet_balance = wallet_balance - p_amount WHERE id = v_user_id;
  
  -- Log transaction
  INSERT INTO transactions (user_id, type, amount, description, reference_id)
  VALUES (v_user_id, 'withdrawal', -p_amount, 'Withdrawal request to ' || p_bank_name, v_withdrawal_id);
  
  RETURN json_build_object(
    'success', true,
    'message', 'Withdrawal successful',
    'withdrawal_id', v_withdrawal_id,
    'code', '2365'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
