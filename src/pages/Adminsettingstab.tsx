import { useEffect, useState } from 'react';
import { Landmark, Hash, User, Coins, Save, Loader2, Check, AlertCircle, Eye, EyeOff, Banknote } from 'lucide-react';
import { supabase } from '../lib/supabase';

type SettingsState = {
  pro_bank_name: string;
  pro_account_number: string;
  pro_account_name: string;
  pro_price: string;
};

type WithdrawalSettingsState = {
  admin_withdraw_bank_name: string;
  admin_withdraw_account_number: string;
  admin_withdraw_account_name: string;
};

type FieldMeta = {
  key: keyof SettingsState;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  type?: string;
  placeholder?: string;
  validation?: (value: string) => string | null;
};

const FIELD_META: FieldMeta[] = [
  {
    key: 'pro_bank_name',
    label: 'Bank Name',
    icon: Landmark,
    placeholder: 'e.g., Access Bank',
    validation: (val) => (val.trim().length < 3 ? 'Bank name must be at least 3 characters' : null),
  },
  {
    key: 'pro_account_number',
    label: 'Account Number',
    icon: Hash,
    placeholder: 'e.g., 1729650675',
    validation: (val) => {
      if (!/^\d{10}$/.test(val)) {
        return 'Account number must be exactly 10 digits';
      }
      return null;
    },
  },
  {
    key: 'pro_account_name',
    label: 'Account Name',
    icon: User,
    placeholder: 'Name on the bank account',
    validation: (val) => (val.trim().length < 3 ? 'Account name must be at least 3 characters' : null),
  },
  {
    key: 'pro_price',
    label: 'Pro Price (₦)',
    icon: Coins,
    type: 'number',
    placeholder: '10000',
    validation: (val) => {
      const num = Number(val);
      if (isNaN(num) || num <= 0) return 'Price must be a positive number';
      if (num < 1000) return 'Price must be at least ₦1,000';
      return null;
    },
  },
];

