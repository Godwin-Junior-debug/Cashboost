import type { Profile, Referral } from '../lib/supabase';
import { Copy, Check, Share2, Users } from 'lucide-react';

type ReferralsPageProps = {
  profile: Profile | null;
  referrals: Referral[];
  copied: boolean;
  copyReferralCode: () => void;
};

export default function ReferralsPage({ profile, referrals, copied, copyReferralCode }: ReferralsPageProps) {
  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 mb-1">Referral Program</h1>
        <p className="text-slate-500 text-xs sm:text-sm">Invite friends and earn ₦500 when they sign up.</p>
      </div>

      <div className="bg-gradient-to-br from-primary-700 via-primary-800 to-slate-950 rounded-2xl p-5 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-500/20 rounded-full blur-[80px]" />
        <div className="relative">
          <div className="flex items-center gap-2 text-primary-300 text-sm mb-4">
            <Share2 className="w-4 h-4" /> Your referral code
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
            <div className="flex-1 bg-white/10 border border-white/20 rounded-xl px-5 py-4">
              <p className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-wider">{profile?.referral_code}</p>
            </div>
            <button
              onClick={copyReferralCode}
              className="p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
              title="Copy code"
            >
              {copied ? <Check className="w-5 h-5 text-accent-400" /> : <Copy className="w-5 h-5 text-white" />}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
              <p className="font-display font-extrabold text-2xl text-white">{referrals.length}</p>
              <p className="text-xs text-slate-400 mt-1">Total referrals</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
              <p className="font-display font-extrabold text-2xl text-accent-400">₦{(referrals.length * 500).toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">Referral earnings</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
              <p className="font-display font-extrabold text-2xl text-white">₦500</p>
              <p className="text-xs text-slate-400 mt-1">Per referral</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200">
        <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 mb-4">Your referrals</h3>
        {referrals.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No referrals yet. Share your code to start earning!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {referrals.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                    R
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-slate-800">Referral bonus</p>
                    <p className="text-[11px] sm:text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <span className={`text-[11px] sm:text-xs font-medium px-2 sm:px-2.5 py-1 rounded-full ${r.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {r.status}
                  </span>
                  <p className="font-semibold text-xs sm:text-sm text-green-600">+₦{parseFloat(r.bonus.toString()).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
