import { useState } from 'react';
import { ArrowLeft, Wifi, Loader2, Wallet, Check } from 'lucide-react';

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
};

const NETWORKS: { id: Network; color: string }[] = [
  { id: 'MTN', color: 'bg-amber-400 text-slate-900' },
  { id: 'Glo', color: 'bg-green-500 text-white' },
  { id: 'Airtel', color: 'bg-red-500 text-white' },
  { id: '9mobile', color: 'bg-emerald-600 text-white' },
];

// NOTE: placeholder plans/prices — replace with the real plan list and prices
// from your data (VTU) provider, ideally fetched per network from Supabase.
const PLANS: DataPlan[] = [
  { id: '500mb', label: '500MB', validity: '30 days', price: 350 },
  { id: '1gb', label: '1GB', validity: '30 days', price: 600 },
  { id: '2gb', label: '2GB', validity: '30 days', price: 1100 },
  { id: '5gb', label: '5GB', validity: '30 days', price: 2500 },
  { id: '10gb', label: '10GB', validity: '30 days', price: 4500 },
];

export default function DataPage({ walletBalance, actionLoading, onSubmit, onBack }: DataPageProps) {
  const [network, setNetwork] = useState<Network>('MTN');
  const [phone, setPhone] = useState('');
  const [planId, setPlanId] = useState<string>('');
  const [error, setError] = useState('');

  const selectedPlan = PLANS.find((p) => p.id === planId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!/^0\d{10}$/.test(phone.trim())) {
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
                onClick={() => setNetwork(n.id)}
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
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08012345678"
            maxLength={11}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Select a plan</label>
          <div className="space-y-2">
            {PLANS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlanId(p.id)}
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

        <button
          type="submit"
          disabled={actionLoading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold text-sm hover:shadow-glow hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:hover:scale-100"
        >
          {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wifi className="w-5 h-5" />}
          {actionLoading ? 'Processing...' : 'Buy Data'}
        </button>
      </form>
    </div>
  );
}