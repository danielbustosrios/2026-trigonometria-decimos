import React from 'react';
import { UserProfile } from '../../types';
import { StorageService } from '../../services/storageService';
export function ChallengesView({ user }: { user: UserProfile }) {
  const events = StorageService.getCourseEvents().filter(e => e.active);
  return <section className="max-w-5xl mx-auto p-6 space-y-6">
    <h1 className="text-3xl font-bold">Actividades del curso</h1>
    <p className="text-slate-300">Indicaciones del docente para acompañar tu práctica, {user.name}.</p>
    {!events.length && <p className="bg-slate-900 rounded-2xl p-6">No hay actividades adicionales publicadas por el momento. Puedes practicar en el mapa estelar.</p>}
    {events.map(e => <article key={e.id} className="bg-slate-900 border border-cyan-700 rounded-2xl p-6"><h2 className="text-xl font-bold text-cyan-300">{e.title}</h2><p className="mt-3 whitespace-pre-wrap">{e.description}</p></article>)}
  </section>;
}
