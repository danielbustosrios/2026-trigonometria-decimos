import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { onIdTokenChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signOut, type User } from 'firebase/auth';
import { auth, authReady } from '../../services/cloud';
import { StorageService } from '../../services/storageService';
import { CosmicBackground } from '../common/CosmicBackground';

const messageFor = (error: unknown) => {
  const code = (error as { code?: string })?.code;
  if (code === 'auth/too-many-requests') return 'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.';
  if (code === 'auth/network-request-failed') return 'No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.';
  if (code === 'auth/weak-password') return 'Usa una contraseña de al menos 8 caracteres.';
  if (code === 'permission-denied') return 'No se pudo acceder a tus datos. Contacta al docente para revisar los permisos.';
  return 'No se pudo completar la operación. Revisa los datos o recupera tu contraseña.';
};

export function SyncStatus() {
  const state = useSyncExternalStore(StorageService.subscribe, StorageService.getSyncState);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (StorageService.getSyncState() !== 'saved') { event.preventDefault(); event.returnValue = ''; }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);
  return <div role="status" className="relative z-50 bg-slate-900 text-slate-300 text-center text-xs p-2">
    {state === 'saved' ? 'Avances guardados en tu cuenta · Progreso privado' : state === 'saving' ? 'Guardando avances… No cierres la página.' : 'No se guardaron todos los avances. Mantén esta página abierta.'}
    {state === 'error' && <button className="underline ml-3 text-amber-300" onClick={() => void StorageService.flush()}>Reintentar guardado</button>}
  </div>;
}

