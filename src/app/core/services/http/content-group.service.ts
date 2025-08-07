import { Injectable, inject } from '@angular/core';
import { ContentGroup, GroupType } from '@app/core/models/content-group';
import { HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { AbstractEntityService } from './abstract-entity.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { RoomStatsService } from './room-stats.service';
import { ContentGroupStatistics } from '@app/core/models/content-group-statistics';
import {
  AnswerResultOverview,
  AnswerResultType,
} from '@app/core/models/answer-result';
import { SeriesCreated } from '@app/core/models/events/series-created';
import { SeriesDeleted } from '@app/core/models/events/series-deleted';
import { ContentLicenseAttribution } from '@app/core/models/content-license-attribution';
import { CurrentLeaderboardItem } from '@app/core/models/current-leaderboard-item';
import { LeaderboardItem } from '@app/core/models/leaderboard-item';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentStats } from '@app/creator/content-group/content-group-page.component';
import { Content } from '@app/core/models/content';
import { ImportResult } from '@app/core/models/import-result';
import { DIALOG_SIZES } from '@app/core/services/util/dialog.service';
import { BaseDialogComponent } from '@app/standalone/_dialogs/base-dialog/base-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ContentChoice } from '@app/core/models/content-choice';
import { ContentNumeric } from '@app/core/models/content-numeric';

const httpOptions = {
  headers: new HttpHeaders({}),
};

interface AnswerStatisticsSummary {
  contentId: string;
  round: number;
  result: AnswerResultType;
  count: number;
}

@Injectable()
export class ContentGroupService extends AbstractEntityService<ContentGroup> {
  private globalStorageService = inject(GlobalStorageService);
  private roomStatsService = inject(RoomStatsService);
  private dialog = inject(MatDialog);

  private contentGroupUpdated = new Subject<ContentGroup>();

  typeIcons: Map<GroupType, string> = new Map<GroupType, string>([
    [GroupType.MIXED, 'dashboard'],
    [GroupType.QUIZ, 'sports_esports'],
    [GroupType.SURVEY, 'tune'],
    [GroupType.FLASHCARDS, 'school'],
  ]);

  constructor() {
    super('ContentGroup', '/contentgroup');
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
      tap((g) => this.contentGroupUpdated.next(g)),
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
      tap((g) => this.contentGroupUpdated.next(g)),
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

  import(
    roomId: string,
    groupId: string,
    blob: Blob
  ): Observable<ImportResult> {
    const connectionUrl = this.buildUri(`/${groupId}/import`, roomId);
    const formData = new FormData();
    formData.append('file', blob);
    return this.http.post<ImportResult>(connectionUrl, formData).pipe(
      tap((r) => this.handleImportResult(r)),
      catchError(
        this.handleError<ImportResult>(
          'importContentGroup',
          undefined,
          'creator.content.import-failed'
        )
      )
    );
  }

  private handleImportResult(result: ImportResult) {
    if (result.importedLines >= result.totalLines) {
      return;
    }
    const message1 = this.translateService.translate(
      'creator.dialog.csv-import-errors',
      { importedLines: result.importedLines, totalLines: result.totalLines }
    );
    const message2 =
      result.importedLines > 0
        ? ' ' +
          this.translateService.translate(
            'creator.dialog.csv-import-errors-line-info',
            { errorLines: result.errorLines.join(', ') }
          )
        : '';
    this.dialog.open(BaseDialogComponent, {
      width: DIALOG_SIZES.small,
      data: {
        headerLabel: 'creator.dialog.csv-import-errors-header',
        body: message1 + message2,
        confirmLabel: 'dialog.close',
        type: 'button-primary',
      },
    });
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

  startContent(
    roomId: string,
    contentGroupId: string,
    contentId: string,
    round?: number
  ): Observable<void> {
    let connectionUrl = this.buildUri(
      `/${contentGroupId}/start-content?contentId=${contentId}`,
      roomId
    );
    if (round) {
      connectionUrl += `&round=${round}`;
    }
    return this.http
      .post<void>(connectionUrl, httpOptions)
      .pipe(
        catchError(
          this.handleError<void>(
            `Start content, room: ${roomId}, content group: ${contentGroupId}, content: ${contentId}`
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
          ContentType.SHORT_ANSWER,
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

  isContentCompatibleWithGroupType(
    content: Content,
    groupType: GroupType
  ): boolean {
    if (
      !this.getContentFormatsOfGroupType(groupType).includes(content.format)
    ) {
      return false;
    }
    if (
      [ContentType.SLIDE, ContentType.TEXT].includes(content.format) ||
      groupType === GroupType.MIXED
    ) {
      return true;
    }
    return (
      (this.isContentScorable(content) && groupType === GroupType.QUIZ) ||
      (!this.isContentScorable(content) && groupType === GroupType.SURVEY)
    );
  }

  isContentScorable(content: Content): boolean {
    const scorableFormats = [
      ContentType.CHOICE,
      ContentType.BINARY,
      ContentType.NUMERIC,
      ContentType.SORT,
      ContentType.SHORT_ANSWER,
    ];
    if (!scorableFormats.includes(content.format)) {
      return false;
    } else {
      switch (content.format) {
        case ContentType.CHOICE:
        case ContentType.BINARY:
          return (content as ContentChoice).correctOptionIndexes?.length > 0;
        case ContentType.NUMERIC:
          return (content as ContentNumeric).correctNumber !== undefined;
        default:
          return true;
      }
    }
  }

  getAnswerStatistics(
    roomId: string,
    groupId: string,
    contents: Content[]
  ): Observable<Map<string, ContentStats>> {
    const connectionUrl = this.buildUri(`/${groupId}/stats`, roomId);
    return this.http
      .get<AnswerStatisticsSummary[]>(connectionUrl)
      .pipe(map((stats) => this.determineContentStatsMap(stats, contents)));
  }

  private determineContentStatsMap(
    stats: AnswerStatisticsSummary[],
    contents: Content[]
  ): Map<string, ContentStats> {
    contents = contents.filter(
      (c) => ![ContentType.SLIDE, ContentType.FLASHCARD].includes(c.format)
    );
    const result = new Map<string, ContentStats>();
    contents.forEach((content) => {
      let count = 0;
      let correct: number | undefined;
      let abstentions = 0;
      const contentSummaries = stats.filter(
        (stats) =>
          stats.contentId === content.id && stats.round === content.state.round
      );
      if (contentSummaries.length > 0) {
        const abstentionStats = contentSummaries.filter(
          (contentStats) => contentStats.result === AnswerResultType.ABSTAINED
        );
        abstentions = abstentionStats
          .map((s) => s.count)
          .reduce((a, b) => a + b, 0);
        count = this.calculateStatsCount(contentSummaries);
        if (this.isContentScorable(content)) {
          correct = this.calculateCorrectStats(contentSummaries);
        }
      }
      if (correct) {
        correct = (correct / count) * 100;
      }
      result.set(content.id, {
        count: count - abstentions,
        correct: correct,
        abstentions: abstentions,
      });
    });
    return result;
  }

  calculateCorrectStats(stats: AnswerStatisticsSummary[]): number {
    return (
      stats.filter((stats) => stats.result === AnswerResultType.CORRECT)[0]
        ?.count || 0
    );
  }

  calculateStatsCount(stats: AnswerStatisticsSummary[]): number {
    return stats.map((stats) => stats.count).reduce((a, b) => a + b);
  }

  getContentGroupUpdated(): Observable<ContentGroup> {
    return this.contentGroupUpdated;
  }
}
