import React, { useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  Coins,
  Sparkles,
  Check,
  CheckCircle2,
  Lock,
  Gamepad2,
  Rocket,
  User,
  Palette,
} from 'lucide-react';
import { UserProfile, RewardItem } from '../../types';
import { REWARD_ITEMS } from '../../data/mockData';
import { StorageService } from '../../services/storageService';

interface CosmicMarketProps {
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  onLaunchArcade: (gameType: 'asteroid' | 'memory') => void;
}

export const CosmicMarket: React.FC<CosmicMarketProps> = ({
  user,
  onUpdateUser,
  onLaunchArcade,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'avatar' | 'spaceship' | 'trail' | 'banner' | 'minigame'
  >('all');
  const [purchaseToast, setPurchaseToast] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Todo el Catálogo', icon: ShoppingBag },
    { id: 'avatar', label: 'Avatares', icon: User },
    { id: 'spaceship', label: 'Naves Espaciales', icon: Rocket },
    { id: 'trail', label: 'Estelas de Plasma', icon: Sparkles },
    { id: 'banner', label: 'Estandartes', icon: Palette },
    { id: 'minigame', label: 'Minijuegos Arcade', icon: Gamepad2 },
  ];

  const filteredItems = REWARD_ITEMS.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.type === selectedCategory;
  });

  const handleBuy = (item: RewardItem) => {
    if (user.cosmicCredits < item.priceCredits) return;

    const res = StorageService.buyRewardItem(user, item);
    if (res.success && res.updatedUser) {
      onUpdateUser(res.updatedUser);
      setPurchaseToast(`¡Has adquirido: ${item.title}!`);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#22d3ee', '#ec4899'],
      });

      setTimeout(() => {
        setPurchaseToast(null);
      }, 3000);
    }
  };

  const handleEquip = (item: RewardItem) => {
    const updated = StorageService.equipItem(user, item);
    onUpdateUser(updated);
    setPurchaseToast(`¡Equipado: ${item.title}!`);
    setTimeout(() => {
      setPurchaseToast(null);
    }, 2000);
  };

  const getItemEmoji = (item: RewardItem) => {
    if (item.type === 'avatar') return '👨‍🚀';
    if (item.type === 'spaceship') return '🚀';
    if (item.type === 'trail') return '✨';
    if (item.type === 'banner') return '🌌';
    if (item.type === 'minigame') return '🕹️';
    return '⭐';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-mono-tech uppercase tracking-widest text-purple-400 font-bold">
              ESTACIÓN COMERCIAL
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-wide mt-1">
            Mercado Interestelar
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Canjea tus créditos cósmicos por mejoras cosméticas de flota y acceso a simuladores arcade.
          </p>
        </div>

        {/* User Balance */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-purple-500/30">
          <Coins className="w-6 h-6 text-purple-400" />
          <div>
            <p className="text-xs font-bold text-slate-200">Saldo Disponible</p>
            <p className="text-sm font-mono-tech font-bold text-purple-300">
              {user.cosmicCredits} Créditos Cósmicos
            </p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-purple-500/20 text-purple-300 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Toast */}
      {purchaseToast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-purple-950/80 border border-purple-400 text-purple-200 text-xs font-bold flex items-center justify-between shadow-lg"
        >
          <span>{purchaseToast}</span>
          <Check className="w-4 h-4 text-purple-300" />
        </motion.div>
      )}

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => {
          const isUnlocked = user.unlockedItems.includes(item.id) || item.priceCredits === 0;
          const isAffordable = user.cosmicCredits >= item.priceCredits;
          const isEquipped =
            (item.type === 'avatar' && user.equippedItems.avatar === item.title) ||
            (item.type === 'spaceship' && user.equippedItems.spaceship === item.title) ||
            (item.type === 'trail' && user.equippedItems.trail === item.title) ||
            (item.type === 'banner' && user.equippedItems.banner === item.title);

          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -4 }}
              className="p-5 rounded-3xl cosmic-glass border border-slate-800 hover:border-purple-500/40 flex flex-col justify-between transition-all group relative overflow-hidden"
            >
              <div>
                {/* Visual Icon / Asset Preview */}
                <div className="h-28 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-center text-4xl mb-4 group-hover:scale-105 transition-transform relative">
                  <span>{getItemEmoji(item)}</span>
                  {item.type === 'minigame' && (
                    <span className="absolute top-2 right-2 text-[10px] font-mono-tech px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                      ARCADE
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-base font-bold font-heading text-white">
                    {item.title}
                  </h4>
                  {!isUnlocked && (
                    <span className="flex items-center gap-1 text-xs font-mono-tech font-bold text-purple-300">
                      <Coins className="w-3.5 h-3.5 text-purple-400" />
                      {item.priceCredits}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80">
                {item.type === 'minigame' ? (
                  isUnlocked ? (
                    <button
                      onClick={() =>
                        onLaunchArcade(item.id.includes('asteroid') ? 'asteroid' : 'memory')
                      }
                      className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-pink-600/25 cursor-pointer"
                    >
                      <Gamepad2 className="w-4 h-4" />
                      JUGAR MINIJUEGO
                    </button>
                  ) : (
                    <button
                      disabled={!isAffordable}
                      onClick={() => handleBuy(item)}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <Coins className="w-4 h-4" />
                      DESBLOQUEAR ({item.priceCredits} CR)
                    </button>
                  )
                ) : isUnlocked ? (
                  isEquipped ? (
                    <div className="w-full py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono-tech font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      EQUIPADO
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEquip(item)}
                      className="w-full py-2 rounded-xl bg-slate-800 hover:bg-purple-600/40 text-purple-200 border border-purple-500/30 hover:border-purple-400 text-xs font-bold transition-colors cursor-pointer"
                    >
                      EQUIPAR EN TU NAVE
                    </button>
                  )
                ) : (
                  <button
                    disabled={!isAffordable}
                    onClick={() => handleBuy(item)}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <Coins className="w-4 h-4" />
                    ADQUIRIR ({item.priceCredits} CR)
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
