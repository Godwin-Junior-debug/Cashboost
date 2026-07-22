import { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import { supabase } from './lib/supabase';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ForgotPasswordPage from './pages/Forgotpasswordpage';
import ResetPasswordPage from './pages/Resetpasswordpage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/Admindashboard';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState('home');
  const hasCheckedInitialSession = useRef(false);

  // On first load, if a session already exists (e.g. after a refresh), send
  // the user straight to the dashboard instead of always showing the
  // landing page. Only runs once, so manually navigating "home" later
  // while logged in still works normally.
  useEffect(() => {
    if (!loading && !hasCheckedInitialSession.current) {
      hasCheckedInitialSession.current = true;
      if (user && page === 'home') {
        setPage('dashboard');
      }
    }
  }, [loading, user, page]);

  // Redirect to dashboard if already logged in and trying to access auth pages
  useEffect(() => {
    if (user && (page === 'login' || page === 'register')) {
      setPage('dashboard');
    }
    if (!user && (page === 'dashboard' || page === 'admin')) {
      setPage('login');
    }
  }, [user, page]);

  // When someone clicks the password-reset link from their email, Supabase
  // fires a PASSWORD_RECOVERY auth event once it parses the recovery token
  // from the URL. Catch that here and route straight to the reset-password
  // screen, regardless of whatever page they'd otherwise land on.
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPage('reset-password');
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (page === 'login') {
    return <AuthPage key="login" mode="login" onNavigate={setPage} />;
  }
  if (page === 'register') {
    return <AuthPage key="register" mode="register" onNavigate={setPage} />;
  }
  if (page === 'forgot-password') {
    return <ForgotPasswordPage onNavigate={setPage} />;
  }
  if (page === 'reset-password') {
    return <ResetPasswordPage onNavigate={setPage} />;
  }
  if (page === 'dashboard') {
    if (!user) return <AuthPage key="login" mode="login" onNavigate={setPage} />;
    return <Dashboard onNavigate={setPage} />;
  }
  if (page === 'admin') {
    if (!user) return <AuthPage key="login" mode="login" onNavigate={setPage} />;
    return <AdminDashboard onNavigate={setPage} />;
  }

  return (
    <div>
      <Navbar onNavigate={setPage} currentPage={page} />
      <LandingPage onNavigate={setPage} />
      <Footer onNavigate={setPage} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}