import {
  UserProfile,
  StudentMissionProgress,
  LeaderboardEntry,
  WeeklyChallenge,
  CourseEvent,
  RewardItem,
  QuestionAnswerLog,
} from '../types';
import {
  INITIAL_STUDENT_USER,
  INITIAL_TEACHER_USER,
  MOCK_STUDENTS,
  WEEKLY_CHALLENGES,
  COURSE_EVENTS,
  REWARD_ITEMS,
  GALAXIES_DATA,
} from '../data/mockData';

const USER_STORAGE_KEY = 'vieco_trig_user';
const SESSION_AUTH_KEY = 'vieco_trig_session_auth';
const PROGRESS_STORAGE_KEY = 'vieco_trig_progress';
const LEADERBOARD_STORAGE_KEY = 'vieco_trig_leaderboard';
const CHALLENGES_STORAGE_KEY = 'vieco_trig_challenges';
const EVENTS_STORAGE_KEY = 'vieco_trig_events';
const QUESTION_LOGS_STORAGE_KEY = 'vieco_trig_question_logs';

// Configurable Attempt Multipliers
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

export class StorageService {
  static isAuthenticated(): boolean {
    try {
      const auth = localStorage.getItem(SESSION_AUTH_KEY);
      return auth === 'true';
    } catch (e) {
      return false;
    }
  }

  static setAuthenticated(authenticated: boolean) {
    try {
      localStorage.setItem(SESSION_AUTH_KEY, authenticated ? 'true' : 'false');
    } catch (e) {
      console.warn('Could not set session auth in storage');
    }
  }

  static logout() {
    this.setAuthenticated(false);
  }

