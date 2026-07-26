import { useEffect, useState, useCallback } from 'react';
import {
  Wallet, LayoutDashboard, ListChecks, Users, Banknote, Receipt,
  Copy, Check, TrendingUp, Gift, ArrowUpRight, ArrowDownLeft,
  LogOut, Loader2, AlertCircle, Sparkles, Zap, Flame,
  Share2, Crown, ShieldCheck, User, Smartphone, Wifi, Ticket,
  Headset,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase, type Task, type TaskCompletion, type Transaction, type Withdrawal, type Referral } from '../lib/supabase';
import TasksPage from './TasksPage';
import WithdrawalsPage from './WithdrawalsPage';
import UpgradeProPage from './UpgradeProPage';
import PaymentProPage from './Paymentpropage';
import ConfirmPaymentPage, { type PaymentConfirmDetails } from './ConfirmPaymentPage';
import ProfilePage from './Profilepage';
import AirtimePage from './Airtimepage';
import DataPage from './Datapage';
import RedeemPage from './Redeempage';
import BuyRedeemCodePage from './Buyredeemcodepage';
import VoucherPaymentPage from './Voucherpaymentpage';
import ConfirmVoucherPaymentPage, { type VoucherPaymentConfirmDetails } from './Confirmvoucherpaymentpage';
import ContactSupportPage from './ContactSupportPage';
import ActivityBadge from '../components/ActivityBadge';

type DashboardProps = {
  onNavigate: (page: string) => void;
};

