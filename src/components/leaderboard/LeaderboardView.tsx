import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  Search,
  Sparkles,
  Zap,
  Filter,
} from 'lucide-react';
import { UserProfile, LeaderboardEntry } from '../../types';
import { MOCK_STUDENTS } from '../../data/mockData';

interface LeaderboardViewProps {
  user: UserProfile;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ user }) => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Map student list to leaderboard entries and inject current user if not present
  const allStudents: LeaderboardEntry[] = [...MOCK_STUDENTS];
  const userEntry: LeaderboardEntry = {
    id: user.id,
    nickname: user.nickname,
    name: user.name,
    lastName: user.lastName,
    avatar: user.avatar,
    spaceship: user.spaceship,
    level: user.level,
    weeklyXP: user.xp,
    monthlyXP: user.xp * 2,
    allTimeXP: user.xp * 3,
    streakDays: user.streakDays,
    courseGroup: user.courseGroup,
  };

  const existingIdx = allStudents.findIndex((s) => s.id === user.id);
  if (existingIdx >= 0) {
    allStudents[existingIdx] = userEntry;
  } else if (user.role === 'student') {
    allStudents.push(userEntry);
  }

  // Get score depending on timeframe
  const getEntryScore = (entry: LeaderboardEntry) => {
    if (timeframe === 'week') return entry.weeklyXP;
    if (timeframe === 'month') return entry.monthlyXP;
    return entry.allTimeXP;
  };

  // Sort descending by score
  const sorted = [...allStudents].sort((a, b) => getEntryScore(b) - getEntryScore(a));

  // Add rank
  const rankedEntries = sorted.map((student, index) => ({
    ...student,
    rank: index + 1,
    isCurrentUser: student.id === user.id,
    currentScore: getEntryScore(student),
  }));

  // Apply filters
  const filtered = rankedEntries.filter((entry) => {
    if (groupFilter !== 'all' && entry.courseGroup !== groupFilter) return false;
    if (
      searchQuery &&
      !entry.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !entry.nickname.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const currentUserRankEntry = rankedEntries.find((e) => e.isCurrentUser);
  const top3 = rankedEntries.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-mono-tech uppercase tracking-widest text-cyan-400 font-bold">
              RANKING INTERGALÁCTICO DE GRADO 10°
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-wide mt-1">
            Muro de Navegantes
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Compite con los exploradores de grado 10° acumulando Cristales Estelares y rachas orbitales.
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 self-start sm:self-auto">
          {[
            { id: 'week', label: 'Esta Semana' },
            { id: 'month', label: 'Este Mes' },
            { id: 'all', label: 'Histórico' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeframe(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeframe === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TOP 3 PODIUM */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto items-end pt-4 pb-2">
          {/* #2 Silver */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center text-center p-4 rounded-3xl cosmic-glass border border-slate-400/30 bg-gradient-to-t from-slate-900 to-slate-950"
          >
            <div className="relative mb-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800 border-2 border-slate-400 flex items-center justify-center text-2xl shadow-lg">
                {top3[1]?.avatar || '👩‍🚀'}
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-300 text-slate-950 font-mono-tech font-black text-xs flex items-center justify-center shadow">
                2
              </div>
            </div>
            <p className="text-xs font-bold text-white truncate max-w-[100px]">
              {top3[1]?.nickname}
            </p>
            <span className="text-[10px] text-slate-400">{top3[1]?.courseGroup}</span>
            <p className="text-xs font-mono-tech font-bold text-cyan-300 mt-2">
              {top3[1]?.currentScore} XP
            </p>
          </motion.div>

          {/* #1 Gold Champion */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center text-center p-5 rounded-3xl cosmic-glass border-2 border-amber-400/60 bg-gradient-to-t from-amber-950/40 via-slate-900 to-slate-950 shadow-[0_0_35px_rgba(251,191,36,0.25)] relative"
          >
            <Crown className="w-8 h-8 text-amber-400 fill-amber-400 absolute -top-5 animate-bounce" />
            <div className="relative mb-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(251,191,36,0.4)]">
                {top3[0]?.avatar || '👨‍🚀'}
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-mono-tech font-black text-xs flex items-center justify-center shadow">
                1
              </div>
            </div>
            <p className="text-sm font-bold text-white truncate max-w-[120px]">
              {top3[0]?.nickname}
            </p>
            <span className="text-[10px] text-amber-300/80 font-mono-tech">
              {top3[0]?.courseGroup} • {top3[0]?.spaceship}
            </span>
            <p className="text-sm font-mono-tech font-black text-amber-300 mt-2">
              {top3[0]?.currentScore} XP
            </p>
          </motion.div>

          {/* #3 Bronze */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center text-center p-4 rounded-3xl cosmic-glass border border-amber-700/40 bg-gradient-to-t from-slate-900 to-slate-950"
          >
            <div className="relative mb-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800 border-2 border-amber-700 flex items-center justify-center text-2xl shadow-lg">
                {top3[2]?.avatar || '🧑‍🚀'}
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-700 text-amber-100 font-mono-tech font-black text-xs flex items-center justify-center shadow">
                3
              </div>
            </div>
            <p className="text-xs font-bold text-white truncate max-w-[100px]">
              {top3[2]?.nickname}
            </p>
            <span className="text-[10px] text-slate-400">{top3[2]?.courseGroup}</span>
            <p className="text-xs font-mono-tech font-bold text-cyan-300 mt-2">
              {top3[2]?.currentScore} XP
            </p>
          </motion.div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-cyan-400 shrink-0" />
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 w-full sm:w-auto"
          >
            <option value="all">Todos los grupos (Grado 10°)</option>
            <option value="10-1">Grupo 10-1</option>
            <option value="10-2">Grupo 10-2</option>
            <option value="10-3">Grupo 10-3</option>
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar navegante..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Leaderboard Table / Roster */}
      <div className="rounded-3xl cosmic-glass border border-slate-800 overflow-hidden">
        <div className="divide-y divide-slate-800/80">
          {filtered.map((entry) => {
            return (
              <div
                key={entry.id}
                className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors ${
                  entry.isCurrentUser
                    ? 'bg-cyan-500/10 border-l-4 border-l-cyan-400'
                    : 'hover:bg-slate-900/40'
                }`}
              >
                {/* Rank & User Info */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-8 text-center">
                    {entry.rank === 1 ? (
                      <span className="text-xl">🥇</span>
                    ) : entry.rank === 2 ? (
                      <span className="text-xl">🥈</span>
                    ) : entry.rank === 3 ? (
                      <span className="text-xl">🥉</span>
                    ) : (
                      <span className="text-sm font-mono-tech font-bold text-slate-400">
                        #{entry.rank}
                      </span>
                    )}
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl shrink-0">
                    {entry.avatar}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        {entry.nickname}
                        {entry.isCurrentUser && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono-tech">
                            TÚ
                          </span>
                        )}
                      </h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono-tech">
                        {entry.courseGroup}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 hidden sm:block">
                      {entry.name} {entry.lastName} • {entry.spaceship}
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-4 sm:gap-6 text-right">
                  <div className="flex items-center gap-1 text-xs text-orange-400 font-mono-tech">
                    <Flame className="w-3.5 h-3.5 fill-orange-400" />
                    <span>{entry.streakDays}d</span>
                  </div>

                  <div className="min-w-[80px]">
                    <span className="text-sm sm:text-base font-mono-tech font-bold text-cyan-300 block">
                      {entry.currentScore.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono-tech">
                      Nivel {entry.level}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky User Position Bar */}
      {currentUserRankEntry && (
        <div className="sticky bottom-4 z-30 p-4 rounded-2xl cosmic-glass border-2 border-cyan-400/60 shadow-[0_0_30px_rgba(34,211,238,0.3)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{user.avatar}</span>
            <div>
              <p className="text-xs font-mono-tech uppercase text-cyan-400 font-bold">
                TU POSICIÓN EN LA FLOTA
              </p>
              <h4 className="text-sm sm:text-base font-bold text-white">
                Rango #{currentUserRankEntry.rank} • {user.nickname} ({user.courseGroup})
              </h4>
            </div>
          </div>

          <div className="text-right">
            <span className="text-base sm:text-xl font-mono-tech font-bold text-cyan-300">
              {currentUserRankEntry.currentScore} XP
            </span>
            <p className="text-[10px] text-slate-300">
              {currentUserRankEntry.rank <= 3
                ? '¡Estás en el podio de honor!'
                : '¡Continúa resolviendo misiones para subir!'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
