import { useEffect, useRef, useState } from 'react';
import {
  Wallet, ArrowRight, Sparkles, Users, TrendingUp, ShieldCheck,
  MousePointerClick, Share2, Video, Gift, CheckCircle2, Star,
  Quote, ChevronDown, Zap, Smartphone, BadgeCheck, Clock,
} from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

type LandingPageProps = {
  onNavigate: (page: string) => void;
};

const stats = [
  { label: 'Members Earning', value: 48000, suffix: '+', icon: Users },
  { label: 'Paid Out', value: 185, prefix: '₦', suffix: 'M+', icon: TrendingUp },
  { label: 'Tasks Completed', value: 1200000, suffix: '+', icon: CheckCircle2 },
  { label: 'Avg. Withdrawal', value: 48, prefix: 'hrs', icon: Clock },
];

const earningMethods = [
  {
    icon: MousePointerClick,
    title: 'Micro-Tasks',
    tagline: 'Get paid daily',
    desc: 'Like, follow, review, and test apps. Simple tasks with clear steps and fixed pay — done on your phone in minutes.',
    range: '₦50 – ₦1,000',
    color: 'from-primary-500 to-primary-700',
    accent: 'text-primary-600',
    bg: 'bg-primary-50',
  },
  {
    icon: Share2,
    title: 'Referral Program',
    tagline: 'Earn when you invite',
    desc: 'Share your unique referral code. When your friends sign up, you both earn a cash bonus — every single time.',
    range: '₦500 per referral',
    color: 'from-accent-500 to-accent-600',
    accent: 'text-accent-600',
    bg: 'bg-accent-50',
  },
  {
    icon: Video,
    title: 'Content Rewards',
    tagline: 'Get paid for content',
    desc: 'Create short videos promoting partner campaigns. One viral post can earn more than a week of micro-tasks.',
    range: 'Per post + bonuses',
    color: 'from-orange-500 to-amber-600',
    accent: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    icon: Gift,
    title: 'Daily Bonuses',
    tagline: 'Login & earn',
    desc: 'Log in every day to claim your daily bonus. Stack streaks for bigger rewards and unlock surprise cash drops.',
    range: '₦50 – ₦500 daily',
    color: 'from-pink-500 to-rose-600',
    accent: 'text-pink-600',
    bg: 'bg-pink-50',
  },
];

const steps = [
  {
    num: '01',
    icon: Wallet,
    title: 'Create your account',
    desc: 'Sign up in under 3 minutes. Get a welcome bonus instantly credited to your wallet.',
  },
  {
    num: '02',
    icon: MousePointerClick,
    title: 'Complete tasks',
    desc: 'Choose from daily micro-tasks, referrals, or content campaigns. Do the work and submit.',
  },
  {
    num: '03',
    icon: TrendingUp,
    title: 'Withdraw your cash',
    desc: 'Your verified earnings land in your wallet. Withdraw straight to your Nigerian bank account.',
  },
];

const testimonials = [
  { name: 'Chidi Okafor', role: 'Student, UNILAG', text: 'I made my first ₦15,000 in two weeks just doing tasks between lectures. DailyCash9ja is the real deal — no scams, just real work for real pay.', rating: 5, avatar: 'C' },
  { name: 'Amaka Eze', role: 'Small Business Owner', text: 'The referral program changed everything for me. I have over 200 referrals and earn passive income every week. This platform is a blessing.', rating: 5, avatar: 'A' },
  { name: 'Tunde Bello', role: 'Digital Marketer', text: 'I was skeptical at first, but after my first withdrawal hit my GTB account in 24 hours, I was sold. Now I earn more here than my old side hustle.', rating: 5, avatar: 'T' },
  { name: 'Fatima Ibrahim', role: 'Content Creator', text: 'The content rewards are insane. One TikTok video earned me ₦12,000 in a single day. DailyCash9ja pays creators what they deserve.', rating: 5, avatar: 'F' },
  { name: 'Emeka Nwosu', role: 'NYSC Corps Member', text: 'As a corps member, allowance is small. DailyCash9ja helped me earn extra during my service year. I have withdrawn over ₦80,000 so far.', rating: 5, avatar: 'E' },
  { name: 'Zainab Yusuf', role: 'Freelancer', text: 'The daily login bonus keeps me coming back. It adds up fast. Combined with micro-tasks, I am earning steady income every single week.', rating: 5, avatar: 'Z' },
];

