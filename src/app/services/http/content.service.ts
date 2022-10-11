import { Injectable } from '@angular/core';
import { Content } from '../../models/content';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AbstractEntityService } from './abstract-entity.service';
import { AnswerStatistics } from '../../models/answer-statistics';
import { ContentChoice } from '../../models/content-choice';
import { WsConnectorService } from '../websockets/ws-connector.service';
import { IMessage } from '@stomp/stompjs';
import { TranslateService } from '@ngx-translate/core';
import { AdvancedSnackBarTypes, NotificationService } from '../util/notification.service';
import { ContentType } from '@arsnova/app/models/content-type.enum';
import { EventService } from '../util/event.service';
import { ContentCreated } from '../../models/events/content-created';
import { CachingService } from '../util/caching.service';
import { ExportFileType } from '../../models/export-file-type';
import { Router } from '@angular/router';
import { ContentMessages } from '../../models/events/content-messages.enum';
import { ContentGroup } from '../../models/content-group';
import { DialogService } from '../../services/util/dialog.service';

const PARTITION_SIZE = 50;

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class ContentService extends AbstractEntityService<Content> {

  serviceApiUrl = {
    answer: '/answer',
    duplicate: '/duplicate',
    bannedKeywords: '/banned-keywords'
  };

  typeIcons: Map<ContentType, string> = new Map<ContentType, string>([
    [ContentType.CHOICE, 'list'],
    [ContentType.SCALE, 'mood'],
    [ContentType.BINARY, 'rule'],
    [ContentType.TEXT, 'description'],
    [ContentType.WORDCLOUD, 'cloud'],
    [ContentType.SORT, 'move_up'],
    [ContentType.PRIORIZATION, 'sort'],
    [ContentType.SLIDE, 'info'],
    [ContentType.FLASHCARD, 'school']
  ]);

  constructor(private http: HttpClient,
              private ws: WsConnectorService,
              protected eventService: EventService,
              protected translateService: TranslateService,
              protected notificationService: NotificationService,
              cachingService: CachingService,
              private router: Router,
              private dialogService: DialogService) {
    super('Content', '/content', http, ws, eventService, translateService, notificationService, cachingService);
  }

  getAnswersChangedStream(roomId: string, contentId: string): Observable<IMessage> {
    return this.ws.getWatcher(`/topic/${roomId}.content-${contentId}.answers-changed.stream`);
  }

  getTextAnswerCreatedStream(roomId: string, contentId: string): Observable<IMessage> {
    return this.ws.getWatcher(`/topic/${roomId}.content-${contentId}.text-answer-created.stream`);
  }

  getContents(roomId: string): Observable<Content[]> {
    const connectionUrl = this.buildUri(this.apiUrl.find, roomId);
    return this.http.post<Content[]>(connectionUrl, {
      properties: { roomId: roomId },
      externalFilters: {}
    }, httpOptions).pipe(
      catchError(this.handleError('getContents', []))
    );
  }

  getContent(roomId: string, contentId: string): Observable<Content> {
    const connectionUrl = this.buildUri('/' + contentId + '/?view=extended', roomId);
    return this.http.get<Content>(connectionUrl).pipe(
      catchError(this.handleError<Content>('getContent by id: ' + contentId))
    );
  }

  getChoiceContent(roomId: string, contentId: string): Observable<ContentChoice> {
    const connectionUrl = this.buildUri('/' + contentId, roomId);
    return this.http.get<ContentChoice>(connectionUrl).pipe(
      catchError(this.handleError<ContentChoice>('getRoom by id: ' + contentId))
    );
  }

  getContentsByIds(roomId: string, contentIds: string[], extendedView?: boolean): Observable<Content[]> {
    const partitionedIds: string[][] = [];
    for (let i = 0; i < contentIds?.length; i += PARTITION_SIZE) {
      partitionedIds.push(contentIds.slice(i, i + PARTITION_SIZE));
    }
    const partitionedContents$: Observable<Content[]>[] = partitionedIds.map(ids => {
      const extended = extendedView ? '&view=extended' : '';
      const connectionUrl = this.buildUri('/?ids=' + ids  + extended, roomId);
      return this.http.get<Content[]>(connectionUrl).pipe(
        catchError(this.handleError('getContentsByIds', []))
      );
    });
    return forkJoin(partitionedContents$).pipe(
        map(results => results.reduce((acc: Content[], value: Content[]) => acc.concat(value), []))
    );
  }

  getContentChoiceByIds(roomId: string, contentIds: string[]): Observable<ContentChoice[]> {
    const connectionUrl = this.buildUri('/?ids=' + contentIds, roomId);
    return this.http.get<ContentChoice[]>(connectionUrl).pipe(
      catchError(this.handleError('getContentsByIds', []))
    );
  }

  getCorrectChoiceIndexes(roomId: string, contentId: string): Observable<number[]> {
    const connectionUrl = this.buildUri('/' + contentId + '/correct-choice-indexes', roomId);
    return this.http.get<number[]>(connectionUrl).pipe(
      catchError(this.handleError('getCorrectChoiceIndexes', []))
    )
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
    const connectionUrl = this.buildUri('/' + updatedContent.id, updatedContent.roomId);
    return this.http.put(connectionUrl, updatedContent, httpOptions).pipe(
      catchError(this.handleError<any>('updateContent'))
    );
  }

  patchContent(content: Content, changes: object): Observable<Content> {
    const connectionUrl = this.buildUri('/' + content.id, content.roomId);
    return this.http.patch(connectionUrl, changes, httpOptions).pipe(
      catchError(this.handleError<any>('patchContent'))
    );
  }

  changeState(content: Content): Observable<Content> {
    const changes: { state: object } = { state: content.state };
    return this.patchContent(content, changes).pipe();
  }

  updateChoiceContent(updatedContent: ContentChoice): Observable<ContentChoice> {
    const connectionUrl = this.buildUri('/' + updatedContent.id, updatedContent.roomId);
    return this.http.put(connectionUrl, updatedContent, httpOptions).pipe(
      catchError(this.handleError<any>('updateContentChoice'))
    );
  }

  deleteContent(roomId: string, contentId: string): Observable<Content> {
    const connectionUrl = this.buildUri('/' + contentId, roomId);
    return this.http.delete<Content>(connectionUrl, httpOptions).pipe(
      catchError(this.handleError<Content>('deleteContent'))
    );
  }

  deleteAnswers(roomId: string, contentId: string): Observable<Content> {
    const connectionUrl = this.buildUri('/' + contentId + this.serviceApiUrl.answer, roomId);
    return this.http.delete<Content>(connectionUrl, httpOptions).pipe(
      catchError(this.handleError<Content>('deleteAnswers'))
    );
  }

  showDeleteAllAnswersDialog(contentGroup: ContentGroup) {
    const dialogRef = this.dialogService.openDeleteDialog('content-answers', 'really-delete-all-answers');
    return dialogRef.afterClosed().pipe(
      switchMap(result => {
        if (result === 'delete') {
          return this.deleteAllAnswersOfContentGroup(contentGroup);
        }
      })
    );
  }

  deleteAllAnswersOfContentGroup(contentGroup: ContentGroup) {
    const observableBatch = [];
    for (const contentId of contentGroup.contentIds) {
      observableBatch.push(this.deleteAnswers(contentGroup.roomId, contentId));
    }
    return forkJoin(observableBatch);
  }

  getAnswer(roomId: string, contentId: string): Observable<AnswerStatistics> {
    const connectionUrl = this.buildUri('/' + contentId + '/stats', roomId);
    return this.http.get<AnswerStatistics>(connectionUrl).pipe(
      catchError(this.handleError<AnswerStatistics>(`getRoom shortId=${contentId}`))
    );
  }

  duplicateContent(roomId: string, groupId: string, contentId: string): Observable<Content> {
    const connectionUrl = this.buildUri(`/${contentId}${this.serviceApiUrl.duplicate}`, roomId);
    const body = {
      roomId: roomId, contentGroupId: groupId
    };
    return this.http.post<Content>(connectionUrl, body, httpOptions).pipe(
        catchError(this.handleError<Content>(`duplicateContent, ${roomId}, ${groupId}, ${contentId}`))
    );
  }

  banKeywordForContent(roomId: string, contentId: string, keyword: string): Observable<void> {
    const connectionUrl = this.buildUri(`/${contentId}${this.serviceApiUrl.bannedKeywords}`, roomId);
    const body = {
      keyword: keyword
    };
    return this.http.post<void>(connectionUrl, body, httpOptions).pipe(
        catchError(this.handleError<void>(`Ban keyword for content, ${roomId}, ${keyword}, ${contentId}`))
    );
  }

  resetBannedKeywords(roomId: string, contentId: string): Observable<void> {
    const connectionUrl = this.buildUri(`/${contentId}${this.serviceApiUrl.bannedKeywords}`, roomId);
    return this.http.delete<void>(connectionUrl, httpOptions).pipe(
        catchError(this.handleError<void>(`Reset banned keywords for content, ${roomId}, ${contentId}`))
    );
  }

  getSupportedContents(contents: Content[]) {
    return contents.filter(content => Object.values(ContentType).indexOf(content.format) > -1);
  }

  export(fileType: ExportFileType, roomId: string, contentIds: string[], charset?: string): Observable<Blob> {
    const connectionUrl = this.buildUri('/-/export', roomId);
    return this.http.post(
        connectionUrl,
        { fileType: fileType, contentIds: contentIds, charset: charset },
        { responseType: 'blob' });
  }

  goToEdit(contentId: string, shortId: string, group: string) {
    this.router.navigate(['edit', shortId, 'series', group, 'edit', contentId]);
  }

  deleteAnswersOfContent(contentId, roomId) {
    this.deleteAnswers(roomId, contentId).subscribe(() => {
      this.translateService.get('dialog.answers-deleted').subscribe(msg => {
        this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
        this.eventService.broadcast(ContentMessages.ANSWERS_DELETED, contentId);
      });
    });
  }

  getTypeIcons(): Map<ContentType, string> {
    return this.typeIcons;
  }

  allowsUnitChange(content: Content): boolean {
    return [ContentType.BINARY, ContentType.SCALE, ContentType.CHOICE].includes(content.format) && !(content as ContentChoice).multiple;
  }

  allowsListChange(content: Content): boolean {
    return [ContentType.BINARY, ContentType.SCALE, ContentType.CHOICE].includes(content.format);
  }

}
