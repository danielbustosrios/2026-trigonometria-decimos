import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Star, ShieldAlert, Zap, Award } from 'lucide-react';
import { getLevelInfo } from '../../services/storageService';

interface LevelUpModalProps {
  level: number;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ level, onClose }) => {
  const levelInfo = getLevelInfo(level * (level + 1) * 75 - 10);

  useEffect(() => {
    // Launch festive confetti
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#22d3ee', '#8b5cf6', '#ec4899', '#f59e0b'],
    });

    const timer = setTimeout(() => {
      onClose();
    }, 3200);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 cursor-pointer"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 15 }}
          className="relative max-w-md w-full text-center p-8 rounded-3xl cosmic-glass border-2 border-cyan-400/50 shadow-[0_0_80px_rgba(34,211,238,0.4)]"
        >
          {/* Animated Halo */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-full blur-2xl opacity-60 animate-pulse" />

          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 p-[2px] shadow-lg shadow-cyan-500/30 flex items-center justify-center"
          >
            <div className="w-full h-full bg-slate-950 rounded-2xl flex flex-col items-center justify-center">
              <Award className="w-10 h-10 text-cyan-300 animate-bounce" />
            </div>
          </motion.div>

          <p className="text-xs font-mono-tech tracking-[0.3em] uppercase text-cyan-400 font-bold mb-2">
            TRANSMISIÓN DE LA FLOTA
          </p>

          <h2 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-200 to-pink-300 font-heading mb-2">
            ASCENSO DE RANGO
          </h2>

          <div className="inline-block px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200 font-bold font-mono-tech text-lg mb-4">
            NIVEL {level}
          </div>

          <p className="text-2xl font-bold text-white mb-2 font-heading">
            "{levelInfo.title}"
          </p>

          <p className="text-sm text-slate-300 max-w-xs mx-auto mb-6">
            Tus habilidades matemáticas han elevado tu autorización de navegación estelar.
          </p>

          <div className="flex items-center justify-center gap-3 text-xs font-mono-tech text-cyan-300/80">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Reactores calibrados • Nuevos sectores disponibles</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
