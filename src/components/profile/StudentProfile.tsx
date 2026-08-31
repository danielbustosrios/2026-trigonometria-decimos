import React from 'react';
import { motion } from 'motion/react';
import {
  User,
  Award,
  Sparkles,
  Zap,
  Flame,
  Rocket,
  ShieldCheck,
  Star,
  Layers,
  Target,
  CheckCircle2,
  LogOut,
} from 'lucide-react';
import { UserProfile, Badge } from '../../types';
import { BADGES_DATABASE } from '../../data/mockData';
import { getLevelInfo } from '../../services/storageService';

interface StudentProfileProps {
  user: UserProfile;
  onLogout?: () => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ user, onLogout }) => {
  const levelInfo = getLevelInfo(user.xp);

  const getRarityColor = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'legendary':
        return 'border-amber-400/80 bg-amber-950/30 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.3)]';
      case 'epic':
        return 'border-purple-400/80 bg-purple-950/30 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.3)]';
      case 'rare':
        return 'border-cyan-400/80 bg-cyan-950/30 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]';
      default:
        return 'border-slate-700 bg-slate-900/60 text-slate-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Profile Identity Hero */}
      <div className="p-6 sm:p-8 rounded-3xl cosmic-glass border border-cyan-500/30 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Avatar & Badges */}
        <div className="md:col-span-4 flex flex-col items-center text-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-1 shadow-[0_0_30px_rgba(34,211,238,0.3)] mb-3">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-5xl">
              {user.avatar}
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-heading text-white">
            {user.nickname}
          </h2>
          <p className="text-xs text-slate-400">
            {user.name} {user.lastName} • Grupo {user.courseGroup}
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200 font-mono-tech text-xs font-bold">
            <Award className="w-3.5 h-3.5" />
            NIVEL {levelInfo.level} • {levelInfo.title}
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="mt-3 text-xs text-slate-400 hover:text-rose-300 font-mono-tech flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/30 transition-all cursor-pointer"
            >
              <LogOut className="w-3 h-3 text-rose-400" />
              <span>Cerrar Sesión</span>
            </button>
          )}
        </div>

        {/* Progression Bars & Ship config */}
        <div className="md:col-span-8 space-y-5 border-t md:border-t-0 md:border-l border-slate-800 pt-5 md:pt-0 md:pl-8">
          <div>
            <div className="flex justify-between text-xs font-mono-tech mb-1.5">
              <span className="text-slate-300 font-bold">Experiencia de Navegante</span>
              <span className="text-cyan-300">
                {levelInfo.xpInCurrentLevel} / {levelInfo.xpNeededForLevel} XP ({levelInfo.progressPercent}%)
              </span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Hangar Setup */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono-tech uppercase">
                Nave Asignada
              </span>
              <span className="text-xs font-bold text-white truncate block mt-0.5">
                {user.spaceship}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono-tech uppercase">
                Estela de Propulsión
              </span>
              <span className="text-xs font-bold text-cyan-300 truncate block mt-0.5">
                Plasma Cian
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 block font-mono-tech uppercase">
                Días en Órbita
              </span>
              <span className="text-xs font-bold text-orange-400 flex items-center gap-1 mt-0.5">
                <Flame className="w-3.5 h-3.5 fill-orange-400" />
                {user.streakDays} días consecutivos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Performance Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl cosmic-glass-card">
          <Layers className="w-5 h-5 text-purple-400 mb-2" />
          <span className="text-[10px] text-slate-400 font-mono-tech uppercase block">
            Galaxias Exploradas
          </span>
          <span className="text-xl font-black font-mono-tech text-white">
            {user.galaxiesExplored} / 9
          </span>
        </div>

        <div className="p-4 rounded-2xl cosmic-glass-card">
          <Rocket className="w-5 h-5 text-cyan-400 mb-2" />
          <span className="text-[10px] text-slate-400 font-mono-tech uppercase block">
            Misiones Completadas
          </span>
          <span className="text-xl font-black font-mono-tech text-white">
            {user.missionsCompleted}
          </span>
        </div>

        <div className="p-4 rounded-2xl cosmic-glass-card">
          <Target className="w-5 h-5 text-pink-400 mb-2" />
          <span className="text-[10px] text-slate-400 font-mono-tech uppercase block">
            Ejercicios Resueltos
          </span>
          <span className="text-xl font-black font-mono-tech text-white">
            {user.exercisesSolved}
          </span>
        </div>

        <div className="p-4 rounded-2xl cosmic-glass-card">
          <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
          <span className="text-[10px] text-slate-400 font-mono-tech uppercase block">
            Precisión Global
          </span>
          <span className="text-xl font-black font-mono-tech text-emerald-300">
            {user.accuracy}%
          </span>
        </div>

        <div className="p-4 rounded-2xl cosmic-glass-card col-span-2 sm:col-span-1">
          <Flame className="w-5 h-5 text-orange-400 mb-2" />
          <span className="text-[10px] text-slate-400 font-mono-tech uppercase block">
            Mejor Racha Histórica
          </span>
          <span className="text-xl font-black font-mono-tech text-orange-300">
            {user.bestStreak} días
          </span>
        </div>
      </div>

      {/* Badges & Medals Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Galería de Insignias y Logros
          </h3>
          <span className="text-xs font-mono-tech text-slate-400">
            {user.badges.length} / {BADGES_DATABASE.length} desbloqueadas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BADGES_DATABASE.map((badge) => {
            const isUnlocked = user.badges.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-5 rounded-3xl border transition-all ${
                  isUnlocked
                    ? getRarityColor(badge.rarity)
                    : 'bg-slate-950/40 border-slate-800 opacity-40'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700/60 flex items-center justify-center text-2xl shrink-0">
                    {badge.rarity === 'legendary'
                      ? '👑'
                      : badge.rarity === 'epic'
                      ? '⚡'
                      : badge.rarity === 'rare'
                      ? '💎'
                      : '🎖️'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold font-heading text-white">
                        {badge.title}
                      </h4>
                      <span className="text-[9px] uppercase font-mono-tech font-bold px-1.5 py-0.5 rounded bg-slate-800">
                        {badge.rarity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {badge.description}
                    </p>
                    {isUnlocked && (
                      <span className="text-[10px] text-emerald-400 font-mono-tech flex items-center gap-1 mt-2">
                        <CheckCircle2 className="w-3 h-3" /> Concedida
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
