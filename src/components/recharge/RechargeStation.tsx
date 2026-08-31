import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Zap,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Trophy,
  Timer,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { StorageService } from '../../services/storageService';

interface RechargeStationProps {
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  onBackToMap: () => void;
}

export const RechargeStation: React.FC<RechargeStationProps> = ({
  user,
  onUpdateUser,
  onBackToMap,
}) => {
  const [gridSize, setGridSize] = useState<3 | 4>(3);
  const [tiles, setTiles] = useState<number[]>([]);
  const [movesCount, setMovesCount] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize and shuffle puzzle
  const initPuzzle = (size: 3 | 4) => {
    const total = size * size;
    let initial = Array.from({ length: total - 1 }, (_, i) => i + 1);
    initial.push(0); // 0 is the empty slot

    // Do valid random sliding moves to ensure solvability
    for (let i = 0; i < 80; i++) {
      const emptyIdx = initial.indexOf(0);
      const row = Math.floor(emptyIdx / size);
      const col = emptyIdx % size;
      const neighbors: number[] = [];

      if (row > 0) neighbors.push(emptyIdx - size);
      if (row < size - 1) neighbors.push(emptyIdx + size);
      if (col > 0) neighbors.push(emptyIdx - 1);
      if (col < size - 1) neighbors.push(emptyIdx + 1);

      const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      [initial[emptyIdx], initial[randomNeighbor]] = [initial[randomNeighbor], initial[emptyIdx]];
    }

    setTiles(initial);
    setMovesCount(0);
    setSecondsElapsed(0);
    setIsPlaying(true);
    setIsCompleted(false);
  };

  useEffect(() => {
    initPuzzle(gridSize);
  }, [gridSize]);

  // Timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !isCompleted) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isCompleted]);

  const handleTileClick = (index: number) => {
    if (isCompleted || tiles[index] === 0) return;

    const emptyIdx = tiles.indexOf(0);
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const emptyRow = Math.floor(emptyIdx / gridSize);
    const emptyCol = emptyIdx % gridSize;

    // Check adjacency
    const isAdjacent =
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
      const nextTiles = [...tiles];
      [nextTiles[index], nextTiles[emptyIdx]] = [nextTiles[emptyIdx], nextTiles[index]];
      setTiles(nextTiles);
      setMovesCount((prev) => prev + 1);

      // Check win condition
      const isWon = nextTiles.every((val, i) => {
        if (i === nextTiles.length - 1) return val === 0;
        return val === i + 1;
      });

      if (isWon) {
        setIsCompleted(true);
        setIsPlaying(false);

        // Recharge +1 battery
        const updated = StorageService.rechargeOneBattery(user);
        onUpdateUser(updated);

        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#22d3ee', '#10b981'],
        });
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-mono-tech uppercase tracking-widest text-amber-400 font-bold">
              ESTACIÓN ESPACIAL DE MANTENIMIENTO
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-wide mt-1">
            Recarga de Reactores Cósmicos
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Alinea los cristales de plasma del reactor para restaurar la energía de tu nave (⚡ +1 Batería por reactor alineado).
          </p>
        </div>

        {/* Current Battery Level Indicator */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30">
          <Zap className="w-6 h-6 text-amber-400 fill-amber-400 animate-pulse" />
          <div>
            <p className="text-xs font-bold text-slate-200">Energía de tu Nave</p>
            <p className="text-sm font-mono-tech font-bold text-amber-300">
              {user.batteries}/3 Baterías
            </p>
          </div>
        </div>
      </div>

      {/* Main Puzzle Arena */}
      <div className="p-6 sm:p-8 rounded-3xl cosmic-glass border border-amber-500/30 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left Side: Stats & Difficulty Selector */}
        <div className="md:col-span-5 space-y-6">
          <div>
            <span className="text-xs font-mono-tech uppercase text-cyan-400 font-bold">
              ESTADO DE CALIBRACIÓN
            </span>
            <h3 className="text-xl font-bold font-heading text-white mt-0.5">
              Reactor Fisión 10-Alpha
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Desplaza los núcleos numéricos haciendo clic en los adyacentes al espacio vacío hasta ordenarlos correlativamente.
            </p>
          </div>

          {/* Difficulty / Size Selector */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-medium">Matriz de Plasma:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setGridSize(3)}
                className={`py-2 rounded-xl text-xs font-bold font-mono-tech border transition-all ${
                  gridSize === 3
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                3 × 3 (Normal)
              </button>
              <button
                onClick={() => setGridSize(4)}
                className={`py-2 rounded-xl text-xs font-bold font-mono-tech border transition-all ${
                  gridSize === 4
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                4 × 4 (Avanzado)
              </button>
            </div>
          </div>

          {/* Moves & Stopwatch HUD */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <Timer className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="text-[10px] text-slate-400 block font-mono-tech">TIEMPO</span>
                <span className="text-base font-mono-tech font-bold text-cyan-300">
                  {formatTime(secondsElapsed)}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <Layers className="w-5 h-5 text-purple-400" />
              <div>
                <span className="text-[10px] text-slate-400 block font-mono-tech">MOVIMIENTOS</span>
                <span className="text-base font-mono-tech font-bold text-purple-300">
                  {movesCount}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => initPuzzle(gridSize)}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-heading font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            REINICIAR REACTOR
          </button>
        </div>

        {/* Right Side: Interactive Sliding Board */}
        <div className="md:col-span-7 flex flex-col items-center justify-center">
          <div
            className="p-3 sm:p-4 rounded-3xl bg-slate-950/90 border-2 border-amber-500/40 shadow-[0_0_40px_rgba(251,191,36,0.2)] max-w-sm w-full"
            style={{
              aspectRatio: '1 / 1',
            }}
          >
            <div
              className="grid gap-2 sm:gap-3 w-full h-full"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
              }}
            >
              {tiles.map((tileVal, idx) => {
                const isEmpty = tileVal === 0;
                return (
                  <motion.button
                    key={idx}
                    layout
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={() => handleTileClick(idx)}
                    disabled={isEmpty || isCompleted}
                    className={`rounded-2xl flex items-center justify-center font-mono-tech font-black text-xl sm:text-2xl transition-all ${
                      isEmpty
                        ? 'bg-slate-950/40 border border-slate-900 opacity-20'
                        : isCompleted
                        ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)] cursor-default'
                        : 'bg-gradient-to-tr from-slate-900 to-slate-800 hover:from-amber-500/20 hover:to-amber-500/30 text-amber-300 border border-amber-500/30 hover:border-amber-400/80 shadow-md cursor-pointer hover:scale-105 active:scale-95'
                    }`}
                  >
                    {!isEmpty && tileVal}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Victory Toast */}
          <AnimatePresence>
            {isCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-400 text-center space-y-2 max-w-sm w-full shadow-[0_0_30px_rgba(16,185,129,0.3)]"
              >
                <div className="flex items-center justify-center gap-2 text-emerald-300 font-bold font-heading">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>¡Reactor Alineado! +1 Batería ⚡</span>
                </div>
                <p className="text-xs text-slate-300">
                  Completado en {movesCount} movimientos y {formatTime(secondsElapsed)}.
                </p>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => initPuzzle(gridSize)}
                    className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700 cursor-pointer"
                  >
                    Otro Reactor
                  </button>
                  <button
                    onClick={onBackToMap}
                    className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Ir al Mapa</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
