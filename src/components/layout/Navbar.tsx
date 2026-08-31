import React from 'react';
import {
  Zap,
  Flame,
  Award,
  Sparkles,
  Compass,
  ShoppingBag,
  Trophy,
  Scroll,
  User,
  GraduationCap,
  Coins,
  Shield,
  LogOut,
  Radio,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { getLevelInfo } from '../../services/storageService';

export type ActiveTab =
  | 'home'
  | 'map'
  | 'recharge'
  | 'market'
  | 'leaderboard'
  | 'challenges'
  | 'profile'
  | 'teacher';

interface NavbarProps {
  user: UserProfile;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  onOpenAuth,
}) => {
  const levelInfo = getLevelInfo(user.xp);

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/60 backdrop-blur-xl border-b border-slate-700/50 transition-all">
      {/* Top Immersive HUD Metrics Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Pilot Identity with glowing cyan ring */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => setActiveTab('profile')}
            className="relative focus:outline-none group cursor-pointer"
            title="Ver perfil de navegante"
          >
            <div className="w-12 h-12 rounded-full border-2 border-cyan-400 p-0.5 shadow-[0_0_15px_rgba(34,211,238,0.4)] group-hover:shadow-[0_0_20px_rgba(34,211,238,0.7)] transition-all">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-xl font-bold">
                {user.avatar || '👨‍🚀'}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-violet-600 text-[10px] font-mono-tech font-bold px-1.5 py-0.5 rounded-full border border-slate-900 text-white shadow-sm">
              LVL {levelInfo.level}
            </div>
          </button>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-400">Navegante</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 font-mono-tech border border-slate-700">
                Grado {user.courseGroup}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight font-heading">
              {user.name} {user.lastName}
            </h1>
          </div>
        </div>

        {/* HUD Game Resources & Stats in Immersive Theme */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          {/* Energy Batteries Indicator */}
          <div
            onClick={() => setActiveTab('recharge')}
            className="flex flex-col items-center sm:items-end cursor-pointer group"
            title="Baterías de energía cuántica. Haz clic para recargar."
          >
            <div className="flex gap-1.5 items-center">
              {[1, 2, 3].map((cell) => {
                const isFull = cell <= user.batteries;
                return (
                  <div
                    key={cell}
                    className={`w-3.5 sm:w-4 h-5 sm:h-6 rounded-sm transition-all duration-300 ${
                      isFull
                        ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]'
                        : 'bg-slate-700 opacity-60'
                    }`}
                  />
                );
              })}
            </div>
            <span className="text-[10px] uppercase tracking-wider mt-1 text-cyan-400 font-bold font-mono-tech group-hover:text-cyan-300">
              Baterías {user.batteries}/3
            </span>
          </div>

          {/* Stellar Crystals XP */}
          <div className="flex flex-col items-center bg-slate-800/50 px-3.5 py-1.5 rounded-xl border border-slate-700 shadow-inner">
            <div className="flex items-center gap-1.5">
              <span className="text-violet-400 text-sm">💎</span>
              <span className="text-lg sm:text-xl font-black font-mono-tech text-white tabular-nums">
                {user.xp.toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono-tech">
              Cristales XP
            </span>
          </div>

          {/* Cosmic Credits */}
          <div
            onClick={() => setActiveTab('market')}
            className="flex flex-col items-center bg-slate-800/50 px-3.5 py-1.5 rounded-xl border border-slate-700 shadow-inner cursor-pointer hover:border-purple-500/50 transition-colors"
            title="Mercado interestelar"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-purple-400 text-sm">🪙</span>
              <span className="text-lg sm:text-xl font-black font-mono-tech text-purple-300 tabular-nums">
                {user.cosmicCredits}
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-purple-400 font-mono-tech">
              Créditos
            </span>
          </div>

          {/* Orbit Days Streak */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <span className="text-orange-500 text-base sm:text-lg animate-pulse">🔥</span>
              <span className="text-lg sm:text-xl font-black font-mono-tech text-white">
                {user.streakDays.toString().padStart(2, '0')}
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-orange-400 font-mono-tech font-bold">
              Días Órbita
            </span>
          </div>
        </div>
      </div>

      {/* Immersive Continuous Progress Neon Bar under Header */}
      <div className="w-full bg-slate-900/90 h-1.5 relative overflow-hidden border-t border-slate-800/50">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 transition-all duration-700"
          style={{ width: `${levelInfo.progressPercent}%` }}
        />
        <div
          className="absolute top-0 left-0 h-full w-full opacity-30 bg-[linear-gradient(90deg,transparent_0%,white_50%,transparent_100%)] animate-pulse"
          style={{ width: '200%', transform: 'translateX(-50%)' }}
        />
      </div>

      {/* Navigation Sub-bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between overflow-x-auto no-scrollbar gap-2">
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'home'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Centro de Mando
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'map'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Mapa Estelar
          </button>

          <button
            onClick={() => setActiveTab('recharge')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'recharge'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Recarga
          </button>

          <button
            onClick={() => setActiveTab('market')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'market'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Mercado
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Ranking
          </button>

          <button
            onClick={() => setActiveTab('challenges')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'challenges'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Scroll className="w-3.5 h-3.5" />
            Misiones Semanales
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Perfil
          </button>
        </nav>

        {/* Teacher Panel Switcher & Account Access */}
        <div className="flex items-center gap-2 pl-2">
          {user.role === 'teacher' ? (
            <button
              onClick={() => setActiveTab('teacher')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'teacher'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/60'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />
              Panel Docente
            </button>
          ) : null}

          <button
            onClick={onLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

