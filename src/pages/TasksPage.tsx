import { useEffect, useState, type ComponentType } from 'react';
import { type Task } from '../lib/supabase';
import { Check, Loader2, ListChecks, MousePointerClick, Share2, Video, ClipboardList, Smartphone, PenLine, UserPlus, MessageCircle, Play, Twitter, Facebook, Youtube, Gift, Sparkles, Clock, TrendingUp } from 'lucide-react';

type TasksPageProps = {
  tasks: Task[];
  completedTaskIds: Set<string>;
  verifyingTaskId: string | null;
  taskCycle: number;
  nextRoundUnlockAt: string | null;
  rotationMultipliers: Record<string, number>;
  rotationSecondsRemaining: number;
  completeTask: (task: Task) => Promise<void>;
};

type IconComponent = ComponentType<{ className?: string }>;

const iconMap: Record<string, IconComponent> = {
  MousePointerClick,
  ListChecks,
  Share2,
  Video,
  ClipboardList,
  Smartphone,
  PenLine,
  UserPlus,
  MessageCircle,
  Play,
  Twitter,
  Facebook,
  Youtube,
  Gift,
};

// Rewards increase 20% per completed round, matching the backend's
// set_task_completion_cycle_and_reward() trigger.
const cycleMultiplier = (cycle: number) => Math.pow(1.2, Math.max(cycle, 1) - 1);

function useCountdown(targetIso: string | null) {
  const [msLeft, setMsLeft] = useState<number>(() =>
    targetIso ? new Date(targetIso).getTime() - Date.now() : 0
  );

  useEffect(() => {
    if (!targetIso) return;
    const tick = () => setMsLeft(new Date(targetIso).getTime() - Date.now());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetIso]);

  return Math.max(msLeft, 0);
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatMinSec(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function TasksPage({
  tasks,
  completedTaskIds,
  verifyingTaskId,
  taskCycle,
  nextRoundUnlockAt,
  rotationMultipliers = {},
  rotationSecondsRemaining = 1800,
  completeTask,
}: TasksPageProps) {
  const multiplier = cycleMultiplier(taskCycle);
  const allDone = tasks.length > 0 && tasks.every((t) => completedTaskIds.has(t.id));
  const msLeft = useCountdown(allDone ? nextRoundUnlockAt : null);
  const waitingForNextRound = allDone && nextRoundUnlockAt && msLeft > 0;

  const nextMultiplier = cycleMultiplier(taskCycle + 1);

  // Local ticking countdown for the price-rotation timer, seeded from the
  // server's seconds_remaining and ticking down every second in between refetches.
  const [localRotationSeconds, setLocalRotationSeconds] = useState(rotationSecondsRemaining);
  useEffect(() => {
    setLocalRotationSeconds(rotationSecondsRemaining);
  }, [rotationSecondsRemaining]);
  useEffect(() => {
    const interval = setInterval(() => {
      setLocalRotationSeconds((s) => Math.max(s - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 mb-1">Available Tasks</h1>
          <p className="text-slate-500 text-xs sm:text-sm">Complete tasks to earn cash instantly.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {taskCycle > 1 && (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              Round {taskCycle} &middot; +{Math.round((multiplier - 1) * 100)}% rewards
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full">
            <TrendingUp className="w-3.5 h-3.5" />
            Prices refresh in {formatMinSec(localRotationSeconds)}
          </div>
        </div>
      </div>

      {waitingForNextRound ? (
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 text-center animate-fade-in">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 mb-1.5">All tasks completed!</h3>
          <p className="text-slate-500 text-sm mb-5">
            Round {taskCycle + 1} unlocks with +{Math.round((nextMultiplier - 1) * 100)}% rewards in:
          </p>
          <p className="font-display font-extrabold text-3xl sm:text-4xl text-primary-600 tracking-wider tabular-nums mb-1">
            {formatCountdown(msLeft)}
          </p>
          <p className="text-slate-400 text-xs">Come back once the timer runs out to keep earning.</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 text-center">
          <ListChecks className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No tasks available right now. Check back soon!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          {tasks.map((task, i) => {
            const Icon = iconMap[task.icon] || MousePointerClick;
            const done = completedTaskIds.has(task.id);
            const verifying = verifyingTaskId === task.id;
            const rotationMult = rotationMultipliers[task.id] ?? 1;
            const displayReward = Math.round(task.reward * multiplier * rotationMult * 100) / 100;
            const isHot = rotationMult > 1.05;
            const isLow = rotationMult < 0.95;
            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-300 animate-fade-in-up ${
                  done ? 'border-green-200 bg-green-50/30' : 'border-slate-200 hover:shadow-lg hover:border-primary-300'
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-100' : 'bg-primary-50'}`}>
                      <Icon className={`w-5 h-5 ${done ? 'text-green-600' : 'text-primary-600'}`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-sm sm:text-base text-slate-900 truncate">{task.title}</h3>
                      <span className="text-[11px] sm:text-xs font-medium text-slate-400 capitalize">{task.category}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="font-display font-extrabold text-base sm:text-lg text-accent-600">
                      ₦{displayReward.toLocaleString()}
                    </span>
                    {!done && isHot && <span className="text-[9px] sm:text-[10px] font-bold text-green-600">▲ HIGHER</span>}
                    {!done && isLow && <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">▼ lower</span>}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">{task.description}</p>
                {done ? (
                  <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-100 text-green-700 font-semibold text-xs sm:text-sm">
                    <Check className="w-4 h-4" /> Completed
                  </div>
                ) : (
                  <button
                    onClick={() => completeTask(task)}
                    disabled={verifying || verifyingTaskId !== null}
                    className="w-full min-h-[44px] py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold text-xs sm:text-sm hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                      </>
                    ) : (
                      'Complete task'
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}