import { Crown, Check, Zap, TrendingUp, Star, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';

type UpgradeProPageProps = {
  isPro?: boolean;
  actionLoading: boolean;
  onProceedToPayment: () => void;
  onBack: () => void;
};

const PRO_FEATURES = [
  { icon: TrendingUp, title: '1.5x Task Rewards', desc: 'Earn 50% more on every single task you complete.' },
  { icon: Zap, title: 'Priority Task Access', desc: 'Unlock exclusive high-paying tasks before everyone else.' },
  { icon: ShieldCheck, title: 'Faster Withdrawals', desc: 'Skip the queue with priority withdrawal processing.' },
  { icon: Crown, title: 'Pro Badge', desc: 'Show off your Pro status with an exclusive profile badge.' },
  { icon: Check, title: 'No Daily Task Limit', desc: 'Complete as many tasks as you want, every single day.' },
  { icon: Star, title: 'Higher Referral Bonus', desc: 'Earn more per successful referral as a Pro member.' },
];

export default function UpgradeProPage({ isPro, actionLoading, onProceedToPayment, onBack }: UpgradeProPageProps) {
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
            {isPro ? "You're already a Pro member" : 'Upgrade to Pro'}
          </h1>
          <p className="text-slate-300 max-w-md mx-auto text-sm sm:text-base">
            {isPro
              ? 'Enjoy all the exclusive Pro benefits below.'
              : 'Unlock everything DailyCash9ja has to offer and boost your earnings.'}
          </p>
        </div>
      </div>

      {/* Feature list */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h3 className="font-display font-bold text-lg text-slate-900 mb-4">What you get with Pro</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {PRO_FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-900">{f.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-display font-bold text-lg text-slate-900">Ready to level up?</p>
          <p className="text-sm text-slate-500">Upgrade once, earn more forever.</p>
        </div>
        <button
          onClick={onProceedToPayment}
          disabled={isPro || actionLoading}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-sm hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100 whitespace-nowrap"
        >
          {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Crown className="w-5 h-5" />}
          {isPro ? 'Already Pro' : 'Proceed to Payment'}
        </button>
      </div>
    </div>
  );
}