export function SessionGate({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<User | null>(null);
  const [phase, setPhase] = useState<'loading' | 'login' | 'verify' | 'profile' | 'ready' | 'error'>('loading');
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [group, setGroup] = useState('10-1');

  useEffect(() => {
    let active = true;
    let generation = 0;
    const unsubscribe = onIdTokenChanged(auth, async user => {
      // Refreshing a token must not discard pending writes or reset a live lesson.
      if (user?.emailVerified && StorageService.isAuthenticated()) return;
      const current = ++generation;
      setAccount(user);
      setPhase('loading');
      StorageService.clear();
      try {
        await authReady;
        if (!active || current !== generation) return;
        if (!user) { setPhase('login'); return; }
        if (!user.emailVerified) { setPhase('verify'); return; }
        const profile = await StorageService.load(user);
        if (active && current === generation) setPhase(profile ? 'ready' : 'profile');
      } catch (error) {
        if (active && current === generation) { setNotice(messageFor(error)); setPhase('error'); }
      }
    });
    return () => { active = false; generation++; unsubscribe(); };
  }, []);

  async function run(action: () => Promise<unknown>) {
    setBusy(true); setNotice('');
    try { await action(); } catch (error) { setNotice(messageFor(error)); }
    finally { setBusy(false); }
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    await run(async () => {
      await authReady;
      if (phase === 'profile' && account) {
        await StorageService.load(account, { name, lastName, courseGroup: group, nickname });
        setPhase('ready'); return;
      }
      if (mode === 'reset') {
        await sendPasswordResetEmail(auth, email.trim());
        setNotice('Si el correo tiene una cuenta, recibirás un enlace de recuperación. Revisa también spam.');
      } else if (mode === 'register') {
        const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
        setPassword('');
        await sendEmailVerification(result.user);
        setNotice('Te enviamos un correo de verificación. Revisa también spam.');
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        setPassword('');
      }
    });
  }
  if (phase === 'ready' && account) return <React.Fragment key={account.uid}><SyncStatus />{children}</React.Fragment>;
  const field = 'block w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white mt-2';
  const button = 'w-full rounded-xl bg-cyan-400 text-slate-950 font-bold px-5 py-3 disabled:opacity-50';
  return <main className="relative min-h-screen bg-[#020617] text-white flex items-center justify-center p-5">
    <CosmicBackground />
    <div className="relative z-10 max-w-5xl w-full grid md:grid-cols-2 gap-10 items-center py-12">
      <section><p className="text-cyan-300 tracking-widest text-sm mb-5">MATEMÁTICAS · GRADO DÉCIMO</p>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">Tu viaje por la <span className="text-cyan-300">trigonometría</span></h1>
        <p className="text-slate-300 mt-6 text-lg">Explora, practica y aprende a partir de cada intento. Tus misiones y avances te esperan aquí.</p>
        <p className="text-sm text-slate-400 mt-8">Institución Educativa Carlos Vieco Ortiz · 2026</p>
        <a className="inline-block text-cyan-300 underline mt-5" href="https://daniel-bustos.vercel.app/#laboratorio">Volver al laboratorio</a>
      </section>
      <section className="rounded-3xl bg-slate-900/90 border border-slate-700 p-7 space-y-5">
        <h2 className="text-2xl font-bold">{phase === 'verify' ? 'Verifica tu correo' : phase === 'profile' ? 'Completa tu perfil' : phase === 'loading' ? 'Conectando…' : mode === 'register' ? 'Crear cuenta de estudiante' : mode === 'reset' ? 'Recuperar contraseña' : 'Entrar al curso'}</h2>
        {phase === 'verify' && <><p className="text-slate-300">Abre el enlace enviado a {account?.email}. Solo podrás ingresar después de verificarlo.</p>
          <button disabled={busy} className={button} onClick={() => void run(async () => { await account!.reload(); await account!.getIdToken(true); if (!account!.emailVerified) setNotice('El correo todavía no aparece verificado.'); })}>Ya verifiqué mi correo</button>
          <button disabled={busy} className="underline text-cyan-300" onClick={() => void run(async () => { await sendEmailVerification(account!); setNotice('Correo enviado. Revisa tu bandeja y spam.'); })}>Reenviar verificación</button></>}
        {(phase === 'login' || phase === 'profile') && <form onSubmit={submit} className="space-y-4">
          {phase === 'profile' ? <>
            <label className="block">Nombres<input className={field} required maxLength={60} value={name} onChange={e => setName(e.target.value)} /></label>
            <label className="block">Apellidos<input className={field} required maxLength={60} value={lastName} onChange={e => setLastName(e.target.value)} /></label>
            <label className="block">Alias para el ranking<input className={field} required maxLength={30} value={nickname} onChange={e => setNickname(e.target.value)} placeholder="Por ejemplo: AstroAzul" /></label>
            <label className="block">Grupo<select className={field} value={group} onChange={e => setGroup(e.target.value)}>{['10-1','10-2','10-3','10-4','10-5','Otro','Docente'].map(g => <option key={g}>{g}</option>)}</select></label>
            <p className="text-xs text-slate-400">Tu nombre, grupo y respuestas serán privados para ti y el docente. Tus compañeros del curso podrán ver tu alias y puntos en el ranking: elige un alias sin apellidos ni datos personales. El grupo «Docente» no concede permisos.</p>
          </> : <>
            <label className="block">Correo electrónico<input className={field} type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
            {mode !== 'reset' && <label className="block">Contraseña<input className={field} type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={mode === 'register' ? 8 : undefined} required value={password} onChange={e => setPassword(e.target.value)} /></label>}
          </>}
          <button disabled={busy || (phase === 'profile' && (!name.trim() || !lastName.trim() || !nickname.trim()))} className={button}>{busy ? 'Un momento…' : phase === 'profile' ? 'Guardar y comenzar' : mode === 'register' ? 'Crear cuenta' : mode === 'reset' ? 'Enviar enlace' : 'Ingresar'}</button>
        </form>}
        {phase === 'login' && <div className="flex flex-wrap gap-4 text-sm text-cyan-300">{(['login','register','reset'] as const).filter(m => m !== mode).map(m => <button disabled={busy} key={m} className="underline" onClick={() => { setMode(m); setNotice(''); setPassword(''); }}>{m === 'login' ? 'Iniciar sesión' : m === 'register' ? 'Crear cuenta' : 'Olvidé mi contraseña'}</button>)}</div>}
        {notice && <p role="status" className="rounded-xl bg-slate-800 p-3 text-amber-200 text-sm">{notice}</p>}
        {phase === 'error' && <button className={button} onClick={() => window.location.reload()}>Reintentar conexión</button>}
        {account && phase !== 'loading' && <button disabled={busy} className="text-slate-400 underline text-sm" onClick={() => void run(() => signOut(auth))}>Salir de esta cuenta</button>}
      </section>
    </div>
  </main>;
}