type Tab = 'overview' | 'tasks' | 'referrals' | 'withdrawals' | 'transactions' | 'upgrade' | 'payment' | 'confirm-payment' | 'profile' | 'airtime' | 'data' | 'redeem' | 'buy-redeem' | 'voucher-payment' | 'confirm-voucher-payment' | 'contact';

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);

  // Withdrawal form
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
  });

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [tasksRes, completionsRes, txRes, wdRes, refRes] = await Promise.all([
      supabase.from('tasks').select('*').eq('is_active', true).order('created_at', { ascending: true }),
      supabase.from('task_completions').select('*').eq('user_id', user.id),
      supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
      supabase.from('withdrawals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('referrals').select('*').or(`referrer_id.eq.${user.id}`).order('created_at', { ascending: false }),
    ]);

    setTasks(tasksRes.data as Task[] || []);
    setCompletions(completionsRes.data as TaskCompletion[] || []);
    setTransactions(txRes.data as Transaction[] || []);
    setWithdrawals(wdRes.data as Withdrawal[] || []);
    setReferrals(refRes.data as Referral[] || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase.rpc('claim_daily_login_bonus');
      if (!error && data?.success) {
        showToast('success', `Daily login bonus credited! +₦${Number(data.amount).toLocaleString()}`);
        await Promise.all([loadData(), refreshProfile()]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function checkCycle() {
      const { data } = await supabase.rpc('check_and_advance_cycle');
      if (!cancelled && data?.advanced) {
        await Promise.all([loadData(), refreshProfile()]);
      }
    }

    checkCycle();
    const interval = setInterval(checkCycle, 30000);
    return () => { cancelled = true; clearInterval(interval); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);

  const cycleMultiplier = (cycle: number) => Math.pow(1.2, Math.max(cycle, 1) - 1);

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function completeTask(task: Task) {
    if (!user || !profile) return;
    setVerifyingTaskId(task.id);
    await delay(2800);

    const expectedReward = Math.round(task.reward * cycleMultiplier(profile.task_cycle) * 100) / 100;

    const { error } = await supabase
      .from('task_completions')
      .insert({ user_id: user.id, task_id: task.id, reward: task.reward, status: 'approved' });

    if (error) {
      if (error.code === '23505') {
        showToast('error', 'You have already completed this task.');
      } else {
        showToast('error', error.message);
      }
    } else {
      showToast('success', `Task completed! ₦${expectedReward.toLocaleString()} credited to your wallet.`);
      await Promise.all([loadData(), refreshProfile()]);
    }
    setVerifyingTaskId(null);
  }

  const [pendingWithdrawal, setPendingWithdrawal] = useState<{ id: string; code: string } | null>(null);
  const [codeInput, setCodeInput] = useState('');

  async function requestWithdrawal(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !profile) return;

    const amount = parseFloat(withdrawForm.amount);
    if (isNaN(amount) || amount < 1000) {
      showToast('error', 'Minimum withdrawal is ₦1,000.');
      return;
    }
    if (amount > parseFloat(profile.wallet_balance.toString())) {
      showToast('error', 'Insufficient wallet balance.');
      return;
    }

    setActionLoading(true);
    const { data, error } = await supabase.rpc('request_withdrawal', {
      p_amount: amount,
      p_bank_name: withdrawForm.bankName,
      p_account_number: withdrawForm.accountNumber,
      p_account_name: withdrawForm.accountName,
    });

    if (error || !data?.success) {
      showToast('error', error?.message || data?.message || 'Could not start withdrawal.');
    } else {
      setPendingWithdrawal({ id: data.withdrawal_id, code: data.code });
      showToast('success', 'Enter the verification code below to confirm your withdrawal.');
    }
    setActionLoading(false);
  }

  async function confirmWithdrawal(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingWithdrawal) return;

    setActionLoading(true);
    const { data, error } = await supabase.rpc('confirm_withdrawal', {
      p_withdrawal_id: pendingWithdrawal.id,
      p_code: codeInput.trim(),
    });

    if (error || !data?.success) {
      showToast('error', error?.message || data?.message || 'Verification failed.');
    } else {
      showToast('success', 'Withdrawal confirmed! Processing within 24-48 hours.');
      setPendingWithdrawal(null);
      setCodeInput('');
      setWithdrawForm({ amount: '', bankName: '', accountNumber: '', accountName: '' });
      await Promise.all([loadData(), refreshProfile()]);
    }
    setActionLoading(false);
  }

  async function upgradeToPro() {
    if (!user) return;
    setActionLoading(true);
    const { data, error } = await supabase.rpc('upgrade_to_pro');
    if (error || !data?.success) {
      showToast('error', error?.message || data?.message || 'Could not upgrade to Pro.');
    } else {
      showToast('success', 'Welcome to Pro! You now earn 1.5x on every task.');
      await Promise.all([loadData(), refreshProfile()]);
    }
    setActionLoading(false);
  }

  // NOTE: requires a `payment-receipts` storage bucket and a `pro_payment_requests`
  // table (user_id, full_name, amount_sent, reference, receipt_url, status, created_at)
  // in Supabase. This only files the request for admin review — it does not grant
  // Pro access by itself. Set up an admin flow to approve/reject and call
  // `upgrade_to_pro` (or flip `is_pro`) once a submission is verified.
  async function submitPaymentProof(details: PaymentConfirmDetails) {
    if (!user) return;
    setActionLoading(true);
    try {
      const ext = details.receiptFile.name.split('.').pop() || 'jpg';
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-receipts')
        .upload(path, details.receiptFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('payment-receipts').getPublicUrl(path);

      const { error: insertError } = await supabase.from('pro_payment_requests').insert({
        user_id: user.id,
        full_name: details.fullName,
        amount_sent: details.amountSent ? parseFloat(details.amountSent) : null,
        reference: details.reference || null,
        receipt_url: urlData.publicUrl,
        status: 'pending',
      });
      if (insertError) throw insertError;

      showToast('success', 'Verification sent! Your account will be upgraded within 1 to 2 hours after review.');
      setPaymentSubmitted(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not submit payment. Please try again.';
      showToast('error', message);
    }
    setActionLoading(false);
  }

  // NOTE: requires a Supabase RPC function `purchase_airtime(p_network, p_phone, p_amount)`
  // that debits `wallet_balance`, inserts a `transactions` row, and forwards the
  // request to your airtime provider (VTU aggregator, etc). Returns { success, message }.
  async function buyAirtime(network: string, phone: string, amount: number) {
    if (!user) return;
    setActionLoading(true);
    const { data, error } = await supabase.rpc('purchase_airtime', {
      p_network: network,
      p_phone: phone,
      p_amount: amount,
    });

    if (error || !data?.success) {
      showToast('error', error?.message || data?.message || 'Could not purchase airtime.');
    } else {
      showToast('success', `₦${amount.toLocaleString()} ${network} airtime sent to ${phone}.`);
      await Promise.all([loadData(), refreshProfile()]);
    }
    setActionLoading(false);
  }

  // NOTE: requires a Supabase RPC function `purchase_data(p_network, p_phone, p_plan_id, p_amount)`
  // that debits `wallet_balance`, inserts a `transactions` row, and forwards the
  // request to your data provider. Returns { success, message }.
  async function buyData(network: string, phone: string, planId: string, amount: number) {
    if (!user) return;
    setActionLoading(true);
    const { data, error } = await supabase.rpc('purchase_data', {
      p_network: network,
      p_phone: phone,
      p_plan_id: planId,
      p_amount: amount,
    });

    if (error || !data?.success) {
      showToast('error', error?.message || data?.message || 'Could not purchase data.');
    } else {
      showToast('success', `Data plan sent to ${phone}.`);
      await Promise.all([loadData(), refreshProfile()]);
    }
    setActionLoading(false);
  }

  // NOTE: requires a Supabase RPC function `redeem_code(p_code)` that validates
  // the code against a `redeem_codes` table (code, amount, max_uses, used_count, expires_at),
  // credits `wallet_balance`, inserts a `transactions` row, and marks the code used.
  // Returns { success, message, amount }.
  async function redeemCode(code: string) {
    if (!user) return;
    setActionLoading(true);
    const { data, error } = await supabase.rpc('redeem_code', {
      p_code: code.trim(),
    });

    if (error || !data?.success) {
      showToast('error', error?.message || data?.message || 'Invalid or expired code.');
    } else {
      showToast('success', `Code redeemed! ₦${Number(data.amount).toLocaleString()} credited to your wallet.`);
      await Promise.all([loadData(), refreshProfile()]);
    }
    setActionLoading(false);
  }

  // Selected voucher tier awaiting bank-transfer payment + admin review.
  const [pendingVoucherTier, setPendingVoucherTier] = useState<{ value: number; price: number } | null>(null);
  const [voucherPaymentSubmitted, setVoucherPaymentSubmitted] = useState(false);

  const VOUCHER_BANK_DETAILS = {
    bankName: 'Access Bank',
    accountNumber: '1729650675',
    accountName: 'Paschal Amobi Obulose',
  };

  function selectVoucherTier(tier: { value: number; price: number }) {
    setPendingVoucherTier(tier);
    setTab('voucher-payment');
  }

  // NOTE: requires a `voucher-receipts` storage bucket and a `voucher_payment_requests`
  // table (user_id, full_name, amount_sent, reference, receipt_url, voucher_value,
  // purchase_price, status, code, created_at) in Supabase. This only files the
  // request for admin review — it does NOT generate or credit the redeem code by
  // itself. Build an admin flow to verify the transfer, generate a code worth
  // `voucher_value`, and deliver it to the user once approved.
  async function submitVoucherPaymentProof(details: VoucherPaymentConfirmDetails) {
    if (!user || !pendingVoucherTier) return;
    setActionLoading(true);
    try {
      const ext = details.receiptFile.name.split('.').pop() || 'jpg';
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('voucher-receipts')
        .upload(path, details.receiptFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('voucher-receipts').getPublicUrl(path);

      const { error: insertError } = await supabase.from('voucher_payment_requests').insert({
        user_id: user.id,
        full_name: details.fullName,
        amount_sent: details.amountSent ? parseFloat(details.amountSent) : pendingVoucherTier.price,
        reference: details.reference || null,
        receipt_url: urlData.publicUrl,
        voucher_value: pendingVoucherTier.value,
        purchase_price: pendingVoucherTier.price,
        status: 'pending',
      });
      if (insertError) throw insertError;

      showToast('success', 'Payment submitted! Your voucher code will be sent within 1 to 2 hours after review.');
      setVoucherPaymentSubmitted(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not submit payment. Please try again.';
      showToast('error', message);
    }
    setActionLoading(false);
  }

  function copyReferralCode() {
    if (!profile) return;
    navigator.clipboard.writeText(profile.referral_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const completedTaskIds = new Set(
    completions.filter((c) => c.cycle === (profile?.task_cycle ?? 1)).map((c) => c.task_id)
  );
  const totalEarnings = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
  const totalWithdrawn = withdrawals
    .filter((w) => w.status === 'approved')
    .reduce((sum, w) => sum + parseFloat(w.amount.toString()), 0);
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: ListChecks },
    { id: 'referrals', label: 'Referrals', icon: Users },
    { id: 'withdrawals', label: 'Withdraw', icon: Banknote },
    { id: 'transactions', label: 'History', icon: Receipt },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <ActivityBadge />
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display font-extrabold text-base sm:text-lg text-slate-900 leading-none">
              DailyCash<span className="text-gradient">9ja</span>
            </span>
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            {profile?.is_admin && (
              <button
                onClick={() => onNavigate('admin')}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                title="Admin Panel"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Admin Panel</span>
              </button>
            )}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium text-slate-700">{profile?.username}</span>
            </div>
            <button
              onClick={() => setTab('contact')}
              className="w-10 h-10 rounded-2xl text-slate-500 hover:bg-primary-50 hover:text-primary-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              title="Contact support"
            >
              <Headset className="w-5 h-5" />
            </button>
            <button onClick={signOut} className="w-10 h-10 rounded-2xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500" title="Sign out">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
            <nav className="grid grid-cols-3 gap-2 lg:grid-cols-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex flex-col items-center justify-center gap-1 rounded-3xl border px-3 py-3 min-h-[82px] text-xs font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                    tab === t.id
                      ? 'bg-gradient-to-br from-primary-600 to-accent-500 text-white border-transparent shadow-glow'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <t.icon className="w-5 h-5" />
                  <span>{t.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="min-w-0 pb-28 lg:pb-0">
            <div className="lg:hidden sticky top-14 sm:top-16 z-30 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200">
              <div className="flex gap-2 overflow-x-auto px-3 py-3 no-scrollbar">
                {tabs.map((t) => (
                  <button
                    key={`mobile-${t.id}`}
                    onClick={() => setTab(t.id)}
                    className={`flex min-w-[90px] items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition-all duration-300 ${
                      tab === t.id
                        ? 'bg-gradient-to-br from-primary-600 to-accent-500 text-white border-transparent shadow-glow'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <t.icon className="w-4 h-4" />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {toast && (
              <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg animate-slide-in-right ${
                toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
              }`}>
                {toast.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span className="text-sm font-medium">{toast.msg}</span>
              </div>
            )}

            {/* ===== OVERVIEW ===== */}
            {tab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                {/* Welcome banner */}
                <div className="relative bg-gradient-to-br from-primary-700 via-primary-800 to-slate-950 rounded-[28px] p-5 sm:p-6 overflow-hidden shadow-soft">
                  <div className="absolute inset-0 bg-grid opacity-20" />
                  <div className="absolute -top-10 -right-10 w-44 h-44 bg-accent-500/20 rounded-full blur-[70px]" />
                  <div className="relative">
                    <div className="flex items-center gap-2 text-primary-200 text-xs sm:text-sm mb-2">
                      <Sparkles className="w-4 h-4" />
                      Welcome back
                    </div>
                    <h1 className="font-display font-extrabold text-xl sm:text-3xl text-white leading-tight mb-2">
                      {profile?.full_name || profile?.username}
                    </h1>
                    <p className="text-slate-300 text-sm sm:text-base max-w-xl">Here's your earning summary today.</p>
                  </div>
                </div>

                {/* Pro upgrade + Withdraw banner */}
                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 rounded-[28px] p-5 sm:p-6 overflow-hidden shadow-soft">
                  <div className="absolute inset-0 bg-grid opacity-20" />
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent-500/20 rounded-full blur-[70px]" />
                  <div className="relative">
                    <div className="flex items-center gap-2 text-amber-300 text-xs sm:text-sm mb-3">
                      <Crown className="w-4 h-4" />
                      {profile?.is_pro ? 'You are a Pro member' : 'Unlock more with Pro'}
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                      <button
                        onClick={() => setTab('upgrade')}
                        className="flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-xs sm:text-sm hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
                        {profile?.is_pro ? 'View Pro Benefits' : 'Upgrade to Pro'}
                      </button>
                      <button
                        onClick={() => setTab('withdrawals')}
                        className="flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-xs sm:text-sm hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        <Banknote className="w-4 h-4 sm:w-5 sm:h-5" />
                        Withdraw
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
                  {[
                    { label: 'Wallet Balance', value: `₦${parseFloat(profile?.wallet_balance?.toString() || '0').toLocaleString()}`, icon: Wallet, color: 'from-primary-500 to-primary-700' },
                    { label: 'Total Earned', value: `₦${totalEarnings.toLocaleString()}`, icon: TrendingUp, color: 'from-accent-500 to-accent-600' },
                    { label: 'Tasks Done', value: completions.length.toString(), icon: ListChecks, color: 'from-orange-500 to-amber-600' },
                    { label: 'Referrals', value: referrals.length.toString(), icon: Users, color: 'from-pink-500 to-rose-600' },
                  ].map((s, i) => (
                    <div
                      key={s.label}
                      className="bg-white rounded-2xl sm:rounded-[24px] p-2 sm:p-5 border border-slate-200 shadow-sm transition-all duration-300 animate-fade-in-up min-h-[86px] sm:min-h-[150px] flex flex-col justify-between"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <div className={`w-6 h-6 sm:w-11 sm:h-11 rounded-lg sm:rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-1.5 sm:mb-4 flex-shrink-0`}>
                        <s.icon className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-display font-extrabold text-[11px] sm:text-xl text-slate-900 leading-tight truncate">{s.value}</p>
                        <p className="text-[9px] sm:text-sm text-slate-500 mt-0.5 sm:mt-2 truncate">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick actions + streak */}
                <div className="grid lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200">
                    <h3 className="font-display font-bold text-lg text-slate-900 mb-4">Quick actions</h3>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                      {[
                        { label: 'Complete Tasks', icon: ListChecks, action: () => setTab('tasks'), color: 'bg-primary-50 text-primary-700' },
                        { label: 'Refer Friends', icon: Share2, action: () => setTab('referrals'), color: 'bg-accent-50 text-accent-600' },
                        { label: 'Buy Airtime', icon: Smartphone, action: () => setTab('airtime'), color: 'bg-blue-50 text-blue-600' },
                        { label: 'Buy Data', icon: Wifi, action: () => setTab('data'), color: 'bg-indigo-50 text-indigo-600' },
                        { label: 'Redeem Code', icon: Ticket, action: () => setTab('redeem'), color: 'bg-purple-50 text-purple-600' },
                        { label: 'Withdraw Money', icon: ArrowUpRight, action: () => setTab('withdrawals'), color: 'bg-red-50 text-red-600' },
                        { label: 'View History', icon: Receipt, action: () => setTab('transactions'), color: 'bg-pink-50 text-pink-600' },
                        { label: 'Daily Bonus', icon: Gift, action: () => showToast('success', 'Daily bonus claimed! ₦50 credited.'), color: 'bg-amber-50 text-amber-600' },
                        { label: 'Contact Support', icon: Headset, action: () => setTab('contact'), color: 'bg-teal-50 text-teal-600' },
                      ].map((a) => (
                        <button
                          key={a.label}
                          onClick={a.action}
                          className={`flex flex-col items-center justify-center gap-1 sm:gap-2 p-2 sm:p-4 min-h-[64px] sm:min-h-0 rounded-lg sm:rounded-xl ${a.color} hover:scale-105 active:scale-95 transition-transform duration-300`}
                        >
                          <a.icon className="w-4 h-4 sm:w-6 sm:h-6" />
                          <span className="text-[9px] sm:text-xs font-semibold text-center leading-tight">{a.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
                    <Flame className="w-8 h-8 mb-3" />
                    <h3 className="font-display font-bold text-lg mb-1">Daily Streak</h3>
                    <p className="text-white/80 text-sm mb-4">Keep logging in to grow your streak bonus!</p>
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      <span className="font-display font-extrabold text-2xl">12 days</span>
                    </div>
                  </div>
                </div>

                {/* Recent transactions */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold text-lg text-slate-900">Recent activity</h3>
                    <button onClick={() => setTab('transactions')} className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                      View all
                    </button>
                  </div>
                  {transactions.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-8">No transactions yet. Complete a task to start earning!</p>
                  ) : (
                    <div className="space-y-2">
                      {transactions.slice(0, 5).map((t) => (
                        <div key={t.id} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${t.amount > 0 ? 'bg-green-50' : 'bg-orange-50'}`}>
                              {t.amount > 0 ? <ArrowDownLeft className="w-4 h-4 text-green-600" /> : <ArrowUpRight className="w-4 h-4 text-orange-600" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800">{t.description}</p>
                              <p className="text-xs text-slate-400">{new Date(t.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                          <p className={`font-semibold text-sm ${t.amount > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                            {t.amount > 0 ? '+' : ''}₦{Math.abs(parseFloat(t.amount.toString())).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===== TASKS ===== */}
            {tab === 'tasks' && (
              <TasksPage
                tasks={tasks}
                completedTaskIds={completedTaskIds}
                verifyingTaskId={verifyingTaskId}
                taskCycle={profile?.task_cycle ?? 1}
                nextRoundUnlockAt={profile?.next_round_unlock_at ?? null}
                rotationMultipliers={{}}
                rotationSecondsRemaining={1800}
                completeTask={completeTask}
              />
            )}

            {/* ===== REFERRALS ===== */}
            {tab === 'referrals' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h1 className="font-display font-extrabold text-2xl text-slate-900 mb-1">Referral Program</h1>
                  <p className="text-slate-500 text-sm">Invite friends and earn ₦500 when they sign up.</p>
                </div>

                {/* Referral card */}
                <div className="bg-gradient-to-br from-primary-700 via-primary-800 to-slate-950 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid opacity-30" />
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-500/20 rounded-full blur-[80px]" />
                  <div className="relative">
                    <div className="flex items-center gap-2 text-primary-300 text-sm mb-4">
                      <Share2 className="w-4 h-4" /> Your referral code
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex-1 bg-white/10 border border-white/20 rounded-xl px-5 py-4">
                        <p className="font-display font-extrabold text-3xl text-white tracking-wider">{profile?.referral_code}</p>
                      </div>
                      <button
                        onClick={copyReferralCode}
                        className="p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
                        title="Copy code"
                      >
                        {copied ? <Check className="w-5 h-5 text-accent-400" /> : <Copy className="w-5 h-5 text-white" />}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                        <p className="font-display font-extrabold text-2xl text-white">{referrals.length}</p>
                        <p className="text-xs text-slate-400">Total referrals</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                        <p className="font-display font-extrabold text-2xl text-accent-400">
                          ₦{(referrals.length * 500).toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-400">Referral earnings</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                        <p className="font-display font-extrabold text-2xl text-white">₦500</p>
                        <p className="text-xs text-slate-400">Per referral</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Referral list */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                  <h3 className="font-display font-bold text-lg text-slate-900 mb-4">Your referrals</h3>
                  {referrals.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">No referrals yet. Share your code to start earning!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {referrals.map((r) => (
                        <div key={r.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                              R
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800">Referral bonus</p>
                              <p className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${r.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {r.status}
                            </span>
                            <p className="font-semibold text-sm text-green-600">+₦{parseFloat(r.bonus.toString()).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===== WITHDRAWALS ===== */}
            {tab === 'withdrawals' && (
              <WithdrawalsPage
                profile={profile}
                withdrawForm={withdrawForm}
                setWithdrawForm={setWithdrawForm}
                actionLoading={actionLoading}
                requestWithdrawal={requestWithdrawal}
                withdrawals={withdrawals}
                pendingWithdrawals={pendingWithdrawals}
                pendingWithdrawal={pendingWithdrawal}
                codeInput={codeInput}
                setCodeInput={setCodeInput}
                confirmWithdrawal={confirmWithdrawal}
                cancelPendingWithdrawal={() => { setPendingWithdrawal(null); setCodeInput(''); }}
                showToast={showToast}
                onNavigateToPayment={() => setTab('payment')}
              />
            )}

            {/* ===== UPGRADE TO PRO ===== */}
            {tab === 'upgrade' && (
              <UpgradeProPage
                isPro={profile?.is_pro}
                actionLoading={actionLoading}
                onProceedToPayment={() => setTab('payment')}
                onBack={() => setTab('overview')}
              />
            )}

            {/* ===== PRO PAYMENT ===== */}
            {tab === 'payment' && (
              <PaymentProPage
                isPro={profile?.is_pro}
                actionLoading={actionLoading}
                onProceedToConfirm={() => { setPaymentSubmitted(false); setTab('confirm-payment'); }}
                onBack={() => setTab('upgrade')}
              />
            )}

            {/* ===== CONFIRM PAYMENT ===== */}
            {tab === 'confirm-payment' && (
              <ConfirmPaymentPage
                actionLoading={actionLoading}
                submitted={paymentSubmitted}
                onSubmit={submitPaymentProof}
                onBack={() => setTab(paymentSubmitted ? 'overview' : 'payment')}
              />
            )}

            {/* ===== PROFILE ===== */}
            {tab === 'profile' && <ProfilePage />}

            {/* ===== AIRTIME ===== */}
            {tab === 'airtime' && (
              <AirtimePage
                walletBalance={parseFloat(profile?.wallet_balance?.toString() || '0')}
                actionLoading={actionLoading}
                onSubmit={buyAirtime}
                onBack={() => setTab('overview')}
              />
            )}

            {/* ===== DATA ===== */}
            {tab === 'data' && (
              <DataPage
                walletBalance={parseFloat(profile?.wallet_balance?.toString() || '0')}
                actionLoading={actionLoading}
                onSubmit={buyData}
                onBack={() => setTab('overview')}
              />
            )}

            {/* ===== REDEEM ===== */}
            {tab === 'redeem' && (
              <RedeemPage
                actionLoading={actionLoading}
                onSubmit={redeemCode}
                onBack={() => setTab('overview')}
                onNavigateToBuy={() => setTab('buy-redeem')}
              />
            )}

            {/* ===== BUY REDEEM CODE ===== */}
            {tab === 'buy-redeem' && (
              <BuyRedeemCodePage
                walletBalance={parseFloat(profile?.wallet_balance?.toString() || '0')}
                onBuyClick={selectVoucherTier}
                onBack={() => setTab('redeem')}
              />
            )}

            {/* ===== VOUCHER PAYMENT (bank transfer) ===== */}
            {tab === 'voucher-payment' && pendingVoucherTier && (
              <VoucherPaymentPage
                voucherValue={pendingVoucherTier.value}
                purchasePrice={pendingVoucherTier.price}
                bankDetails={VOUCHER_BANK_DETAILS}
                onProceedToConfirm={() => { setVoucherPaymentSubmitted(false); setTab('confirm-voucher-payment'); }}
                onCancel={() => { setPendingVoucherTier(null); setTab('buy-redeem'); }}
              />
            )}

            {/* ===== CONFIRM VOUCHER PAYMENT ===== */}
            {tab === 'confirm-voucher-payment' && pendingVoucherTier && (
              <ConfirmVoucherPaymentPage
                voucherValue={pendingVoucherTier.value}
                purchasePrice={pendingVoucherTier.price}
                actionLoading={actionLoading}
                submitted={voucherPaymentSubmitted}
                onSubmit={submitVoucherPaymentProof}
                onBack={() => setTab(voucherPaymentSubmitted ? 'overview' : 'voucher-payment')}
              />
            )}

            {/* ===== CONTACT SUPPORT ===== */}
            {tab === 'contact' && (
              <ContactSupportPage onBack={() => setTab('overview')} />
            )}

            {/* ===== TRANSACTIONS ===== */}
            {tab === 'transactions' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h1 className="font-display font-extrabold text-2xl text-slate-900 mb-1">Transaction History</h1>
                  <p className="text-slate-500 text-sm">All your earnings, referrals, and withdrawals in one place.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Total Earned', value: `₦${totalEarnings.toLocaleString()}`, color: 'text-green-600' },
                    { label: 'Total Withdrawn', value: `₦${totalWithdrawn.toLocaleString()}`, color: 'text-orange-600' },
                    { label: 'Transactions', value: transactions.length.toString(), color: 'text-primary-600' },
                    { label: 'Pending', value: pendingWithdrawals.toString(), color: 'text-amber-600' },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl p-4 border border-slate-200">
                      <p className="text-xs text-slate-400 mb-1">{s.label}</p>
                      <p className={`font-display font-bold text-lg ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  {transactions.length === 0 ? (
                    <div className="text-center py-12">
                      <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">No transactions yet. Complete a task to start earning!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {transactions.map((t) => (
                        <div key={t.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${t.amount > 0 ? 'bg-green-50' : 'bg-orange-50'}`}>
                              {t.amount > 0 ? <ArrowDownLeft className="w-4 h-4 text-green-600" /> : <ArrowUpRight className="w-4 h-4 text-orange-600" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800">{t.description}</p>
                              <p className="text-xs text-slate-400 capitalize">{t.type} · {new Date(t.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                          </div>
                          <p className={`font-semibold text-sm ${t.amount > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                            {t.amount > 0 ? '+' : ''}₦{Math.abs(parseFloat(t.amount.toString())).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}