export default function AdminSettingsTab() {
  const [values, setValues] = useState<SettingsState>({
    pro_bank_name: '',
    pro_account_number: '',
    pro_account_name: '',
    pro_price: '',
  });

  const [withdrawalValues, setWithdrawalValues] = useState<WithdrawalSettingsState>({
    admin_withdraw_bank_name: '',
    admin_withdraw_account_number: '',
    admin_withdraw_account_name: '',
  });

  const [errors, setErrors] = useState<Partial<SettingsState>>({});
  const [withdrawalErrors, setWithdrawalErrors] = useState<Partial<WithdrawalSettingsState>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingWithdrawal, setSavingWithdrawal] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [showWithdrawalAccountNumber, setShowWithdrawalAccountNumber] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [hasWithdrawalChanges, setHasWithdrawalChanges] = useState(false);
  const [originalValues, setOriginalValues] = useState<SettingsState>({
    pro_bank_name: '',
    pro_account_number: '',
    pro_account_name: '',
    pro_price: '',
  });
  const [originalWithdrawalValues, setOriginalWithdrawalValues] = useState<WithdrawalSettingsState>({
    admin_withdraw_bank_name: '',
    admin_withdraw_account_number: '',
    admin_withdraw_account_name: '',
  });

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // Load settings from database
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('key, value')
          .in('key', [
            'pro_bank_name',
            'pro_account_number',
            'pro_account_name',
            'pro_price',
            'admin_withdraw_bank_name',
            'admin_withdraw_account_number',
            'admin_withdraw_account_name',
          ]);

        if (error) {
          showToast('error', `Failed to load settings: ${error.message}`);
        } else if (data) {
          const next: SettingsState = {
            pro_bank_name: '',
            pro_account_number: '',
            pro_account_name: '',
            pro_price: '',
          };
          const nextWithdrawal: WithdrawalSettingsState = {
            admin_withdraw_bank_name: '',
            admin_withdraw_account_number: '',
            admin_withdraw_account_name: '',
          };

          data.forEach((row) => {
            if (row.key in next) {
              next[row.key as keyof SettingsState] = row.value;
            }
            if (row.key in nextWithdrawal) {
              nextWithdrawal[row.key as keyof WithdrawalSettingsState] = row.value;
            }
          });

          setValues(next);
          setOriginalValues(next);
          setWithdrawalValues(nextWithdrawal);
          setOriginalWithdrawalValues(nextWithdrawal);
        }
      } catch (err: any) {
        showToast('error', 'Error loading settings');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Track changes
  useEffect(() => {
    const changed = Object.keys(values).some(
      (key) => values[key as keyof SettingsState] !== originalValues[key as keyof SettingsState]
    );
    setHasChanges(changed);
  }, [values, originalValues]);

  // Track withdrawal changes
  useEffect(() => {
    const changed = Object.keys(withdrawalValues).some(
      (key) =>
        withdrawalValues[key as keyof WithdrawalSettingsState] !==
        originalWithdrawalValues[key as keyof WithdrawalSettingsState]
    );
    setHasWithdrawalChanges(changed);
  }, [withdrawalValues, originalWithdrawalValues]);

  // Validate all fields
  const validateAllFields = () => {
    const newErrors: Partial<SettingsState> = {};
    let isValid = true;

    FIELD_META.forEach((field) => {
      const error = field.validation?.(values[field.key]);
      if (error) {
        newErrors[field.key] = error as any;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (key: keyof SettingsState, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  };

  const handleWithdrawalChange = (key: keyof WithdrawalSettingsState, value: string) => {
    setWithdrawalValues((v) => ({ ...v, [key]: value }));
    if (withdrawalErrors[key]) {
      setWithdrawalErrors((e) => ({ ...e, [key]: undefined }));
    }
  };

  // Validate withdrawal fields
  const validateWithdrawalFields = () => {
    const newErrors: Partial<WithdrawalSettingsState> = {};
    let isValid = true;

    if (withdrawalValues.admin_withdraw_bank_name.trim().length < 3) {
      newErrors.admin_withdraw_bank_name = 'Bank name must be at least 3 characters';
      isValid = false;
    }

    if (!/^\d{10}$/.test(withdrawalValues.admin_withdraw_account_number)) {
      newErrors.admin_withdraw_account_number = 'Account number must be exactly 10 digits';
      isValid = false;
    }

    if (withdrawalValues.admin_withdraw_account_name.trim().length < 3) {
      newErrors.admin_withdraw_account_name = 'Account name must be at least 3 characters';
      isValid = false;
    }

    setWithdrawalErrors(newErrors);
    return isValid;
  };

  // Updated Pro Payment Settings save using RPC
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!validateAllFields()) {
      showToast('error', 'Please fix the errors below');
      return;
    }

    const confirmMessage = `Are you sure you want to update these payment settings?\n\nBank: ${values.pro_bank_name}\nAccount: ${values.pro_account_number}\nName: ${values.pro_account_name}\nPrice: ₦${Number(values.pro_price).toLocaleString()}`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.rpc('save_app_settings', {
        p_settings: values,
      });

      if (error) {
        showToast('error', `Failed to save settings: ${error.message}`);
        return;
      }

      setOriginalValues(values);
      setHasChanges(false);
      showToast('success', '✅ Payment settings updated successfully! Changes will appear for users immediately.');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to discard changes?')) {
      setValues(originalValues);
      setErrors({});
      setHasChanges(false);
    }
  };

  const handleWithdrawalReset = () => {
    if (window.confirm('Are you sure you want to discard withdrawal account changes?')) {
      setWithdrawalValues(originalWithdrawalValues);
      setWithdrawalErrors({});
      setHasWithdrawalChanges(false);
    }
  };

  // UPDATED: Withdrawal Account Save using RPC
  async function handleWithdrawalSave(e: React.FormEvent) {
    e.preventDefault();

    if (!validateWithdrawalFields()) {
      showToast('error', 'Please fix the errors below');
      return;
    }

    const confirmMessage = `Are you sure you want to update your withdrawal account details?\n\nBank: ${withdrawalValues.admin_withdraw_bank_name}\nAccount: ${withdrawalValues.admin_withdraw_account_number}\nName: ${withdrawalValues.admin_withdraw_account_name}`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setSavingWithdrawal(true);

    try {
      const { error } = await supabase.rpc('save_app_settings', {
        p_settings: withdrawalValues,
      });

      if (error) {
        showToast('error', `Failed to save withdrawal account: ${error.message}`);
        return;
      }

      setOriginalWithdrawalValues(withdrawalValues);
      setHasWithdrawalChanges(false);
      showToast('success', '✅ Withdrawal account updated successfully!');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save withdrawal account');
    } finally {
      setSavingWithdrawal(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-3" />
        <p className="text-slate-500 text-sm">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-900 mb-1">Pro Payment Settings</h2>
        <p className="text-slate-500 text-sm">
          Configure the bank account details that will be displayed to users on the Pro payment page. Changes take
          effect immediately.
        </p>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`flex items-center gap-3 px-5 py-4 rounded-xl animate-fade-in ${
            toast.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}
        >
          {toast.type === 'success' ? (
            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span className={`text-sm font-medium ${toast.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {toast.msg}
          </span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
        {FIELD_META.map((field) => (
          <div key={field.key}>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 mb-2">
              <field.icon className="w-4 h-4 text-primary-600" />
              {field.label}
            </label>

            <div className="relative">
              <input
                type={field.key === 'pro_account_number' && !showAccountNumber ? 'password' : field.type || 'text'}
                value={values[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                disabled={saving}
                className={`w-full px-4 py-3 pr-${
                  field.key === 'pro_account_number' ? '12' : '4'
                } rounded-xl border text-sm text-slate-800 placeholder-slate-400 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed focus:outline-none ${
                  errors[field.key]
                    ? 'border-red-300 focus:ring-2 focus:ring-red-500'
                    : 'border-slate-200 focus:ring-2 focus:ring-primary-500'
                }`}
              />

              {field.key === 'pro_account_number' && (
                <button
                  type="button"
                  onClick={() => setShowAccountNumber(!showAccountNumber)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                >
                  {showAccountNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
            </div>

            {errors[field.key] && (
              <p className="text-red-600 text-xs font-medium mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors[field.key]}
              </p>
            )}

            {field.key === 'pro_account_number' && (
              <p className="text-slate-500 text-xs mt-2">
                Ensure this is the correct 10-digit account number. Users will transfer funds to this account.
              </p>
            )}
          </div>
        ))}

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasChanges || saving}
            className="flex-1 px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset Changes
          </button>

          <button
            type="submit"
            disabled={!hasChanges || saving}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold text-sm hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>

        {hasChanges && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs font-medium text-amber-800">
              You have unsaved changes. These will be shown to all users immediately upon saving.
            </p>
          </div>
        )}
      </form>

      {/* Preview Section */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary-600" />
          Preview (What Users See)
        </h3>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Bank Name</p>
            <p className="font-semibold text-slate-900">{values.pro_bank_name || '—'}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Account Number</p>
            <p className="font-semibold text-slate-900 font-mono">
              {values.pro_account_number ? values.pro_account_number.replace(/(\d{4})(?=\d)/g, '$1 ****') : '—'}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Account Name</p>
            <p className="font-semibold text-slate-900">{values.pro_account_name || '—'}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Amount to Pay</p>
            <p className="font-semibold text-slate-900">
              ₦{values.pro_price ? Number(values.pro_price).toLocaleString() : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Withdrawal Account Settings */}
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-900 mb-1 flex items-center gap-2">
          <Banknote className="w-6 h-6 text-primary-600" />
          Withdrawal Account Settings
        </h2>
        <p className="text-slate-500 text-sm">
          Configure your personal withdrawal bank account details. This is where your admin withdrawals will be sent.
        </p>
      </div>

      {/* Withdrawal Settings Form */}
      <form onSubmit={handleWithdrawalSave} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
        <div>
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 mb-2">
            <Landmark className="w-4 h-4 text-primary-600" />
            Bank Name
          </label>
          <input
            type="text"
            value={withdrawalValues.admin_withdraw_bank_name}
            onChange={(e) => handleWithdrawalChange('admin_withdraw_bank_name', e.target.value)}
            placeholder="e.g., Guaranty Trust Bank"
            disabled={savingWithdrawal}
            className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-800 placeholder-slate-400 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed focus:outline-none ${
              withdrawalErrors.admin_withdraw_bank_name
                ? 'border-red-300 focus:ring-2 focus:ring-red-500'
                : 'border-slate-200 focus:ring-2 focus:ring-primary-500'
            }`}
          />
          {withdrawalErrors.admin_withdraw_bank_name && (
            <p className="text-red-600 text-xs font-medium mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {withdrawalErrors.admin_withdraw_bank_name}
            </p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 mb-2">
            <Hash className="w-4 h-4 text-primary-600" />
            Account Number
          </label>
          <div className="relative">
            <input
              type={!showWithdrawalAccountNumber ? 'password' : 'text'}
              value={withdrawalValues.admin_withdraw_account_number}
              onChange={(e) =>
                handleWithdrawalChange('admin_withdraw_account_number', e.target.value.replace(/\D/g, '').slice(0, 10))
              }
              placeholder="0123456789"
              inputMode="numeric"
              maxLength={10}
              disabled={savingWithdrawal}
              className={`w-full px-4 py-3 pr-12 rounded-xl border text-sm text-slate-800 placeholder-slate-400 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed focus:outline-none ${
                withdrawalErrors.admin_withdraw_account_number
                  ? 'border-red-300 focus:ring-2 focus:ring-red-500'
                  : 'border-slate-200 focus:ring-2 focus:ring-primary-500'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowWithdrawalAccountNumber(!showWithdrawalAccountNumber)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            >
              {showWithdrawalAccountNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {withdrawalErrors.admin_withdraw_account_number && (
            <p className="text-red-600 text-xs font-medium mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {withdrawalErrors.admin_withdraw_account_number}
            </p>
          )}
          <p className="text-slate-500 text-xs mt-2">
            This is your personal bank account where admin withdrawals will be sent.
          </p>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 mb-2">
            <User className="w-4 h-4 text-primary-600" />
            Account Name
          </label>
          <input
            type="text"
            value={withdrawalValues.admin_withdraw_account_name}
            onChange={(e) => handleWithdrawalChange('admin_withdraw_account_name', e.target.value)}
            placeholder="Your full name as shown on the bank account"
            disabled={savingWithdrawal}
            className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-800 placeholder-slate-400 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed focus:outline-none ${
              withdrawalErrors.admin_withdraw_account_name
                ? 'border-red-300 focus:ring-2 focus:ring-red-500'
                : 'border-slate-200 focus:ring-2 focus:ring-primary-500'
            }`}
          />
          {withdrawalErrors.admin_withdraw_account_name && (
            <p className="text-red-600 text-xs font-medium mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {withdrawalErrors.admin_withdraw_account_name}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleWithdrawalReset}
            disabled={!hasWithdrawalChanges || savingWithdrawal}
            className="flex-1 px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset Changes
          </button>

          <button
            type="submit"
            disabled={!hasWithdrawalChanges || savingWithdrawal}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold text-sm hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {savingWithdrawal ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Account Details
              </>
            )}
          </button>
        </div>

        {hasWithdrawalChanges && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs font-medium text-amber-800">You have unsaved withdrawal account changes.</p>
          </div>
        )}
      </form>
    </div>
  );
}