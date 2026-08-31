export type RankingEntry = { id: string; nickname: string; xp: number };
export function publicRankingEntry(user: { id: string; nickname: string; xp: number }): RankingEntry {
  return { id: user.id, nickname: user.nickname, xp: user.xp };
}
export function rankEntries(entries: RankingEntry[]) {
  const sorted = [...entries].sort((a,b) => b.xp - a.xp || a.id.localeCompare(b.id));
  let rank = 0;
  return sorted.map((entry,index) => {
    if (!index || entry.xp !== sorted[index-1].xp) rank = index + 1;
    return { ...entry, rank };
  });
}
