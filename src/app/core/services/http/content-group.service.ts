import { Injectable } from '@angular/core';
import { ContentGroup, GroupType } from '@app/core/models/content-group';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { AbstractEntityService } from './abstract-entity.service';
import { EventService } from '@app/core/services/util/event.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { TranslocoService } from '@ngneat/transloco';
import { NotificationService } from '@app/core/services/util/notification.service';
import { RoomStatsService } from './room-stats.service';
import { ContentGroupStatistics } from '@app/core/models/content-group-statistics';
import { CachingService } from '@app/core/services/util/caching.service';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';
import { AnswerResultOverview } from '@app/core/models/answer-result';
import { SeriesCreated } from '@app/core/models/events/series-created';
import { SeriesDeleted } from '@app/core/models/events/series-deleted';
import { ContentLicenseAttribution } from '@app/core/models/content-license-attribution';
import { CurrentLeaderboardItem } from '@app/core/models/current-leaderboard-item';
import { LeaderboardItem } from '@app/core/models/leaderboard-item';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentStats } from '@app/creator/content-group/content-group-page.component';
import { TextAnswer } from '@app/core/models/text-answer';
import { Content } from '@app/core/models/content';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { ContentService } from '@app/core/services/http/content.service';
import { AnswerStatistics } from '@app/core/models/answer-statistics';
import { ContentChoice } from '@app/core/models/content-choice';
import {
  Combination,
  NumericRoundStatistics,
  RoundStatistics,
} from '@app/core/models/round-statistics';
import { ContentNumeric } from '@app/core/models/content-numeric';

const httpOptions = {
  headers: new HttpHeaders({}),
};

@Injectable()
export class ContentGroupService extends AbstractEntityService<ContentGroup> {
  typeIcons: Map<GroupType, string> = new Map<GroupType, string>([
    [GroupType.MIXED, 'dashboard'],
    [GroupType.QUIZ, 'emoji_events'],
    [GroupType.SURVEY, 'bar_chart'],
    [GroupType.FLASHCARDS, 'school'],
  ]);

  constructor(
    private http: HttpClient,
    protected ws: WsConnectorService,
    private globalStorageService: GlobalStorageService,
    protected eventService: EventService,
    protected translateService: TranslocoService,
    protected notificationService: NotificationService,
    private roomStatsService: RoomStatsService,
    private contentAnswerService: ContentAnswerService,
    private contentService: ContentService,
    cachingService: CachingService
  ) {
    super(
      'ContentGroup',
      '/contentgroup',
      http,
      ws,
      eventService,
      translateService,
      notificationService,
      cachingService
    );
  }

  getStatsByRoomIdAndName(
    roomId: string,
    name: string,
    extendedView = false
  ): Observable<ContentGroupStatistics> {
    return this.roomStatsService
      .getStats(roomId, extendedView)
      .pipe(
        map(
          (stats) =>
            stats.groupStats.find(
              (groupStats) => groupStats.groupName === name
            ) as ContentGroupStatistics
        )
      );
  }

  getByRoomIdAndName(
    roomId: string,
    name: string,
    extendedView = false
  ): Observable<ContentGroup> {
    return this.roomStatsService.getStats(roomId, extendedView).pipe(
      map(
        (stats) =>
          stats.groupStats.find((groupStats) => groupStats.groupName === name)
            ?.id
      ),
      mergeMap((id) => this.getById(id as string, { roomId: roomId }))
    );
  }

  post(entity: ContentGroup): Observable<ContentGroup> {
    return this.postEntity(entity, entity.roomId).pipe(
      tap((group) => {
        this.roomStatsService.removeCacheEntry(entity.roomId);
        this.sendCreatedEvent(group);
      }),
      catchError(
        this.handleError<ContentGroup>(`post, ${entity.roomId}, ${entity.name}`)
      )
    );
  }

