import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  Radio,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Sparkles,
  Award,
  Zap,
  BarChart3,
  Calendar,
  Layers,
  HelpCircle,
  Flame,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { UserProfile, LeaderboardEntry, ClassErrorStat, CourseEvent } from '../../types';
import { MOCK_STUDENTS, CLASS_ERROR_STATS } from '../../data/mockData';
import { StorageService } from '../../services/storageService';

interface TeacherDashboardProps {
  user: UserProfile;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user }) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [searchStudent, setSearchStudent] = useState<string>('');
  const [inspectedStudent, setInspectedStudent] = useState<LeaderboardEntry | null>(null);
  const [events, setEvents] = useState<CourseEvent[]>(StorageService.getCourseEvents());

  const allStudents = MOCK_STUDENTS;

  // Filter students
  const filteredStudents = allStudents.filter((s) => {
    if (selectedGroup !== 'all' && s.courseGroup !== selectedGroup) return false;
    if (
      searchStudent &&
      !s.name.toLowerCase().includes(searchStudent.toLowerCase()) &&
      !s.nickname.toLowerCase().includes(searchStudent.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Calculate cohort KPIs
  const totalStudentsCount = allStudents.length;
  const activeThisWeek = allStudents.filter((s) => s.streakDays > 0).length;
  const totalXPAccumulated = allStudents.reduce((acc, s) => acc + s.allTimeXP, 0);
  const avgLevel = (
    allStudents.reduce((acc, s) => acc + s.level, 0) / Math.max(1, totalStudentsCount)
  ).toFixed(1);

  // Chart 1: Progress per Galaxy across the course
  const galaxyMasteryData = [
    { name: 'G1: Aritmética', dominado: 95, proceso: 5 },
    { name: 'G2: Jerarquía', dominado: 88, proceso: 12 },
    { name: 'G3: Reales', dominado: 80, proceso: 20 },
    { name: 'G4: Pitágoras', dominado: 74, proceso: 26 },
    { name: 'G5: Razones SOH', dominado: 68, proceso: 32 },
    { name: 'G6: Circunf.', dominado: 55, proceso: 45 },
    { name: 'G7: Funciones', dominado: 48, proceso: 52 },
    { name: 'G8: Identidades', dominado: 40, proceso: 60 },
    { name: 'G9: Ángulos', dominado: 32, proceso: 68 },
  ];

  // Chart 2: Activity Trend throughout the week
  const activityTrendData = [
    { day: 'Lun', misiones: 42, precision: 88 },
    { day: 'Mar', misiones: 58, precision: 90 },
    { day: 'Mié', misiones: 65, precision: 85 },
    { day: 'Jue', misiones: 80, precision: 87 },
    { day: 'Vie', misiones: 94, precision: 89 },
    { day: 'Sáb', misiones: 52, precision: 92 },
    { day: 'Dom', misiones: 61, precision: 91 },
  ];

  const handleToggleEvent = (eventId: string) => {
    const updated = events.map((e) =>
      e.id === eventId ? { ...e, active: !e.active } : e
    );
    setEvents(updated);
    StorageService.saveCourseEvents(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-mono-tech uppercase tracking-widest text-emerald-400 font-bold">
              PANEL DE CONTROL DOCENTE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-wide mt-1">
            Laboratorio de trigonometría Vieco • Diagnóstico Grado 10°
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Monitoreo en tiempo real de desempeño, curvas de aprendizaje y diagnóstico conceptual de la cohorte.
          </p>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-xs font-mono-tech text-emerald-300">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Periodo Académico 2026</span>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl cosmic-glass border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono-tech uppercase text-slate-400 block">
              Total Estudiantes
            </span>
            <span className="text-2xl font-black font-mono-tech text-white">
              {totalStudentsCount}
            </span>
            <p className="text-[11px] text-emerald-400 mt-1">100% de la cohorte enrolada</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Users className="w-6 h-6 text-cyan-400" />
          </div>
        </div>

        <div className="p-5 rounded-3xl cosmic-glass border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono-tech uppercase text-slate-400 block">
              Activos Esta Semana
            </span>
            <span className="text-2xl font-black font-mono-tech text-cyan-300">
              {activeThisWeek}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Participación activa en misiones</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Flame className="w-6 h-6 text-cyan-400" />
          </div>
        </div>

        <div className="p-5 rounded-3xl cosmic-glass border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono-tech uppercase text-slate-400 block">
              XP Total Acumulado
            </span>
            <span className="text-2xl font-black font-mono-tech text-purple-300">
              {totalXPAccumulated.toLocaleString()}
            </span>
            <p className="text-[11px] text-purple-400 mt-1">Cristales estelares ganados</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-purple-400" />
          </div>
        </div>

        <div className="p-5 rounded-3xl cosmic-glass border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono-tech uppercase text-slate-400 block">
              Nivel Promedio
            </span>
            <span className="text-2xl font-black font-mono-tech text-emerald-300">
              Nivel {avgLevel}
            </span>
            <p className="text-[11px] text-emerald-400 mt-1">Avance sostenido en el mapa</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Section (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Galaxy Mastery Chart */}
        <div className="lg:col-span-7 p-6 rounded-3xl cosmic-glass border border-slate-800 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Porcentaje de Dominio por Galaxia Temática
            </h3>
            <p className="text-xs text-slate-400">
              Porcentaje de estudiantes de grado 10° que han superado los sectores curriculares.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={galaxyMasteryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="dominado" name="% Dominado" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                <Bar dataKey="proceso" name="% En Proceso" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity & Precision Trend Chart */}
        <div className="lg:col-span-5 p-6 rounded-3xl cosmic-glass border border-slate-800 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              Actividad y Rendimiento Semanal
            </h3>
            <p className="text-xs text-slate-400">
              Misiones resueltas por día y tasa de precisión observada.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityTrendData}>
                <defs>
                  <linearGradient id="colorMisiones" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="misiones"
                  name="Misiones Resueltas"
                  stroke="#a855f7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMisiones)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pedagogical Diagnosis: Most Common Course Errors */}
      <div className="p-6 sm:p-8 rounded-3xl cosmic-glass border border-rose-500/30 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-bold font-mono-tech text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              DIAGNÓSTICO PEDAGÓGICO DE ERRORES
            </div>
            <h3 className="text-xl font-bold font-heading text-white mt-1">
              Errores Conceptuales Más Frecuentes del Grado 10°
            </h3>
          </div>
          <span className="text-xs font-mono-tech text-slate-400 hidden sm:inline">
            Actualizado según últimos intentos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CLASS_ERROR_STATS.map((err, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono-tech mb-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Severidad: {err.severity.toUpperCase()}
                  </span>
                  <span className="text-rose-400 font-bold">{err.errorPercentage}% del curso</span>
                </div>

                <h4 className="text-sm font-bold text-white leading-snug">
                  {err.topic}
                </h4>
              </div>

              <div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${err.errorPercentage}%` }}
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-rose-900/30 text-[11px] text-slate-300">
                  <strong className="text-rose-300 block mb-0.5">Estudiantes Afectados:</strong>
                  {err.affectedStudentsCount} estudiantes requieren refuerzo guiado en este concepto.
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cohort Attempt & Energy Analytics (2-Attempt System Tracking) */}
      {(() => {
        const attemptStats = StorageService.getCohortAttemptStats();
        return (
          <div className="p-6 sm:p-8 rounded-3xl cosmic-glass border border-cyan-500/30 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono-tech uppercase text-cyan-400 font-bold tracking-wider">
                  MÉTRICAS DE INTENTOS Y CONSUMO DE ENERGÍA
                </span>
                <h3 className="text-xl font-bold font-heading text-white mt-1">
                  Eficacia del Sistema de 2 Intentos y Recuperación con Pistas
                </h3>
              </div>
              <span className="text-xs font-mono-tech text-cyan-300 px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 self-start sm:self-auto">
                {attemptStats.totalLogs} respuestas registradas
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 1st Attempt */}
              <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-tech text-emerald-400 font-bold">
                    1er Intento Exitoso
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black font-mono-tech text-white">
                  {attemptStats.firstAttemptPercent}%
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {attemptStats.firstAttemptSuccess} ejercicios resueltos con 100% de XP y sin errores.
                </p>
              </div>

              {/* 2nd Attempt Recovery with Hints */}
              <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-tech text-amber-400 font-bold">
                    Recuperación con Pista (2º Intento)
                  </span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black font-mono-tech text-white">
                  {attemptStats.secondAttemptPercent}%
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {attemptStats.secondAttemptSuccess} ejercicios corregidos exitosamente tras ver la pista pedagógica (sin perder batería).
                </p>
              </div>

              {/* Both Attempts Failed -> Battery Lost */}
              <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-tech text-rose-400 font-bold">
                    Pérdida de Batería (2 Fallos)
                  </span>
                  <Zap className="w-4 h-4 text-rose-400 fill-rose-400" />
                </div>
                <div className="text-2xl font-black font-mono-tech text-white">
                  {attemptStats.failedPercent}%
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {attemptStats.failedAfterTwoAttempts} preguntas requirieron la solución explicada paso a paso (-{attemptStats.totalBatteriesLost} ⚡).
                </p>
              </div>
            </div>
          </div>
        );
      })()}


      {/* Course Event Activator (Gamification Control) */}
      <div className="p-6 rounded-3xl cosmic-glass border border-orange-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono-tech uppercase text-orange-400 font-bold">
              CONTROL DE MOTIVACIÓN
            </span>
            <h3 className="text-lg font-bold font-heading text-white">
              Gestor de Eventos y Bonificaciones del Curso
            </h3>
          </div>
          <span className="text-xs text-slate-400">Activa multiplicadores para motivar a la clase</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {events.map((evt) => (
            <div
              key={evt.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between ${
                evt.active
                  ? 'bg-orange-950/30 border-orange-500/50'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">{evt.title}</span>
                  <span className="text-xs font-mono-tech text-orange-400 font-bold">
                    XP × {evt.multiplierXP}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mb-4">{evt.description}</p>
              </div>

              <button
                onClick={() => handleToggleEvent(evt.id)}
                className={`w-full py-2 rounded-xl text-xs font-bold font-heading transition-colors cursor-pointer ${
                  evt.active
                    ? 'bg-orange-500 text-slate-950 hover:bg-orange-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {evt.active ? 'DESACTIVAR EVENTO' : 'ACTIVAR PARA EL CURSO'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Nómina de Estudiantes ({filteredStudents.length})
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">Todos los grupos</option>
              <option value="10-1">Grupo 10-1</option>
              <option value="10-2">Grupo 10-2</option>
              <option value="10-3">Grupo 10-3</option>
            </select>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                placeholder="Buscar estudiante..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        <div className="rounded-3xl cosmic-glass border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-mono-tech uppercase border-b border-slate-800">
                <tr>
                  <th className="p-4">Estudiante / Nickname</th>
                  <th className="p-4">Grupo</th>
                  <th className="p-4">Nivel & XP</th>
                  <th className="p-4">Nave</th>
                  <th className="p-4">Racha</th>
                  <th className="p-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{st.avatar}</span>
                        <div>
                          <strong className="text-white block">{st.name} {st.lastName}</strong>
                          <span className="text-slate-400 font-mono-tech text-[10px]">
                            @{st.nickname}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono-tech">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {st.courseGroup}
                      </span>
                    </td>
                    <td className="p-4 font-mono-tech">
                      <strong className="text-cyan-300 block">{st.allTimeXP} XP</strong>
                      <span className="text-[10px] text-slate-400">Nivel {st.level}</span>
                    </td>
                    <td className="p-4 font-mono-tech text-purple-300 font-bold">
                      {st.spaceship}
                    </td>
                    <td className="p-4 font-mono-tech text-orange-400">
                      {st.streakDays}d
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setInspectedStudent(st)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Ficha</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Student Inspection Modal */}
      {inspectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-lg w-full p-6 sm:p-8 rounded-3xl cosmic-glass border border-cyan-500/40 space-y-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{inspectedStudent.avatar}</span>
                <div>
                  <h3 className="text-lg font-bold text-white font-heading">
                    {inspectedStudent.name} {inspectedStudent.lastName}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono-tech">
                    @{inspectedStudent.nickname} • Grado {inspectedStudent.courseGroup}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectedStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Performance breakdown */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono-tech">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">NIVEL</span>
                <strong className="text-purple-300 text-sm">{inspectedStudent.level}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">XP HISTÓRICO</span>
                <strong className="text-cyan-300 text-sm">{inspectedStudent.allTimeXP}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">XP SEMANAL</span>
                <strong className="text-emerald-300 text-sm">{inspectedStudent.weeklyXP}</strong>
              </div>
            </div>

            {/* Curricular Mastery Diagnostics */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold font-mono-tech uppercase text-slate-300">
                Desglose Curricular
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                  <span>Tema Dominado: Teorema de Pitágoras</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                  <span>Tema Dominado: Agilidad Aritmética</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300">
                  <span>Por Reforzar: Identidades Trigonométricas</span>
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                </div>
              </div>
            </div>

            <button
              onClick={() => setInspectedStudent(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
            >
              Cerrar Ficha
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
