import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  X,
  Zap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Star,
  Award,
  Timer,
  Volume2,
  Compass,
  Triangle,
  CircleDot,
  MoveUp,
  MoveDown,
  Activity,
  HeartCrack,
  Crown,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { Mission, Question, UserProfile, StudentMissionProgress, QuestionAnswerLog } from '../../types';
import { StorageService, ATTEMPT_CONFIG } from '../../services/storageService';
import { getQuestionHint } from '../../utils/questionHints';

interface MissionPlayerProps {
  mission: Mission;
  user: UserProfile;
  onClose: () => void;
  onComplete: (earnedXP: number, earnedCredits: number, stars: number) => void;
  onOpenRecharge: () => void;
  onUpdateUser: (updated: UserProfile) => void;
}

export const MissionPlayer: React.FC<MissionPlayerProps> = ({
  mission,
  user,
  onClose,
  onComplete,
  onOpenRecharge,
  onUpdateUser,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userErrorsCount, setUserErrorsCount] = useState(0);
  const [isRiskFreeMode, setIsRiskFreeMode] = useState(false);
  const [showZeroBatteryModal, setShowZeroBatteryModal] = useState(false);

  // 2-Attempt System States per Question
  const [currentAttemptNumber, setCurrentAttemptNumber] = useState<number>(1);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number>(2);
  const [isDischargingBattery, setIsDischargingBattery] = useState<boolean>(false);
  const [lastQuestionEarnedXP, setLastQuestionEarnedXP] = useState<number>(0);
  const [wasSecondAttemptSuccess, setWasSecondAttemptSuccess] = useState<boolean>(false);

  // Question Interaction States
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [numberInput, setNumberInput] = useState<string>('');
  const [orderedStepIds, setOrderedStepIds] = useState<string[]>([]);
  const [ratioNumerator, setRatioNumerator] = useState<string>('');
  const [ratioDenominator, setRatioDenominator] = useState<string>('');
  const [graphAmp, setGraphAmp] = useState<number>(1);
  const [graphFreq, setGraphFreq] = useState<number>(1);

  // Result state: 'idle' | 'correct' | 'first_error_hint' | 'second_error_solution' | 'completed'
  const [feedbackState, setFeedbackState] = useState<
    'idle' | 'correct' | 'first_error_hint' | 'second_error_solution' | 'completed'
  >('idle');
  const [celebrationText, setCelebrationText] = useState<string>('¡Trayectoria perfecta!');
  const [earnedXPAccumulator, setEarnedXPAccumulator] = useState(0);
  const [earnedCreditsAccumulator, setEarnedCreditsAccumulator] = useState(0);

  const currentQuestion: Question | undefined = mission.questions[currentIndex];
  const totalQuestions = mission.questions.length;
  const progressPercent = Math.round(((currentIndex) / Math.max(1, totalQuestions)) * 100);

  // Reset question-specific attempt state whenever current question index changes
  useEffect(() => {
    if (currentQuestion?.type === 'order_steps') {
      const shuffled = [...currentQuestion.steps].sort(() => Math.random() - 0.5);
      setOrderedStepIds(shuffled.map((s) => s.id));
    }
    setNumberInput('');
    setSelectedOption(null);
    setRatioNumerator('');
    setRatioDenominator('');
    setGraphAmp(1);
    setGraphFreq(1);
    setCurrentAttemptNumber(1);
    setAttemptsRemaining(2);
    setWasSecondAttemptSuccess(false);
    setFeedbackState('idle');
  }, [currentIndex, currentQuestion]);

  // Check battery at startup
  useEffect(() => {
    if (user.batteries <= 0 && !isRiskFreeMode) {
      setShowZeroBatteryModal(true);
    }
  }, [user.batteries, isRiskFreeMode]);

  const CELEBRATION_MESSAGES = [
    '¡Trayectoria perfecta!',
    '¡Cálculo confirmado!',
    '¡Coordenadas exactas!',
    '¡Motor matemático activado!',
    '¡Propulsión trigonométrica al 100%!',
  ];

  const handleCheckAnswer = () => {
    if (!currentQuestion || feedbackState !== 'idle') return;

    let isCorrect = false;

    switch (currentQuestion.type) {
      case 'mental_math':
        isCorrect = parseFloat(numberInput.trim()) === currentQuestion.correctAnswer;
        break;

      case 'multiple_choice':
        isCorrect = selectedOption === currentQuestion.correctIndex;
        break;

      case 'pythagoras_builder':
        isCorrect = parseFloat(numberInput.trim()) === currentQuestion.correctValue;
        break;

      case 'trig_ratio_builder':
        isCorrect =
          parseFloat(ratioNumerator.trim()) === currentQuestion.correctNumerator &&
          parseFloat(ratioDenominator.trim()) === currentQuestion.correctDenominator;
        break;

      case 'unit_circle_point':
        if (currentQuestion.targetValue === 'coord') {
          isCorrect = selectedOption === 0;
        } else {
          isCorrect = selectedOption === 0;
        }
        break;

      case 'order_steps':
        isCorrect =
          JSON.stringify(orderedStepIds) ===
          JSON.stringify(currentQuestion.correctOrderIds);
        break;

      case 'trig_graph_manipulator':
        isCorrect =
          graphAmp === currentQuestion.targetAmplitude &&
          graphFreq === currentQuestion.targetFrequency;
        break;
    }

    if (isCorrect) {
      // SUCCESS HANDLING
      const isSecondAttempt = currentAttemptNumber === 2;
      setWasSecondAttemptSuccess(isSecondAttempt);

      // Section 20: Award XP (100% on 1st attempt, e.g. +20 XP; 75% on 2nd attempt, e.g. +15 XP)
      const multiplier = isSecondAttempt
        ? ATTEMPT_CONFIG.SECOND_ATTEMPT_XP_MULTIPLIER
        : ATTEMPT_CONFIG.FIRST_ATTEMPT_XP_MULTIPLIER;
      const baseXP = isRiskFreeMode ? 0 : currentQuestion.pointsXP;
      const finalXP = Math.round(baseXP * multiplier);
      const credits = isRiskFreeMode ? 0 : currentQuestion.pointsCredits;

      setLastQuestionEarnedXP(finalXP);
      setEarnedXPAccumulator((prev) => prev + finalXP);
      setEarnedCreditsAccumulator((prev) => prev + credits);

      // Section 21: Record Data Log
      const answerLog: QuestionAnswerLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        questionId: currentQuestion.id,
        studentId: user.id,
        missionId: mission.id,
        numberOfAttempts: currentAttemptNumber,
        correct: true,
        firstAttemptCorrect: !isSecondAttempt,
        batteryLost: false,
        timestamp: new Date().toISOString(),
      };
      StorageService.saveQuestionLog(answerLog);

      // Trigger celebration
      const randomMsg =
        CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];
      setCelebrationText(randomMsg);
      setFeedbackState('correct');

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#22d3ee', '#8b5cf6', '#38bdf8'],
      });
    } else {
      // INCORRECT ANSWER HANDLING
      if (currentAttemptNumber === 1) {
        // Section 17 & 19: FIRST INCORRECT ATTEMPT
        // Do NOT deduct battery yet!
        // Show pedagogical hint and alert remaining 1 attempt
        setAttemptsRemaining(1);
        setFeedbackState('first_error_hint');
      } else {
        // Section 17 & 19: SECOND INCORRECT ATTEMPT
        // Deduct 1 battery cell
        setAttemptsRemaining(0);
        setUserErrorsCount((prev) => prev + 1);
        setFeedbackState('second_error_solution');

        // Section 21: Record Data Log
        const answerLog: QuestionAnswerLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          questionId: currentQuestion.id,
          studentId: user.id,
          missionId: mission.id,
          numberOfAttempts: 2,
          correct: false,
          firstAttemptCorrect: false,
          batteryLost: !isRiskFreeMode,
          timestamp: new Date().toISOString(),
        };
        StorageService.saveQuestionLog(answerLog);

        if (!isRiskFreeMode) {
          // Trigger battery discharge animation
          setIsDischargingBattery(true);
          setTimeout(() => setIsDischargingBattery(false), 2000);

          const updated = StorageService.deductBattery(user);
          onUpdateUser(updated);

          if (updated.batteries <= 0) {
            setTimeout(() => {
              setShowZeroBatteryModal(true);
            }, 1800);
          }
        }
      }
    }
  };

  // Handler for student trying the question again on Attempt 2
  const handleRetryAfterFirstError = () => {
    setCurrentAttemptNumber(2);
    setFeedbackState('idle');
  };

  const handleNextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setFeedbackState('idle');
    } else {
      // Mission Complete!
      handleFinishMission();
    }
  };

  const handleFinishMission = () => {
    setFeedbackState('completed');

    // Calculate stars:
    // 0 errors -> 3 stars
    // 1 error -> 2 stars
    // 2+ errors -> 1 star
    let calculatedStars = 1;
    if (userErrorsCount === 0) calculatedStars = 3;
    else if (userErrorsCount === 1) calculatedStars = 2;

    const totalXP = earnedXPAccumulator + mission.xpReward;
    const totalCredits = earnedCreditsAccumulator + mission.creditsReward;

    // Save progress
    const progress: StudentMissionProgress = {
      missionId: mission.id,
      completed: true,
      stars: calculatedStars,
      highScore: totalXP,
      attemptsCount: 1,
      errorsCount: userErrorsCount,
      lastAttemptDate: new Date().toISOString(),
    };
    StorageService.saveMissionProgress(progress);

    // Update user stats
    const updatedUser: UserProfile = {
      ...user,
      xp: isRiskFreeMode ? user.xp : user.xp + totalXP,
      cosmicCredits: isRiskFreeMode ? user.cosmicCredits : user.cosmicCredits + totalCredits,
      missionsCompleted: Object.values(StorageService.getAllProgress()).filter(p => p.completed).length,
      exercisesSolved: user.exercisesSolved + totalQuestions,
    };
    StorageService.saveUser(updatedUser);
    onUpdateUser(updatedUser);

    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#fbbf24', '#22d3ee', '#ec4899'],
    });

    onComplete(totalXP, totalCredits, calculatedStars);
  };


  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#020617] text-slate-100 overflow-y-auto">
      {/* Top Mission HUD */}
      <div className="sticky top-0 z-20 w-full border-b border-slate-800/80 cosmic-glass px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Close and Mission Name */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Abandonar misión"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono-tech text-cyan-400 font-bold uppercase tracking-wider">
                MISIÓN {currentIndex + 1} DE {totalQuestions}
              </span>
              {isRiskFreeMode && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  MODO PRÁCTICA SIN RIESGO
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-200 truncate max-w-[200px] sm:max-w-md">
              {mission.title}
            </p>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="flex-1 max-w-xs hidden md:block">
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Live Batteries & Mission XP */}
        <div className="flex items-center gap-3">
          <motion.div
            animate={isDischargingBattery ? { x: [-5, 5, -5, 5, 0], scale: [1, 1.25, 1] } : {}}
            transition={{ duration: 0.5 }}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors ${
              isDischargingBattery
                ? 'bg-rose-950/90 border-rose-500 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.6)]'
                : 'bg-slate-900 border-amber-500/30 text-amber-300'
            }`}
          >
            <Zap
              className={`w-4 h-4 ${
                isDischargingBattery ? 'text-rose-400 fill-rose-400 animate-bounce' : 'text-amber-400 fill-amber-400'
              }`}
            />
            <span className="text-xs font-mono-tech font-bold">
              {user.batteries}/3
            </span>
            {isDischargingBattery && (
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono-tech font-black text-rose-300 whitespace-nowrap bg-rose-950 border border-rose-500 px-2 py-0.5 rounded-md shadow-lg shadow-rose-950">
                -1 BATERÍA ⚡
              </span>
            )}
          </motion.div>

          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/30">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono-tech font-bold text-cyan-300">
              +{earnedXPAccumulator} XP
            </span>
          </div>
        </div>
      </div>

      {/* Main Full-Screen Question Canvas */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center my-auto">
        <AnimatePresence mode="wait">
          {feedbackState === 'completed' ? (
            /* Mission Completed Screen */
            <motion.div
              key="completed"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center p-8 rounded-3xl cosmic-glass border border-cyan-400/40 space-y-6"
            >
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-500 p-1 flex items-center justify-center shadow-lg shadow-amber-500/30 animate-bounce">
                <Crown className="w-12 h-12 text-slate-950" />
              </div>

              <div>
                <p className="text-xs font-mono-tech text-cyan-400 font-bold uppercase tracking-widest">
                  SECTOR COMPLETADO
                </p>
                <h2 className="text-3xl sm:text-4xl font-black font-heading text-white mt-1">
                  ¡Misión Superada con Éxito!
                </h2>
                <p className="text-sm text-slate-300 mt-2">
                  Has demostrado maestría en los conceptos matemáticos de esta ruta estelar.
                </p>
              </div>

              {/* Stars Earned */}
              <div className="flex items-center justify-center gap-3 py-2">
                {[1, 2, 3].map((s) => {
                  const hasStar =
                    userErrorsCount === 0 || (userErrorsCount === 1 && s <= 2) || (s === 1);
                  return (
                    <motion.div
                      key={s}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: s * 0.2, type: 'spring' }}
                    >
                      <Star
                        className={`w-10 h-10 ${
                          hasStar
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                            : 'text-slate-800'
                        }`}
                      />
                    </motion.div>
                  );
                })}
              </div>

              {/* Rewards Summary */}
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/30">
                  <span className="text-[11px] text-slate-400 block">Cristales Estelares</span>
                  <span className="text-xl font-mono-tech font-bold text-cyan-300">
                    +{earnedXPAccumulator + mission.xpReward} XP
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-purple-500/30">
                  <span className="text-[11px] text-slate-400 block">Créditos Cósmicos</span>
                  <span className="text-xl font-mono-tech font-bold text-purple-300">
                    +{earnedCreditsAccumulator + mission.creditsReward} 🪙
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-heading font-extrabold text-base shadow-lg shadow-cyan-500/30 hover:scale-105 transition-all cursor-pointer"
              >
                REGRESAR AL CENTRO DE MANDO
              </button>
            </motion.div>
          ) : currentQuestion ? (
            /* Active Interactive Exercise Screen */
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Section 18: Visual Indicator of Attempts */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono-tech uppercase font-bold tracking-wider text-slate-400">
                    INTENTOS:
                  </span>
                  <div className="flex items-center gap-2.5">
                    {/* Attempt 1 Dot */}
                    <div
                      title={attemptsRemaining >= 1 ? 'Intento 1 activo' : 'Intento 1 consumido'}
                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                        attemptsRemaining >= 1
                          ? attemptsRemaining === 1
                            ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)] ring-2 ring-amber-300/80 animate-pulse'
                            : 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)] ring-2 ring-cyan-300/80'
                          : 'border-2 border-slate-700 bg-slate-900'
                      }`}
                    >
                      {attemptsRemaining >= 1 && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                    </div>

                    {/* Attempt 2 Dot */}
                    <div
                      title={attemptsRemaining >= 2 ? 'Intento 2 disponible' : 'Intento 2 consumido'}
                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                        attemptsRemaining >= 2
                          ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)] ring-2 ring-cyan-300/80'
                          : 'border-2 border-slate-700 bg-slate-900'
                      }`}
                    >
                      {attemptsRemaining >= 2 && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                    </div>
                  </div>
                </div>

                {/* Status badge */}
                <div>
                  {attemptsRemaining === 2 && (
                    <span className="text-[11px] sm:text-xs font-mono-tech font-bold text-cyan-300 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      2 INTENTOS DISPONIBLES • ENERGÍA SEGURA
                    </span>
                  )}
                  {attemptsRemaining === 1 && (
                    <span className="text-[11px] sm:text-xs font-mono-tech font-bold text-amber-300 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center gap-1.5 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      ÚLTIMO INTENTO • RIESGO DE PERDER 1 BATERÍA ⚡
                    </span>
                  )}
                  {attemptsRemaining === 0 && (
                    <span className="text-[11px] sm:text-xs font-mono-tech font-bold text-rose-300 px-3 py-1 rounded-lg bg-rose-500/15 border border-rose-500/40 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                      INTENTOS AGOTADOS • -1 BATERÍA CONSUMIDA
                    </span>
                  )}
                </div>
              </div>

              {/* Question Context & Prompt */}
              <div className="p-6 rounded-3xl cosmic-glass border border-slate-800">
                {currentQuestion.context && (
                  <span className="text-xs font-mono-tech uppercase tracking-wider text-cyan-400 font-semibold px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 mb-3 inline-block">
                    {currentQuestion.context}
                  </span>
                )}
                <h3 className="text-lg sm:text-2xl font-bold font-heading text-white leading-snug">
                  {currentQuestion.prompt}
                </h3>
              </div>


              {/* Dynamic Interactive Activity Engines */}

              {/* 1. MENTAL MATH ENGINE */}
              {currentQuestion.type === 'mental_math' && (
                <div className="p-8 rounded-3xl cosmic-glass border border-cyan-500/30 flex flex-col items-center justify-center space-y-6">
                  <div className="text-4xl sm:text-6xl font-black font-mono-tech text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-200 to-pink-300 tracking-wider">
                    {currentQuestion.numA} {currentQuestion.operator} {currentQuestion.numB} = ?
                  </div>

                  {/* Input field & quick keypad */}
                  <div className="w-full max-w-xs space-y-4">
                    <input
                      type="number"
                      value={numberInput}
                      onChange={(e) => setNumberInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCheckAnswer()}
                      placeholder="Escribe tu cálculo..."
                      className="w-full text-center text-2xl font-mono-tech font-bold py-3 rounded-2xl bg-slate-900 border-2 border-cyan-500/40 text-cyan-300 focus:outline-none focus:border-cyan-400 shadow-inner"
                      autoFocus
                    />

                    {/* Fast Keypad */}
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setNumberInput((prev) => prev + num)}
                          className="py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-mono-tech font-bold text-lg border border-slate-800 hover:border-cyan-500/40 transition-colors"
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setNumberInput('')}
                        className="col-span-2 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-mono-tech font-bold text-xs border border-rose-500/40"
                      >
                        BORRAR
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. MULTIPLE CHOICE ENGINE */}
              {currentQuestion.type === 'multiple_choice' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedOption(idx)}
                        className={`p-5 rounded-2xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] text-white scale-[1.02]'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono-tech font-bold ${
                              isSelected
                                ? 'bg-cyan-400 text-slate-950'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="text-base font-semibold">{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 3. PYTHAGORAS THEOREM BUILDER */}
              {currentQuestion.type === 'pythagoras_builder' && (
                <div className="p-6 rounded-3xl cosmic-glass border border-cyan-500/30 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* Visual Right Triangle SVG Canvas */}
                  <div className="relative p-6 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center min-h-[220px]">
                    <svg viewBox="0 0 240 180" className="w-full max-w-[200px] h-auto">
                      {/* Right Triangle */}
                      <polygon
                        points="40,150 200,150 40,30"
                        fill="rgba(34, 211, 238, 0.1)"
                        stroke="#22d3ee"
                        strokeWidth="3"
                      />
                      {/* 90 deg corner box */}
                      <polyline
                        points="40,135 55,135 55,150"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="2"
                      />
                      {/* Labels */}
                      <text x="20" y="95" fill="#38bdf8" fontSize="14" fontWeight="bold">
                        {currentQuestion.catetoA !== undefined
                          ? `a = ${currentQuestion.catetoA}`
                          : 'a = ?'}
                      </text>
                      <text x="110" y="170" fill="#38bdf8" fontSize="14" fontWeight="bold">
                        {currentQuestion.catetoB !== undefined
                          ? `b = ${currentQuestion.catetoB}`
                          : 'b = ?'}
                      </text>
                      <text x="130" y="80" fill="#ec4899" fontSize="14" fontWeight="bold">
                        {currentQuestion.hipotenusa !== undefined
                          ? `c = ${currentQuestion.hipotenusa}`
                          : 'c = ? (Hipotenusa)'}
                      </text>
                    </svg>

                    <div className="mt-2 text-xs font-mono-tech text-purple-300 font-semibold text-center">
                      Fórmula: a² + b² = c²
                    </div>
                  </div>

                  {/* Calculation Input */}
                  <div className="space-y-4">
                    <p className="text-xs text-slate-300">
                      Calcula el valor exacto del lado faltante:{' '}
                      <span className="text-pink-400 font-bold">
                        {currentQuestion.targetSide === 'hipotenusa'
                          ? 'Hipotenusa (c)'
                          : 'Cateto faltante'}
                      </span>
                    </p>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={numberInput}
                        onChange={(e) => setNumberInput(e.target.value)}
                        placeholder="Valor del lado..."
                        className="flex-1 text-center text-xl font-mono-tech font-bold py-3 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 focus:outline-none focus:border-cyan-400"
                      />
                      <span className="text-sm font-mono-tech text-slate-400">
                        {currentQuestion.unit}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
                      💡 Consejo: Eleva al cuadrado los catetos conocidos y calcula la raíz cuadrada resultante.
                    </div>
                  </div>
                </div>
              )}

              {/* 4. TRIGONOMETRIC RATIO BUILDER (SOH-CAH-TOA) */}
              {currentQuestion.type === 'trig_ratio_builder' && (
                <div className="p-6 rounded-3xl cosmic-glass border border-cyan-500/30 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* Triangle representation */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center">
                    <p className="text-xs font-mono-tech text-cyan-400 font-bold mb-2">
                      Triángulo Rectángulo • Ángulo {currentQuestion.triangle.angleLabel}
                    </p>
                    <div className="space-y-1.5 text-xs text-slate-300 w-full max-w-[200px]">
                      <div className="flex justify-between p-1.5 rounded bg-slate-900">
                        <span>Cateto Opuesto:</span>
                        <strong className="text-cyan-300">{currentQuestion.triangle.opposite}</strong>
                      </div>
                      <div className="flex justify-between p-1.5 rounded bg-slate-900">
                        <span>Cateto Adyacente:</span>
                        <strong className="text-purple-300">{currentQuestion.triangle.adjacent}</strong>
                      </div>
                      <div className="flex justify-between p-1.5 rounded bg-slate-900">
                        <span>Hipotenusa:</span>
                        <strong className="text-pink-300">{currentQuestion.triangle.hypotenuse}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Fraction Constructor */}
                  <div className="space-y-4 text-center">
                    <p className="text-xs text-slate-300 font-medium">
                      Construye la razón{' '}
                      <strong className="text-cyan-300 uppercase">
                        {currentQuestion.targetRatio}({currentQuestion.triangle.angleLabel})
                      </strong>{' '}
                      como una fracción [ Numerador / Denominador ]:
                    </p>

                    <div className="inline-flex flex-col items-center gap-2">
                      <input
                        type="number"
                        value={ratioNumerator}
                        onChange={(e) => setRatioNumerator(e.target.value)}
                        placeholder="Numerador"
                        className="w-32 text-center text-lg font-mono-tech font-bold py-2 rounded-xl bg-slate-900 border border-cyan-500/50 text-cyan-300 focus:outline-none focus:border-cyan-400"
                      />
                      <div className="w-36 h-1 bg-slate-600 rounded-full" />
                      <input
                        type="number"
                        value={ratioDenominator}
                        onChange={(e) => setRatioDenominator(e.target.value)}
                        placeholder="Denominador"
                        className="w-32 text-center text-lg font-mono-tech font-bold py-2 rounded-xl bg-slate-900 border border-cyan-500/50 text-cyan-300 focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="text-[11px] font-mono-tech text-slate-400">
                      {currentQuestion.targetRatio === 'sin' && 'Seno = Opuesto / Hipotenusa (SOH)'}
                      {currentQuestion.targetRatio === 'cos' && 'Coseno = Adyacente / Hipotenusa (CAH)'}
                      {currentQuestion.targetRatio === 'tan' && 'Tangente = Opuesto / Adyacente (TOA)'}
                    </div>
                  </div>
                </div>
              )}

              {/* 5. UNIT CIRCLE ENGINE */}
              {currentQuestion.type === 'unit_circle_point' && (
                <div className="p-6 rounded-3xl cosmic-glass border border-emerald-500/30 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="relative p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center">
                    <svg viewBox="0 0 200 200" className="w-48 h-48">
                      {/* Unit Circle */}
                      <circle cx="100" cy="100" r="70" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />
                      {/* Axes */}
                      <line x1="20" y1="100" x2="180" y2="100" stroke="#475569" strokeWidth="1.5" />
                      <line x1="100" y1="20" x2="100" y2="180" stroke="#475569" strokeWidth="1.5" />
                      {/* 90 deg Point */}
                      <circle cx="100" cy="30" r="6" fill="#22d3ee" className="animate-ping" />
                      <circle cx="100" cy="30" r="5" fill="#22d3ee" />
                      <text x="110" y="30" fill="#22d3ee" fontSize="12" fontWeight="bold">
                        90° (0, 1)
                      </text>
                      <text x="175" y="115" fill="#94a3b8" fontSize="10">0° (1, 0)</text>
                      <text x="10" y="115" fill="#94a3b8" fontSize="10">180° (-1, 0)</text>
                    </svg>
                    <span className="text-xs font-mono-tech text-emerald-400 mt-2">
                      Circunferencia Unitaria (r = 1)
                    </span>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs text-slate-300">
                      Selecciona las coordenadas (x, y) = (cos θ, sen θ) para el ángulo de {currentQuestion.angleDeg}°:
                    </p>
                    {[
                      { label: '(0, 1)', desc: 'x = cos(90°) = 0, y = sen(90°) = 1' },
                      { label: '(1, 0)', desc: 'x = cos(0°) = 1, y = sen(0°) = 0' },
                      { label: '(-1, 0)', desc: 'x = cos(180°) = -1, y = sen(180°) = 0' },
                      { label: '(0, -1)', desc: 'x = cos(270°) = 0, y = sen(270°) = -1' },
                    ].map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedOption(i)}
                        className={`w-full p-3 rounded-xl text-left border transition-all cursor-pointer ${
                          selectedOption === i
                            ? 'bg-emerald-500/20 border-emerald-400 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        <strong className="text-sm font-mono-tech block">{opt.label}</strong>
                        <span className="text-[10px] text-slate-400">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. ORDER PROOF STEPS ENGINE */}
              {currentQuestion.type === 'order_steps' && (
                <div className="p-6 rounded-3xl cosmic-glass border border-purple-500/30 space-y-4">
                  <p className="text-xs text-purple-300 font-semibold">
                    Reordena los pasos lógicos de arriba hacia abajo usando los botones de posición:
                  </p>

                  <div className="space-y-2">
                    {orderedStepIds.map((stepId, idx) => {
                      const stepObj = currentQuestion.steps.find((s) => s.id === stepId);
                      return (
                        <div
                          key={stepId}
                          className="p-3 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-mono-tech font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-xs sm:text-sm text-slate-200">
                              {stepObj?.text}
                            </span>
                          </div>

                          {/* Move up / down buttons */}
                          <div className="flex gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => {
                                const copy = [...orderedStepIds];
                                [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]];
                                setOrderedStepIds(copy);
                              }}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30"
                            >
                              <MoveUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === orderedStepIds.length - 1}
                              onClick={() => {
                                const copy = [...orderedStepIds];
                                [copy[idx + 1], copy[idx]] = [copy[idx], copy[idx + 1]];
                                setOrderedStepIds(copy);
                              }}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30"
                            >
                              <MoveDown className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 7. TRIG GRAPH WAVE ENGINE */}
              {currentQuestion.type === 'trig_graph_manipulator' && (
                <div className="p-6 rounded-3xl cosmic-glass border border-amber-500/30 space-y-6">
                  {/* Waveform Visualization Canvas */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 relative h-48 flex items-center justify-center overflow-hidden">
                    <svg viewBox="0 0 300 120" className="w-full h-full">
                      {/* Axes */}
                      <line x1="0" y1="60" x2="300" y2="60" stroke="#334155" strokeWidth="1.5" />
                      <line x1="150" y1="0" x2="150" y2="120" stroke="#334155" strokeWidth="1.5" />
                      {/* Dynamic Sine Wave */}
                      <path
                        d={Array.from({ length: 300 })
                          .map((_, x) => {
                            const y =
                              60 - graphAmp * 15 * Math.sin(((x - 150) * graphFreq * Math.PI) / 60);
                            return `${x === 0 ? 'M' : 'L'} ${x} ${y}`;
                          })
                          .join(' ')}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="3"
                      />
                    </svg>

                    <div className="absolute bottom-2 left-4 text-xs font-mono-tech text-amber-300 font-bold bg-slate-900/80 px-2.5 py-1 rounded-md">
                      Función: y = {graphAmp} sen({graphFreq > 1 ? `${graphFreq}x` : 'x'})
                    </div>
                  </div>

                  {/* Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Amplitud (A):</span>
                        <strong className="text-amber-400 font-mono-tech">{graphAmp}</strong>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="4"
                        step="1"
                        value={graphAmp}
                        onChange={(e) => setGraphAmp(parseInt(e.target.value))}
                        className="w-full accent-amber-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Frecuencia (B):</span>
                        <strong className="text-amber-400 font-mono-tech">{graphFreq}</strong>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="1"
                        value={graphFreq}
                        onChange={(e) => setGraphFreq(parseInt(e.target.value))}
                        className="w-full accent-amber-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action & Educational Feedback Strip */}
              {feedbackState === 'idle' && (
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleCheckAnswer}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-heading font-extrabold text-sm sm:text-base tracking-wide shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    <span>COMPROBAR COORDENADAS</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* SUCCESS FEEDBACK CARD */}
              {feedbackState === 'correct' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.25)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold font-heading text-emerald-200">
                        {celebrationText}
                      </h4>
                      <p className="text-xs text-emerald-300/90 font-mono-tech flex items-center gap-2 mt-0.5">
                        <span>+{lastQuestionEarnedXP} XP</span>
                        <span>•</span>
                        <span>+{isRiskFreeMode ? 0 : currentQuestion.pointsCredits} Créditos Cósmicos</span>
                        {wasSecondAttemptSuccess && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 font-sans font-semibold">
                            Completado en 2º intento (+75% XP)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    className="self-end sm:self-center px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-extrabold text-sm shadow-md shadow-emerald-500/30 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                  >
                    <span>SIGUIENTE DESAFÍO</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* Section 19: FIRST ERROR - PEDAGOGICAL HINT (NO BATTERY LOST) */}
              {feedbackState === 'first_error_hint' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-amber-950/80 border border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)] space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
                      <div>
                        <h4 className="text-base font-bold font-heading text-amber-200">
                          Primer intento fallido
                        </h4>
                        <p className="text-xs text-amber-300/90 font-medium">
                          Te queda 1 intento antes de perder energía.
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono-tech text-cyan-300 font-bold px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 self-start sm:self-auto">
                      ⚡ Batería protegida (0 daño)
                    </span>
                  </div>

                  {/* Pedagogical Clue Box */}
                  <div className="p-4 rounded-xl bg-slate-950/90 border border-amber-500/30 text-xs sm:text-sm text-slate-200 space-y-2">
                    <p className="font-bold text-amber-300 font-mono-tech flex items-center gap-1.5 text-xs uppercase tracking-wider">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      Pista Pedagógica para tu segundo intento
                    </p>
                    <p className="leading-relaxed text-slate-300 font-sans">
                      {getQuestionHint(currentQuestion)}
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-1">
                    <button
                      onClick={handleRetryAfterFirstError}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-heading font-extrabold text-sm shadow-md shadow-amber-500/30 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>INTENTAR DE NUEVO (INTENTO 2/2)</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Section 19: SECOND ERROR - FULL STEP-BY-STEP SOLUTION & BATTERY LOST */}
              {feedbackState === 'second_error_solution' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-rose-950/80 border border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.25)] space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-500/20 pb-3">
                    <div className="flex items-center gap-2.5">
                      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      <div>
                        <h4 className="text-base font-bold font-heading text-rose-200">
                          ENERGÍA PERDIDA
                        </h4>
                        <p className="text-xs text-rose-300/90 font-medium">
                          Has agotado tus 2 intentos en este ejercicio.
                        </p>
                      </div>
                    </div>
                    {!isRiskFreeMode && (
                      <span className="text-xs font-mono-tech text-rose-200 font-black px-2.5 py-1 rounded-lg bg-rose-600/30 border border-rose-500 shadow-md shadow-rose-900/50 self-start sm:self-auto flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 fill-rose-300" />
                        -1 Batería de Reactor ⚡
                      </span>
                    )}
                  </div>

                  {/* Step-by-step pedagogical explanation */}
                  <div className="p-4 rounded-xl bg-slate-950/90 border border-rose-900/40 text-xs sm:text-sm text-slate-200 space-y-2">
                    <p className="font-bold text-cyan-300 font-mono-tech flex items-center gap-1.5 text-xs uppercase tracking-wider">
                      <HelpCircle className="w-4 h-4 text-cyan-400" />
                      Solución Explicada Paso a Paso
                    </p>
                    <p className="whitespace-pre-line leading-relaxed text-slate-300 font-sans">
                      {currentQuestion.explanation}
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-1">
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-heading font-extrabold text-sm shadow-md shadow-rose-500/30 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                    >
                      <span>CONTINUAR RUTA</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* ZERO BATTERIES MODAL */}
      {showZeroBatteryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full p-6 sm:p-8 rounded-3xl cosmic-glass border border-amber-500/50 text-center space-y-6"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
              <Zap className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>

            <div>
              <h3 className="text-2xl font-bold font-heading text-white">
                Tu nave necesita energía
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Has consumido tus 3 baterías en intentos de navegación. Puedes recargarlas resolviendo puzzles en la Estación de Recarga o continuar practicando sin riesgo de penalización.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowZeroBatteryModal(false);
                  onClose();
                  onOpenRecharge();
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-heading font-black text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                ESTACIÓN DE RECARGA (RESTAURAR REACTOR)
              </button>

              <button
                onClick={() => {
                  setIsRiskFreeMode(true);
                  setShowZeroBatteryModal(false);
                }}
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-heading font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-emerald-400" />
                PRACTICAR SIN RIESGO (MODO ESTUDIO)
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
