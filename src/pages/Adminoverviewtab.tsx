import { useEffect, useState } from 'react';
import { Users, Crown, Clock, Banknote, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Stats = {
  totalUsers: number;
  proUsers: number;
  pendingPayments: number;
  pendingWithdrawals: number;
};

export default function AdminOverviewTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [usersRes, proRes, paymentsRes, withdrawalsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_pro', true),
        supabase.from('pro_payment_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('withdrawals').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        proUsers: proRes.count || 0,
        pendingPayments: paymentsRes.count || 0,
        pendingWithdrawals: withdrawalsRes.count || 0,
      });
      setLoading(false);
    })();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
      </div>
    );
  }

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-primary-500 to-primary-700' },
    { label: 'Pro Members', value: stats.proUsers, icon: Crown, color: 'from-amber-400 to-orange-500' },
    { label: 'Pending Payments', value: stats.pendingPayments, icon: Clock, color: 'from-pink-500 to-rose-600' },
    { label: 'Pending Withdrawals', value: stats.pendingWithdrawals, icon: Banknote, color: 'from-accent-500 to-accent-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-lg text-slate-900 mb-1">Overview</h2>
        <p className="text-slate-500 text-sm">Quick snapshot of your platform right now.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-5 border border-slate-200">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-3`}>
              <c.icon className="w-5 h-5 text-white" />
            </div>
            <p className="font-display font-extrabold text-2xl text-slate-900">{c.value}</p>
            <p className="text-xs text-slate-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}