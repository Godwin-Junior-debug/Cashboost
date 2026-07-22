import { useEffect, useState } from 'react';
import { Wallet, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../lib/auth';

type NavbarProps = {
  onNavigate: (page: string) => void;
  currentPage: string;
};

export default function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'How It Works', target: 'how' },
    { label: 'Earn', target: 'earn' },
    { label: 'Reviews', target: 'reviews' },
    { label: 'FAQ', target: 'faq' },
  ];

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    if (currentPage !== 'home') {
      onNavigate('home');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/85 backdrop-blur-xl shadow-sm border-b border-slate-200/60' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
            <Wallet className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className={`font-display font-extrabold text-lg tracking-tight ${scrolled ? 'text-slate-900' : 'text-white'}`}>
            DailyCash<span className="text-gradient">9ja</span>
          </span>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.target}
              onClick={() => scrollTo(link.target)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                scrolled ? 'text-slate-600 hover:text-primary-700 hover:bg-primary-50' : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <button
                onClick={() => onNavigate('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  scrolled ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'glass text-white hover:bg-white/20'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={signOut}
                className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('login')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  scrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white/90 hover:bg-white/10'
                }`}
              >
                Log in
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-accent-500 hover:shadow-glow hover:scale-105 transition-all duration-300"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden p-2 rounded-lg ${scrolled ? 'text-slate-700' : 'text-white'}`}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-2 animate-fade-in-up">
          {navLinks.map((link) => (
            <button
              key={link.target}
              onClick={() => scrollTo(link.target)}
              className="block w-full text-left px-4 py-2.5 rounded-lg text-slate-600 hover:bg-primary-50 hover:text-primary-700 font-medium"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            {user ? (
              <>
                <button
                  onClick={() => { setMobileOpen(false); onNavigate('dashboard'); }}
                  className="block w-full text-center px-4 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { setMobileOpen(false); signOut(); }}
                  className="block w-full text-center px-4 py-2.5 rounded-lg text-red-600 font-semibold"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setMobileOpen(false); onNavigate('login'); }}
                  className="block w-full text-center px-4 py-2.5 rounded-lg text-slate-700 font-semibold border border-slate-200"
                >
                  Log in
                </button>
                <button
                  onClick={() => { setMobileOpen(false); onNavigate('register'); }}
                  className="block w-full text-center px-4 py-2.5 rounded-lg text-white font-bold bg-gradient-to-r from-primary-600 to-accent-500"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
