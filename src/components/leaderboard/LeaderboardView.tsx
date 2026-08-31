import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/cloud';
import { rankEntries, type RankingEntry } from '../../services/ranking';
import { UserProfile } from '../../types';
import { StorageService } from '../../services/storageService';
import { GALAXIES_DATA } from '../../data/mockData';
export function LeaderboardView({ user }: { user: UserProfile }) {
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  async function refresh() {
    setBusy(true); setError('');
    try { const snapshot = await getDocs(collection(db, 'leaderboard'));
      setEntries(snapshot.docs.map(d => d.data() as RankingEntry));
    } catch { setError('No se pudo cargar el ranking. Revisa tu conexión y vuelve a intentar.'); }
    finally { setBusy(false); }
  }
  useEffect(() => { void refresh(); }, []);
  const ranking = rankEntries(entries);
  const progress = Object.values(StorageService.getAllProgress());
  return <section className="max-w-5xl mx-auto p-6 space-y-6">
    <header className="flex justify-between gap-4"><h1 className="text-3xl font-bold">Ranking del curso</h1><button className="text-cyan-300 underline" disabled={busy} onClick={() => void refresh()}>Actualizar</button></header>
    <p className="text-slate-300">Compara tu posición con tus compañeros. Solo se comparten alias y puntos; las respuestas y los avances detallados son privados. Los XP reflejan práctica, no calificaciones oficiales.</p>
    {busy && <p role="status">Cargando posiciones…</p>}
    {error && <p role="alert" className="text-amber-300">{error}</p>}
    {!busy && !error && !ranking.length && <p>El ranking aparecerá cuando ingresen los primeros estudiantes.</p>}
    {!!ranking.length && <div className="overflow-x-auto bg-slate-900 rounded-2xl p-3"><table className="w-full text-left"><thead><tr><th className="p-3">Posición</th><th>Alias</th><th>XP</th></tr></thead><tbody>{ranking.map(entry => <tr key={entry.id} className={entry.id === user.id ? 'bg-cyan-950 text-cyan-200' : 'border-t border-slate-800'}><td className="p-3">#{entry.rank}</td><td>{entry.nickname}{entry.id === user.id ? ' (tú)' : ''}</td><td>{entry.xp}</td></tr>)}</tbody></table></div>}
    <h2 className="text-2xl font-bold">Mis avances privados</h2>
    <div className="grid grid-cols-3 gap-3">{[['XP', user.xp], ['Misiones', progress.filter(p => p.completed).length], ['Estrellas', StorageService.getTotalStars()]].map(([label,value]) =>
      <div key={label} className="rounded-2xl p-5 bg-slate-900 border border-slate-700"><p className="text-cyan-300">{label}</p><strong className="text-3xl">{value}</strong></div>)}</div>
    {!progress.length && <p>Todavía no has completado una misión. ¡Comienza en el mapa estelar!</p>}
    <ul className="space-y-3">{progress.map(p => <li key={p.missionId} className="p-4 bg-slate-900 rounded-xl">
      <strong>{GALAXIES_DATA.flatMap(g => g.missions).find(m => m.id === p.missionId)?.title || p.missionId}</strong>
      <p className="text-slate-300">{p.stars} estrellas · Mejor puntaje: {p.highScore} · Intentos: {p.attemptsCount}</p>
    </li>)}</ul>
  </section>;
}
