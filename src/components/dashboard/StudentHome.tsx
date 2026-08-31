import React from 'react';
import { motion } from 'motion/react';
import {
  Rocket,
  Compass,
  Zap,
  Sparkles,
  Trophy,
  ShoppingBag,
  Flame,
  ArrowRight,
  Target,
  Orbit,
  Star,
  ShieldCheck,
  Award,
  Radio,
} from 'lucide-react';
import { UserProfile, Galaxy, Mission } from '../../types';
import { GALAXIES_DATA } from '../../data/mockData';
import { StorageService, getLevelInfo } from '../../services/storageService';
import { ActiveTab } from '../layout/Navbar';

interface StudentHomeProps {
  user: UserProfile;
  setActiveTab: (tab: ActiveTab) => void;
  onLaunchMission: (mission: Mission) => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({
  user,
  setActiveTab,
  onLaunchMission,
}) => {
  const levelInfo = getLevelInfo(user.xp);
  const progressMap = StorageService.getAllProgress();
  const events = StorageService.getCourseEvents();
  const activeEvent = events.find((e) => e.active);

  // Total missions count across 9 galaxies
  const allMissions = GALAXIES_DATA.flatMap((g) => g.missions);
  const completedMissionsCount = Object.values(progressMap).filter((p) => p.completed).length;
  const totalMissions = allMissions.length;
  const explorationPercentage = Math.min(100, Math.round((completedMissionsCount / totalMissions) * 100));

  // Determine current active mission
  const currentMission: Mission =
    allMissions.find((m) => !progressMap[m.id]?.completed && m.type === 'academic') ||
    GALAXIES_DATA[3].missions[0] ||
    allMissions[0];

  const currentGalaxy = GALAXIES_DATA.find((g) => g.id === currentMission.galaxyId) || GALAXIES_DATA[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Active Course Event Banner (if active) */}
      {activeEvent && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-4 sm:p-5 border border-orange-500/40 bg-gradient-to-r from-orange-950/60 via-purple-950/40 to-slate-950/80 shadow-[0_0_30px_rgba(249,115,22,0.15)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6 text-orange-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono-tech uppercase tracking-wider font-bold text-orange-300">
                  {activeEvent.title}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-200 border border-orange-500/30">
                  XP × {activeEvent.multiplierXP} ACTIVO
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{activeEvent.description}</p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('map')}
            className="self-end sm:self-center px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs font-heading tracking-wide transition-all shadow-md shadow-orange-500/30 whitespace-nowrap cursor-pointer"
          >
            APROVECHAR BONO
          </button>
        </motion.div>
      )}

      {/* Immersive UI Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Mission Command Card in Immersive Theme */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-8 rounded-3xl bg-indigo-950/20 border border-indigo-500/30 backdrop-blur-xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-[0_10px_40px_rgba(49,46,129,0.2)]"
        >
          {/* Subtle background glow effect */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-mono-tech uppercase tracking-widest text-indigo-400 font-bold">
                MISIÓN ACTUAL DE VUELO
              </span>
            </div>

            <p className="text-sm font-medium text-slate-300 mb-1 font-mono-tech">
              {currentGalaxy.name}: {currentGalaxy.sectorName}
            </p>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading text-white tracking-wide leading-tight">
              {currentMission.title}
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
              {currentMission.description}
            </p>
          </div>

          {/* Current Mission Focus Action Container */}
          <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-mono-tech text-xs font-bold">
                  Misión #{currentMission.order}
                </span>
                <span className="text-xs text-slate-400 font-mono-tech">
                  {currentMission.questions.length} Desafíos de cálculo
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono-tech">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Recompensa: +{currentMission.xpReward} XP y Créditos</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onLaunchMission(currentMission)}
                className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-heading font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/35 transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.02]"
              >
                <Rocket className="w-4 h-4" />
                DESPEGAR AHORA
              </button>

              <button
                onClick={() => setActiveTab('map')}
                className="w-full sm:w-auto px-5 py-3.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl font-heading font-bold text-xs uppercase tracking-wider border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4 text-cyan-400" />
                MAPA ESTELAR
              </button>
            </div>
          </div>
        </motion.div>

        {/* Immersive Galaxy Exploration & Progress Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 rounded-3xl bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 flex flex-col justify-between shadow-lg"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono-tech">
                PROGRESO GALAXIA
              </h3>
              <span className="text-xs font-mono-tech font-bold text-cyan-400">
                {explorationPercentage}%
              </span>
            </div>

            {/* Neon Linear Progress */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs font-mono-tech text-slate-400">
                <span>Exploración de la cohorte</span>
                <span className="text-cyan-400">{completedMissionsCount}/{totalMissions} misiones</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] rounded-full transition-all duration-700"
                  style={{ width: `${explorationPercentage}%` }}
                />
              </div>
            </div>

            {/* 2-Column Bento Metrics Grid from Design */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-mono-tech">
                  Sectores
                </span>
                <span className="text-base font-bold font-mono-tech text-white">
                  {user.galaxiesExplored} / 9
                </span>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-mono-tech">
                  Misiones
                </span>
                <span className="text-base font-bold font-mono-tech text-cyan-300">
                  {completedMissionsCount} / {totalMissions}
                </span>
              </div>
            </div>

            {/* Weekly Challenge Banner Card from Design */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🏆</div>
                <div>
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-mono-tech">
                    Desafío Semanal
                  </p>
                  <p className="text-xs text-slate-300">
                    Resuelve cálculos trigonométricos para desbloquear el cofre estelar.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Ship and Hangar Footer */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{user.avatar}</span>
              <div>
                <p className="text-xs font-bold text-slate-200">{user.spaceship}</p>
                <p className="text-[10px] text-slate-400">Racha activa: {user.streakDays} días</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('profile')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono-tech cursor-pointer"
            >
              Hangar <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Quick Launchpad Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Star Map */}
        <div
          onClick={() => setActiveTab('map')}
          className="p-5 rounded-2xl cosmic-glass-card hover:border-cyan-400/60 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Compass className="w-5 h-5 text-cyan-400" />
          </div>
          <h4 className="text-base font-bold font-heading text-white group-hover:text-cyan-300 transition-colors">
            Mapa Estelar
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            9 Galaxias con misiones interactivas desde aritmética hasta identidades.
          </p>
        </div>

        {/* Recharge Station */}
        <div
          onClick={() => setActiveTab('recharge')}
          className="p-5 rounded-2xl cosmic-glass-card hover:border-amber-400/60 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <h4 className="text-base font-bold font-heading text-white group-hover:text-amber-300 transition-colors">
            Estación de Recarga
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Restaura tus 3 baterías completando puzzles galácticos de reactores.
          </p>
        </div>

        {/* Cosmic Market */}
        <div
          onClick={() => setActiveTab('market')}
          className="p-5 rounded-2xl cosmic-glass-card hover:border-purple-400/60 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-5 h-5 text-purple-400" />
          </div>
          <h4 className="text-base font-bold font-heading text-white group-hover:text-purple-300 transition-colors">
            Mercado Interestelar
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Canjea créditos por naves, avatares, estelas y minijuegos arcade.
          </p>
        </div>

        {/* Leaderboard */}
        <div
          onClick={() => setActiveTab('leaderboard')}
          className="p-5 rounded-2xl cosmic-glass-card hover:border-pink-400/60 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Trophy className="w-5 h-5 text-pink-400" />
          </div>
          <h4 className="text-base font-bold font-heading text-white group-hover:text-pink-300 transition-colors">
            Muro de Navegantes
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Compite sanamente en el ranking semanal del grado 10° con podio.
          </p>
        </div>
      </div>
    </div>
  );
};

