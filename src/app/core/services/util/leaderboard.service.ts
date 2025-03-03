import { Injectable } from '@angular/core';
import { CurrentLeaderboardItem } from '@app/core/models/current-leaderboard-item';
import { LeaderboardItem } from '@app/core/models/leaderboard-item';
import { RoomUserAlias } from '@app/core/models/room-user-alias';
import { ThemeService } from '@app/core/theme/theme.service';

const DISPLAY_LIMIT = 10;
const TABLE_LIMIT = 100;

export interface LeaderboardTableItem {
  position: number;
  userAlias?: RoomUserAlias;
  score: number;
  color: string;
}

export interface ContentLeaderboardTableItem extends LeaderboardTableItem {
  currentPoints: number;
  currentDuration: number;
  correct: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class LeaderboardService {
  constructor(private themeService: ThemeService) {}
  private determineLeaderboardPosition(
    index: number,
    item: LeaderboardItem,
    tableItems: LeaderboardTableItem[]
  ) {
    return index > 0 && item.score === tableItems[index - 1].score
      ? tableItems[index - 1].position
      : index + 1;
  }

  private determineContentLeaderboardPosition(
    index: number,
    item: CurrentLeaderboardItem,
    tableItems: ContentLeaderboardTableItem[]
  ) {
    if (tableItems.length === 0) {
      return 1;
    }
    return (index > 0 &&
      item.currentResult?.points === tableItems[index - 1]?.currentPoints) ||
      (!item.currentResult?.points && !tableItems[index - 1]?.currentPoints)
      ? tableItems[index - 1].position
      : index + 1;
  }

  private showBelowList(
    leaderboardItems: LeaderboardItem[] | CurrentLeaderboardItem[],
    aliasId?: string,
    allowScrolling = false
  ): boolean {
    if (aliasId && !allowScrolling) {
      return !leaderboardItems
        .slice(0, DISPLAY_LIMIT)
        .map((l) => l.userAlias?.id)
        .includes(aliasId);
    }
    return false;
  }

  private minimizeTableAndAddAliasItem(
    tableItems: ContentLeaderboardTableItem[] | LeaderboardTableItem[],
    leaderboardItems: LeaderboardItem[] | CurrentLeaderboardItem[],
    aliasId?: string
  ) {
    const aliasItem = tableItems.find((t) => t.userAlias?.id === aliasId);
    tableItems = tableItems.slice(0, DISPLAY_LIMIT);
    if (this.showBelowList(leaderboardItems, aliasId) && aliasItem) {
      tableItems.push(aliasItem);
    }
    return tableItems;
  }

  buildLeaderboardTableData(
    leaderboardItems: LeaderboardItem[],
    aliasId?: string,
    showAll = false
  ): LeaderboardTableItem[] {
    const tableItems: LeaderboardTableItem[] = [];
    leaderboardItems.forEach((item, index) => {
      if (index < TABLE_LIMIT) {
        tableItems.push({
          position: this.determineLeaderboardPosition(index, item, tableItems),
          userAlias: item.userAlias,
          score: item.score,
          color: this.themeService.getTextColorFromSeed(item.userAlias?.seed),
        });
      }
    });
    if (showAll) {
      return tableItems;
    } else {
      return this.minimizeTableAndAddAliasItem(
        tableItems,
        leaderboardItems,
        aliasId
      );
    }
  }

  buildContentLeaderboardTableData(
    leaderboardItems: CurrentLeaderboardItem[],
    aliasId: string
  ): ContentLeaderboardTableItem[] {
    const tableItems: ContentLeaderboardTableItem[] = [];
    leaderboardItems.forEach((item, index) => {
      if (index < TABLE_LIMIT) {
        tableItems.push({
          position: this.determineContentLeaderboardPosition(
            index,
            item,
            tableItems
          ),
          userAlias: item.userAlias,
          score: item.score,
          color: this.themeService.getTextColorFromSeed(item.userAlias?.seed),
          currentPoints: item.currentResult?.points || 0,
          currentDuration: item.currentResult?.durationMs || 0,
          correct: item.currentResult?.correct,
        });
      }
    });
    return this.minimizeTableAndAddAliasItem(
      tableItems,
      leaderboardItems,
      aliasId
    ) as ContentLeaderboardTableItem[];
  }
}
