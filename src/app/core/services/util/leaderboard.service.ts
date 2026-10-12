import { Injectable, inject } from '@angular/core';
import { ThemeService } from '@app/core/theme/theme.service';
import {
  LeaderboardEntry,
  LeaderboardPage,
  QuestionnaireLeaderboardByQuestionnaireIdGql,
  QuestionnaireLeaderboardByQuestionnaireIdQueryVariables,
  QuestionnaireLeaderboardUpdatedGql,
  RoomUserAlias,
} from '@gql/generated/graphql';
import { Observable, map, merge, share, takeUntil } from 'rxjs';
import { onlyCompleteData } from 'apollo-angular';

/** Rows a leaderboard shows before the user's own entry is appended. */
export const LEADERBOARD_DISPLAY_LIMIT = 10;

/** Upper bound the server clamps the requested page size to. */
export const MAX_LEADERBOARD_LIMIT = 1000;

const EMPTY_PAGE: LeaderboardPage = { entries: [], totalCount: 0 };

export interface LeaderboardTableItem {
  position: number;
  // Not set for participants who did not choose a nickname.
  userAlias?: RoomUserAlias | null;
  score: number;
  color: string;
}

export interface ContentLeaderboardTableItem extends LeaderboardTableItem {
  currentPoints: number;
  currentDuration: number;
  correct: boolean;
}

/**
 * Streams the leaderboard of a question series, starting with the current state
 * and continuing with server-pushed updates. Passing a `contentId` scopes the
 * entries to that content and populates their `currentResult`.
 *
 * The server truncates the ranking to `limit` entries (100 by default) and
 * reports the requesting user's own entry separately if it is cut off, so only
 * request as many entries as are displayed.
 *
 * Requires read access to the questionnaire, which an unpublished questionnaire
 * only grants to users with room write access.
 */
export function watchLeaderboard(
  leaderboardByQuestionnaireId: QuestionnaireLeaderboardByQuestionnaireIdGql,
  leaderboardUpdated: QuestionnaireLeaderboardUpdatedGql,
  variables: QuestionnaireLeaderboardByQuestionnaireIdQueryVariables
): Observable<LeaderboardPage> {
  const initial$ = leaderboardByQuestionnaireId
    // The cached page shows at once; the network answer keeps it current.
    .watch({ variables, fetchPolicy: 'cache-and-network' })
    .valueChanges.pipe(
      onlyCompleteData(),
      map((r) => r.data?.questionnaireLeaderboardByQuestionnaireId)
    );
  const updates$ = leaderboardUpdated.subscribe({ variables }).pipe(
    map((r) => r.data?.questionnaireLeaderboardUpdated),
    share()
  );
  return merge(initial$.pipe(takeUntil(updates$)), updates$).pipe(
    map((page) => page ?? EMPTY_PAGE)
  );
}

@Injectable({
  providedIn: 'root',
})
export class LeaderboardService {
  private themeService = inject(ThemeService);

  /** The requesting user's entry, wherever the page carries it. */
  getOwnEntry(
    page: LeaderboardPage,
    aliasId?: string | null
  ): LeaderboardEntry | undefined {
    return (
      page.ownEntry ??
      (aliasId
        ? page.entries.find((entry) => entry.userAlias?.id === aliasId)
        : undefined)
    );
  }

  buildLeaderboardTableData(
    page: LeaderboardPage,
    showAll = false
  ): LeaderboardTableItem[] {
    const tableItems = page.entries.map((entry) => this.toTableItem(entry));
    if (showAll) {
      return tableItems;
    }
    return this.limitToDisplayed(
      tableItems,
      page.ownEntry && this.toTableItem(page.ownEntry)
    );
  }

  buildContentLeaderboardTableData(
    page: LeaderboardPage
  ): ContentLeaderboardTableItem[] {
    return this.limitToDisplayed(
      page.entries.map((entry) => this.toContentTableItem(entry)),
      page.ownEntry && this.toContentTableItem(page.ownEntry)
    );
  }

  private toTableItem(entry: LeaderboardEntry): LeaderboardTableItem {
    return {
      position: entry.position,
      userAlias: entry.userAlias,
      score: entry.score,
      color: this.themeService.getTextColorFromSeed(entry.userAlias?.seed),
    };
  }

  private toContentTableItem(
    entry: LeaderboardEntry
  ): ContentLeaderboardTableItem {
    return {
      ...this.toTableItem(entry),
      currentPoints: entry.currentResult?.points || 0,
      currentDuration: entry.currentResult?.durationMs || 0,
      correct: entry.currentResult?.correct ?? false,
    };
  }

  // The server sends the user's own entry separately if the page does not reach
  // that far, so that their row stays visible below the cut.
  private limitToDisplayed<T extends LeaderboardTableItem>(
    tableItems: T[],
    ownItem?: T | null
  ): T[] {
    const displayed = tableItems.slice(0, LEADERBOARD_DISPLAY_LIMIT);
    if (ownItem) {
      displayed.push(ownItem);
    }
    return displayed;
  }
}
