import { Injectable } from '@angular/core';
import { Content } from '@app/core/models/content';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { catchError, take, tap } from 'rxjs/operators';
import { AbstractEntityService } from './abstract-entity.service';
import { AnswerStatistics } from '@app/core/models/answer-statistics';
import { ContentChoice } from '@app/core/models/content-choice';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';
import { IMessage } from '@stomp/stompjs';
import { TranslocoService } from '@ngneat/transloco';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { ContentType } from '@app/core/models/content-type.enum';
import { EventService } from '@app/core/services/util/event.service';
import { ContentCreated } from '@app/core/models/events/content-created';
import { CachingService } from '@app/core/services/util/caching.service';
import { ExportFileType } from '@app/core/models/export-file-type';
import { Router } from '@angular/router';
import { ContentGroup } from '@app/core/models/content-group';
import { DialogService } from '@app/core/services/util/dialog.service';
import { BaseDialogComponent } from '@app/standalone/_dialogs/base-dialog/base-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ContentState } from '@app/core/models/content-state';
import { DisplayAnswer } from '@app/creator/content-group/content-editing/_models/display-answer';
import { AnswerOption } from '@app/core/models/answer-option';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable()
export class ContentService extends AbstractEntityService<Content> {
  answersDeleted = new BehaviorSubject<string | null>(null);
  private roundStarted = new BehaviorSubject<Content | null>(null);

  serviceApiUrl = {
    answer: '/answer',
    duplicate: '/duplicate',
    bannedKeywords: '/banned-keywords',
  };

  typeIcons: Map<ContentType, string> = new Map<ContentType, string>([
    [ContentType.CHOICE, 'list'],
    [ContentType.SCALE, 'mood'],
    [ContentType.BINARY, 'rule'],
    [ContentType.TEXT, 'description'],
    [ContentType.WORDCLOUD, 'cloud'],
    [ContentType.SORT, 'move_up'],
    [ContentType.PRIORITIZATION, 'sort'],
    [ContentType.NUMERIC, 'numbers'],
    [ContentType.SLIDE, 'info'],
    [ContentType.FLASHCARD, 'school'],
  ]);

  constructor(
    private http: HttpClient,
    private ws: WsConnectorService,
    protected eventService: EventService,
    protected translateService: TranslocoService,
    protected notificationService: NotificationService,
    cachingService: CachingService,
    private router: Router,
    private dialogService: DialogService,
    private dialog: MatDialog
  ) {
    super(
      'Content',
      '/content',
      http,
      ws,
      eventService,
      translateService,
      notificationService,
      cachingService,
      false
    );
  }

  getAnswersChangedStream(
    roomId: string,
    contentId: string
  ): Observable<IMessage> {
    return this.ws.getWatcher(
      `/topic/${roomId}.content-${contentId}.answers-changed.stream`
    );
  }

  getTextAnswerCreatedStream(
    roomId: string,
    contentId: string
  ): Observable<IMessage> {
    return this.ws.getWatcher(
      `/topic/${roomId}.content-${contentId}.text-answer-created.stream`
    );
  }

  getContents(roomId: string): Observable<Content[]> {
    const connectionUrl = this.buildUri(this.apiUrl.find, roomId);
    return this.http
      .post<Content[]>(
        connectionUrl,
        {
          properties: { roomId: roomId },
          externalFilters: {},
        },
        httpOptions
      )
      .pipe(catchError(this.handleError('getContents', [])));
  }

  getContent(
    roomId: string,
    contentId: string,
    extendedView = true
  ): Observable<Content> {
    const connectionUrl = this.buildUri(
      '/' + contentId + (extendedView ? '?view=extended' : ''),
      roomId
    );
    return this.http
      .get<Content>(connectionUrl)
      .pipe(
        catchError(this.handleError<Content>('getContent by id: ' + contentId))
      );
  }

  getChoiceContent(
    roomId: string,
    contentId: string
  ): Observable<ContentChoice> {
    const connectionUrl = this.buildUri('/' + contentId, roomId);
    return this.http
      .get<ContentChoice>(connectionUrl)
      .pipe(
        catchError(
          this.handleError<ContentChoice>('getRoom by id: ' + contentId)
        )
      );
  }

  getContentsByIds(
    roomId: string,
    contentIds: string[],
    extendedView?: boolean
  ): Observable<Content[]> {
    const params: Record<string, string> = { roomId: roomId };
    if (extendedView) {
      params.view = 'extended';
    }
    return this.getByIds(contentIds, params);
  }

