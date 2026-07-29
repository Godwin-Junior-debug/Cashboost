import { useState, useEffect, type Dispatch, type SetStateAction, type FormEvent } from 'react';
import { type Profile, type Withdrawal } from '../lib/supabase';
import { Banknote, Loader2, Check, AlertCircle, UserCheck, KeyRound, Crown, XCircle } from 'lucide-react';

const NIGERIAN_BANKS = [
  'Access Bank',
  'Citibank Nigeria',
  'Ecobank Nigeria',
  'Fidelity Bank',
  'First Bank of Nigeria',
  'First City Monument Bank (FCMB)',
  'Globus Bank',
  'Guaranty Trust Bank (GTBank)',
  'Heritage Bank',
  'Jaiz Bank',
  'Keystone Bank',
  'Kuda Bank',
  'Moniepoint MFB',
  'Opay',
  'Palmpay',
  'Parallex Bank',
  'Polaris Bank',
  'Premium Trust Bank',
  'Providus Bank',
  'Stanbic IBTC Bank',
  'Standard Chartered Bank',
  'Sterling Bank',
  'SunTrust Bank',
  'Titan Trust Bank',
  'Union Bank of Nigeria',
  'United Bank for Africa (UBA)',
  'Unity Bank',
  'Wema Bank',
  'Zenith Bank',
];

