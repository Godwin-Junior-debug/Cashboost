import { useEffect, useState } from 'react';
import { Users, ListChecks, UserPlus, Banknote, ShoppingBag, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Stats = {
  tasks_completed_today: number;
  signups_today: number;
  withdrawals_confirmed_today: number;
  total_members: number;
};

type BadgeMessage = {
  icon: any;
  text: string;
  color: string;
};

// --- Mock Data Generator with Full Names (First Name + Surname) ---
const FIRST_NAMES = [
  "Chinedu", "Amara", "Tunde", "Fatima", "David", "Chioma", "Ibrahim", 
  "Blessing", "Emeka", "Aisha", "Samuel", "Yetunde", "Oluwaseun", "Ngozi", 
  "Kelechi", "Sani", "Abubakar", "Funke", "Chidi", "Efe"
];

const SURNAMES = [
  "Okeke", "Adebayo", "Balogun", "Okonkwo", "Bello", "Nwachukwu", "Obi", 
  "Ibrahim", "Eze", "Danjuma", "Abiola", "Okafor", "Lawal", "Alabi", "Oni"
];

const MOCK_AMOUNTS = ["₦2,500", "₦5,000", "₦7,500", "₦10,000", "₦15,000", "₦20,000"];

const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function generateMockMessage(): BadgeMessage {
  const firstName = getRandomItem(FIRST_NAMES);
  const surname = getRandomItem(SURNAMES);
  const fullName = `${firstName} ${surname}`;
  const isWithdrawal = Math.random() > 0.5;

  if (isWithdrawal) {
    const amount = getRandomItem(MOCK_AMOUNTS);
    return {
      icon: Banknote,
      text: `${fullName} just withdrew ${amount}!`,
      color: 'from-emerald-500 to-green-600',
    };
  } else {
    return {
      icon: ShoppingBag,
      text: `${fullName} just purchased a withdrawal code`,
      color: 'from-violet-600 to-purple-500',
    };
  }
}

export default function ActivityBadge() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [currentMessage, setCurrentMessage] = useState<BadgeMessage | null>(null);
  const [visible, setVisible] = useState(false);

  // 1. Fetch live db stats
  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      const { data, error } = await supabase.rpc('get_platform_activity_stats');
      if (!cancelled && !error && data) {
        setStats(data as Stats);
      }
    }

    loadStats();
    const refreshInterval = setInterval(loadStats, 60000);
    return () => { cancelled = true; clearInterval(refreshInterval); };
  }, []);

  // 2. Cycle messages every 5 seconds (alternating between real stats and mockups)
  useEffect(() => {
    let isMounted = true;

    const cycleMessages = () => {
      if (!isMounted) return;

      // Smooth slide-down exit
      setVisible(false);

      setTimeout(() => {
        if (!isMounted) return;

        // 65% chance to show a mock withdrawal/code purchase, 35% chance to show live counter stats
        const showMockup = Math.random() < 0.65;

        if (showMockup || !stats) {
          setCurrentMessage(generateMockMessage());
        } else {
          const statOptions: BadgeMessage[] = [
            { icon: ListChecks, text: `${stats.tasks_completed_today} tasks completed today`, color: 'from-primary-600 to-accent-500' },
            { icon: UserPlus, text: `${stats.signups_today} new members joined today`, color: 'from-accent-500 to-accent-600' },
            { icon: Banknote, text: `${stats.withdrawals_confirmed_today} withdrawals confirmed today`, color: 'from-orange-500 to-amber-600' },
            { icon: Users, text: `${stats.total_members.toLocaleString()} members on DailyCash9ja`, color: 'from-pink-500 to-rose-600' },
          ];
          setCurrentMessage(getRandomItem(statOptions));
        }

        // Smooth slide-up entry
        setVisible(true);
      }, 300);
    };

    cycleMessages();
    const cycleInterval = setInterval(cycleMessages, 5000);

    return () => {
      isMounted = false;
      clearInterval(cycleInterval);
    };
  }, [stats]);

  if (!currentMessage) return null;

  const Icon = currentMessage.icon;

  return (
    <div
      className={`fixed bottom-4 left-3 right-3 sm:left-4 sm:right-auto z-50 flex items-center gap-2 sm:gap-2.5 bg-white border border-slate-200 shadow-lg rounded-full pl-2 pr-3 sm:pr-4 py-2 max-w-full sm:max-w-none transition-all duration-300 transform ${
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
      }`}
    >
      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br ${currentMessage.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white animate-pulse" />
      </div>
      <div className="flex flex-col min-w-0 pr-1">
        <span className="text-[9px] uppercase tracking-wider font-extrabold text-primary-600 leading-none mb-0.5 flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-accent-500" /> Live Feed
        </span>
        <span className="text-[11px] sm:text-xs font-semibold text-slate-700 truncate leading-tight">
          {currentMessage.text}
        </span>
      </div>
    </div>
  );
}