import { useState, type FormEvent } from 'react';
import { Wallet, Mail, ArrowRight, ArrowLeft, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../lib/auth';

type ForgotPasswordPageProps = {
  onNavigate: (page: string) => void;
};

export default function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await sendPasswordReset(email);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setSent(true);
    }
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
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center mx-auto mb-5 shadow-glow-teal animate-scale-in">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-display font-extrabold text-2xl text-white mb-2">Check your email</h1>
              <p className="text-slate-400 text-sm mb-6">
                If an account exists for <span className="text-slate-200">{email}</span>, we've sent a link to reset your password.
              </p>
              <button
                onClick={() => onNavigate('login')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold hover:shadow-glow hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                Back to login
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => onNavigate('login')}
                className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm mb-5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to login
              </button>

              <h1 className="font-display font-extrabold text-2xl text-white mb-1">Forgot your password?</h1>
              <p className="text-slate-400 text-sm mb-6">Enter your email and we'll send you a reset link.</p>

              {error && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold hover:shadow-glow hover:scale-[1.02] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                  ) : (
                    <>Send reset link <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}