type WithdrawalsPageProps = {
  profile: Profile | null;
  withdrawForm: {
    amount: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  setWithdrawForm: Dispatch<SetStateAction<{
    amount: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
  }>>;
  actionLoading: boolean;
  requestWithdrawal: (e: FormEvent) => Promise<void>;
  withdrawals: Withdrawal[];
  pendingWithdrawals: number;
  pendingWithdrawal: { id: string; code: string } | null;
  codeInput: string;
  setCodeInput: Dispatch<SetStateAction<string>>;
  confirmWithdrawal: (e: FormEvent) => Promise<void>;
  cancelPendingWithdrawal: () => void;
  onNavigateToPayment?: () => void;
  onResolveAccount?: (bankName: string, accountNumber: string) => Promise<string | null>;
};

export default function WithdrawalsPage({
  profile,
  withdrawForm,
  setWithdrawForm,
  actionLoading,
  requestWithdrawal,
  withdrawals,
  pendingWithdrawals,
  pendingWithdrawal,
  codeInput,
  setCodeInput,
  confirmWithdrawal,
  cancelPendingWithdrawal,
  onNavigateToPayment,
  onResolveAccount,
}: WithdrawalsPageProps) {
  const [showCodeError, setShowCodeError] = useState(false);
  const [resolvingAccount, setResolvingAccount] = useState(false);
  const [accountResolved, setAccountResolved] = useState(false);

  const { bankName, accountNumber } = withdrawForm;

  useEffect(() => {
    setAccountResolved(false);

    if (!bankName || !/^\d{10}$/.test(accountNumber.trim())) {
      setWithdrawForm((prev) => ({ ...prev, accountName: '' }));
      return;
    }

    let cancelled = false;
    setResolvingAccount(true);

    const timer = setTimeout(async () => {
      try {
        let name: string | null;
        if (onResolveAccount) {
          name = await onResolveAccount(bankName, accountNumber.trim());
        } else {
          await new Promise((resolve) => setTimeout(resolve, 900));
          name = 'JOHN A. DOE';
        }
        if (cancelled) return;
        if (name) {
          setWithdrawForm((prev) => ({ ...prev, accountName: name as string }));
          setAccountResolved(true);
        } else {
          setWithdrawForm((prev) => ({ ...prev, accountName: '' }));
        }
      } catch {
        if (!cancelled) {
          setWithdrawForm((prev) => ({ ...prev, accountName: '' }));
        }
      } finally {
        if (!cancelled) setResolvingAccount(false);
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [bankName, accountNumber, onResolveAccount]);

  const handleWithdrawSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Always trigger the invalid code error on submit
    setShowCodeError(true);
  };

  const formattedBalance = parseFloat(profile?.wallet_balance?.toString() || '0').toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 mb-1">Withdraw Cash</h1>
        <p className="text-slate-500 text-xs sm:text-sm">Withdraw your earnings to your Nigerian bank account. Processing within 24-48 hours.</p>
      </div>

      <div className="max-w-xl space-y-4">
        {/* Balance & Code Requirement Card */}
        <div className="bg-slate-100/80 rounded-2xl p-6 border border-slate-200/80 text-center space-y-4">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Available Balance</p>
            <p className="font-display font-extrabold text-3xl sm:text-4xl text-indigo-600">
              ₦{formattedBalance}
            </p>
          </div>

          {/* Status Badge */}
          <div className="bg-red-100/80 border border-red-200/60 rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 text-red-600 text-sm font-medium">
            <XCircle className="w-4 h-4 fill-red-500 text-white" />
            <span>Your Code: Not Purchased</span>
          </div>

          {/* Warning Banner */}
          <div className="bg-red-100/50 border border-red-200/40 rounded-xl py-3 px-4 text-red-600 text-sm font-medium flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>Valid DailyCash9ja code required for withdrawals</span>
          </div>

          {/* Top Purchase Button */}
          <button
            type="button"
            onClick={() => onNavigateToPayment?.()}
            className="w-full py-3.5 px-4 rounded-xl bg-indigo-200/60 hover:bg-indigo-200 text-indigo-700 font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2"
          >
            <Crown className="w-5 h-5 fill-indigo-600 text-indigo-600" />
            Purchase DailyCash9ja Code
          </button>
        </div>

        {/* Single unified withdraw form */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-base sm:text-lg text-slate-900">Withdraw money</h3>
            <div className="text-right">
              <p className="text-xs text-slate-400">Available</p>
              <p className="font-display font-extrabold text-base sm:text-lg text-primary-600">₦{parseFloat(profile?.wallet_balance?.toString() || '0').toLocaleString()}</p>
            </div>
          </div>

          {pendingWithdrawal ? (
            <form onSubmit={confirmWithdrawal} className="space-y-3 sm:space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs sm:text-sm text-amber-800">
                <p className="font-semibold mb-1 flex items-center gap-1.5"><Check className="w-4 h-4" /> Code generated</p>
                <p>
                  Your verification code is <span className="font-mono font-bold text-sm sm:text-base">{pendingWithdrawal.code}</span>.
                  Enter it below to confirm your withdrawal.
                </p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Verification code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="6-digit code"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 sm:py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all tracking-widest text-center font-mono text-base sm:text-lg"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={cancelPendingWithdrawal}
                  className="flex-1 py-3 sm:py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold text-sm sm:text-base hover:shadow-glow hover:scale-[1.02] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Withdrawal'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleWithdrawSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Amount (₦)</label>
                <input
                  type="number"
                  min="10000"
                  max="50000"
                  step="100"
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  placeholder="Minimum ₦10,000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Bank name</label>
                <select
                  value={withdrawForm.bankName}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, bankName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base text-slate-900 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all appearance-none"
                  required
                >
                  <option value="" disabled>Select your bank</option>
                  {NIGERIAN_BANKS.map((bank) => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Account number</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    value={withdrawForm.accountNumber}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value.replace(/\D/g, '') })}
                    placeholder="0123456789"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                    Account name
                    {resolvingAccount && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
                    {accountResolved && !resolvingAccount && <UserCheck className="w-3.5 h-3.5 text-green-600" />}
                  </label>
                  <input
                    type="text"
                    value={withdrawForm.accountName}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, accountName: e.target.value })}
                    readOnly={resolvingAccount}
                    placeholder={resolvingAccount ? 'Verifying account...' : 'Account holder name'}
                    className={`w-full border rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base placeholder-slate-400 transition-all ${
                      resolvingAccount
                        ? 'cursor-not-allowed bg-slate-100 border-slate-200 text-slate-500'
                        : accountResolved
                        ? 'bg-green-50 border-green-200 text-green-800 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* DailyCash9ja Code Input with Input-level Error */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-primary-600" />
                  DailyCash9ja Code
                </label>
                <input
                  type="text"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="Enter DailyCash9ja code"
                  className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base placeholder-slate-400 focus:outline-none transition-all uppercase tracking-wider font-mono ${
                    codeInput.trim().length > 0 || showCodeError
                      ? 'border-red-400 bg-red-50/30 text-red-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border-slate-200 text-slate-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20'
                  }`}
                  required
                />
                {(codeInput.trim().length > 0 || showCodeError) && (
                  <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    Invalid code
                  </p>
                )}
              </div>

              {/* Single standard error message on Submit */}
              {showCodeError && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs sm:text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>Enter valid code</p>
                </div>
              )}

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold text-sm sm:text-base hover:shadow-glow hover:scale-[1.02] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <Banknote className="w-5 h-5" /> Withdraw money
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onNavigateToPayment?.()}
                className="w-full py-3 sm:py-3.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm sm:text-base hover:bg-slate-50 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
              >
                <Crown className="w-4 h-4 text-indigo-600" />
                Purchase DailyCash9ja Code
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Withdrawal history, full width */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-base sm:text-lg text-slate-900">Withdrawal history</h3>
          {pendingWithdrawals > 0 && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
              {pendingWithdrawals} pending
            </span>
          )}
        </div>
        {withdrawals.length === 0 ? (
          <div className="text-center py-8">
            <Banknote className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No withdrawals yet.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {withdrawals.map((w) => (
              <div key={w.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-slate-800">₦{parseFloat(w.amount.toString()).toLocaleString()}</p>
                  <p className="text-[11px] sm:text-xs text-slate-400 truncate">{w.bank_name} · {w.account_number} · {new Date(w.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}</p>
                </div>
                <span className={`text-[11px] sm:text-xs font-medium px-2 sm:px-2.5 py-1 rounded-full flex-shrink-0 ${
                  w.status === 'approved' ? 'bg-green-100 text-green-700' : w.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {w.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}