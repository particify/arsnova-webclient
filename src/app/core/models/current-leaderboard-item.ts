import { LeaderboardItem } from '@app/core/models/leaderboard-item';

export interface CurrentLeaderboardItem extends LeaderboardItem {
  currentResult: CurrentResult;
}

interface CurrentResult {
  points: number;
  durationMs: number;
  correct: boolean;
}
