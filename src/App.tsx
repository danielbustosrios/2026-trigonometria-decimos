import React, { useState } from 'react';
import { CosmicBackground } from './components/common/CosmicBackground';
import { Navbar, ActiveTab } from './components/layout/Navbar';
import { LevelUpModal } from './components/common/LevelUpModal';
import { StudentHome } from './components/dashboard/StudentHome';
import { StarMap } from './components/map/StarMap';
import { MissionPlayer } from './components/mission/MissionPlayer';
import { RechargeStation } from './components/recharge/RechargeStation';
import { CosmicMarket } from './components/market/CosmicMarket';
import { AsteroidBlaster } from './components/arcade/AsteroidBlaster';
import { MemoryTrig } from './components/arcade/MemoryTrig';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { ChallengesView } from './components/challenges/ChallengesView';
import { StudentProfile } from './components/profile/StudentProfile';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { UserProfile, Mission } from './types';
import { StorageService, getLevelInfo } from './services/storageService';

export const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(() => StorageService.getUser());
  const [activeTab, setActiveTab] = useState<ActiveTab>(user.role === 'teacher' ? 'teacher' : 'home');
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [activeArcade, setActiveArcade] = useState<'asteroid' | 'memory' | null>(null);
  const [levelUpEvent, setLevelUpEvent] = useState<number | null>(null);

  const [logoutError, setLogoutError] = useState('');
  const handleLogout = async () => {
    try { await StorageService.logout(); }
    catch { setLogoutError('No se pudo cerrar sesión: espera a que se guarden tus avances y vuelve a intentarlo.'); }
  };

  // Monitor level up
  const handleUpdateUser = (updated: UserProfile) => {
    const oldLevel = getLevelInfo(user.xp).level;
    const newLevel = getLevelInfo(updated.xp).level;

    setUser(updated);
    StorageService.saveUser(updated);

    if (newLevel > oldLevel) {
      setLevelUpEvent(newLevel);
    }
  };

  const handleLaunchMission = (mission: Mission) => {
    setActiveMission(mission);
  };

  const handleMissionComplete = (earnedXP: number, earnedCredits: number, stars: number) => {
    // Mission completed callback
    const freshUser = StorageService.getUser();
    handleUpdateUser(freshUser);
  };

  return (
    <div className="relative min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Starfield Canvas */}
      <CosmicBackground />

      {/* Main Persistent Top HUD Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onOpenAuth={handleLogout}
      />

      {logoutError && <p role="alert" className="relative z-20 p-4 text-amber-300">{logoutError}</p>}
      {/* Main Viewport Router */}
      <main className="relative z-10 flex-1 pb-16">
        {activeTab === 'home' && (
          <StudentHome
            user={user}
            setActiveTab={setActiveTab}
            onLaunchMission={handleLaunchMission}
          />
        )}

        {activeTab === 'map' && (
          <StarMap
            user={user}
            onSelectMission={handleLaunchMission}
            onOpenRecharge={() => setActiveTab('recharge')}
          />
        )}

        {activeTab === 'recharge' && (
          <RechargeStation
            user={user}
            onUpdateUser={handleUpdateUser}
            onBackToMap={() => setActiveTab('map')}
          />
        )}

        {activeTab === 'market' && (
          <CosmicMarket
            user={user}
            onUpdateUser={handleUpdateUser}
            onLaunchArcade={(game) => setActiveArcade(game)}
          />
        )}

        {activeTab === 'leaderboard' && <LeaderboardView user={user} />}

        {activeTab === 'challenges' && <ChallengesView user={user} />}

        {activeTab === 'profile' && <StudentProfile user={user} onLogout={handleLogout} />}

        {activeTab === 'teacher' && user.role === 'teacher' && <TeacherDashboard user={user} />}
      </main>

      {/* Fullscreen Interactive Mission Player Modal */}
      {activeMission && (
        <MissionPlayer
          mission={activeMission}
          user={user}
          onClose={() => setActiveMission(null)}
          onComplete={handleMissionComplete}
          onOpenRecharge={() => {
            setActiveMission(null);
            setActiveTab('recharge');
          }}
          onUpdateUser={handleUpdateUser}
        />
      )}

      {/* Arcade Games Modals */}
      {activeArcade === 'asteroid' && (
        <AsteroidBlaster
          user={user}
          onClose={() => setActiveArcade(null)}
          onUpdateUser={handleUpdateUser}
        />
      )}

      {activeArcade === 'memory' && (
        <MemoryTrig
          user={user}
          onClose={() => setActiveArcade(null)}
          onUpdateUser={handleUpdateUser}
        />
      )}

      {/* Level Up Fullscreen Celebration */}
      {levelUpEvent && (
        <LevelUpModal
          level={levelUpEvent}
          onClose={() => setLevelUpEvent(null)}
        />
      )}


    </div>
  );
};

export default App;
