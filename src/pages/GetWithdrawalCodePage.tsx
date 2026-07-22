import type { Dispatch, SetStateAction, FormEvent } from 'react';
import { type Profile } from '../lib/supabase';
import { Banknote, Loader2, Check } from 'lucide-react';

type GetWithdrawalCodePageProps = {
  profile: Profile | null;
  withdrawForm: {
    amount: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  setWithdrawForm: Dispatch<SetStateAction<{
    amount: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
  }>>;
  actionLoading: boolean;
  requestWithdrawal: (e: FormEvent) => Promise<void>;
  pendingWithdrawal: { id: string; code: string } | null;
  cancelPendingWithdrawal: () => void;
};

export default function GetWithdrawalCodePage({
  profile,
  withdrawForm,
  setWithdrawForm,
  actionLoading,
  requestWithdrawal,
  pendingWithdrawal,
  cancelPendingWithdrawal,
}: GetWithdrawalCodePageProps) {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-bold text-base sm:text-lg text-slate-900">Get withdrawal code</h3>
        <div className="text-right">
          <p className="text-xs text-slate-400">Available</p>
          <p className="font-display font-extrabold text-base sm:text-lg text-primary-600">₦{parseFloat(profile?.wallet_balance?.toString() || '0').toLocaleString()}</p>
        </div>
      </div>

      {pendingWithdrawal ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
          <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="font-semibold text-slate-800 mb-1">Code generated</p>
          <p className="font-mono font-extrabold text-2xl text-green-700 tracking-widest mb-2">{pendingWithdrawal.code}</p>
          <p className="text-xs text-slate-500">Use this code in the "Withdraw money" card to confirm your withdrawal.</p>
          <button
            type="button"
            onClick={cancelPendingWithdrawal}
            className="mt-4 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-all"
          >
            Start a new request instead
          </button>
        </div>
      ) : (
        <form onSubmit={requestWithdrawal} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Amount (₦)</label>
            <input
              type="number"
              min="1000"
              step="100"
              value={withdrawForm.amount}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
              placeholder="Minimum ₦1,000"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Bank name</label>
            <input
              type="text"
              value={withdrawForm.bankName}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, bankName: e.target.value })}
              placeholder="e.g. GTBank"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Account number</label>
              <input
                type="text"
                value={withdrawForm.accountNumber}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })}
                placeholder="0123456789"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Account name</label>
              <input
                type="text"
                value={withdrawForm.accountName}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, accountName: e.target.value })}
                placeholder="Your name"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold text-sm sm:text-base hover:shadow-glow hover:scale-[1.02] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Banknote className="w-5 h-5" /> Get withdrawal code</>}
          </button>
        </form>
      )}
    </div>
  );
}