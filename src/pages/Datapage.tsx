import { useState } from 'react';
import { ArrowLeft, Wifi, Loader2, Wallet, Check, KeyRound } from 'lucide-react';

type Network = 'MTN' | 'Glo' | 'Airtel' | '9mobile';

type DataPlan = {
  id: string;
  label: string;
  validity: string;
  price: number;
};

type DataPageProps = {
  walletBalance: number;
  actionLoading: boolean;
  onSubmit: (network: string, phone: string, planId: string, amount: number) => Promise<void>;
  onBack: () => void;
  onNavigateToPayment?: () => void;
  // Optional: wire this to your OTP/verification endpoint. If omitted, a
  // local mock is used so the flow still works end-to-end.
  onRequestCode?: (phone: string) => Promise<void>;
  onVerifyCode?: (phone: string, code: string) => Promise<boolean>;
};

const NETWORKS: { id: Network; color: string }[] = [
  { id: 'MTN', color: 'bg-amber-400 text-slate-900' },
  { id: 'Glo', color: 'bg-green-500 text-white' },
  { id: 'Airtel', color: 'bg-red-500 text-white' },
  { id: '9mobile', color: 'bg-emerald-600 text-white' },
];

// NOTE: placeholder plans/prices — replace with the real plan list and prices
// from your data (VTU) provider, ideally fetched per network from Supabase.
const PLANS_BY_NETWORK: Record<Network, DataPlan[]> = {
  MTN: [
    { id: 'mtn-500mb', label: '500MB', validity: '30 days', price: 350 },
    { id: 'mtn-1gb', label: '1GB', validity: '30 days', price: 600 },
    { id: 'mtn-2gb', label: '2GB', validity: '30 days', price: 1100 },
    { id: 'mtn-5gb', label: '5GB', validity: '30 days', price: 2500 },
    { id: 'mtn-10gb', label: '10GB', validity: '30 days', price: 4500 },
  ],
  Glo: [
    { id: 'glo-1gb', label: '1GB', validity: '30 days', price: 500 },
    { id: 'glo-2gb', label: '2GB', validity: '30 days', price: 900 },
    { id: 'glo-3.5gb', label: '3.5GB', validity: '30 days', price: 1400 },
    { id: 'glo-7gb', label: '7GB', validity: '30 days', price: 2500 },
    { id: 'glo-10gb', label: '10GB', validity: '30 days', price: 3500 },
  ],
  Airtel: [
    { id: 'airtel-500mb', label: '500MB', validity: '30 days', price: 300 },
    { id: 'airtel-1.5gb', label: '1.5GB', validity: '30 days', price: 650 },
    { id: 'airtel-3gb', label: '3GB', validity: '30 days', price: 1200 },
    { id: 'airtel-6gb', label: '6GB', validity: '30 days', price: 2200 },
    { id: 'airtel-10gb', label: '10GB', validity: '30 days', price: 4000 },
  ],
  '9mobile': [
    { id: '9mobile-500mb', label: '500MB', validity: '30 days', price: 300 },
    { id: '9mobile-1gb', label: '1GB', validity: '30 days', price: 550 },
    { id: '9mobile-2gb', label: '2GB', validity: '30 days', price: 1000 },
    { id: '9mobile-4.5gb', label: '4.5GB', validity: '30 days', price: 2000 },
    { id: '9mobile-11gb', label: '11GB', validity: '30 days', price: 4000 },
  ],
};

