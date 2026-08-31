import { UserProfile, StudentMissionProgress, LeaderboardEntry, WeeklyChallenge, CourseEvent, RewardItem, QuestionAnswerLog } from '../types';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { signOut, type User } from 'firebase/auth';
import { auth, db } from './cloud';
import { publicRankingEntry } from './ranking';

export const ATTEMPT_CONFIG = {
  MAX_ATTEMPTS_PER_QUESTION: 2,
  FIRST_ATTEMPT_XP_MULTIPLIER: 1.0, // 100% XP on 1st attempt (e.g. +20 XP)
  SECOND_ATTEMPT_XP_MULTIPLIER: 0.75, // 75% XP on 2nd attempt (e.g. +15 XP)
  BATTERIES_LOST_ON_TWO_ERRORS: 1,
};


// Level XP Thresholds
export function getLevelInfo(xp: number) {
  // Exponential scale
  // Level 1: 0 - 150
  // Level 2: 150 - 350
  // Level 3: 350 - 650
  // Level 4: 650 - 1050
  // Level 5: 1050 - 1550
  // Level 6: 1550 - 2150
  // Level 7: 2150 - 2850
  // Level 8: 2850 - 3650
  // Level 9: 3650 - 4550
  // Level 10: 4550+
  let level = 1;
  let prevThreshold = 0;
  let nextThreshold = 150;

  for (let lvl = 1; lvl <= 50; lvl++) {
    const threshold = lvl * (lvl + 1) * 75;
    if (xp < threshold) {
      level = lvl;
      nextThreshold = threshold;
      prevThreshold = lvl === 1 ? 0 : (lvl - 1) * lvl * 75;
      break;
    }
  }

  const xpInCurrentLevel = Math.max(0, xp - prevThreshold);
  const xpNeededForLevel = nextThreshold - prevThreshold;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForLevel) * 100));

  const titles: Record<number, string> = {
    1: 'Cadete Espacial',
    2: 'Navegante Inicial',
    3: 'Explorador Aritmético',
    4: 'Piloto Pitagórico',
    5: 'Astro-Geómetra',
    6: 'Alférez Trigonométrico',
    7: 'Comandante de Órbita',
    8: 'Capitán de Ondas',
    9: 'Almirante del Cosmos',
    10: 'Maestro del Multiverso',
  };

  const title = titles[level] || (level > 10 ? 'Guardián del Hiperespacio' : 'Cadete Espacial');

  return {
    level,
    title,
    xpInCurrentLevel,
    xpNeededForLevel,
    progressPercent,
    prevThreshold,
    nextThreshold,
  };
}


