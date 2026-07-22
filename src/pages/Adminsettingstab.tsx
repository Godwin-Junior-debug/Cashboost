import { useEffect, useState } from 'react';
import { Landmark, Hash, User, Coins, Save, Loader2, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

type SettingsState = {
  pro_bank_name: string;
  pro_account_number: string;
  pro_account_name: string;
  pro_price: string;
};

const FIELD_META: { key: keyof SettingsState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'pro_bank_name', label: 'Bank Name', icon: Landmark },
  { key: 'pro_account_number', label: 'Account Number', icon: Hash },
  { key: 'pro_account_name', label: 'Account Name', icon: User },
  { key: 'pro_price', label: 'Pro Price (₦)', icon: Coins },
];

export default function AdminSettingsTab() {
  const [values, setValues] = useState<SettingsState>({
    pro_bank_name: '',
    pro_account_number: '',
    pro_account_name: '',
    pro_price: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', ['pro_bank_name', 'pro_account_number', 'pro_account_name', 'pro_price']);

      if (error) {
        showToast('error', error.message);
      } else if (data) {
        const next: SettingsState = { pro_bank_name: '', pro_account_number: '', pro_account_name: '', pro_price: '' };
        data.forEach((row) => {
          if (row.key in next) next[row.key as keyof SettingsState] = row.value;
        });
        setValues(next);
      }
      setLoading(false);
    })();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const entries = Object.entries(values) as [keyof SettingsState, string][];
    for (const [key, value] of entries) {
      const { data, error } = await supabase.rpc('admin_update_setting', { p_key: key, p_value: value });
      if (error || !data?.success) {
        showToast('error', error?.message || data?.message || `Could not save ${key}.`);
        setSaving(false);
        return;
      }
    }

    showToast('success', 'Payment settings updated successfully.');
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-lg text-slate-900 mb-1">Pro Payment Settings</h2>
        <p className="text-slate-500 text-sm">This is the bank account shown to users on the Pro payment page.</p>
      </div>

      {toast && (
        <div className={`flex items-center gap-2 px-5 py-3 rounded-xl ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="text-sm font-medium">{toast.msg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        {FIELD_META.map((f) => (
          <div key={f.key}>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
              <f.icon className="w-4 h-4 text-slate-400" /> {f.label}
            </label>
            <input
              type="text"
              value={values[f.key]}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold text-sm hover:shadow-glow transition-all disabled:opacity-70"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </form>
    </div>
  );
}