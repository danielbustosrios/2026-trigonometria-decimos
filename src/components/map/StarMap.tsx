import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Lock,
  Star,
  CheckCircle2,
  Rocket,
  Zap,
  Crown,
  Sparkles,
  Compass,
  Play,
  RotateCcw,
  Info,
  Layers,
} from 'lucide-react';
import { Galaxy, Mission, UserProfile } from '../../types';
import { GALAXIES_DATA } from '../../data/mockData';
import { StorageService } from '../../services/storageService';

interface StarMapProps {
  user: UserProfile;
  onSelectMission: (mission: Mission) => void;
  onOpenRecharge: () => void;
}

export const StarMap: React.FC<StarMapProps> = ({
  user,
  onSelectMission,
  onOpenRecharge,
}) => {
  const [selectedGalaxyId, setSelectedGalaxyId] = useState<string>('galaxy-1');
  const [hoveredMission, setHoveredMission] = useState<Mission | null>(null);

  const progressMap = StorageService.getAllProgress();
  const totalStars = StorageService.getTotalStars();

  const activeGalaxy =
    GALAXIES_DATA.find((g) => g.id === selectedGalaxyId) || GALAXIES_DATA[0];

  // Helper to determine node state
  const getMissionStatus = (mission: Mission, galaxy: Galaxy) => {
    const progress = progressMap[mission.id];
    if (progress?.completed) {
      return progress.stars === 3 ? 'PERFECT' : 'COMPLETED';
    }

    // Check unlock condition (stars or first mission of unlocked galaxy)
    const isUnlocked = totalStars >= mission.requiredStarsToUnlock;
    if (isUnlocked) {
      return 'CURRENT';
    }
    return 'LOCKED';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Header with Galaxy Selector Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-mono-tech uppercase tracking-widest text-cyan-400 font-bold">
              MAPA DE EXPLORACIÓN MATEMÁTICA
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-wide mt-1">
            Rutas de la Galaxia Trigonométrica
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Avanza por los 9 sectores curriculares resolviendo desafíos y desbloqueando estrellas estelares.
          </p>
        </div>

        {/* Global Stars Tracker */}
        <div className="flex items-center gap-3 self-start md:self-auto p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-200">Estrellas de Dominio</p>
            <p className="text-sm font-mono-tech font-bold text-amber-300">
              {totalStars} ⭐ acumuladas
            </p>
          </div>
        </div>
      </div>

      {/* Sector Carousel Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {GALAXIES_DATA.map((galaxy) => {
          const isSelected = galaxy.id === selectedGalaxyId;
          const galaxyMissions = galaxy.missions;
          const completedCount = galaxyMissions.filter(
            (m) => progressMap[m.id]?.completed
          ).length;
          const galaxyStars = galaxyMissions.reduce(
            (acc, m) => acc + (progressMap[m.id]?.stars || 0),
            0
          );
          const maxStars = galaxyMissions.length * 3;

          return (
            <button
              key={galaxy.id}
              onClick={() => setSelectedGalaxyId(galaxy.id)}
              className={`flex-shrink-0 text-left p-3.5 rounded-2xl border transition-all cursor-pointer min-w-[200px] ${
                isSelected
                  ? 'bg-slate-800/90 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)] scale-[1.02]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono-tech mb-1">
                <span
                  className="font-bold"
                  style={{ color: galaxy.themeColor }}
                >
                  {galaxy.name}
                </span>
                <span className="text-amber-400 flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {galaxyStars}/{maxStars}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-100 truncate mb-2">
                {galaxy.sectorName}
              </p>
              <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(completedCount / Math.max(1, galaxyMissions.length)) * 100}%`,
                    backgroundColor: galaxy.themeColor,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Galaxy Level Node Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Map Area */}
        <div className="lg:col-span-8 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 relative min-h-[520px] flex flex-col justify-between overflow-hidden shadow-2xl">
          {/* Galaxy Info Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-mono-tech font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg"
                  style={{
                    backgroundColor: `${activeGalaxy.themeColor}20`,
                    color: activeGalaxy.themeColor,
                    borderColor: `${activeGalaxy.themeColor}40`,
                  }}
                >
                  {activeGalaxy.name}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
                  {activeGalaxy.sectorName}
                </h2>
              </div>
              <p className="text-xs text-slate-300 mt-1.5 max-w-xl leading-relaxed">
                {activeGalaxy.description}
              </p>
            </div>

            {/* Topics Pill Badge */}
            <div className="flex flex-wrap gap-1.5 max-w-xs">
              {activeGalaxy.topics.slice(0, 3).map((topic, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700 text-slate-300 font-mono-tech"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Interactive Zig-Zag / Vertical Gaming Path Nodes */}
          <div className="relative py-8 my-4 flex flex-col items-center justify-center space-y-12">
            {/* Curved Connecting Laser Line in Background */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="50%"
                y1="10%"
                x2="50%"
                y2="90%"
                stroke="#6366f1"
                strokeWidth="3"
                strokeDasharray="6 6"
              />
            </svg>

            {activeGalaxy.missions.map((mission, index) => {
              const status = getMissionStatus(mission, activeGalaxy);
              const progress = progressMap[mission.id];
              const isRecharge = mission.type === 'recharge_station';
              const isBoss = mission.type === 'boss_challenge';

              // Alternate horizontal offset for authentic game path feel
              const offsetClasses = [
                'translate-x-0',
                '-translate-x-12 sm:-translate-x-20',
                'translate-x-12 sm:translate-x-20',
                'translate-x-0',
              ][index % 4];

              return (
                <div
                  key={mission.id}
                  className={`relative z-10 flex flex-col items-center ${offsetClasses}`}
                  onMouseEnter={() => setHoveredMission(mission)}
                >
                  {/* Node Button with Immersive Theme */}
                  <motion.button
                    whileHover={{ scale: status !== 'LOCKED' ? 1.12 : 1 }}
                    whileTap={{ scale: status !== 'LOCKED' ? 0.95 : 1 }}
                    onClick={() => {
                      if (status === 'LOCKED') return;
                      if (isRecharge) {
                        onOpenRecharge();
                      } else {
                        onSelectMission(mission);
                      }
                    }}
                    className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl p-1 flex items-center justify-center transition-all cursor-pointer ${
                      status === 'PERFECT'
                        ? 'bg-amber-500/20 border-2 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.6)]'
                        : status === 'COMPLETED'
                        ? 'bg-cyan-500/20 border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]'
                        : status === 'CURRENT'
                        ? 'bg-indigo-600/30 border-2 border-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.7)] animate-pulse'
                        : 'bg-slate-900/60 border border-slate-800 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {/* Inner Core */}
                    <div className="w-full h-full bg-slate-950/90 rounded-[20px] flex flex-col items-center justify-center relative overflow-hidden">
                      {/* Icons by type/status */}
                      {isRecharge ? (
                        <Zap className="w-8 h-8 text-amber-400 fill-amber-400/30 animate-bounce" />
                      ) : isBoss ? (
                        <Crown className="w-8 h-8 text-pink-400 animate-pulse" />
                      ) : status === 'PERFECT' ? (
                        <div className="flex flex-col items-center">
                          <Crown className="w-6 h-6 text-amber-400 mb-0.5" />
                          <div className="flex gap-0.5">
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                className="w-2.5 h-2.5 text-amber-400 fill-amber-400"
                              />
                            ))}
                          </div>
                        </div>
                      ) : status === 'COMPLETED' ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle2 className="w-7 h-7 text-cyan-400 mb-0.5" />
                          <div className="flex gap-0.5">
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                className={`w-2.5 h-2.5 ${
                                  s <= (progress?.stars || 1)
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      ) : status === 'CURRENT' ? (
                        <div className="flex flex-col items-center">
                          <Rocket className="w-7 h-7 text-indigo-300 animate-bounce" />
                          <span className="text-[10px] font-mono-tech text-indigo-300 font-bold uppercase">
                            ACTUAL
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-slate-500">
                          <Lock className="w-6 h-6 mb-1" />
                          <span className="text-[9px] font-mono-tech">
                            {mission.requiredStarsToUnlock} ⭐
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Orbiting Player Ship indicator if on current node */}
                    {status === 'CURRENT' && (
                      <div className="absolute -top-3 -right-3 text-lg animate-bounce">
                        {user.avatar || '🚀'}
                      </div>
                    )}
                  </motion.button>

                  {/* Title Label Under Node */}
                  <div className="mt-2 text-center max-w-[180px]">
                    <p
                      className={`text-xs font-bold font-heading truncate ${
                        status === 'LOCKED' ? 'text-slate-500' : 'text-slate-100'
                      }`}
                    >
                      {mission.title}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {mission.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Legend at the bottom */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-4 text-xs font-mono-tech text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
              <span>Completada</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_6px_#6366f1]" />
              <span>Misión Actual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
              <span>Dominio Perfecto</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <span>Bloqueada</span>
            </div>
          </div>
        </div>

        {/* Selected / Hovered Mission Details Preview Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 flex flex-col justify-between min-h-[300px] shadow-xl">
            {hoveredMission ? (
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-mono-tech text-xs font-bold">
                    Misión #{hoveredMission.order}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono-tech font-bold">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    +{hoveredMission.xpReward} XP
                  </div>
                </div>

                <h3 className="text-xl font-bold font-heading text-white mb-1">
                  {hoveredMission.title}
                </h3>
                <p className="text-xs text-indigo-400 font-medium mb-3">
                  {hoveredMission.subtitle}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  {hoveredMission.description}
                </p>

                {/* Progress breakdown */}
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2 mb-6">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Estado:</span>
                    <span className="font-bold text-white">
                      {progressMap[hoveredMission.id]?.completed
                        ? 'Completado'
                        : totalStars >= hoveredMission.requiredStarsToUnlock
                        ? 'Disponible'
                        : 'Requiere más estrellas'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Estrellas Obtenidas:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= (progressMap[hoveredMission.id]?.stars || 0)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Ejercicios interactivos:</span>
                    <span className="font-mono-tech text-slate-200">
                      {hoveredMission.questions.length} desafíos
                    </span>
                  </div>
                </div>

                {hoveredMission.type === 'recharge_station' ? (
                  <button
                    onClick={onOpenRecharge}
                    className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <Zap className="w-4 h-4" />
                    INGRESAR A LA ESTACIÓN DE RECARGA
                  </button>
                ) : (
                  <button
                    disabled={totalStars < hoveredMission.requiredStarsToUnlock}
                    onClick={() => onSelectMission(hoveredMission)}
                    className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-heading font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    {progressMap[hoveredMission.id]?.completed
                      ? 'REPETIR MISIÓN'
                      : 'DESPEGAR A LA MISIÓN'}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-spin" style={{ animationDuration: '20s' }} />
                <p className="text-sm font-bold text-slate-300">
                  Selecciona una Misión Estelar
                </p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  Pasa el cursor o haz clic en cualquier nodo para ver los objetivos y comenzar tu vuelo.
                </p>
              </div>
            )}
          </div>

          {/* Curricular Mastery Overview Widget */}
          <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800">
            <h4 className="text-xs font-bold font-heading uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              SISTEMA DE DOMINIO GRADO 10°
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Puedes repetir misiones para perfeccionar tu dominio y conseguir hasta 3 estrellas doradas ⭐⭐⭐.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono-tech">
              <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700">
                <span className="text-slate-400 text-[10px] block">Misiones Completas</span>
                <span className="text-cyan-300 font-bold text-sm">
                  {Object.values(progressMap).filter((p) => p.completed).length} /{' '}
                  {GALAXIES_DATA.flatMap((g) => g.missions).length}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700">
                <span className="text-slate-400 text-[10px] block">Estrellas Acumuladas</span>
                <span className="text-amber-300 font-bold text-sm">
                  {totalStars} / {GALAXIES_DATA.flatMap((g) => g.missions).length * 3}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