  getContentChoiceByIds(
    roomId: string,
    contentIds: string[]
  ): Observable<ContentChoice[]> {
    const connectionUrl = this.buildUri('/?ids=' + contentIds, roomId);
    return this.http
      .get<ContentChoice[]>(connectionUrl)
      .pipe(catchError(this.handleError('getContentsByIds', [])));
  }

  getCorrectChoiceIndexes(
    roomId: string,
    contentId: string
  ): Observable<number[]> {
    const connectionUrl = this.buildUri(
      '/' + contentId + '/correct-choice-indexes',
      roomId
    );
    return this.http
      .get<number[]>(connectionUrl)
      .pipe(catchError(this.handleError('getCorrectChoiceIndexes', [])));
  }

  addContent(content: Content): Observable<Content> {
    const connectionUrl = this.buildUri('/', content.roomId);
    return this.http.post<Content>(connectionUrl, content, httpOptions).pipe(
      tap(() => {
        const event = new ContentCreated(content.format);
        this.eventService.broadcast(event.type, event.payload);
      }),
      catchError(this.handleError<Content>('addContent'))
    );
  }

  updateContent(updatedContent: Content): Observable<Content> {
    const connectionUrl = this.buildUri(
      '/' + updatedContent.id,
      updatedContent.roomId
    );
    return this.http
      .put<Content>(connectionUrl, updatedContent, httpOptions)
      .pipe(catchError(this.handleError<Content>('updateContent')));
  }

  patchContent(content: Content, changes: object): Observable<Content> {
    const connectionUrl = this.buildUri('/' + content.id, content.roomId);
    return this.http
      .patch<Content>(connectionUrl, changes, httpOptions)
      .pipe(catchError(this.handleError<Content>('patchContent')));
  }

  changeState(content: Content, state: ContentState): Observable<Content> {
    const changes: { state: object } = { state: state };
    return this.patchContent(content, changes).pipe();
  }

  updateChoiceContent(
    updatedContent: ContentChoice
  ): Observable<ContentChoice> {
    const connectionUrl = this.buildUri(
      '/' + updatedContent.id,
      updatedContent.roomId
    );
    return this.http
      .put<ContentChoice>(connectionUrl, updatedContent, httpOptions)
      .pipe(catchError(this.handleError<ContentChoice>('updateContentChoice')));
  }

  deleteContent(roomId: string, contentId: string): Observable<Content> {
    const connectionUrl = this.buildUri('/' + contentId, roomId);
    return this.http
      .delete<Content>(connectionUrl, httpOptions)
      .pipe(catchError(this.handleError<Content>('deleteContent')));
  }

  deleteAnswers(roomId: string, contentId: string): Observable<Content> {
    const connectionUrl = this.buildUri(
      '/' + contentId + this.serviceApiUrl.answer,
      roomId
    );
    return this.http
      .delete<Content>(connectionUrl, httpOptions)
      .pipe(catchError(this.handleError<Content>('deleteAnswers')));
  }

  showDeleteAllAnswersDialog(contentGroup: ContentGroup): Observable<string> {
    const dialogRef = this.dialogService.openDeleteDialog(
      'content-answers',
      'creator.dialog.really-delete-all-answers',
      undefined,
      undefined,
      () => this.deleteAllAnswersOfContentGroup(contentGroup)
    );
    return dialogRef.afterClosed();
  }

  deleteAllAnswersOfContentGroup(contentGroup: ContentGroup) {
    const observableBatch = [];
    if (!contentGroup.contentIds) {
      return of();
    }
    for (const contentId of contentGroup.contentIds) {
      observableBatch.push(this.deleteAnswers(contentGroup.roomId, contentId));
    }
    return forkJoin(observableBatch);
  }

  getAnswer(roomId: string, contentId: string): Observable<AnswerStatistics> {
    const connectionUrl = this.buildUri('/' + contentId + '/stats', roomId);
    return this.http
      .get<AnswerStatistics>(connectionUrl)
      .pipe(
        catchError(
          this.handleError<AnswerStatistics>(`getRoom shortId=${contentId}`)
        )
      );
  }

  duplicateContent(
    roomId: string,
    groupId: string,
    contentId: string
  ): Observable<Content> {
    const connectionUrl = this.buildUri(
      `/${contentId}${this.serviceApiUrl.duplicate}`,
      roomId
    );
    const body = {
      roomId: roomId,
      contentGroupId: groupId,
    };
    return this.http
      .post<Content>(connectionUrl, body, httpOptions)
      .pipe(
        catchError(
          this.handleError<Content>(
            `duplicateContent, ${roomId}, ${groupId}, ${contentId}`
          )
        )
      );
  }

