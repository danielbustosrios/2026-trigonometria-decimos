import { beforeEach, expect, test, vi } from 'vitest';
const fake = vi.hoisted(() => ({ account: { uid: 'student-a', email: 'a@example.test', emailVerified: true }, documents: new Map<string, any>(), fail: false }));
vi.mock('./cloud', () => ({ db: {}, auth: { get currentUser() { return fake.account; } } }));
vi.mock('firebase/auth', () => ({ signOut: vi.fn(async () => {}) }));
vi.mock('firebase/firestore', () => ({
  doc: (_: unknown, ...parts: string[]) => parts.join('/'),
  collection: (_: unknown, ...parts: string[]) => parts.join('/'),
  getDoc: async (path: string) => ({ exists: () => fake.documents.has(path), data: () => fake.documents.get(path) }),
  getDocs: async (path: string) => ({ docs: [...fake.documents].filter(([key]) => key.startsWith(path + '/') && key.split('/').length === path.split('/').length + 1).map(([key,value]) => ({ id: key.split('/').at(-1), data: () => value })) }),
  setDoc: vi.fn(async (path: string, data: any) => { if (fake.fail) throw new Error('offline'); fake.documents.set(path, structuredClone(data)); }),
}));
import { StorageService, getLevelInfo } from './storageService';

beforeEach(() => { StorageService.clear(); fake.documents.clear(); fake.fail = false; fake.account = { uid: 'student-a', email: 'a@example.test', emailVerified: true }; });
const load = () => StorageService.load(fake.account as any, { name: 'Prueba', lastName: 'Local', courseGroup: '10-1' });
const saved = () => vi.waitFor(() => expect(StorageService.getSyncState()).toBe('saved'));

test('a new student starts without seeded progress or another student data', async () => {
  const user = await load(); expect(user?.role).toBe('student'); expect(user?.xp).toBe(0);
  expect(StorageService.getAllProgress()).toEqual({}); expect(StorageService.getQuestionLogs()).toEqual([]);
});
test('unverified accounts cannot load the course', async () => {
  fake.account.emailVerified = false; await expect(load()).rejects.toThrow('Verifica');
});
test('teacher privileges come from the registry, not the profile', async () => {
  const user = await load(); fake.documents.set('users/student-a', { ...user, role: 'teacher' });
  expect((await load())?.role).toBe('student');
  fake.documents.set('teachers/student-a', { role: 'teacher' }); expect((await load())?.role).toBe('teacher');
});
test('progress persists and a replay preserves the best result', async () => {
  await load(); const p = { missionId: 'g1-m1', completed: true, stars: 3, highScore: 80, attemptsCount: 1, errorsCount: 0, lastAttemptDate: new Date().toISOString() };
  StorageService.saveMissionProgress(p); await saved();
  StorageService.saveMissionProgress({ ...p, stars: 1, highScore: 20 }); await saved();
  StorageService.clear(); await load();
  expect(StorageService.getAllProgress()['g1-m1']).toMatchObject({ stars: 3, highScore: 80, attemptsCount: 2 });
});
test('failed writes remain pending, retry saves them', async () => {
  await load(); fake.fail = true;
  StorageService.saveUser({ ...StorageService.getUser(), xp: 150 });
  await vi.waitFor(() => expect(StorageService.getSyncState()).toBe('error'));
  expect(fake.documents.get('users/student-a').xp).toBe(0);
  fake.fail = false; await StorageService.flush(); await saved();
  expect(fake.documents.get('users/student-a')).toMatchObject({ xp: 150, level: 2 });
});
test('changing accounts clears private progress', async () => {
  await load(); StorageService.saveQuestionLog({ id: 'answer-1', studentId: 'someone-else', questionId: 'q1', missionId: 'g1-m1', numberOfAttempts: 1, correct: true, firstAttemptCorrect: true, batteryLost: false, timestamp: new Date().toISOString() }); await saved();
  expect(fake.documents.get('users/student-a/answers/answer-1').studentId).toBe('student-a');
  StorageService.clear(); fake.account = { uid: 'student-b', email: 'b@example.test', emailVerified: true }; await load();
  expect(StorageService.getQuestionLogs()).toEqual([]); expect(StorageService.getUser().id).toBe('student-b');
});
test('students cannot publish activities or set another account identity', async () => {
  await load(); expect(() => StorageService.saveCourseEvents([])).toThrow('Solo docentes');
  expect(() => StorageService.saveUser({ ...StorageService.getUser(), id: 'other' })).toThrow('Cuenta incorrecta');
});
test('level thresholds remain consistent', () => { expect(getLevelInfo(0).level).toBe(1); expect(getLevelInfo(150).level).toBe(2); });