  sendCreatedEvent(group: ContentGroup) {
    const event = new SeriesCreated(group);
    this.eventService.broadcast(event.type, event.payload);
  }

  delete(contentGroup: ContentGroup): Observable<ContentGroup> {
    return this.deleteEntity(contentGroup.id, contentGroup.roomId).pipe(
      tap(() => {
        this.roomStatsService.removeCacheEntry(contentGroup.roomId);
        this.sendDeletedEvent(contentGroup);
      }),
      catchError(
        this.handleError<ContentGroup>(
          `Delete, ${contentGroup.roomId}, ${contentGroup.name}`
        )
      )
    );
  }

  sendDeletedEvent(group: ContentGroup) {
    const event = new SeriesDeleted(group);
    this.eventService.broadcast(event.type, event.payload);
  }

  addContentToGroup(
    roomId: string,
    name: string,
    contentId: string
  ): Observable<void> {
    const connectionUrl = this.buildUri('/-/content/', roomId);
    return this.http
      .post<void>(
        connectionUrl,
        { roomId: roomId, contentGroupName: name, contentId: contentId },
        httpOptions
      )
      .pipe(
        catchError(
          this.handleError<void>(
            `addContentToGroup, ${roomId}, ${name}, ${contentId}`
          )
        )
      );
  }

  updateGroup(contentGroup: ContentGroup): Observable<ContentGroup> {
    return this.putEntity(contentGroup, contentGroup.roomId).pipe(
      catchError(
        this.handleError<ContentGroup>(
          `updateGroup, ${contentGroup.roomId}, ${contentGroup.name}, ${ContentGroup}`
        )
      )
    );
  }

  patchContentGroup(
    group: ContentGroup,
    changes: object
  ): Observable<ContentGroup> {
    return this.patchEntity(group.id, changes, group.roomId).pipe(
      catchError(this.handleError<any>('patchContentGroup'))
    );
  }

