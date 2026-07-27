import { Mail, Send, MessageCircle, Phone, Copy, Check, Clock, ChevronLeft } from 'lucide-react';
import { useState } from 'react';

type ContactSupportPageProps = {
  onBack: () => void;
};

const SUPPORT_EMAIL = 'supportdailycash9ja@gmail.com';
const WHATSAPP_NUMBER = '2348012345678'; // full intl format, no + or leading zeros
const TELEGRAM_HANDLE = 'dailycash9ja';

export default function ContactSupportPage({ onBack }: ContactSupportPageProps) {
  const [copied, setCopied] = useState<string | null>(null);

  function copy(value: string, key: string) {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  }

  const channels = [
    {
      key: 'whatsapp',
      icon: MessageCircle,
      iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
      title: 'WhatsApp',
      description: 'Fastest way to reach us. Chat directly with support, no app switching needed.',
      badge: { label: 'Online now', color: 'bg-green-100 text-green-700' },
      responseTime: 'Usually replies in minutes',
      primaryAction: {
        label: 'Chat on WhatsApp',
        href: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          'Hi, I need help with my DailyCash9ja account.'
        )}`,
      },
      secondaryAction: { label: '+234 801 234 5678', onClick: () => copy('+2348012345678', 'whatsapp') },
    },
    {
      key: 'livechat',
      icon: Send,
      iconBg: 'bg-gradient-to-br from-primary-600 to-accent-500',
      title: 'Live Chat',
      description: 'Chat with our team in real-time, right here on the platform.',
      badge: { label: 'Online', color: 'bg-green-100 text-green-700' },
      responseTime: 'Immediate assistance',
      primaryAction: {
        label: 'Start Live Chat',
        onClick: () => {
          const openWidget = () => {
            const tawk = (window as any).Tawk_API;
            if (tawk?.showWidget && tawk?.maximize) {
              tawk.showWidget();
              tawk.maximize();
              return true;
            }
            return false;
          };

          if (openWidget()) return;

          // Tawk script hasn't fully initialized yet — poll briefly, then give up gracefully.
          let attempts = 0;
          const interval = setInterval(() => {
            attempts += 1;
            if (openWidget() || attempts > 10) {
              clearInterval(interval);
            }
          }, 300);
        },
      },
    },
    {
      key: 'telegram',
      icon: Send,
      iconBg: 'bg-gradient-to-br from-sky-500 to-sky-600',
      title: 'Telegram',
      description: 'Join our channel for updates, or message us directly for support.',
      badge: { label: 'Community', color: 'bg-sky-100 text-sky-700' },
      responseTime: 'Replies within a few hours',
      primaryAction: { label: 'Open Telegram', href: `https://t.me/${TELEGRAM_HANDLE}` },
    },
    {
      key: 'email',
      icon: Mail,
      iconBg: 'bg-gradient-to-br from-orange-500 to-amber-600',
      title: 'Email Support',
      description:
        'Send us an email for account issues, payment inquiries, bug reports, or any detailed support request. You can also attach screenshots to help us resolve your issue faster.',
      badge: { label: '< 24 hrs', color: 'bg-amber-100 text-amber-700' },
      responseTime: 'Replies within 24 hours',
      primaryAction: {
        label: SUPPORT_EMAIL,
        href: `mailto:${SUPPORT_EMAIL}`,
      },
      secondaryAction: {
        label: 'Copy email',
        onClick: () => copy(SUPPORT_EMAIL, 'email'),
      },
},
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900">Contact Support</h1>
          <p className="text-slate-500 text-sm">Pick whichever channel works best for you.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {channels.map((c) => (
          <div
            key={c.key}
            className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-2xl ${c.iconBg} flex items-center justify-center flex-shrink-0`}>
                <c.icon className="w-5 h-5 text-white" />
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${c.badge.color}`}>
                {c.badge.label}
              </span>
            </div>

            <h3 className="font-display font-bold text-lg text-slate-900 mb-1.5">{c.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-3">{c.description}</p>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
              <Clock className="w-3.5 h-3.5" />
              {c.responseTime}
            </div>

            <div className="flex items-center gap-2">
              {c.primaryAction.href ? (
                <a
                  href={c.primaryAction.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white text-sm font-semibold hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all truncate"
                >
                  {c.primaryAction.label}
                </a>
              ) : (
                <button
                  onClick={c.primaryAction.onClick}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white text-sm font-semibold hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {c.primaryAction.label}
                </button>
              )}

              {c.secondaryAction && (
                <button
                  onClick={c.secondaryAction.onClick}
                  title="Copy"
                  className="w-10 h-10 flex-shrink-0 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  {copied === c.key ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-start gap-3">
        <Phone className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-slate-500">
          For withdrawal or payment issues, include your username and transaction reference so we can locate your
          account faster.
        </p>
      </div>
    </div>
  );
}