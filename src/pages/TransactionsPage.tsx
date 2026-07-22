import { type Transaction } from '../lib/supabase';
import { Receipt, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

type TransactionsPageProps = {
  transactions: Transaction[];
  totalEarnings: number;
  totalWithdrawn: number;
  pendingWithdrawals: number;
};

export default function TransactionsPage({ transactions, totalEarnings, totalWithdrawn, pendingWithdrawals }: TransactionsPageProps) {
  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 mb-1">Transaction History</h1>
        <p className="text-slate-500 text-xs sm:text-sm">All your earnings, referrals, and withdrawals in one place.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {[
          { label: 'Total Earned', value: `₦${totalEarnings.toLocaleString()}`, color: 'text-green-600' },
          { label: 'Total Withdrawn', value: `₦${totalWithdrawn.toLocaleString()}`, color: 'text-orange-600' },
          { label: 'Transactions', value: transactions.length.toString(), color: 'text-primary-600' },
          { label: 'Pending', value: pendingWithdrawals.toString(), color: 'text-amber-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200">
            <p className="text-[11px] sm:text-xs text-slate-400 mb-1">{s.label}</p>
            <p className={`font-display font-bold text-sm sm:text-lg ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No transactions yet. Complete a task to start earning!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 hover:bg-slate-50 transition-colors gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${t.amount > 0 ? 'bg-green-50' : 'bg-orange-50'}`}>
                    {t.amount > 0 ? <ArrowDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" /> : <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-slate-800 truncate">{t.description}</p>
                    <p className="text-[11px] sm:text-xs text-slate-400 capitalize">{t.type} · {new Date(t.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                <p className={`font-semibold text-xs sm:text-sm flex-shrink-0 ${t.amount > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  {t.amount > 0 ? '+' : ''}₦{Math.abs(parseFloat(t.amount.toString())).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
