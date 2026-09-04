import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, type Profile } from './supabase';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata: { username: string; full_name: string; phone?: string; referred_by?: string }) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    setProfile(data as Profile | null);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadProfile(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // IMPORTANT: this listener fires for MANY event types, not just real
    // sign-in/sign-out — including TOKEN_REFRESHED (periodic silent token
    // renewal, and also refired when a backgrounded mobile tab regains
    // focus/visibility, e.g. after the native camera/photo picker closes).
    // We skip re-running setUser/loadProfile/setLoading for THAT event only,
    // since the identity hasn't actually changed and doing so was causing
    // Dashboard to unmount and reset in-progress form state.
    // NOTE: INITIAL_SESSION is deliberately NOT skipped — unlike
    // TOKEN_REFRESHED, it's the authoritative signal that the session has
    // finished restoring from storage on first load, and getSession() alone
    // can lose that race. Skipping it caused profile (wallet balance,
    // tasks, etc.) to stay null and the whole dashboard to render empty.
    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      // TEMP DEBUG — remove once we've confirmed the real event sequence
      // on a phone during the upload/picker flow.
      console.log('[auth event]', event, 'hasSession:', !!newSession, 'visibility:', document.visibilityState);

      if (event === 'TOKEN_REFRESHED') {
        // Keep the session object fresh (new access token) without
        // touching user/profile/loading, so nothing downstream remounts.
        setSession(newSession);
        return;
      }

      (async () => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await loadProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      })();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Profile creation, the welcome bonus, and any referral bonus are ALL
  // handled entirely server-side by the handle_new_user() database
  // trigger, in one atomic transaction. This function only needs to kick
  // off the signup itself — it should never try to duplicate that logic
  // here, since doing so previously caused referral bonuses to risk being
  // paid twice (once by the trigger, once by client code) and could throw
  // spurious "signup failed" errors even when the account was created fine.
  async function signUp(email: string, password: string, metadata: { username: string; full_name: string; phone?: string; referred_by?: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) return { error: error.message };
    if (!data.user) return { error: 'Sign up failed. Please try again.' };

    return { error: null };
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  async function refreshProfile() {
    if (user) await loadProfile(user.id);
  }

  // Auto sign-out after 15 minutes of no activity (mouse, keyboard, touch,
  // or scroll). Only runs while someone is actually logged in. Any of
  // those events resets the timer; if none happen for the full duration,
  // we sign the user out, which App.tsx already redirects to /login for.
  useEffect(() => {
    if (!user) return;

    const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15 minutes
    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        supabase.auth.signOut();
      }, INACTIVITY_LIMIT_MS);
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach((evt) => window.addEventListener(evt, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [user]);

  async function sendPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) return { error: error.message };
    return { error: null };
  }

  async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    return { error: null };
  }

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signUp, signIn, signOut, refreshProfile, sendPasswordReset, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}