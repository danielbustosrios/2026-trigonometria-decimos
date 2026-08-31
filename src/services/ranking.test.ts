import { expect, test } from 'vitest';
import { publicRankingEntry, rankEntries } from './ranking';
test('ranking publishes no email, name or answers', () => {
  const profile = { id: 'a', nickname: 'Astro', xp: 50, email: 'private@example.test', name: 'Private', answers: ['a'] };
  expect(publicRankingEntry(profile)).toEqual({ id: 'a', nickname: 'Astro', xp: 50 });
});
test('ranking orders by points and gives equal positions to ties', () => {
  const entries = [{ id: 'c', nickname: 'C', xp: 10 },{ id: 'b', nickname: 'B', xp: 50 },{ id: 'a', nickname: 'A', xp: 50 }];
  expect(rankEntries(entries).map(e => [e.id,e.rank])).toEqual([['a',1],['b',1],['c',3]]);
  expect(entries[0].id).toBe('c');
});
