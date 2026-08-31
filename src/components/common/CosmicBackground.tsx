import React, { useMemo } from 'react';

export const CosmicBackground: React.FC = () => {
  // Generate a stable starfield
  const stars = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.2 + 1,
      opacity: Math.random() * 0.7 + 0.3,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#020617]">
      {/* Immersive UI Radial Space Backdrop */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, #312e81 0%, transparent 45%), radial-gradient(circle at 80% 70%, #1e1b4b 0%, transparent 45%), radial-gradient(rgba(255,255,255,0.4) 1px, transparent 0)',
          backgroundSize: '100% 100%, 100% 100%, 50px 50px',
        }}
      />

      {/* Soft cosmic nebula glows */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div
        className="absolute top-1/3 -right-40 w-[700px] h-[700px] bg-indigo-600/15 rounded-full blur-[140px] animate-pulse-glow"
        style={{ animationDelay: '3s' }}
      />
      <div
        className="absolute -bottom-40 left-1/4 w-[650px] h-[650px] bg-violet-600/10 rounded-full blur-[130px] animate-pulse-glow"
        style={{ animationDelay: '1.5s' }}
      />

      {/* Twinkling star field */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white transition-opacity"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            boxShadow: star.size > 2 ? `0 0 8px 1px rgba(34, 211, 238, 0.9)` : undefined,
            animation: `starFloat ${star.duration}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {/* Shooting star accents */}
      <div className="absolute top-16 left-1/3 w-36 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent -rotate-45 opacity-25" />
      <div className="absolute top-2/3 right-1/4 w-48 h-[1px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent -rotate-30 opacity-20" />
    </div>
  );
};