export default function DataPage({
  walletBalance,
  actionLoading,
  onSubmit,
  onBack,
  onNavigateToPayment,
  onRequestCode,
  onVerifyCode,
}: DataPageProps) {
  const [network, setNetwork] = useState<Network>('MTN');
  const [phone, setPhone] = useState('');
  const [planId, setPlanId] = useState<string>('');
  const [error, setError] = useState('');

  // Verification flow state
  const [codeSent, setCodeSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [requestingCode, setRequestingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [otp, setOtp] = useState('');
  const [codeError, setCodeError] = useState('');

  const plans = PLANS_BY_NETWORK[network];
  const selectedPlan = plans.find((p) => p.id === planId);
  const phoneValid = /^0\d{10}$/.test(phone.trim());
  const planValid = !!selectedPlan && selectedPlan.price <= walletBalance;
  const readyForVerification = phoneValid && planValid;

  // Any edit to phone/plan after a code was sent invalidates it, so the user
  // has to re-verify against the details they're actually submitting.
  function updatePhone(value: string) {
    setPhone(value);
    setCodeSent(false);
    setCodeVerified(false);
    setOtp('');
    setCodeError('');
  }

  function updatePlan(id: string) {
    setPlanId(id);
    setCodeSent(false);
    setCodeVerified(false);
    setOtp('');
    setCodeError('');
  }

  // Plans are network-specific, so switching networks clears whatever plan
  // was picked from the old list (and resets verification, since the price
  // may now be different).
  function updateNetwork(n: Network) {
    setNetwork(n);
    setPlanId('');
    setCodeSent(false);
    setCodeVerified(false);
    setOtp('');
    setCodeError('');
  }

  async function handleGetCode() {
    setError('');
    setCodeError('');
    if (!phoneValid) {
      setError('Enter a valid 11-digit phone number (e.g. 08012345678).');
      return;
    }
    if (!selectedPlan) {
      setError('Select a data plan.');
      return;
    }
    if (selectedPlan.price > walletBalance) {
      setError('Insufficient wallet balance.');
      return;
    }

    setRequestingCode(true);
    try {
      if (onRequestCode) {
        await onRequestCode(phone.trim());
      } else {
        // Local mock so the UI works before a real OTP endpoint is wired up.
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
      setCodeSent(true);
    } catch {
      setCodeError('Could not send verification code. Try again.');
    } finally {
      setRequestingCode(false);
    }
  }

  async function handleVerifyCode() {
    setCodeError('');
    if (otp.trim().length < 4) {
      setCodeError('Enter the DailyCash Naija code we sent you.');
      return;
    }
    setVerifyingCode(true);
    try {
      let ok = true;
      if (onVerifyCode) {
        ok = await onVerifyCode(phone.trim(), otp.trim());
      } else {
        // Local mock: any 4-6 digit code passes.
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      if (ok) {
        setCodeVerified(true);
      } else {
        setCodeError('Incorrect code. Try again.');
      }
    } catch {
      setCodeError('Could not verify code. Try again.');
    } finally {
      setVerifyingCode(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!phoneValid) {
      setError('Enter a valid 11-digit phone number (e.g. 08012345678).');
      return;
    }
    if (!selectedPlan) {
      setError('Select a data plan.');
      return;
    }
    if (selectedPlan.price > walletBalance) {
      setError('Insufficient wallet balance.');
      return;
    }
    if (!codeVerified) {
      setError('Get and verify your code before buying data.');
      return;
    }

    await onSubmit(network, phone.trim(), selectedPlan.id, selectedPlan.price);
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-lg">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900">Buy Data</h1>
          <p className="text-slate-500 text-sm">Get a data bundle for any line, straight from your wallet.</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary-700 via-primary-800 to-slate-950 rounded-2xl p-5 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-primary-200 text-xs">Wallet balance</p>
          <p className="font-display font-extrabold text-xl text-white">₦{walletBalance.toLocaleString()}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Network</label>
          <div className="grid grid-cols-4 gap-2">
            {NETWORKS.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => updateNetwork(n.id)}
                className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border-2 transition-all ${
                  network === n.id ? 'border-primary-600 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${n.color}`}>
                  {n.id.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-[11px] font-medium text-slate-700">{n.id}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Phone number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => updatePhone(e.target.value)}
            placeholder="08012345678"
            maxLength={11}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Select a plan</label>
          <div className="space-y-2">
            {plans.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => updatePlan(p.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                  planId === p.id ? 'border-primary-600 bg-primary-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-800">{p.label}</p>
                  <p className="text-xs text-slate-400">{p.validity}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">₦{p.price.toLocaleString()}</span>
                  {planId === p.id && <Check className="w-4 h-4 text-primary-600" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

        {/* Verification step: appears once phone + plan look valid */}
        {readyForVerification && !codeVerified && (
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <label className="block text-sm font-semibold text-slate-700">Enter DailyCash Naija code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder={codeSent ? 'Enter DailyCash Naija code' : 'Tap "Get code" to receive your code'}
                maxLength={10}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
              <button
                type="button"
                onClick={handleGetCode}
                disabled={requestingCode}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold text-xs sm:text-sm hover:shadow-glow transition-all disabled:opacity-60 flex items-center gap-2 whitespace-nowrap"
              >
                {requestingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                {requestingCode ? 'Sending...' : codeSent ? 'Resend' : 'Get code'}
              </button>
            </div>
            {codeSent && (
              <p className="text-xs text-slate-500">
                DailyCash Naija code sent to {phone.trim()}.{' '}
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={verifyingCode || !otp.trim()}
                  className="font-semibold text-primary-600 hover:text-primary-700 disabled:opacity-60 disabled:hover:text-primary-600"
                >
                  {verifyingCode ? 'Verifying...' : 'Verify code'}
                </button>
              </p>
            )}
            {codeError && <p className="text-sm text-red-600 font-medium">{codeError}</p>}
          </div>
        )}

        <button
          type="submit"
          disabled={actionLoading || !codeVerified}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold text-sm hover:shadow-glow hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:hover:scale-100"
        >
          {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wifi className="w-5 h-5" />}
          {actionLoading ? 'Processing...' : 'Buy Data'}
        </button>
      </form>
    </div>
  );
}