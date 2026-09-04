import { useState } from 'react';
import { ArrowLeft, Ticket, Loader2, ShoppingBag, ChevronRight } from 'lucide-react';

type RedeemPageProps = {
  actionLoading: boolean;
  onSubmit: (code: string) => Promise<void>;
  onBack: () => void;
  onNavigateToBuy: () => void;
};

export default function RedeemPage({ actionLoading, onSubmit, onBack, onNavigateToBuy }: RedeemPageProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!code.trim()) {
      setError('Enter a redeem code.');
      return;
    }

    await onSubmit(code.trim().toUpperCase());
    setCode('');
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
          <h1 className="font-display font-extrabold text-2xl text-slate-900">Redeem Code</h1>
          <p className="text-slate-500 text-sm">Have a gift or bonus code? Redeem it here for instant wallet credit.</p>
        </div>
      </div>

      <div className="relative bg-gradient-to-br from-purple-700 via-purple-800 to-slate-950 rounded-2xl p-6 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-accent-500/20 rounded-full blur-[60px]" />
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <p className="text-white/90 text-sm">Codes are case-insensitive and can only be used once per account.</p>
        </div>
      </div>

      <button
        onClick={onNavigateToBuy}
        className="w-full flex items-center justify-between gap-3 bg-white rounded-2xl p-5 border border-slate-200 hover:border-primary-300 hover:bg-primary-50/40 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-primary-600 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-800">Buy a Redeem Code</p>
            <p className="text-xs text-slate-500">Turn your wallet balance into a code you can gift or sell.</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </button>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Redeem code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. WELCOME500"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm uppercase tracking-wide"
          />
        </div>

        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={actionLoading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold text-sm hover:shadow-glow hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:hover:scale-100"
        >
          {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Ticket className="w-5 h-5" />}
          {actionLoading ? 'Redeeming...' : 'Redeem'}
        </button>
      </form>
    </div>
  );
}