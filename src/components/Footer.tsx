import { Wallet, Twitter, Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

type FooterProps = {
  onNavigate: (page: string) => void;
};

export default function Footer({ onNavigate }: FooterProps) {
  const socials = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="bg-slate-950 text-slate-400 pt-20 pb-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary-600/20 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display font-extrabold text-xl text-white">
                DailyCash<span className="text-primary-400">9ja</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              Nigeria's most trusted platform to earn money online. Complete tasks, refer friends, and get paid weekly.
            </p>
            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-primary-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => onNavigate('home')} className="hover:text-primary-400 transition-colors">Home</button></li>
              <li><button onClick={() => onNavigate('dashboard')} className="hover:text-primary-400 transition-colors">Dashboard</button></li>
              <li><button onClick={() => onNavigate('register')} className="hover:text-primary-400 transition-colors">Sign Up</button></li>
              <li><button onClick={() => onNavigate('login')} className="hover:text-primary-400 transition-colors">Log In</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-primary-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="hover:text-primary-400 transition-colors"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Get in Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary-400" /> supportdailycash9ja@gmail.com</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary-400" /> +234 810 698 3225</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-400" /> Lagos, Nigeria</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} DailyCash9ja. All rights reserved.</p>
          <p className="text-xs text-slate-500">Built for Nigerians, by Nigerians.</p>
        </div>
      </div>
    </footer>
  );
}
