-- Voucher payment receipts and review requests

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_pro boolean NOT NULL DEFAULT false;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pro_since timestamptz;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-receipts',
  'payment-receipts',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'voucher-receipts',
  'voucher-receipts',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "voucher_receipts_insert_authenticated" ON storage.objects;
CREATE POLICY "voucher_receipts_insert_authenticated" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('voucher-receipts', 'payment-receipts') AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "voucher_receipts_select_authenticated" ON storage.objects;
CREATE POLICY "voucher_receipts_select_authenticated" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id IN ('voucher-receipts', 'payment-receipts')
    AND ((storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true))
  );

CREATE TABLE IF NOT EXISTS public.voucher_payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  amount_sent numeric(12,2),
  reference text,
  receipt_url text NOT NULL,
  voucher_value numeric(12,2) NOT NULL,
  purchase_price numeric(12,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  code text,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.voucher_payment_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "voucher_requests_select_own_or_admin" ON public.voucher_payment_requests;
CREATE POLICY "voucher_requests_select_own_or_admin" ON public.voucher_payment_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

DROP POLICY IF EXISTS "voucher_requests_insert_own" ON public.voucher_payment_requests;
CREATE POLICY "voucher_requests_insert_own" ON public.voucher_payment_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "voucher_requests_update_admin" ON public.voucher_payment_requests;
CREATE POLICY "voucher_requests_update_admin" ON public.voucher_payment_requests
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

CREATE INDEX IF NOT EXISTS idx_voucher_payment_requests_user
  ON public.voucher_payment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_voucher_payment_requests_status
  ON public.voucher_payment_requests(status);