  saveGroupInMemoryStorage(newGroup: string): boolean {
    if (newGroup === '') {
      return false;
    }
    this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, newGroup);
    const groups: string[] =
      this.globalStorageService.getItem(STORAGE_KEYS.CONTENT_GROUPS) || [];
    if (groups) {
      for (let i = 0; i < groups.length; i++) {
        if (newGroup === groups[i]) {
          return false;
        }
      }
    }
    groups.push(newGroup);
    this.globalStorageService.setItem(STORAGE_KEYS.CONTENT_GROUPS, groups);
    return true;
  }

  updateGroupInMemoryStorage(oldName: string, newName: string) {
    const groups: string[] = this.globalStorageService.getItem(
      STORAGE_KEYS.CONTENT_GROUPS
    );
    if (groups) {
      for (let i = 0; i < groups.length; i++) {
        if (groups[i] === oldName) {
          groups[i] = newName;
          this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, groups[i]);
          break;
        }
      }
    } else {
      this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, newName);
    }
    this.globalStorageService.setItem(STORAGE_KEYS.CONTENT_GROUPS, groups);
  }

  sortContentGroupsByName(contentGroups: ContentGroup[]): ContentGroup[] {
    return contentGroups.sort((a, b) => a.name.localeCompare(b.name));
  }

  import(roomId: string, groupId: string, blob: Blob): Observable<Blob> {
    const connectionUrl = this.buildUri(`/${groupId}/import`, roomId);
    const formData = new FormData();
    formData.append('file', blob);
    return this.httpClient
      .post<Blob>(connectionUrl, formData)
      .pipe(
        catchError(
          this.handleError<Blob>(
            'importContentGroup',
            undefined,
            'creator.content.import-failed'
          )
        )
      );
  }

  getAnswerStats(
    roomId: string,
    groupId: string,
    userId: string
  ): Observable<AnswerResultOverview> {
    const connectionUrl = this.buildUri(
      `/${groupId}/stats/user/${userId}`,
      roomId
    );
    return this.http
      .get<AnswerResultOverview>(connectionUrl, httpOptions)
      .pipe(
        catchError(
          this.handleError<AnswerResultOverview>('getAnswerResultOverview')
        )
      );
  }

  getAttributions(
    roomId: string,
    groupId: string
  ): Observable<ContentLicenseAttribution[]> {
    const connectionUrl = this.buildUri(`/${groupId}/attributions`, roomId);
    return this.http.get<ContentLicenseAttribution[]>(connectionUrl);
  }

  getLeaderboard(
    roomId: string,
    groupId: string
  ): Observable<LeaderboardItem[]> {
    const connectionUrl = this.buildUri(`/${groupId}/leaderboard`, roomId);
    return this.http
      .get<LeaderboardItem[]>(connectionUrl)
      .pipe(map((items) => items.sort((a, b) => b.score - a.score)));
  }

  getCurrentLeaderboard(
    roomId: string,
    groupId: string,
    contentId?: string
  ): Observable<CurrentLeaderboardItem[]> {
    const connectionUrl = this.buildUri(
      `/${groupId}/leaderboard?contentId=${contentId}`,
      roomId
    );
    return this.http
      .get<CurrentLeaderboardItem[]>(connectionUrl)
      .pipe(
        map((items) =>
          items.sort(
            (a, b) =>
              (b.currentResult?.points || 0) - (a.currentResult?.points || 0)
          )
        )
      );
  }

  getTypeIcons(): Map<GroupType, string> {
    return this.typeIcons;
  }

  getContentFormatsOfGroupType(groupType: GroupType): ContentType[] {
    switch (groupType) {
      case GroupType.MIXED:
        return Object.values(ContentType);
      case GroupType.QUIZ:
        return [
          ContentType.CHOICE,
          ContentType.BINARY,
          ContentType.TEXT,
          ContentType.SORT,
          ContentType.NUMERIC,
          ContentType.SLIDE,
        ];
      case GroupType.SURVEY:
        return [
          ContentType.CHOICE,
          ContentType.SCALE,
          ContentType.BINARY,
          ContentType.TEXT,
          ContentType.WORDCLOUD,
          ContentType.PRIORITIZATION,
          ContentType.NUMERIC,
          ContentType.SLIDE,
        ];
      default:
        return [ContentType.FLASHCARD, ContentType.SLIDE];
    }
  }

  private getSum(list: number[]): number {
    if (list && list.length > 0) {
      return list.reduce((a, b) => a + b);
    } else {
      return 0;
    }
  }

  private getMultipleCount(combinatedCounts?: Combination[]): number {
    if (!combinatedCounts) {
      return 0;
    } else {
      return this.getSum(combinatedCounts.map((c) => c.count));
    }
  }

  private getCorrectSingleCount(
    independentCounts: number[],
    correctIndexes: number[],
    totalCount: number
  ) {
    if (!independentCounts || !totalCount) {
      return 0;
    }
    return (independentCounts[correctIndexes[0]] / totalCount) * 100;
  }

  private getCorrectMultipleCount(
    combinatedCounts: Combination[],
    correctIndexes: number[],
    totalCount: number
  ) {
    const correctCombinations = combinatedCounts?.filter(
      (c) =>
        c.selectedChoiceIndexes.sort().toString() ===
        correctIndexes.sort().toString()
    );
    if (!combinatedCounts) {
      return 0;
    }
    const count = correctCombinations[0]?.count ?? 0;
    return (count / totalCount) * 100;
  }

  private prepareAnswerStatisticRequests(
    roomId: string,
    contents: Content[]
  ): Map<string, Observable<TextAnswer[] | AnswerStatistics>> {
    const requests = new Map<
      string,
      Observable<TextAnswer[] | AnswerStatistics>
    >();
    contents.forEach((content) => {
      if (content.format === ContentType.TEXT) {
        requests.set(
          content.id,
          this.contentAnswerService.getAnswers(roomId, content.id)
        );
      } else {
        requests.set(
          content.id,
          this.contentService.getAnswer(roomId, content.id)
        );
      }
    });
    return requests;
  }

  private getChoiceContentStats(
    content: ContentChoice,
    roundStats: RoundStatistics
  ): ContentStats {
    const count = content.multiple
      ? this.getMultipleCount(roundStats.combinatedCounts)
      : this.getSum(roundStats.independentCounts);
    let correct: number | undefined;
    if (count && content.correctOptionIndexes) {
      correct = content.multiple
        ? this.getCorrectMultipleCount(
            roundStats.combinatedCounts,
            content.correctOptionIndexes,
            count
          )
        : this.getCorrectSingleCount(
            roundStats.independentCounts,
            content.correctOptionIndexes,
            count
          );
    }
    return {
      count: count,
      correct: correct,
    };
  }

  private getSortContentStats(
    content: ContentChoice,
    roundStats: RoundStatistics
  ): ContentStats {
    const count = this.getMultipleCount(roundStats.combinatedCounts);
    let correct: number | undefined;
    if (count && roundStats.combinatedCounts) {
      correct = this.getCorrectMultipleCount(
        roundStats.combinatedCounts,
        (content as ContentChoice).correctOptionIndexes,
        count
      );
    }
    return {
      count: count,
      correct: correct,
    };
  }

  private getBinaryContentStats(
    content: ContentChoice,
    roundStats: RoundStatistics
  ): ContentStats {
    const count = this.getSum(roundStats.independentCounts);
    let correct: number | undefined;
    if (count && content.correctOptionIndexes) {
      correct = this.getCorrectSingleCount(
        roundStats.independentCounts,
        content.correctOptionIndexes,
        count
      );
    }
    return {
      count: count,
      correct: correct,
    };
  }

  private getNumericContentStats(
    content: ContentNumeric,
    roundStats: NumericRoundStatistics
  ): ContentStats {
    const count = this.getSum(roundStats.independentCounts);
    let correct: number | undefined;
    if (count && content.correctNumber) {
      correct = roundStats.correctAnswerFraction * 100;
    }
    return {
      count: count,
      correct: correct,
    };
  }

  private getContentStatistics(
    contents: Content[],
    stats: Array<AnswerStatistics | TextAnswer[]>
  ): Map<string, ContentStats> {
    const result = new Map<string, ContentStats>();
    contents.forEach((content, index) => {
      const current = stats[index];
      if (Array.isArray(current)) {
        result.set(content.id, { count: current.length });
      } else {
        const roundStats = current.roundStatistics[content.state.round - 1];
        switch (content.format) {
          case ContentType.CHOICE:
            result.set(
              content.id,
              this.getChoiceContentStats(content as ContentChoice, roundStats)
            );
            break;
          case ContentType.SORT:
            result.set(
              content.id,
              this.getSortContentStats(content as ContentChoice, roundStats)
            );
            break;
          case ContentType.BINARY:
            result.set(
              content.id,
              this.getBinaryContentStats(content as ContentChoice, roundStats)
            );
            break;
          case ContentType.NUMERIC:
            result.set(
              content.id,
              this.getNumericContentStats(
                content as ContentNumeric,
                roundStats as NumericRoundStatistics
              )
            );
            break;
          default:
            result.set(content.id, { count: roundStats.answerCount });
        }
      }
    });
    return result;
  }

  getAnswerStatistics(
    roomId: string,
    contents: Content[]
  ): Observable<Map<string, ContentStats>> {
    contents = contents.filter(
      (c) => ![ContentType.SLIDE, ContentType.FLASHCARD].includes(c.format)
    );
    return forkJoin(
      Array.from(this.prepareAnswerStatisticRequests(roomId, contents).values())
    ).pipe(
      map((stats) => {
        return this.getContentStatistics(contents, stats);
      })
    );
  }
}