  banKeywordForContent(
    roomId: string,
    contentId: string,
    keyword: string
  ): Observable<void> {
    const connectionUrl = this.buildUri(
      `/${contentId}${this.serviceApiUrl.bannedKeywords}`,
      roomId
    );
    const body = {
      keyword: keyword,
    };
    return this.http
      .post<void>(connectionUrl, body, httpOptions)
      .pipe(
        catchError(
          this.handleError<void>(
            `Ban keyword for content, ${roomId}, ${keyword}, ${contentId}`
          )
        )
      );
  }

  resetBannedKeywords(roomId: string, contentId: string): Observable<void> {
    const connectionUrl = this.buildUri(
      `/${contentId}${this.serviceApiUrl.bannedKeywords}`,
      roomId
    );
    return this.http
      .delete<void>(connectionUrl, httpOptions)
      .pipe(
        catchError(
          this.handleError<void>(
            `Reset banned keywords for content, ${roomId}, ${contentId}`
          )
        )
      );
  }

  getSupportedContents(contents: Content[]) {
    return contents.filter(
      (content) => Object.values(ContentType).indexOf(content.format) > -1
    );
  }

  export(
    fileType: ExportFileType,
    roomId: string,
    contentIds: string[],
    charset?: string
  ): Observable<Blob> {
    const connectionUrl = this.buildUri('/-/export', roomId);
    return this.http.post(
      connectionUrl,
      { fileType: fileType, contentIds: contentIds, charset: charset },
      { responseType: 'blob' }
    );
  }

  goToEdit(contentId: string, shortId: string, group: string) {
    this.router.navigate(['edit', shortId, 'series', group, 'edit', contentId]);
  }

  deleteAnswersOfContent(
    contentId: string,
    roomId: string
  ): Observable<Content> {
    return this.deleteAnswers(roomId, contentId).pipe(
      tap(() => {
        this.translateService
          .selectTranslate('creator.dialog.answers-deleted')
          .pipe(take(1))
          .subscribe((msg) => {
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.WARNING
            );
            this.answersDeleted.next(contentId);
          });
      })
    );
  }

  getAnswersDeleted(): Observable<string | null> {
    return this.answersDeleted;
  }

  getTypeIcons(): Map<ContentType, string> {
    return this.typeIcons;
  }

  hasFormatRounds(format: ContentType): boolean {
    return [
      ContentType.CHOICE,
      ContentType.SCALE,
      ContentType.BINARY,
      ContentType.NUMERIC,
    ].includes(format);
  }

  startNewRound(content: Content) {
    const changes = {
      state: new ContentState(
        content.state.round,
        content.state.answeringEndTime,
        content.state.answersPublished
      ),
    };
    changes.state.round = 2;
    const dialogRef = this.dialog.open(BaseDialogComponent, {
      data: {
        headerLabel: 'dialog.sure',
        body: 'creator.dialog.really-start-new-round',
        confirmLabel: 'creator.dialog.start',
        abortLabel: 'dialog.cancel',
        type: 'button-primary',
        confirmAction: () => this.patchContent(content, changes),
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        content.state.round = 2;
        this.roundStarted.next(content);
        this.translateService
          .selectTranslate('creator.dialog.started-new-round')
          .pipe(take(1))
          .subscribe((msg) => {
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
          });
      }
    });
  }

  getRoundStarted(): Observable<Content | null> {
    return this.roundStarted;
  }

  getAnswerOptions(
    options: AnswerOption[],
    correctOptionIndexes?: number[]
  ): DisplayAnswer[] {
    const answers: DisplayAnswer[] = [];
    options?.map((option, i) => {
      answers.push(
        new DisplayAnswer(
          new AnswerOption(option.label),
          correctOptionIndexes ? correctOptionIndexes.includes(i) : false
        )
      );
    });
    return answers;
  }

  startCountdown(roomId: string, contentId: string): Observable<void> {
    const connectionUrl = this.buildUri(`/${contentId}/start`, roomId);
    return this.http
      .post<void>(connectionUrl, httpOptions)
      .pipe(
        catchError(
          this.handleError<void>(
            `Start countdown for content, room: ${roomId}, content: ${contentId}`
          )
        )
      );
  }
}
