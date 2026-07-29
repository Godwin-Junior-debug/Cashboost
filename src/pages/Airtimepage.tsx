import { useState } from 'react';
import { ArrowLeft, Smartphone, Loader2, Wallet } from 'lucide-react';

type Network = 'MTN' | 'Glo' | 'Airtel' | '9mobile';

type AirtimePageProps = {
  walletBalance: number;
  actionLoading: boolean;
  onSubmit: (network: string, phone: string, amount: number) => Promise<void>;
  onBack: () => void;
  onNavigateToPayment?: () => void;
};

const NETWORKS: { id: Network; color: string }[] = [
  { id: 'MTN', color: 'bg-amber-400 text-slate-900' },
  { id: 'Glo', color: 'bg-green-500 text-white' },
  { id: 'Airtel', color: 'bg-red-500 text-white' },
  { id: '9mobile', color: 'bg-emerald-600 text-white' },
];

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export default function AirtimePage({
  walletBalance,
  actionLoading,
  onSubmit,
  onBack,
  onNavigateToPayment,
}: AirtimePageProps) {
  const [network, setNetwork] = useState<Network>('MTN');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');

  const phoneValid = /^0\d{10}$/.test(phone.trim());
  const numericAmount = parseFloat(amount);
  const amountValid = !isNaN(numericAmount) && numericAmount >= 50 && numericAmount <= walletBalance;
  const readyForCode = phoneValid && amountValid;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!phoneValid) {
      setError('Enter a valid 11-digit phone number (e.g. 08012345678).');
      return;
    }
    if (isNaN(numericAmount) || numericAmount < 50) {
      setError('Minimum airtime purchase is ₦50.');
      return;
    }
    if (numericAmount > walletBalance) {
      setError('Insufficient wallet balance.');
      return;
    }

    await onSubmit(network, phone.trim(), numericAmount);
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
          <h1 className="font-display font-extrabold text-2xl text-slate-900">Buy Airtime</h1>
          <p className="text-slate-500 text-sm">Top up any Nigerian line instantly from your wallet.</p>
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
          <label className="block text-sm font-semibold text-slate-700 mb-2">Amount</label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {QUICK_AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAmount(a.toString())}
                className={`py-2 rounded-xl border text-sm font-semibold transition-colors ${
                  amount === a.toString()
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                ₦{a.toLocaleString()}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter custom amount"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

        {/* Appears once phone + amount look valid */}
        {readyForCode && (
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <label className="block text-sm font-semibold text-slate-700">Enter DailyCash9ja code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter your DailyCash9ja code"
                maxLength={10}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
              <button
                type="button"
                onClick={() => onNavigateToPayment?.()}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold text-xs sm:text-sm hover:shadow-glow transition-all flex items-center gap-2 whitespace-nowrap"
              >
                Get code
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={actionLoading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold text-sm hover:shadow-glow hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:hover:scale-100"
        >
          {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Smartphone className="w-5 h-5" />}
          {actionLoading ? 'Processing...' : 'Buy Airtime'}
        </button>
      </form>
    </div>
  );
}