import { Injectable } from '@angular/core';
import { Content } from '../../models/content';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AbstractEntityService } from './abstract-entity.service';
import { AnswerStatistics } from '../../models/answer-statistics';
import { ContentChoice } from '../../models/content-choice';
import { WsConnectorService } from '../websockets/ws-connector.service';
import { IMessage } from '@stomp/stompjs';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../util/notification.service';
import { ContentType } from '@arsnova/app/models/content-type.enum';
import { EventService } from '../util/event.service';
import { ContentCreated } from '../../models/events/content-created';
import { CachingService } from '../util/caching.service';

const PARTITION_SIZE = 50;

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class ContentService extends AbstractEntityService<Content> {

  serviceApiUrl = {
    answer: '/answer'
  };

  constructor(private http: HttpClient,
              private ws: WsConnectorService,
              protected eventService: EventService,
              protected translateService: TranslateService,
              protected notificationService: NotificationService,
              cachingService: CachingService) {
    super('/content', http, eventService, translateService, notificationService, cachingService);
  }

  getAnswersChangedStream(roomId: string, contentId: string): Observable<IMessage> {
    return this.ws.getWatcher(`/topic/${roomId}.content-${contentId}.answers-changed.stream`);
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
    for (let i = 0; i < contentIds.length; i += PARTITION_SIZE) {
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

  getAnswer(roomId: string, contentId: string): Observable<AnswerStatistics> {
    const connectionUrl = this.buildUri('/' + contentId + '/stats', roomId);
    return this.http.get<AnswerStatistics>(connectionUrl).pipe(
      catchError(this.handleError<AnswerStatistics>(`getRoom shortId=${contentId}`))
    );
  }

  findContentsWithoutGroup(roomId: string): Observable<Content[]> {
    const connectionUrl = this.buildUri(this.apiUrl.find, roomId);
    return this.http.post<Content[]>(connectionUrl, {
      properties: {},
      externalFilters: { notInContentGroupOfRoomId: roomId }
    }).pipe(
      catchError(this.handleError<Content[]>(`findContentsWithoutGroup roomId=${roomId}`))
    );
  }

  getSupportedContents(contents: Content[]) {
    return contents.filter(content => Object.values(ContentType).indexOf(content.format) > -1);
  }
}
