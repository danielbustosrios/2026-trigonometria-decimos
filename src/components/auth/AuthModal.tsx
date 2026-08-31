import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Rocket,
  Shield,
  KeyRound,
  UserCheck,
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
} from 'lucide-react';
import { UserProfile } from '../../types';
import { INITIAL_STUDENT_USER, INITIAL_TEACHER_USER } from '../../data/mockData';
import { StorageService } from '../../services/storageService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password' | 'teacher_code'>('login');
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    nickname: '',
    courseGroup: '10-1',
    email: '',
    password: '',
    teacherPasscode: '',
    resetEmail: '',
    newPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.nickname || !formData.password) {
      setError('Por favor completa todos los campos requeridos de la tripulación.');
      return;
    }

    const newUser: UserProfile = {
      id: 'student-' + Date.now(),
      email: formData.email,
      name: formData.name,
      lastName: formData.lastName,
      nickname: formData.nickname,
      courseGroup: formData.courseGroup,
      role: 'student', // Strictly student by default, no role selection
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
      unlockedItems: ['item-avatar-cadet', 'item-ship-alfa', 'item-trail-cyan', 'item-game-puzzle'],
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
    onClose();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Ingresa tu correo institucional y contraseña de acceso.');
      return;
    }

    // Authenticate with stored user or demo student
    const existing = StorageService.getUser();
    if (existing.email.toLowerCase() === formData.email.toLowerCase()) {
      StorageService.setAuthenticated(true);
      onLoginSuccess(existing);
      onClose();
    } else {
      // Simulate quick successful login with entered email
      const user: UserProfile = {
        ...INITIAL_STUDENT_USER,
        email: formData.email,
        name: formData.email.split('@')[0],
      };
      StorageService.saveUser(user);
      StorageService.setAuthenticated(true);
      onLoginSuccess(user);
      onClose();
    }
  };

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.teacherPasscode === 'VIECO2026' || formData.teacherPasscode.trim() === '1234') {
      StorageService.saveUser(INITIAL_TEACHER_USER);
      StorageService.setAuthenticated(true);
      onLoginSuccess(INITIAL_TEACHER_USER);
      onClose();
    } else {
      setError('Código de seguridad docente inválido. Usa la clave demo: VIECO2026');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.resetEmail) {
      setError('Ingresa tu correo institucional registrado.');
      return;
    }
    setResetSent(true);
    setSuccessMsg('Código cuántico enviado a ' + formData.resetEmail + '.');
  };

  const handleSetNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.newPassword) {
      setError('Ingresa la nueva contraseña.');
      return;
    }
    setSuccessMsg('¡Contraseña actualizada con éxito! Ahora puedes iniciar sesión.');
    setMode('login');
    setResetSent(false);
  };

  const handleDemoStudent = () => {
    StorageService.saveUser(INITIAL_STUDENT_USER);
    StorageService.setAuthenticated(true);
    onLoginSuccess(INITIAL_STUDENT_USER);
    onClose();
  };

  const handleDemoTeacher = () => {
    StorageService.saveUser(INITIAL_TEACHER_USER);
    StorageService.setAuthenticated(true);
    onLoginSuccess(INITIAL_TEACHER_USER);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl cosmic-glass border border-cyan-500/30 shadow-[0_0_60px_rgba(34,211,238,0.25)] text-slate-100 my-8"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm bg-slate-900 border border-slate-700 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
        >
          ✕
        </button>

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-[2px] shadow-lg shadow-cyan-500/30">
            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
              <Orbit className="w-8 h-8 text-cyan-400 animate-spin" style={{ animationDuration: '15s' }} />
            </div>
          </div>

          <p className="text-xs font-mono-tech tracking-[0.25em] uppercase text-cyan-400 font-bold mb-1">
            EXPLORACIÓN MATEMÁTICA GRADO 10°
          </p>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-200 to-pink-300">
            Laboratorio de trigonometría Vieco
          </h1>
          <p className="text-sm text-slate-300 mt-1 font-medium">
            "Tu misión comienza aquí."
          </p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-4 rounded-xl bg-slate-900/90 p-1 border border-slate-800 mb-6 gap-1">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
              setSuccessMsg(null);
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
              setSuccessMsg(null);
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
              setSuccessMsg(null);
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
              setSuccessMsg(null);
            }}
            className={`py-2 px-1 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1 ${
              mode === 'teacher_code'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-emerald-400 hover:text-emerald-300'
            }`}
            title="Acceso docente verificado"
          >
            <GraduationCap className="w-3.5 h-3.5 hidden sm:inline" />
            Docente
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Forms */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="estudiante@colegio.edu.co"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Contraseña de Navegante
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot_password')}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-heading font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Rocket className="w-4 h-4" />
              INGRESAR AL CENTRO DE MANDO
            </button>
          </form>
        )}

        {mode === 'forgot_password' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs text-amber-300">
              <p className="font-semibold mb-1">Recuperar Acceso</p>
              <p className="text-[11px] text-amber-300/80">
                Ingresa tu correo institucional para restablecer tu clave de acceso.
              </p>
            </div>

            {!resetSent ? (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Correo Registrado
                  </label>
                  <input
                    type="email"
                    value={formData.resetEmail}
                    onChange={(e) => setFormData({ ...formData, resetEmail: e.target.value })}
                    placeholder="estudiante@colegio.edu.co"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-heading font-bold text-xs tracking-wide shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  ENVIAR CÓDIGO DE RECUPERACIÓN
                </button>
              </form>
            ) : (
              <form onSubmit={handleSetNewPassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    placeholder="Nueva clave de acceso"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-heading font-bold text-xs tracking-wide shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  GUARDAR Y VOLVER AL INGRESO
                </button>
              </form>
            )}
          </div>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Valencia"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nickname de Navegante
                </label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, courseGroup: e.target.value })}
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
                Correo Electrónico Institucional
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="m.valencia@colegio.edu.co"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            {/* Granted Initial Package preview */}
            <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-300 flex items-center justify-between">
              <span className="flex items-center gap-1 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Paquete de Cadete:
              </span>
              <span>🚀 Nave Alfa • ⚡ 3 Baterías • 💎 100 Créditos</span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-heading font-bold text-xs tracking-wide shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Rocket className="w-4 h-4" />
              REGISTRAR Y COMENZAR MISIÓN
            </button>
          </form>
        )}

        {mode === 'teacher_code' && (
          <form onSubmit={handleTeacherLogin} className="space-y-4">
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300">
              <p className="font-semibold mb-1">Portal de Comando Docente</p>
              <p className="text-[11px] text-emerald-400/90">
                El acceso docente está protegido por clave institucional para inspeccionar estadísticas, errores del curso y eventos.
              </p>
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
                  onChange={(e) => setFormData({ ...formData, teacherPasscode: e.target.value })}
                  placeholder="Ingresa clave o usa VIECO2026"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-emerald-700/50 text-sm text-slate-100 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Clave de demostración: <span className="text-emerald-300 font-mono">VIECO2026</span></p>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-heading font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              ACCEDER AL PANEL DEL PROFESOR
            </button>
          </form>
        )}

        {/* Quick Demo Profiles for fast visual evaluation */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-400 text-center font-mono-tech mb-3 uppercase tracking-wider">
            Perfiles Rápidos de Evaluación
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleDemoStudent}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-cyan-500/30 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">👨‍🚀</span>
                <div>
                  <p className="text-xs font-bold text-cyan-300 group-hover:text-cyan-200">
                    AstroMateo (10-1)
                  </p>
                  <p className="text-[10px] text-slate-400">Modo Estudiante • Nivel 4</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={handleDemoTeacher}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-emerald-500/30 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🧑‍🏫</span>
                <div>
                  <p className="text-xs font-bold text-emerald-300 group-hover:text-emerald-200">
                    Prof. Carlos Vieco
                  </p>
                  <p className="text-[10px] text-slate-400">Panel Docente • Grado 10°</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