const faqs = [
  { q: 'Is DailyCash9ja legit?', a: 'Yes. DailyCash9ja has paid out over ₦185M to members across Nigeria. Every payment is for work you actually complete, and you can see real member reviews above.' },
  { q: 'Is it free to join?', a: 'Yes! Creating an account is completely free. You start earning immediately by completing micro-tasks, referring friends, or creating content. No hidden fees.' },
  { q: 'How fast do I get paid?', a: 'Withdrawals are processed within 24–48 hours. Once your earnings are in your wallet, request a withdrawal and the cash lands in your Nigerian bank account.' },
  { q: 'What if my task is not approved?', a: 'Every micro-task has clear instructions and a fixed payout. Follow the instructions and your submission is approved and paid. Verification simply confirms the work was done.' },
  { q: 'Do I need skills or experience?', a: 'No. Most micro-tasks are simple social tasks with step-by-step guidance, so anyone can start. As you grow, you unlock higher-paying campaigns and content rewards.' },
  { q: 'How much can I realistically earn?', a: 'Micro-tasks pay ₦50 to ₦1,000 each, and referrals pay ₦500 each. Members who stay active earn ₦5,000–₦50,000+ per week. Your total depends on how active you are.' },
];

function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 2000;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.floor(value * eased));
          if (progress < 1) requestAnimationFrame(tick);
          else setDisplay(value);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  const formatted = display >= 1000 ? display.toLocaleString() : display.toString();
  return <span ref={ref}>{prefix}{formatted}{suffix}</span>;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const { ref: howRef, visible: howVisible } = useReveal();
  const { ref: earnRef, visible: earnVisible } = useReveal();
  const { ref: statsRef, visible: statsVisible } = useReveal();
  const { ref: reviewsRef, visible: reviewsVisible } = useReveal();
  const { ref: faqRef } = useReveal();
  const { ref: ctaRef, visible: ctaVisible } = useReveal();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="overflow-hidden">
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center pt-16 pb-20 bg-gradient-to-br from-slate-950 via-primary-950 to-slate-900">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-600/30 rounded-full blur-[100px] animate-float-slow" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent-500/20 rounded-full blur-[100px] animate-float-slow" style={{ animationDelay: '4s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-primary-300 text-sm font-medium mb-6 animate-fade-in-up">
              <Sparkles className="w-4 h-4" />
              Nigeria's #1 earning platform
              <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-white leading-[1.05] mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Turn your time into <span className="text-gradient-hero">real cash</span>, daily.
            </h1>

            <p className="text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Complete micro-tasks, refer friends, and create content — earn money online in Nigeria and withdraw straight to your bank account. No scams, no gimmicks, just real work for real pay.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <button
                onClick={() => onNavigate('register')}
                className="group px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold text-base hover:shadow-glow hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Start earning in 3 minutes
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 rounded-xl glass text-white font-semibold text-base hover:bg-white/20 transition-all duration-300"
              >
                See how it works
              </button>
            </div>

            <div className="flex items-center gap-6 mt-10 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex -space-x-3">
                {['A', 'T', 'C', 'F', 'E'].map((c, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 border-2 border-slate-900 flex items-center justify-center text-white font-bold text-sm">
                    {c}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-sm text-slate-400">Trusted by 48,000+ Nigerians</p>
              </div>
            </div>
          </div>

          {/* Hero visual — floating dashboard mockup */}
          <div className="relative hidden lg:block animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 to-accent-500/30 rounded-3xl blur-2xl" />
              <div className="relative glass rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">My Wallet</p>
                      <p className="text-slate-400 text-xs">DailyCash9ja</p>
                    </div>
                  </div>
                  <BadgeCheck className="w-5 h-5 text-accent-400" />
                </div>

                <div className="bg-gradient-to-br from-primary-600/20 to-accent-500/20 rounded-2xl p-5 mb-4 border border-white/10">
                  <p className="text-slate-400 text-xs mb-1">Available Balance</p>
                  <p className="text-white font-display font-extrabold text-3xl">₦42,850.00</p>
                  <div className="flex items-center gap-1 mt-2 text-accent-400 text-xs">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +₦3,200 this week
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Tasks', value: '127', icon: CheckCircle2, color: 'text-primary-400' },
                    { label: 'Referrals', value: '34', icon: Users, color: 'text-accent-400' },
                    { label: 'Streak', value: '12', icon: Zap, color: 'text-amber-400' },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                      <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
                      <p className="text-white font-bold text-lg">{s.value}</p>
                      <p className="text-slate-400 text-xs">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  {[
                    { desc: 'Twitter follow task', amount: '+₦150', time: '2m ago' },
                    { desc: 'Referral bonus — Amaka E.', amount: '+₦500', time: '1h ago' },
                    { desc: 'YouTube subscribe task', amount: '+₦200', time: '3h ago' },
                  ].map((t, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2.5 border border-white/5">
                      <div>
                        <p className="text-white text-sm font-medium">{t.desc}</p>
                        <p className="text-slate-500 text-xs">{t.time}</p>
                      </div>
                      <p className="text-accent-400 font-semibold text-sm">{t.amount}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-6 -right-6 glass rounded-2xl px-4 py-3 animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-accent-500/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-accent-400" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold">Payout sent</p>
                    <p className="text-slate-400 text-xs">₦10,000</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 glass rounded-2xl px-4 py-3 animate-float" style={{ animationDelay: '2s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold">Verified</p>
                    <p className="text-slate-400 text-xs">CAC Registered</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle">
          <ChevronDown className="w-6 h-6 text-white/40" />
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section ref={statsRef} className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`text-center transition-all duration-700 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center mx-auto mb-3">
                  <s.icon className="w-6 h-6 text-primary-600" />
                </div>
                <p className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900">
                  <AnimatedCounter value={s.value} prefix={s.prefix} suffix={s.suffix} />
                </p>
                <p className="text-sm text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" ref={howRef} className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold mb-4">
              How It Works
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 mb-4">
              3 steps to your <span className="text-gradient">first payout</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From sign-up to a credit alert, here is exactly how your money is earned and paid.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className={`relative group transition-all duration-700 ${howVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-primary-300 hover:shadow-xl transition-all duration-300 h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
                      <step.icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="font-display font-extrabold text-5xl text-slate-100 group-hover:text-primary-100 transition-colors">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.desc}</p>
                </div>

                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-slate-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== EARNING METHODS ===== */}
      <section id="earn" ref={earnRef} className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent-50 text-accent-600 text-sm font-semibold mb-4">
              Earning Methods
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 mb-4">
              Four ways to <span className="text-gradient">get paid</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              The best earners don't choose just one — they stack them. Small wins, stacked daily, add up fast.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {earningMethods.map((m, i) => (
              <div
                key={m.title}
                className={`group relative bg-white rounded-2xl p-8 border border-slate-200 hover:border-transparent hover:shadow-2xl transition-all duration-500 overflow-hidden ${earnVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${m.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl ${m.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <m.icon className={`w-7 h-7 ${m.accent}`} />
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${m.bg} ${m.accent}`}>
                      {m.tagline}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-slate-900 mb-2">{m.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">{m.desc}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="font-display font-bold text-lg text-slate-900">{m.range}</span>
                    <button
                      onClick={() => onNavigate('register')}
                      className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 group-hover:gap-2 transition-all"
                    >
                      Start now <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRUST / FEATURES STRIP ===== */}
      <section className="py-20 bg-gradient-to-br from-slate-950 to-primary-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-64 bg-primary-600/20 rounded-full blur-[120px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: 'Bank-grade security', desc: 'Your data and wallet are protected with industry-standard encryption.' },
              { icon: Clock, title: 'Fast withdrawals', desc: 'Withdrawals processed within 24–48 hours straight to your bank account.' },
              { icon: Smartphone, title: 'Earn on the go', desc: 'Works perfectly on any phone. No app download required — just your browser.' },
            ].map((f, i) => (
              <div
                key={f.title}
                className="glass rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-300"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-glow">
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="reviews" ref={reviewsRef} className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold mb-4">
              Member Voices
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 mb-4">
              Real members. <span className="text-gradient">Real payouts.</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              See what earning with DailyCash9ja looks like for Nigerians across the country.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className={`bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-xl transition-all duration-500 ${reviewsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <Quote className="w-8 h-8 text-primary-200 mb-3" />
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-slate-700 leading-relaxed mb-5 text-sm">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" ref={faqRef} className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold mb-4">
              Honest Answers
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 mb-4">
              Questions everyone <span className="text-gradient">asks first</span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`rounded-2xl border transition-all duration-300 ${openFaq === i ? 'border-primary-300 bg-primary-50/50 shadow-md' : 'border-slate-200 bg-white'}`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-display font-semibold text-slate-900 text-base">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-primary-600 flex-shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-60' : 'max-h-0'}`}>
                  <p className="px-5 pb-5 text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section ref={ctaRef} className="py-24 bg-gradient-to-br from-primary-700 via-primary-800 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-500/10 rounded-full blur-[120px]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`transition-all duration-700 ${ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center mx-auto mb-6 shadow-glow-teal animate-float">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
              Your money. On time. Every week.
            </h2>
            <p className="text-lg text-primary-100 max-w-2xl mx-auto mb-10">
              Join thousands of Nigerians turning time online into weekly income. Start earning in just 3 minutes.
            </p>
            <button
              onClick={() => onNavigate('register')}
              className="group inline-flex items-center gap-2 px-10 py-5 rounded-xl bg-white text-primary-700 font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Start earning now
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
