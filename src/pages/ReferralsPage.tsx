import type { Profile, Referral } from '../lib/supabase';
import { Copy, Check, Share2, Users, Clock, CheckCircle2 } from 'lucide-react';

type ReferralsPageProps = {
  profile: Profile | null;
  referrals: Referral[];
  copied: boolean;
  copyReferralCode: () => void;
};

const REFERRAL_BONUS_LABEL = 1000; // display only — must match the real value set server-side

export default function ReferralsPage({ profile, referrals, copied, copyReferralCode }: ReferralsPageProps) {
  // Real, backend-driven numbers — never inferred from referrals.length.
  // A referral only counts toward "earned" once it's actually paid out;
  // pending ones are shown separately so the totals can't be inflated
  // or misread as spendable balance.
  const paidReferrals = referrals.filter((r) => r.status === 'paid');
  const pendingReferrals = referrals.filter((r) => r.status !== 'paid');

  const totalEarned = paidReferrals.reduce(
    (sum, r) => sum + (Number.isFinite(parseFloat(r.bonus?.toString() ?? '')) ? parseFloat(r.bonus.toString()) : 0),
    0
  );
  const totalPending = pendingReferrals.reduce(
    (sum, r) => sum + (Number.isFinite(parseFloat(r.bonus?.toString() ?? '')) ? parseFloat(r.bonus.toString()) : 0),
    0
  );

  const shareMessage = `Join Cashboost9ja and start earning! Use my referral code ${profile?.referral_code ?? ''} when you sign up.`;
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 mb-1">Referral Program</h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Invite friends and earn ₦{REFERRAL_BONUS_LABEL.toLocaleString()} once they sign up and verify their account.
        </p>
      </div>

      {/* Referral code + share */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-800 to-slate-950 rounded-2xl p-5 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-500/20 rounded-full blur-[80px]" />
        <div className="relative">
          <div className="flex items-center gap-2 text-primary-300 text-sm mb-4">
            <Share2 className="w-4 h-4" /> Your referral code
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            <div className="flex-1 w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4">
              <p className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-wider break-all">
                {profile?.referral_code}
              </p>
            </div>
            <button
              onClick={copyReferralCode}
              className="p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all flex-shrink-0"
              title="Copy code"
            >
              {copied ? <Check className="w-5 h-5 text-accent-400" /> : <Copy className="w-5 h-5 text-white" />}
            </button>
          </div>

          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-sm hover:shadow-glow hover:scale-[1.01] active:scale-[0.99] transition-all mb-6"
          >
            <Share2 className="w-4 h-4" />
            Share on WhatsApp
          </a>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
              <p className="font-display font-extrabold text-2xl text-white">{referrals.length}</p>
              <p className="text-xs text-slate-400 mt-1">Total referrals</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
              <p className="font-display font-extrabold text-2xl text-accent-400">
                ₦{totalEarned.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 mt-1">Earned (paid)</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
              <p className="font-display font-extrabold text-2xl text-amber-300">
                ₦{totalPending.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 mt-1">Pending</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
              <p className="font-display font-extrabold text-2xl text-white">
                ₦{REFERRAL_BONUS_LABEL.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 mt-1">Per referral</p>
            </div>
          </div>
        </div>
      </div>

      {/* How it works — sets expectations so users understand why pending ≠ spendable */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200">
        <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 mb-4">How referral bonuses work</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">
              1
            </div>
            <p className="text-sm text-slate-600">Share your code with friends using the button above.</p>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">
              2
            </div>
            <p className="text-sm text-slate-600">
              When they sign up and verify their account, your bonus is marked{' '}
              <span className="font-semibold text-amber-600">pending</span>.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">
              3
            </div>
            <p className="text-sm text-slate-600">
              Once approved, it's marked <span className="font-semibold text-green-600">paid</span> and added
              to your wallet balance.
            </p>
          </div>
        </div>
      </div>

      {/* Referral list */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200">
        <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 mb-4">Your referrals</h3>
        {referrals.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No referrals yet. Share your code to start earning!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {referrals.slice(0, 30).map((r) => {
              const amount = Number.isFinite(parseFloat(r.bonus?.toString() ?? '')) ? parseFloat(r.bonus.toString()) : 0;
              const isPaid = r.status === 'paid';
              return (
                <div key={r.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isPaid ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                      }`}
                    >
                      {isPaid ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-slate-800">Referral bonus</p>
                      <p className="text-[11px] sm:text-xs text-slate-400">
                        {new Date(r.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <span
                      className={`text-[11px] sm:text-xs font-medium px-2 sm:px-2.5 py-1 rounded-full capitalize ${
                        isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {r.status}
                    </span>
                    <p className={`font-semibold text-xs sm:text-sm ${isPaid ? 'text-green-600' : 'text-amber-600'}`}>
                      +₦{amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
            {referrals.length > 30 && (
              <p className="text-center text-xs text-slate-400 pt-3">
                Showing your 30 most recent referrals.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}