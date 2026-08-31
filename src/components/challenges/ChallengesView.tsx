import React from 'react';
import { motion } from 'motion/react';
import {
  Scroll,
  Sparkles,
  Coins,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  Zap,
  Radio,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { StorageService } from '../../services/storageService';

interface ChallengesViewProps {
  user: UserProfile;
}

export const ChallengesView: React.FC<ChallengesViewProps> = ({ user }) => {
  const challenges = StorageService.getWeeklyChallenges();
  const events = StorageService.getCourseEvents();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Scroll className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-mono-tech uppercase tracking-widest text-cyan-400 font-bold">
              CONTRATOS DE NAVEGACIÓN
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-wide mt-1">
            Misiones Semanales y Eventos
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Cumple los objetivos periódicos de la flota para conseguir bonificaciones masivas de XP y créditos.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono-tech text-cyan-300 self-start sm:self-auto">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Renovación en: 4 días 16h</span>
        </div>
      </div>

      {/* Active Events Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold font-heading uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Radio className="w-4 h-4 text-orange-400 animate-pulse" />
          Eventos Estelares en Curso
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className={`p-5 rounded-3xl border transition-all ${
                event.active
                  ? 'bg-gradient-to-br from-orange-950/40 via-purple-950/30 to-slate-900/80 border-orange-500/50 shadow-[0_0_25px_rgba(249,115,22,0.15)]'
                  : 'bg-slate-900/60 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-mono-tech px-2 py-0.5 rounded-full ${
                    event.active
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 font-bold'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {event.active ? 'EN CURSO' : 'PRÓXIMAMENTE'}
                </span>
                <span className="text-xs font-mono-tech font-bold text-orange-400">
                  XP × {event.multiplierXP}
                </span>
              </div>

              <h4 className="text-base font-bold font-heading text-white mb-1">
                {event.title}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {event.description}
              </p>

              <div className="flex items-center gap-2 text-[11px] font-mono-tech text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Finaliza el fin de semana</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Challenges Cards Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold font-heading uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Award className="w-4 h-4 text-cyan-400" />
          Desafíos de la Semana
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map((challenge) => {
            const isDone = challenge.isCompleted || challenge.currentCount >= challenge.targetCount;
            const percent = Math.min(100, Math.round((challenge.currentCount / challenge.targetCount) * 100));

            return (
              <motion.div
                key={challenge.id}
                whileHover={{ y: -2 }}
                className={`p-6 rounded-3xl cosmic-glass border flex flex-col justify-between transition-all ${
                  isDone
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : 'border-slate-800 hover:border-cyan-500/30'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h4 className="text-base font-bold font-heading text-white">
                      {challenge.title}
                    </h4>
                    {isDone ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono-tech font-bold flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" /> COMPLETADO
                      </span>
                    ) : (
                      <span className="text-xs font-mono-tech text-slate-400 shrink-0">
                        {challenge.currentCount} / {challenge.targetCount}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {challenge.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 mb-4">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDone
                          ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                          : 'bg-gradient-to-r from-cyan-400 to-purple-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Rewards Strip */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono-tech">
                  <span className="text-slate-400">Recompensas:</span>
                  <div className="flex items-center gap-3">
                    <span className="text-cyan-300 font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      +{challenge.xpReward} XP
                    </span>
                    <span className="text-purple-300 font-bold flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-purple-400" />
                      +{challenge.creditsReward} CR
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
