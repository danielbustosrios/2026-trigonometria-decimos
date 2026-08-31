import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../../services/cloud';
import { StorageService } from '../../services/storageService';
import { UserProfile, StudentMissionProgress, CourseEvent } from '../../types';
import { GALAXIES_DATA } from '../../data/mockData';

export function TeacherDashboard({ user }: { user: UserProfile }) {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [selected, setSelected] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<StudentMissionProgress[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [events, setEvents] = useState(StorageService.getCourseEvents());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  async function refresh() {
    setBusy(true); setError('');
    try { const snapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'student'), limit(500)));
      setStudents(snapshot.docs.map(d => d.data() as UserProfile));
    } catch { setError('No se pudieron cargar los estudiantes. Revisa la conexión y vuelve a intentar.'); }
    finally { setBusy(false); }
  }
  useEffect(() => { if (user.role === 'teacher') void refresh(); }, [user.role]);
  async function inspect(student: UserProfile) {
    setSelected(student); setProgress([]); setBusy(true); setError('');
    try { const snapshot = await getDocs(collection(db, 'users', student.id, 'progress'));
      setProgress(snapshot.docs.map(d => d.data() as StudentMissionProgress));
    } catch { setError('No se pudieron consultar los avances.'); }
    finally { setBusy(false); }
  }
  function saveEvents(next: CourseEvent[]) { StorageService.saveCourseEvents(next); setEvents(next); }
  if (user.role !== 'teacher') return null;
  return <section className="max-w-6xl mx-auto p-6 space-y-6">
    <header className="flex justify-between gap-4"><div><h1 className="text-3xl font-bold">Panel docente</h1><p className="text-slate-300 mt-2">Estudiantes y avances reales del curso. Los indicadores corresponden a práctica, no a notas oficiales.</p></div>
      <button className="text-cyan-300 underline" disabled={busy} onClick={() => void refresh()}>Actualizar</button></header>
    {error && <p role="alert" className="text-amber-300">{error}</p>}
    {busy && <p role="status">Consultando datos…</p>}
    <label className="block">Buscar estudiante o grupo<input className="block mt-2 w-full p-3 rounded-xl bg-slate-900 border border-slate-700" value={search} onChange={e => setSearch(e.target.value)} /></label>
    {!busy && !students.length && <p className="bg-slate-900 p-6 rounded-2xl">Aún no hay estudiantes con perfil completado. Aparecerán aquí cuando verifiquen su correo e ingresen.</p>}
    <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr><th className="p-3">Estudiante</th><th>Grupo</th><th>XP</th><th>Avances</th></tr></thead><tbody>
      {students.filter(s => (s.name + ' ' + s.lastName + ' ' + s.courseGroup).toLowerCase().includes(search.toLowerCase())).map(s =>
        <tr key={s.id} className="border-t border-slate-700"><td className="p-3">{s.name} {s.lastName}</td><td>{s.courseGroup}</td><td>{s.xp}</td><td><button disabled={busy} className="text-cyan-300 underline" onClick={() => void inspect(s)}>Consultar</button></td></tr>)}
    </tbody></table></div>
    {selected && <section className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-3"><h2 className="text-xl font-bold">Avances de {selected.name} {selected.lastName}</h2>
      {!busy && !progress.length && <p>Sin misiones completadas todavía.</p>}
      {progress.map(p => <p key={p.missionId}>{GALAXIES_DATA.flatMap(g => g.missions).find(m => m.id === p.missionId)?.title || p.missionId}: {p.stars} estrellas · {p.attemptsCount} intentos · {p.highScore} XP</p>)}
    </section>}
    <section className="bg-slate-900 p-6 rounded-2xl space-y-4"><h2 className="text-2xl font-bold">Actividades y avisos</h2>
      <p className="text-slate-300">Publica indicaciones para tus estudiantes. Se muestran en Misiones Semanales al volver a ingresar.</p>
      <form className="space-y-3" onSubmit={e => { e.preventDefault(); if (!title.trim() || !description.trim()) return;
        saveEvents([...events, { id: crypto.randomUUID(), title: title.trim(), description: description.trim(), active: true, multiplierXP: 1, remainingHours: 0, bannerColor: 'cyan' }]);
        setTitle(''); setDescription('');
      }}>
        <label className="block">Título<input required maxLength={100} value={title} onChange={e => setTitle(e.target.value)} className="block w-full mt-1 p-3 bg-slate-950 rounded-xl" /></label>
        <label className="block">Indicaciones<textarea required maxLength={2000} value={description} onChange={e => setDescription(e.target.value)} className="block w-full mt-1 p-3 bg-slate-950 rounded-xl" /></label>
        <button className="rounded-xl bg-cyan-400 text-slate-950 px-5 py-3 font-bold">Publicar actividad</button>
      </form>
      {events.map(event => <div key={event.id} className="border-t border-slate-700 pt-3"><strong>{event.title}</strong><p>{event.description}</p>
        <button className="text-cyan-300 underline" onClick={() => saveEvents(events.map(item => item.id === event.id ? { ...item, active: !item.active } : item))}>{event.active ? 'Desactivar' : 'Activar'}</button></div>)}
    </section>
  </section>;
}
