import type { Dispatch, SetStateAction, FormEvent } from 'react';
import { Banknote, Loader2 } from 'lucide-react';

type WithdrawMoneyPageProps = {
  actionLoading: boolean;
  pendingWithdrawal: { id: string; code: string } | null;
  codeInput: string;
  setCodeInput: Dispatch<SetStateAction<string>>;
  confirmWithdrawal: (e: FormEvent) => Promise<void>;
};

export default function WithdrawMoneyPage({
  actionLoading,
  pendingWithdrawal,
  codeInput,
  setCodeInput,
  confirmWithdrawal,
}: WithdrawMoneyPageProps) {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200">
      <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 mb-5">Withdraw money</h3>

      {pendingWithdrawal ? (
        <form onSubmit={confirmWithdrawal} className="space-y-3 sm:space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs sm:text-sm text-amber-800">
            Enter the withdrawal code you generated to send this withdrawal for processing.
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Withdrawal code</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="6-digit code"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 sm:py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all tracking-widest text-center font-mono text-base sm:text-lg"
              required
            />
          </div>
          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold text-sm sm:text-base hover:shadow-glow hover:scale-[1.02] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Withdraw money'}
          </button>
        </form>
      ) : (
        <div className="text-center py-10">
          <Banknote className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Get a withdrawal code first to unlock this step.</p>
        </div>
      )}
    </div>
  );
}