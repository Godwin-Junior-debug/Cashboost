import { useState } from 'react';
import { ShieldCheck, LayoutDashboard, Receipt, Settings, LogOut, AlertCircle } from 'lucide-react';
import { useAuth } from '../lib/auth';
import AdminOverviewTab from './Adminoverviewtab';
import AdminPaymentRequestsTab from './Adminpaymentrequeststab';
import AdminSettingsTab from './Adminsettingstab';

type AdminDashboardProps = {
  onNavigate: (page: string) => void;
};

type AdminTab = 'overview' | 'payments' | 'settings';

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { profile, signOut } = useAuth();
  const [tab, setTab] = useState<AdminTab>('overview');

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-600" />
          </div>
          <h1 className="font-display font-bold text-xl text-slate-900 mb-1">Not authorized</h1>
          <p className="text-slate-500 text-sm mb-6">You don't have admin access to this page.</p>
          <button onClick={() => onNavigate('dashboard')} className="text-sm font-semibold text-primary-600 hover:text-primary-700">
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const tabs: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'payments', label: 'Payment Requests', icon: Receipt },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display font-extrabold text-lg text-slate-900 leading-none">
              Admin<span className="text-gradient">Panel</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('dashboard')} className="text-sm font-semibold text-slate-500 hover:text-slate-700">
              Exit Admin
            </button>
            <button onClick={signOut} className="w-10 h-10 rounded-2xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors" title="Sign out">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                    tab === t.id
                      ? 'bg-gradient-to-br from-primary-600 to-accent-500 text-white shadow-glow'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </button>
              ))}
            </nav>
          </aside>

          <main className="min-w-0">
            {tab === 'overview' && <AdminOverviewTab />}
            {tab === 'payments' && <AdminPaymentRequestsTab />}
            {tab === 'settings' && <AdminSettingsTab />}
          </main>
        </div>
      </div>
    </div>
  );
}