  static getUser(): UserProfile {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read user from storage, using initial state');
    }
    return INITIAL_STUDENT_USER;
  }

  static saveUser(user: UserProfile) {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      // Update entry in leaderboard too
      this.updateUserInLeaderboard(user);
    } catch (e) {
      console.error('Error saving user to storage', e);
    }
  }

  static getAllProgress(): Record<string, StudentMissionProgress> {
    try {
      const saved = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read progress from storage');
    }

    // Default initial mock progress
    const initialProgress: Record<string, StudentMissionProgress> = {
      'g1-m1': {
        missionId: 'g1-m1',
        completed: true,
        stars: 3,
        highScore: 60,
        attemptsCount: 1,
        errorsCount: 0,
        lastAttemptDate: new Date().toISOString(),
      },
      'g1-m2': {
        missionId: 'g1-m2',
        completed: true,
        stars: 2,
        highScore: 50,
        attemptsCount: 2,
        errorsCount: 1,
        lastAttemptDate: new Date().toISOString(),
      },
      'g1-m3': {
        missionId: 'g1-m3',
        completed: true,
        stars: 3,
        highScore: 40,
        attemptsCount: 1,
        errorsCount: 0,
        lastAttemptDate: new Date().toISOString(),
      },
      'g2-m1': {
        missionId: 'g2-m1',
        completed: true,
        stars: 2,
        highScore: 60,
        attemptsCount: 1,
        errorsCount: 1,
        lastAttemptDate: new Date().toISOString(),
      },
    };
    return initialProgress;
  }

  static saveMissionProgress(progress: StudentMissionProgress) {
    const all = this.getAllProgress();
    all[progress.missionId] = progress;
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(all));
    } catch (e) {
      console.error('Error saving mission progress', e);
    }
  }

  static getTotalStars(): number {
    const all = this.getAllProgress();
    return Object.values(all).reduce((acc, p) => acc + (p.stars || 0), 0);
  }

  static getLeaderboard(): LeaderboardEntry[] {
    try {
      const saved = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read leaderboard');
    }
    return MOCK_STUDENTS;
  }

  static updateUserInLeaderboard(user: UserProfile) {
    const list = this.getLeaderboard();
    const existingIndex = list.findIndex((item) => item.id === user.id || item.nickname === user.nickname);
    const entry: LeaderboardEntry = {
      id: user.id,
      nickname: user.nickname,
      name: user.name,
      lastName: user.lastName,
      avatar: user.avatar,
      spaceship: user.spaceship,
      level: user.level,
      weeklyXP: user.xp, // for current user
      monthlyXP: user.xp + 450,
      allTimeXP: user.xp + 1200,
      streakDays: user.streakDays,
      courseGroup: user.courseGroup,
    };

    if (existingIndex >= 0) {
      list[existingIndex] = entry;
    } else {
      list.push(entry);
    }

    try {
      localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error updating leaderboard', e);
    }
  }

  static getWeeklyChallenges(): WeeklyChallenge[] {
    try {
      const saved = localStorage.getItem(CHALLENGES_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read challenges');
    }
    return WEEKLY_CHALLENGES;
  }

  static saveWeeklyChallenges(challenges: WeeklyChallenge[]) {
    try {
      localStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify(challenges));
    } catch (e) {
      console.error('Error saving challenges', e);
    }
  }

  static getCourseEvents(): CourseEvent[] {
    try {
      const saved = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read events');
    }
    return COURSE_EVENTS;
  }

  static saveCourseEvents(events: CourseEvent[]) {
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.error('Error saving events', e);
    }
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

  static getQuestionLogs(): QuestionAnswerLog[] {
    try {
      const saved = localStorage.getItem(QUESTION_LOGS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read question logs from storage');
    }

    // Default seeded answer logs for the cohort analysis
    const seededLogs: QuestionAnswerLog[] = [
      {
        id: 'log-seed-1',
        questionId: 'g1-m1-q1',
        studentId: 'student-main',
        missionId: 'g1-m1',
        numberOfAttempts: 1,
        correct: true,
        firstAttemptCorrect: true,
        batteryLost: false,
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: 'log-seed-2',
        questionId: 'g1-m1-q2',
        studentId: 'student-main',
        missionId: 'g1-m1',
        numberOfAttempts: 2,
        correct: true,
        firstAttemptCorrect: false,
        batteryLost: false,
        timestamp: new Date(Date.now() - 3600000 * 4.8).toISOString(),
      },
      {
        id: 'log-seed-3',
        questionId: 'g1-m1-q3',
        studentId: 'student-main',
        missionId: 'g1-m1',
        numberOfAttempts: 1,
        correct: true,
        firstAttemptCorrect: true,
        batteryLost: false,
        timestamp: new Date(Date.now() - 3600000 * 4.5).toISOString(),
      },
      {
        id: 'log-seed-4',
        questionId: 'g1-m2-q1',
        studentId: 'student-main',
        missionId: 'g1-m2',
        numberOfAttempts: 2,
        correct: false,
        firstAttemptCorrect: false,
        batteryLost: true,
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: 'log-seed-5',
        questionId: 'g1-m2-q2',
        studentId: 'student-main',
        missionId: 'g1-m2',
        numberOfAttempts: 1,
        correct: true,
        firstAttemptCorrect: true,
        batteryLost: false,
        timestamp: new Date(Date.now() - 3600000 * 2.8).toISOString(),
      },
      // Other student logs in cohort
      {
        id: 'log-seed-6',
        questionId: 'g1-m1-q1',
        studentId: 'std-1',
        missionId: 'g1-m1',
        numberOfAttempts: 1,
        correct: true,
        firstAttemptCorrect: true,
        batteryLost: false,
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
      {
        id: 'log-seed-7',
        questionId: 'g1-m1-q2',
        studentId: 'std-1',
        missionId: 'g1-m1',
        numberOfAttempts: 1,
        correct: true,
        firstAttemptCorrect: true,
        batteryLost: false,
        timestamp: new Date(Date.now() - 3600000 * 11.8).toISOString(),
      },
      {
        id: 'log-seed-8',
        questionId: 'g1-m1-q3',
        studentId: 'std-3',
        missionId: 'g1-m1',
        numberOfAttempts: 2,
        correct: true,
        firstAttemptCorrect: false,
        batteryLost: false,
        timestamp: new Date(Date.now() - 3600000 * 10).toISOString(),
      },
      {
        id: 'log-seed-9',
        questionId: 'g2-m1-q1',
        studentId: 'std-4',
        missionId: 'g2-m1',
        numberOfAttempts: 2,
        correct: false,
        firstAttemptCorrect: false,
        batteryLost: true,
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
      },
      {
        id: 'log-seed-10',
        questionId: 'g4-m1-q1',
        studentId: 'std-5',
        missionId: 'g4-m1',
        numberOfAttempts: 2,
        correct: true,
        firstAttemptCorrect: false,
        batteryLost: false,
        timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
      },
    ];

    try {
      localStorage.setItem(QUESTION_LOGS_STORAGE_KEY, JSON.stringify(seededLogs));
    } catch (e) {
      console.warn('Could not seed initial question logs');
    }

    return seededLogs;
  }

  static saveQuestionLog(log: QuestionAnswerLog) {
    const logs = this.getQuestionLogs();
    logs.push(log);
    try {
      localStorage.setItem(QUESTION_LOGS_STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error('Error saving question log to storage', e);
    }
  }

  static getQuestionLogsForStudent(studentId: string): QuestionAnswerLog[] {
    const logs = this.getQuestionLogs();
    return logs.filter((l) => l.studentId === studentId);
  }

  static getCohortAttemptStats() {
    const logs = this.getQuestionLogs();
    const totalLogs = logs.length;
    const firstAttemptSuccess = logs.filter((l) => l.firstAttemptCorrect).length;
    const secondAttemptSuccess = logs.filter((l) => !l.firstAttemptCorrect && l.correct).length;
    const failedAfterTwoAttempts = logs.filter((l) => !l.correct && l.numberOfAttempts >= 2).length;
    const totalBatteriesLost = logs.filter((l) => l.batteryLost).length;

    return {
      totalLogs,
      firstAttemptSuccess,
      secondAttemptSuccess,
      failedAfterTwoAttempts,
      totalBatteriesLost,
      firstAttemptPercent: totalLogs > 0 ? Math.round((firstAttemptSuccess / totalLogs) * 100) : 70,
      secondAttemptPercent: totalLogs > 0 ? Math.round((secondAttemptSuccess / totalLogs) * 100) : 20,
      failedPercent: totalLogs > 0 ? Math.round((failedAfterTwoAttempts / totalLogs) * 100) : 10,
    };
  }
}

