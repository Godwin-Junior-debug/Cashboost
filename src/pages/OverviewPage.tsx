import type { Profile, Referral, Transaction, TaskCompletion } from '../lib/supabase';
import { LayoutDashboard, ListChecks, Users, Wallet, TrendingUp, Banknote, Receipt, Gift, Sparkles, Zap, Flame, Share2, Smartphone, Crown, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

type OverviewPageProps = {
  profile: Profile | null;
  completions: TaskCompletion[];
  transactions: Transaction[];
  referrals: Referral[];
  totalEarnings: number;
  onNavigate: (page: string) => void;
  setTab: (tab: 'overview' | 'tasks' | 'referrals' | 'withdrawals' | 'transactions' | 'pro') => void;
  showToast: (type: 'success' | 'error', msg: string) => void;
};

export default function OverviewPage({
  profile,
  completions,
  transactions,
  referrals,
  totalEarnings,
  onNavigate,
  setTab,
  showToast,
}: OverviewPageProps) {
  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="relative bg-gradient-to-br from-primary-700 via-primary-800 to-slate-950 rounded-2xl p-5 sm:p-8 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-accent-500/20 rounded-full blur-[80px]" />
        <div className="relative">
          <div className="flex items-center gap-2 text-primary-300 text-xs sm:text-sm mb-2">
            <Sparkles className="w-4 h-4" />
            Welcome back
          </div>
          <h1 className="font-display font-extrabold text-xl sm:text-3xl text-white mb-1 truncate">
            {profile?.full_name || profile?.username}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">Here's your earning summary today.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Wallet Balance', value: `₦${parseFloat(profile?.wallet_balance?.toString() || '0').toLocaleString()}`, icon: Wallet, color: 'from-primary-500 to-primary-700' },
          { label: 'Total Earned', value: `₦${totalEarnings.toLocaleString()}`, icon: TrendingUp, color: 'from-accent-500 to-accent-600' },
          { label: 'Tasks Done', value: completions.length.toString(), icon: ListChecks, color: 'from-orange-500 to-amber-600' },
          { label: 'Referrals', value: referrals.length.toString(), icon: Users, color: 'from-pink-500 to-rose-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 hover:shadow-lg transition-all duration-300">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-2 sm:mb-3`}>
              <s.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <p className="font-display font-extrabold text-lg sm:text-2xl text-slate-900 break-words">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 rounded-2xl p-5 sm:p-6 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white mb-0.5">Unlock Pro Benefits</h3>
              <p className="text-white/80 text-xs sm:text-sm">Double your daily bonus, priority withdrawals & exclusive tasks.</p>
            </div>
          </div>
          <button
            onClick={() => setTab('pro')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-orange-600 font-bold text-sm hover:scale-105 transition-transform whitespace-nowrap"
          >
            Upgrade now
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200">
          <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 mb-4">Quick actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[
              { label: 'Tasks', icon: ListChecks, action: () => setTab('tasks'), color: 'bg-primary-50 text-primary-700' },
              { label: 'Refer', icon: Share2, action: () => setTab('referrals'), color: 'bg-accent-50 text-accent-600' },
              { label: 'Withdraw', icon: Banknote, action: () => setTab('withdrawals'), color: 'bg-orange-50 text-orange-600' },
              { label: 'History', icon: Receipt, action: () => setTab('transactions'), color: 'bg-pink-50 text-pink-600' },
              { label: 'Bonus', icon: Gift, action: () => showToast('success', 'Daily bonus claimed! ₦50 credited.'), color: 'bg-amber-50 text-amber-600' },
              { label: 'Upgrade', icon: Crown, action: () => setTab('pro'), color: 'bg-yellow-50 text-yellow-700' },
              { label: 'Airtime', icon: Smartphone, action: () => showToast('success', 'Airtime purchase coming soon!'), color: 'bg-cyan-50 text-cyan-700' },
              { label: 'Home', icon: LayoutDashboard, action: () => onNavigate('home'), color: 'bg-slate-100 text-slate-700' },
            ].map((a) => (
              <button
                key={a.label}
                onClick={a.action}
                className={`flex min-h-[90px] sm:min-h-[100px] flex-col items-center justify-center gap-1.5 sm:gap-2 p-2 sm:p-4 rounded-xl sm:rounded-2xl ${a.color} hover:shadow-md hover:scale-[1.03] transition-all duration-300`}
              >
                <a.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-[11px] sm:text-xs font-semibold text-center">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
          <Flame className="w-7 h-7 sm:w-8 sm:h-8 mb-3" />
          <h3 className="font-display font-bold text-base sm:text-lg mb-1">Daily Streak</h3>
          <p className="text-white/80 text-xs sm:text-sm mb-4">Keep logging in to grow your streak bonus!</p>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            <span className="font-display font-extrabold text-xl sm:text-2xl">12 days</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-base sm:text-lg text-slate-900">Recent activity</h3>
          <button onClick={() => setTab('transactions')} className="text-xs sm:text-sm font-semibold text-primary-600 hover:text-primary-700">
            View all
          </button>
        </div>
        {transactions.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No transactions yet. Complete a task to start earning!</p>
        ) : (
          <div className="space-y-1">
            {transactions.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0 gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${t.amount > 0 ? 'bg-green-50' : 'bg-orange-50'}`}>
                    {t.amount > 0 ? <ArrowDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" /> : <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-slate-800 truncate">{t.description}</p>
                    <p className="text-[11px] sm:text-xs text-slate-400">{new Date(t.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
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
