import { useState, type FormEvent } from 'react';
import { Wallet, Mail, Lock, ArrowRight, AlertCircle, Loader2, CheckCircle2, User, Phone, Gift } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

type AuthPageProps = {
  mode: 'login' | 'register';
  onNavigate: (page: string) => void;
};

export default function AuthPage({ mode, onNavigate }: AuthPageProps) {
  const { signIn, signUp } = useAuth();
  const isRegister = mode === 'register';

  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    fullName: '',
    phone: '',
    referralCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isRegister) {
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }
      const { error } = await signUp(form.email, form.password, {
        username: form.username || form.email.split('@')[0],
        full_name: form.fullName,
        phone: form.phone || undefined,
        referred_by: form.referralCode || undefined,
      });
      if (error) {
        setError(error);
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
      }
    } else {
      const { error } = await signIn(form.email, form.password);
      if (error) {
        setError(error);
        setLoading(false);
        return;
      }

      // Check straight away whether this account is an admin, and route
      // accordingly. We query directly instead of waiting on the auth
      // context's `profile` state, since that updates asynchronously and
      // may not be ready in this same render.
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', authData.user.id)
          .single();

        if (profileRow?.is_admin) {
          setLoading(false);
          onNavigate('admin');
          return;
        }
      }

      setLoading(false);
      onNavigate('dashboard');
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-primary-950 to-slate-900 px-4">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center mx-auto mb-6 shadow-glow-teal animate-scale-in">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-display font-extrabold text-3xl text-white mb-3">Account created!</h2>
          <p className="text-slate-300 mb-8">Welcome to DailyCash9ja. Check your email to confirm your account, then log in to start earning.</p>
          <button
            onClick={() => onNavigate('login')}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold hover:shadow-glow hover:scale-105 transition-all"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-primary-950 to-slate-900 px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-600/20 rounded-full blur-[100px] animate-float-slow" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent-500/15 rounded-full blur-[100px] animate-float-slow" style={{ animationDelay: '4s' }} />

      <div className="relative w-full max-w-md">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-2.5 mb-8 mx-auto group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
            <Wallet className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display font-extrabold text-xl text-white">
            DailyCash<span className="text-gradient">9ja</span>
          </span>
        </button>

        <div className="glass rounded-3xl p-8 shadow-2xl animate-scale-in">
          <h1 className="font-display font-extrabold text-2xl text-white mb-1">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-slate-400 text-sm mb-6">
            {isRegister ? 'Start earning in 3 minutes — it\'s free.' : 'Log in to continue earning.'}
          </p>

          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      placeholder="Choose a username"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Full name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="Your full name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone (optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+234 800 000 0000"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => onNavigate('forgot-password')}
                    className="text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={isRegister ? 'At least 6 characters' : 'Your password'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  required
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Referral code (optional)</label>
                <div className="relative">
                  <Gift className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={form.referralCode}
                    onChange={(e) => setForm({ ...form, referralCode: e.target.value.toUpperCase() })}
                    placeholder="Enter referral code"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all uppercase"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold hover:shadow-glow hover:scale-[1.02] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Please wait...</>
              ) : (
                <>{isRegister ? 'Create account' : 'Log in'} <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => onNavigate(isRegister ? 'login' : 'register')}
              className="text-primary-400 font-semibold hover:text-primary-300 transition-colors"
            >
              {isRegister ? 'Log in' : 'Sign up free'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}