type SyncState = 'saved' | 'saving' | 'error';
let profile: UserProfile | null = null;
let progress: Record<string, StudentMissionProgress> = {};
let logs: QuestionAnswerLog[] = [];
let challenges: WeeklyChallenge[] = [];
let events: CourseEvent[] = [];
let syncState: SyncState = 'saved';
const subscribers = new Set<() => void>();
let queue: Array<{ uid: string; path: string; data: object }> = [];
let draining = false;
const publish = (state: SyncState) => { syncState = state; subscribers.forEach(fn => fn()); };
const clean = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export class StorageService {
  static subscribe = (fn: () => void) => { subscribers.add(fn); return () => { subscribers.delete(fn); }; };
  static getSyncState = () => syncState;
  static isAuthenticated() { return !!profile && auth.currentUser?.uid === profile.id && auth.currentUser.emailVerified; }
  static clear() { profile = null; progress = {}; logs = []; challenges = []; events = []; queue = []; publish('saved'); }
  static async logout() {
    if (draining) throw new Error('Espera a que termine el guardado.');
    if (queue.length) { await this.flush(); if (queue.length) throw new Error('Hay avances sin guardar. Reintenta antes de cerrar sesión.'); }
    await signOut(auth);
    this.clear();
  }
  static async load(account: User, identity?: { name: string; lastName: string; courseGroup: string; nickname?: string }) {
    if (!account.emailVerified) throw new Error('Verifica tu correo antes de ingresar.');
    const uid = account.uid;
    const [teacher, saved, missions, answers, weekly, courseEvents] = await Promise.all([
      getDoc(doc(db, 'teachers', uid)), getDoc(doc(db, 'users', uid)),
      getDocs(collection(db, 'users', uid, 'progress')),
      getDocs(collection(db, 'users', uid, 'answers')),
      getDocs(collection(db, 'weeklyChallenges')), getDocs(collection(db, 'courseEvents')),
    ]);
    if (auth.currentUser?.uid !== uid) return null;
    const role = teacher.data()?.role === 'teacher' ? 'teacher' : 'student';
    if (!saved.exists() && !identity) return null;
    const user = saved.exists() ? { ...saved.data(), id: uid, email: account.email!, role } as UserProfile : {
      id: uid, email: account.email!, name: identity!.name.trim(), lastName: identity!.lastName.trim(),
      nickname: identity!.nickname?.trim() || ('Navegante-' + uid.slice(-6)), courseGroup: identity!.courseGroup, role,
      avatar: '👨‍🚀', spaceship: 'Alfa', level: 1, xp: 0, cosmicCredits: 100, batteries: 3,
      streakDays: 0, lastActiveDate: new Date().toISOString(), galaxiesExplored: 0, missionsCompleted: 0,
      exercisesSolved: 0, accuracy: 0, bestStreak: 0,
      unlockedItems: ['item-avatar-cadet', 'item-ship-alfa', 'item-trail-cyan', 'item-game-puzzle'],
      equippedItems: { avatar: '👨‍🚀', spaceship: 'Alfa', trail: 'Plasma Cian', banner: '' }, badges: [],
    } satisfies UserProfile;
    if (!saved.exists()) await setDoc(doc(db, 'users', uid), user);
    if (auth.currentUser?.uid !== uid) return null;
    profile = user;
    progress = Object.fromEntries(missions.docs.map(d => [d.id, d.data() as StudentMissionProgress]));
    logs = answers.docs.map(d => d.data() as QuestionAnswerLog);
    challenges = weekly.docs.map(d => d.data() as WeeklyChallenge);
    events = courseEvents.docs.map(d => d.data() as CourseEvent);
    publish('saved');
    if (user.role === 'student') this.enqueue('leaderboard/' + uid, publicRankingEntry(user));
    return user;
  }
  static getUser(): UserProfile {
    if (!profile) throw new Error('Debes iniciar sesión.');
    return clean(profile);
  }
  private static enqueue(path: string, data: object) {
    const uid = this.getUser().id;
    queue.push({ uid, path, data: clean(data) });
    publish('saving');
    void this.flush();
  }
  static async flush() {
    if (draining) return;
    draining = true;
    try {
      while (queue.length) {
        const job = queue[0];
        if (auth.currentUser?.uid !== job.uid) throw new Error('Sesión cambiada');
        await setDoc(doc(db, job.path), job.data);
        if (queue[0] === job) queue.shift();
      }
      publish('saved');
    } catch { publish('error'); }
    finally { draining = false; }
  }
  static saveUser(user: UserProfile) {
    const current = this.getUser();
    if (user.id !== current.id) throw new Error('Cuenta incorrecta');
    profile = { ...clean(user), id: current.id, email: current.email, role: current.role };
    profile.level = getLevelInfo(profile.xp).level;
    if (JSON.stringify(profile) === JSON.stringify(current)) return;
    this.enqueue('users/' + current.id, profile);
    if (profile.role === 'student') this.enqueue('leaderboard/' + current.id, publicRankingEntry(profile));
  }
  static getAllProgress() { return clean(progress); }
  static saveMissionProgress(value: StudentMissionProgress) {
    const previous = progress[value.missionId];
    const next = { ...value, completed: value.completed || !!previous?.completed,
      stars: Math.max(value.stars, previous?.stars || 0),
      highScore: Math.max(value.highScore, previous?.highScore || 0),
      attemptsCount: (previous?.attemptsCount || 0) + 1 };
    progress[next.missionId] = next;
    this.enqueue('users/' + this.getUser().id + '/progress/' + next.missionId, next);
  }
  static getTotalStars() { return Object.values(progress).reduce((sum, p) => sum + p.stars, 0); }
  static getLeaderboard(): LeaderboardEntry[] { return []; }
  static getWeeklyChallenges() { return clean(challenges); }
  static saveWeeklyChallenges(next: WeeklyChallenge[]) {
    if (this.getUser().role !== 'teacher') throw new Error('Solo docentes');
    challenges = clean(next);
    next.forEach(c => this.enqueue('weeklyChallenges/' + c.id, c));
  }
  static getCourseEvents() { return clean(events); }
  static saveCourseEvents(next: CourseEvent[]) {
    if (this.getUser().role !== 'teacher') throw new Error('Solo docentes');
    events = clean(next);
    next.forEach(e => this.enqueue('courseEvents/' + e.id, e));
  }
  static rechargeOneBattery(user: UserProfile): UserProfile {
    const updated = {
      ...user,
      batteries: Math.min(3, user.batteries + 1),
    };
    this.saveUser(updated);
    return updated;
  }

  static deductBattery(user: UserProfile): UserProfile {
    const updated = {
      ...user,
      batteries: Math.max(0, user.batteries - 1),
    };
    this.saveUser(updated);
    return updated;
  }

  static buyRewardItem(user: UserProfile, item: RewardItem): { success: boolean; updatedUser: UserProfile; message: string } {
    if (user.unlockedItems.includes(item.id)) {
      return { success: false, updatedUser: user, message: '¡Ya posees este elemento!' };
    }

    if (user.cosmicCredits < item.priceCredits) {
      return {
        success: false,
        updatedUser: user,
        message: `Te faltan ${item.priceCredits - user.cosmicCredits} Créditos Cósmicos para adquirir esto.`,
      };
    }

    const updatedUser: UserProfile = {
      ...user,
      cosmicCredits: user.cosmicCredits - item.priceCredits,
      unlockedItems: [...user.unlockedItems, item.id],
    };

    this.saveUser(updatedUser);
    return { success: true, updatedUser, message: `¡Has desbloqueado ${item.title}!` };
  }

  static equipItem(user: UserProfile, item: RewardItem): UserProfile {
    const equipped = { ...user.equippedItems };
    let avatar = user.avatar;
    let spaceship = user.spaceship;

    if (item.type === 'avatar') {
      avatar = item.title;
      equipped.avatar = item.title;
    } else if (item.type === 'spaceship') {
      spaceship = item.title;
      equipped.spaceship = item.title;
    } else if (item.type === 'trail') {
      equipped.trail = item.title;
    } else if (item.type === 'banner') {
      equipped.banner = item.title;
    }

    const updatedUser: UserProfile = {
      ...user,
      avatar,
      spaceship,
      equippedItems: equipped,
    };

    this.saveUser(updatedUser);
    return updatedUser;
  }


  static getQuestionLogs() { return clean(logs); }
  static saveQuestionLog(log: QuestionAnswerLog) {
    const own = { ...log, studentId: this.getUser().id };
    logs.push(own);
    this.enqueue('users/' + own.studentId + '/answers/' + own.id, own);
  }
  static getQuestionLogsForStudent(id: string) { return logs.filter(l => l.studentId === id); }
  static getCohortAttemptStats() {
    const totalLogs = logs.length;
    const firstAttemptSuccess = logs.filter(l => l.firstAttemptCorrect).length;
    const secondAttemptSuccess = logs.filter(l => !l.firstAttemptCorrect && l.correct).length;
    const failedAfterTwoAttempts = logs.filter(l => !l.correct && l.numberOfAttempts >= 2).length;
    const percent = (n: number) => totalLogs ? Math.round(100 * n / totalLogs) : 0;
    return { totalLogs, firstAttemptSuccess, secondAttemptSuccess, failedAfterTwoAttempts,
      totalBatteriesLost: logs.filter(l => l.batteryLost).length,
      firstAttemptPercent: percent(firstAttemptSuccess), secondAttemptPercent: percent(secondAttemptSuccess),
      failedPercent: percent(failedAfterTwoAttempts) };
  }
}

