import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Rocket,
  Flame,
  Sparkles,
  Trophy,
  RotateCcw,
  X,
  Zap,
  Target,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { StorageService } from '../../services/storageService';

interface AsteroidBlasterProps {
  user: UserProfile;
  onClose: () => void;
  onUpdateUser: (user: UserProfile) => void;
}

interface Asteroid {
  id: number;
  mathProblem: string;
  correctAnswer: number;
  options: number[];
  xPos: number; // 10% to 90%
}

const MATH_ASTEROIDS = [
  { problem: '7 × 8', answer: 56, options: [54, 56, 64, 48] },
  { problem: 'sen(30°)', answer: 0.5, options: [0.5, 1, 0, 0.7] },
  { problem: '√144', answer: 12, options: [14, 12, 10, 16] },
  { problem: 'cos(0°)', answer: 1, options: [0, 1, -1, 0.5] },
  { problem: '9 × 6', answer: 54, options: [56, 54, 63, 45] },
  { problem: 'sen(90°)', answer: 1, options: [1, 0, 0.5, -1] },
  { problem: '5² + 12²', answer: 169, options: [144, 169, 225, 100] },
  { problem: 'tan(45°)', answer: 1, options: [0, 1, 0.5, 2] },
  { problem: '180° en π', answer: 1, options: [1, 2, 0.5, 4] },
  { problem: '3² + 4²', answer: 25, options: [25, 49, 16, 12] },
];

export const AsteroidBlaster: React.FC<AsteroidBlasterProps> = ({
  user,
  onClose,
  onUpdateUser,
}) => {
  const [score, setScore] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);

  const currentAsteroid = MATH_ASTEROIDS[currentIdx];

  const handleShootOption = (chosen: number) => {
    if (gameOver) return;

    if (chosen === currentAsteroid.answer) {
      // Hit!
      setScore((prev) => prev + 100);
      setEarnedCoins((prev) => prev + 10);

      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#22d3ee', '#ec4899', '#fbbf24'],
      });

      if (currentIdx < MATH_ASTEROIDS.length - 1) {
        setCurrentIdx((prev) => prev + 1);
      } else {
        // Game completed
        setGameOver(true);
        const updated = {
          ...user,
          cosmicCredits: user.cosmicCredits + (score + 100) / 10,
        };
        StorageService.saveUser(updated);
        onUpdateUser(updated);
      }
    } else {
      // Missed
      setGameOver(true);
    }
  };

  const handleRestart = () => {
    setScore(0);
    setCurrentIdx(0);
    setGameOver(false);
    setEarnedCoins(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative max-w-xl w-full p-6 sm:p-8 rounded-3xl cosmic-glass border border-pink-500/40 shadow-[0_0_60px_rgba(236,72,153,0.3)] text-slate-100 flex flex-col justify-between min-h-[480px]"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono-tech uppercase text-pink-400 font-bold tracking-wider">
                MINIJUEGO ARCADE
              </span>
              <h3 className="text-lg font-bold font-heading">
                Asteroides Trigonométricos
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-mono-tech block">PUNTAJE</span>
              <span className="text-base font-mono-tech font-bold text-pink-300">
                {score} PTS
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Playfield Area */}
        {!gameOver && currentAsteroid ? (
          <div className="my-auto py-8 text-center space-y-8">
            {/* Falling Asteroid Problem */}
            <motion.div
              key={currentIdx}
              initial={{ y: -30, scale: 0.8 }}
              animate={{ y: 0, scale: 1 }}
              className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-amber-600 via-rose-700 to-slate-950 p-1 border-2 border-amber-400/60 shadow-[0_0_40px_rgba(245,158,11,0.4)] flex flex-col items-center justify-center relative animate-pulse"
            >
              <Target className="w-6 h-6 text-amber-300 mb-1" />
              <span className="text-2xl font-black font-mono-tech text-white">
                {currentAsteroid.problem}
              </span>
              <span className="text-[10px] font-mono-tech text-amber-300 uppercase mt-1">
                Destruir asteroide
              </span>
            </motion.div>

            {/* Answer Cannons / Options */}
            <div>
              <p className="text-xs text-slate-400 mb-3 font-mono-tech">
                Dispara el láser con el cálculo exacto:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {currentAsteroid.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleShootOption(opt)}
                    className="py-3 rounded-2xl bg-slate-900/90 hover:bg-pink-600/30 text-slate-100 hover:text-pink-200 border border-slate-700 hover:border-pink-400 font-mono-tech font-bold text-lg shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Game Over Screen */
          <div className="my-auto text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 p-1 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>

            <div>
              <h4 className="text-2xl font-black font-heading text-white">
                Misión Arcade Finalizada
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Puntaje total alcanzado: <strong className="text-pink-300 font-mono">{score} pts</strong>
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleRestart}
                className="px-6 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 font-heading font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                JUGAR OTRA VEZ
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-heading font-bold text-xs cursor-pointer"
              >
                CERRAR
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Asteroide {currentIdx + 1} de {MATH_ASTEROIDS.length}</span>
          <span>Recompensa: +10 Créditos por acierto</span>
        </div>
      </motion.div>
    </div>
  );
};
