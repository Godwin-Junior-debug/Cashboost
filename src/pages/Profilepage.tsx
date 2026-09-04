import { useState, type FormEvent } from 'react';
import { User, Phone, Lock, Save, Loader2, Check, AlertCircle, Mail, Crown, Calendar } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();

  const [username, setUsername] = useState(profile?.username || '');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [savingDetails, setSavingDetails] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  async function handleSaveDetails(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (!username.trim() || !fullName.trim()) {
      showToast('error', 'Username and full name are required.');
      return;
    }

    setSavingDetails(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        username: username.trim(),
        full_name: fullName.trim(),
        phone: phone.trim() || null,
      })
      .eq('id', user.id);

    if (error) {
      showToast('error', error.code === '23505' ? 'That username is already taken.' : error.message);
    } else {
      showToast('success', 'Profile updated successfully.');
      await refreshProfile();
    }
    setSavingDetails(false);
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();

    if (newPassword.length < 6) {
      showToast('error', 'Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'Passwords do not match.');
      return;
    }

    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      showToast('error', error.message);
    } else {
      showToast('success', 'Password changed successfully.');
      setNewPassword('');
      setConfirmPassword('');
    }
    setSavingPassword(false);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-extrabold text-2xl text-slate-900 mb-1">Profile Settings</h1>
        <p className="text-slate-500 text-sm">Manage your account details and password.</p>
      </div>

      {toast && (
        <div className={`flex items-center gap-2 px-5 py-3 rounded-xl ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="text-sm font-medium">{toast.msg}</span>
        </div>
      )}

      {/* Account summary */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-800 to-slate-950 rounded-2xl p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
          {profile?.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="min-w-0">
          <p className="font-display font-bold text-lg text-white truncate">{profile?.full_name || profile?.username}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
            <span className="flex items-center gap-1 text-xs text-slate-300">
              <Mail className="w-3.5 h-3.5" /> {user?.email}
            </span>
            {profile?.is_pro && (
              <span className="flex items-center gap-1 text-xs text-amber-300">
                <Crown className="w-3.5 h-3.5" /> Pro member
              </span>
            )}
            {profile?.created_at && (
              <span className="flex items-center gap-1 text-xs text-slate-300">
                <Calendar className="w-3.5 h-3.5" />
                Joined {new Date(profile.created_at).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Edit details */}
      <form onSubmit={handleSaveDetails} className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
        <h3 className="font-display font-bold text-lg text-slate-900">Personal Details</h3>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
            <User className="w-4 h-4 text-slate-400" /> Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
            <User className="w-4 h-4 text-slate-400" /> Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
            <Phone className="w-4 h-4 text-slate-400" /> Phone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+234 800 000 0000"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
            <Mail className="w-4 h-4 text-slate-400" /> Email
          </label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-400"
          />
          <p className="text-xs text-slate-400 mt-1">Email cannot be changed here.</p>
        </div>

        <button
          type="submit"
          disabled={savingDetails}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold text-sm hover:shadow-glow transition-all disabled:opacity-70"
        >
          {savingDetails ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </form>

      {/* Change password */}
      <form onSubmit={handleChangePassword} className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
        <h3 className="font-display font-bold text-lg text-slate-900">Change Password</h3>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
            <Lock className="w-4 h-4 text-slate-400" /> New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
            <Lock className="w-4 h-4 text-slate-400" /> Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <button
          type="submit"
          disabled={savingPassword}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-70"
        >
          {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          Update Password
        </button>
      </form>
    </div>
  );
}