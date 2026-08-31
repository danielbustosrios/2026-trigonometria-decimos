import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Trophy,
  RotateCcw,
  X,
  CheckCircle2,
  BrainCircuit,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { StorageService } from '../../services/storageService';

interface MemoryTrigProps {
  user: UserProfile;
  onClose: () => void;
  onUpdateUser: (user: UserProfile) => void;
}

interface CardItem {
  id: number;
  pairId: number;
  content: string;
  isFormula: boolean;
}

const BASE_PAIRS = [
  { pairId: 1, formula: 'sen²(θ) + cos²(θ)', match: '1' },
  { pairId: 2, formula: 'tan(θ)', match: 'sen(θ) / cos(θ)' },
  { pairId: 3, formula: '180°', match: 'π radianes' },
  { pairId: 4, formula: 'cos(0°)', match: '1' },
  { pairId: 5, formula: 'sen(90°)', match: '1' },
  { pairId: 6, formula: 'a² + b²', match: 'c²' },
];

export const MemoryTrig: React.FC<MemoryTrigProps> = ({
  user,
  onClose,
  onUpdateUser,
}) => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const initGame = () => {
    const deck: CardItem[] = [];
    let idCounter = 0;
    BASE_PAIRS.forEach((p) => {
      deck.push({ id: idCounter++, pairId: p.pairId, content: p.formula, isFormula: true });
      deck.push({ id: idCounter++, pairId: p.pairId, content: p.match, isFormula: false });
    });

    // Shuffle
    deck.sort(() => Math.random() - 0.5);
    setCards(deck);
    setFlippedIndices([]);
    setMatchedPairIds([]);
    setMoves(0);
    setIsCompleted(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2) return;
    if (flippedIndices.includes(index)) return;
    if (matchedPairIds.includes(cards[index].pairId)) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const [idx1, idx2] = newFlipped;
      if (cards[idx1].pairId === cards[idx2].pairId) {
        // Matched!
        const nextMatched = [...matchedPairIds, cards[idx1].pairId];
        setMatchedPairIds(nextMatched);
        setFlippedIndices([]);

        if (nextMatched.length === BASE_PAIRS.length) {
          setIsCompleted(true);
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#22d3ee', '#8b5cf6', '#38bdf8'],
          });
          const updated = {
            ...user,
            cosmicCredits: user.cosmicCredits + 100,
            xp: user.xp + 50,
          };
          StorageService.saveUser(updated);
          onUpdateUser(updated);
        }
      } else {
        // Not matched -> flip back after 1s
        setTimeout(() => {
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative max-w-2xl w-full p-6 sm:p-8 rounded-3xl cosmic-glass border border-cyan-500/40 shadow-[0_0_60px_rgba(34,211,238,0.3)] text-slate-100 flex flex-col justify-between"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono-tech uppercase text-cyan-400 font-bold tracking-wider">
                MEMORIA INTERESTELAR
              </span>
              <h3 className="text-lg font-bold font-heading">
                Identidades y Equivalencias
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-mono-tech block">MOVIMIENTOS</span>
              <span className="text-base font-mono-tech font-bold text-cyan-300">
                {moves}
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

        {/* Card Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 my-6">
          {cards.map((card, idx) => {
            const isFlipped =
              flippedIndices.includes(idx) || matchedPairIds.includes(card.pairId);
            const isMatched = matchedPairIds.includes(card.pairId);

            return (
              <motion.button
                key={card.id}
                whileHover={{ scale: isFlipped ? 1 : 1.05 }}
                whileTap={{ scale: isFlipped ? 1 : 0.95 }}
                onClick={() => handleCardClick(idx)}
                className={`h-24 sm:h-28 rounded-2xl p-2 flex flex-col items-center justify-center text-center font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  isMatched
                    ? 'bg-emerald-950/80 border border-emerald-400/80 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : isFlipped
                    ? 'bg-slate-900 border-2 border-cyan-400 text-cyan-300'
                    : 'bg-slate-900/90 border border-slate-700 hover:border-cyan-500/50 text-slate-400'
                }`}
              >
                {isFlipped ? (
                  <div>
                    <span className="font-mono-tech block">{card.content}</span>
                    {isMatched && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mx-auto mt-1" />
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 opacity-50">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    <span className="text-[10px] font-mono-tech">VIECO</span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Footer & Win state */}
        {isCompleted ? (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-400 text-center space-y-2">
            <h4 className="text-base font-bold font-heading text-emerald-200">
              ¡Todas las identidades emparejadas!
            </h4>
            <p className="text-xs text-slate-300">
              +50 XP • +100 Créditos Cósmicos otorgados
            </p>
            <button
              onClick={initGame}
              className="px-6 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs cursor-pointer"
            >
              Jugar de nuevo
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono-tech">
            <span>Parejas encontradas: {matchedPairIds.length} / {BASE_PAIRS.length}</span>
            <button
              onClick={initGame}
              className="hover:text-cyan-300 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reiniciar
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
