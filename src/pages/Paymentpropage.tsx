import { useEffect, useState } from 'react';
import { Copy, Check, Landmark, User, Hash, ArrowLeft, Loader2, Crown, AlertCircle, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

type PaymentProPageProps = {
  isPro?: boolean;
  actionLoading: boolean;
  onProceedToConfirm: () => void;
  onBack: () => void;
};

type BankDetails = {
  bankName: string;
  accountNumber: string;
  accountName: string;
  price: number;
};

const DEFAULT_DETAILS: BankDetails = {
  bankName: 'Access Bank',
  accountNumber: '1729650675',
  accountName: 'Paschal Amobi Obulose',
  price: 10000,
};

function CopyField({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-slate-500" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-slate-400 uppercase tracking-wide">{label}</p>
          <p className="font-semibold text-sm text-slate-900 truncate">{value}</p>
        </div>
      </div>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors flex-shrink-0"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

export default function PaymentProPage({ isPro, actionLoading, onProceedToConfirm, onBack }: PaymentProPageProps) {
  const [details, setDetails] = useState<BankDetails>(DEFAULT_DETAILS);
  const [loadingDetails, setLoadingDetails] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', ['pro_bank_name', 'pro_account_number', 'pro_account_name', 'pro_price']);

      if (!error && data && data.length > 0) {
        const map = Object.fromEntries(data.map((row) => [row.key, row.value]));
        setDetails({
          bankName: map.pro_bank_name || DEFAULT_DETAILS.bankName,
          accountNumber: map.pro_account_number || DEFAULT_DETAILS.accountNumber,
          accountName: map.pro_account_name || DEFAULT_DETAILS.accountName,
          price: map.pro_price ? Number(map.pro_price) : DEFAULT_DETAILS.price,
        });
      }
      setLoadingDetails(false);
    })();
  }, []);

  if (loadingDetails) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 rounded-[28px] p-6 sm:p-8 overflow-hidden shadow-soft text-center">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-amber-400/20 rounded-full blur-[70px]" />
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-2">
            {isPro ? "You're already a Pro member" : 'Complete Your Payment'}
          </h1>
          <p className="text-slate-300 max-w-md mx-auto text-sm sm:text-base">
            {isPro
              ? 'You have full access to all Pro benefits.'
              : `Transfer ₦${details.price.toLocaleString()} to the account below to activate Pro.`}
          </p>
        </div>
      </div>

      {!isPro && (
        <>
          {/* Amount */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Amount to pay</p>
            <p className="font-display font-extrabold text-4xl text-slate-900">₦{details.price.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">One-time payment · Lifetime Pro access</p>
          </div>

          {/* Bank details */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-display font-bold text-lg text-slate-900 mb-4">Bank transfer details</h3>
            <div className="space-y-3">
              <CopyField label="Bank Name" value={details.bankName} icon={Landmark} />
              <CopyField label="Account Number" value={details.accountNumber} icon={Hash} />
              <CopyField label="Account Name" value={details.accountName} icon={User} />
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 space-y-1">
              <p className="font-semibold">Before you confirm:</p>
              <ul className="list-disc list-inside space-y-0.5 text-amber-700">
                <li>Transfer exactly ₦{details.price.toLocaleString()} to the account above.</li>
                <li>Use your registered username as the transfer narration/description if possible.</li>
                <li>Only tap "I've Made This Payment" after the transfer is completed.</li>
                <li>Your Pro access will be reviewed and activated shortly after payment.</li>
              </ul>
            </div>
          </div>

          {/* Confirm */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-display font-bold text-base text-slate-900">Already sent the money?</p>
                <p className="text-xs text-slate-500">Confirm below to notify us.</p>
              </div>
            </div>
            <button
              onClick={onProceedToConfirm}
              disabled={actionLoading}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-sm hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100 whitespace-nowrap"
            >
              {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              I've Made This Payment
            </button>
          </div>
        </>
      )}
    </div>
  );
}