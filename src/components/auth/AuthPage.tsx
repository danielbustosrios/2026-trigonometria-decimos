import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Rocket,
  Shield,
  KeyRound,
  Sparkles,
  Zap,
  GraduationCap,
  ChevronRight,
  Orbit,
  Lock,
  Mail,
  User,
  Hash,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Eye,
  EyeOff,
  Compass,
  Trophy,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { INITIAL_STUDENT_USER, INITIAL_TEACHER_USER } from '../../data/mockData';
import { StorageService } from '../../services/storageService';
import { CosmicBackground } from '../common/CosmicBackground';

export type AuthPageMode = 'login' | 'register' | 'forgot_password' | 'teacher_code';

interface AuthPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  initialMode?: AuthPageMode;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onLoginSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<AuthPageMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    nickname: '',
    courseGroup: '10-1',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: true,
    teacherPasscode: '',
    resetEmail: '',
    newPassword: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resetStep, setResetStep] = useState<'request' | 'confirm'>('request');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Por favor ingresa tu correo institucional y contraseña.');
      return;
    }

    // Check existing stored user or authenticate
    const existing = StorageService.getUser();
    if (
      existing &&
      existing.email.toLowerCase() === formData.email.trim().toLowerCase()
    ) {
      StorageService.setAuthenticated(true);
      onLoginSuccess(existing);
      return;
    }

    // Create / simulate user session
    const username = formData.email.split('@')[0];
    const loggedUser: UserProfile = {
      ...INITIAL_STUDENT_USER,
      email: formData.email.trim(),
      name: username.charAt(0).toUpperCase() + username.slice(1),
      nickname: 'Cadete_' + username.slice(0, 8),
    };

    StorageService.saveUser(loggedUser);
    StorageService.setAuthenticated(true);
    onLoginSuccess(loggedUser);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (
      !formData.name.trim() ||
      !formData.lastName.trim() ||
      !formData.nickname.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      setError('Todos los campos son obligatorios para crear tu expediente.');
      return;
    }

    if (formData.password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      setError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    const newUser: UserProfile = {
      id: 'student-' + Date.now(),
      email: formData.email.trim(),
      name: formData.name.trim(),
      lastName: formData.lastName.trim(),
      nickname: formData.nickname.trim(),
      courseGroup: formData.courseGroup,
      role: 'student',
      avatar: '👨‍🚀',
      spaceship: '🚀 Interceptor Alfa',
      level: 1,
      xp: 0,
      cosmicCredits: 100,
      batteries: 3,
      streakDays: 1,
      lastActiveDate: new Date().toISOString(),
      galaxiesExplored: 0,
      missionsCompleted: 0,
      exercisesSolved: 0,
      accuracy: 100,
      bestStreak: 1,
      unlockedItems: [
        'item-avatar-cadet',
        'item-ship-alfa',
        'item-trail-cyan',
        'item-game-puzzle',
      ],
      equippedItems: {
        avatar: '👨‍🚀',
        spaceship: '🚀 Interceptor Alfa',
        trail: 'cyan-plasma',
        banner: 'deep-nebula',
      },
      badges: ['badge-first-galaxy'],
    };

    StorageService.saveUser(newUser);
    StorageService.setAuthenticated(true);
    onLoginSuccess(newUser);
  };

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const code = formData.teacherPasscode.trim().toUpperCase();
    if (code === 'VIECO2026' || code === '1234' || code === 'DOCENTE') {
      StorageService.saveUser(INITIAL_TEACHER_USER);
      StorageService.setAuthenticated(true);
      onLoginSuccess(INITIAL_TEACHER_USER);
    } else {
      setError('Clave de seguridad docente no autorizada. Usa la clave demo: VIECO2026');
    }
  };

  const handleForgotPasswordRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.resetEmail.trim() || !formData.resetEmail.includes('@')) {
      setError('Ingresa un correo institucional válido (@colegio.edu.co).');
      return;
    }

    setResetStep('confirm');
    setSuccessMessage(
      `Se ha enviado un enlace de recuperación cuántica y un código temporal a ${formData.resetEmail}. Ingresa tu nueva contraseña para continuar.`
    );
  };

  const handleSetNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.newPassword.trim() || formData.newPassword.length < 4) {
      setError('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }

    // Successfully reset password
    setSuccessMessage('¡Tu contraseña ha sido restablecida con éxito! Ahora puedes iniciar sesión.');
    setMode('login');
    setResetStep('request');
    setFormData((prev) => ({ ...prev, password: prev.newPassword, email: prev.resetEmail }));
  };

  const handleDemoStudent = () => {
    StorageService.saveUser(INITIAL_STUDENT_USER);
    StorageService.setAuthenticated(true);
    onLoginSuccess(INITIAL_STUDENT_USER);
  };

  const handleDemoTeacher = () => {
    StorageService.saveUser(INITIAL_TEACHER_USER);
    StorageService.setAuthenticated(true);
    onLoginSuccess(INITIAL_TEACHER_USER);
  };

  return (
    <div className="relative min-h-screen bg-[#020617] text-slate-100 flex flex-col justify-center px-4 py-8 sm:py-12 selection:bg-cyan-500 selection:text-slate-950">
      <CosmicBackground />

      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Educational Lore & Features Showcase */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono-tech font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <Orbit className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
            Plataforma Gamificada de Aprendizaje • Grado 10°
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-200 to-purple-300">
              Laboratorio de Trigonometría Vieco
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans max-w-xl">
              Institución Educativa Carlos Vieco Ortiz. Domina el cálculo mental, el Teorema de Pitágoras, las razones trigonométricas y la circunferencia unitaria explorando las galaxias del cosmos.
            </p>
          </div>

          {/* Feature Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5 hover:border-cyan-500/40 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-200 font-heading">Sistema 2 Intentos</h4>
              <p className="text-[11px] text-slate-400 leading-tight">
                Pistas pedagógicas en el primer error que protegen tu batería.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5 hover:border-indigo-500/40 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-200 font-heading">4 Galaxias</h4>
              <p className="text-[11px] text-slate-400 leading-tight">
                Misiones progresivas con retos interactivos y visualizadores.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5 hover:border-purple-500/40 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-200 font-heading">XP & Mercado</h4>
              <p className="text-[11px] text-slate-400 leading-tight">
                Desbloquea naves, avatares, minijuegos y lidera el ranking del curso.
              </p>
            </div>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 to-indigo-950/40 border border-slate-800/80 space-y-2">
            <p className="text-[11px] font-mono-tech uppercase text-slate-400 font-bold tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Acceso Rápido de Evaluación y Demostración:
            </p>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleDemoStudent}
                className="px-3.5 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <span>👨‍🚀</span>
                <span>Entrar como Cadete Mateo (10-1)</span>
              </button>
              <button
                type="button"
                onClick={handleDemoTeacher}
                className="px-3.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <span>🧑‍🏫</span>
                <span>Entrar como Prof. Carlos Vieco</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Authentication Box */}
        <div className="lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full p-6 sm:p-8 rounded-3xl cosmic-glass border border-cyan-500/30 shadow-[0_0_50px_rgba(34,211,238,0.15)] text-slate-100 relative"
          >
            {/* Header Tabs */}
            <div className="grid grid-cols-4 rounded-xl bg-slate-950/80 p-1 border border-slate-800 mb-6 gap-1">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all text-center ${
                  mode === 'login'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Ingreso
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all text-center ${
                  mode === 'register'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Registro
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('forgot_password');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all text-center ${
                  mode === 'forgot_password'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Recordar
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('teacher_code');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1 ${
                  mode === 'teacher_code'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 hidden sm:inline" />
                Docente
              </button>
            </div>

            {/* Error Message Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 mb-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Success Message Alert */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 mb-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMessage}</span>
              </motion.div>
            )}

            {/* 1. INGRESO / INICIAR SESIÓN */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="border-b border-slate-800 pb-2 mb-2">
                  <h3 className="text-lg font-bold font-heading text-white">
                    Iniciar Sesión de Navegante
                  </h3>
                  <p className="text-xs text-slate-400">
                    Accede con tu cuenta institucional de Grado 10°
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Correo Institucional o Usuario
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="estudiante@colegio.edu.co"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300">
                      Contraseña de Acceso
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot_password');
                        setError(null);
                      }}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={(e) =>
                        setFormData({ ...formData, rememberMe: e.target.checked })
                      }
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-400"
                    />
                    <span>Recordar sesión en esta terminal</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-heading font-extrabold text-sm tracking-wide shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <Rocket className="w-4 h-4" />
                  INGRESAR AL CENTRO DE MANDO
                </button>

                <p className="text-center text-xs text-slate-400 pt-2">
                  ¿Aún no tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError(null);
                    }}
                    className="text-cyan-400 font-bold hover:underline cursor-pointer"
                  >
                    Crear cuenta de navegante
                  </button>
                </p>
              </form>
            )}

            {/* 2. REGISTRO / CREAR CUENTA */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="border-b border-slate-800 pb-2 mb-2">
                  <h3 className="text-lg font-bold font-heading text-white">
                    Expediente de Nuevo Navegante
                  </h3>
                  <p className="text-xs text-slate-400">
                    Crea tu cuenta institucional y recibe tu paquete de cadete
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Mateo"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      placeholder="Valencia"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Nickname Cósmico
                    </label>
                    <input
                      type="text"
                      value={formData.nickname}
                      onChange={(e) =>
                        setFormData({ ...formData, nickname: e.target.value })
                      }
                      placeholder="AstroMateo"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Curso / Grupo
                    </label>
                    <select
                      value={formData.courseGroup}
                      onChange={(e) =>
                        setFormData({ ...formData, courseGroup: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                    >
                      <option value="10-1">Grado 10-1</option>
                      <option value="10-2">Grado 10-2</option>
                      <option value="10-3">Grado 10-3</option>
                      <option value="10-A">Grado 10-A</option>
                      <option value="10-B">Grado 10-B</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Correo Institucional
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="m.valencia@colegio.edu.co"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Mínimo 4 caracteres"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Confirmar Contraseña
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, confirmPassword: e.target.value })
                      }
                      placeholder="Repite la contraseña"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                </div>

                {/* Kit Preview */}
                <div className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-800/50 text-[11px] text-cyan-300 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Kit Inicial de Bienvenida:
                  </span>
                  <span>🚀 Nave Alfa • ⚡ 3 Baterías • 💎 100 Créditos</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-heading font-extrabold text-xs tracking-wide shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <Rocket className="w-4 h-4" />
                  REGISTRAR Y COMENZAR MISIÓN
                </button>

                <p className="text-center text-xs text-slate-400 pt-1">
                  ¿Ya tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className="text-cyan-400 font-bold hover:underline cursor-pointer"
                  >
                    Iniciar Sesión
                  </button>
                </p>
              </form>
            )}

            {/* 3. RECORDAR / RECUPERAR CONTRASEÑA */}
            {mode === 'forgot_password' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-2 mb-2">
                  <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2">
                    <RotateCcw className="w-5 h-5 text-amber-400" />
                    Recuperación de Contraseña
                  </h3>
                  <p className="text-xs text-slate-400">
                    Restablece tu clave institucional para recuperar el acceso a tu nave
                  </p>
                </div>

                {resetStep === 'request' ? (
                  <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-700/40 text-xs text-amber-200/90 leading-relaxed">
                      Ingresa el correo institucional con el que te registraste. Te enviaremos un código de restablecimiento cuántico para actualizar tu clave de inmediato.
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Correo Institucional Registrado
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          value={formData.resetEmail}
                          onChange={(e) =>
                            setFormData({ ...formData, resetEmail: e.target.value })
                          }
                          placeholder="estudiante@colegio.edu.co"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-heading font-extrabold text-sm tracking-wide shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4" />
                      ENVIAR CÓDIGO DE RECUPERACIÓN
                    </button>

                    <p className="text-center text-xs text-slate-400 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setMode('login');
                          setError(null);
                        }}
                        className="text-cyan-400 font-bold hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
                      >
                        ← Volver a Iniciar Sesión
                      </button>
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleSetNewPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Nueva Contraseña de Acceso
                      </label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="password"
                          value={formData.newPassword}
                          onChange={(e) =>
                            setFormData({ ...formData, newPassword: e.target.value })
                          }
                          placeholder="Nueva contraseña (mínimo 4 caracteres)"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-heading font-extrabold text-sm tracking-wide shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      GUARDAR NUEVA CONTRASEÑA E INGRESAR
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* 4. ACCESO DOCENTE */}
            {mode === 'teacher_code' && (
              <form onSubmit={handleTeacherLogin} className="space-y-4">
                <div className="border-b border-slate-800 pb-2 mb-2">
                  <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-emerald-400" />
                    Portal de Comando Docente
                  </h3>
                  <p className="text-xs text-slate-400">
                    Inspección diagnóstica de errores, métricas y gestión de eventos
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-700/40 text-xs text-emerald-200/90 leading-relaxed">
                  El panel docente está reservado para profesores de matemáticas. Permite revisar las estadísticas en vivo del curso, el mapa de errores más comunes y activar eventos pedagógicos.
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Clave de Seguridad Docente
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-emerald-400" />
                    <input
                      type="password"
                      value={formData.teacherPasscode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          teacherPasscode: e.target.value,
                        })
                      }
                      placeholder="Ingresa clave o usa VIECO2026"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-emerald-700/50 text-sm text-slate-100 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Clave de demostración rápida:{' '}
                    <span className="text-emerald-300 font-mono font-bold">
                      VIECO2026
                    </span>
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-heading font-extrabold text-sm tracking-wide shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4" />
                  ACCEDER AL PANEL DEL PROFESOR
                </button>
              </form>
            )}
          </motion.div>
        </div>

      </div>
    </div>
  );
};
