import { Injectable } from '@angular/core';
import { Content } from '../../models/content';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
import { AnswerStatistics } from '../../models/answer-statistics';
import { ContentChoice } from '../../models/content-choice';
import { TSMap } from 'typescript-map';
import { WsConnectorService } from '../websockets/ws-connector.service';
import { IMessage } from '@stomp/stompjs';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../util/notification.service';
import { ContentType } from '@arsnova/app/models/content-type.enum';
import { EventService } from '../util/event.service';
import { ContentCreated } from '../../models/events/content-created';

const PARTITION_SIZE = 50;

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class ContentService extends BaseHttpService {
  private apiUrl = {
    base: '/api',
    content: '/content',
    find: '/find',
    answer: '/answer'
  };

  constructor(private http: HttpClient,
              private ws: WsConnectorService,
              protected eventService: EventService,
              protected translateService: TranslateService,
              protected notificationService: NotificationService) {
    super(eventService, translateService, notificationService);
  }

  getAnswersChangedStream(roomId: string, contentId: string): Observable<IMessage> {
    return this.ws.getWatcher(`/topic/${roomId}.content-${contentId}.answers-changed.stream`);
  }

  getContents(roomId: string): Observable<Content[]> {
    const connectionUrl = this.apiUrl.base + this.apiUrl.content + this.apiUrl.find;
    return this.http.post<Content[]>(connectionUrl, {
      properties: { roomId: roomId },
      externalFilters: {}
    }, httpOptions).pipe(
      catchError(this.handleError('getContents', []))
    );
  }

  getContent(id: string): Observable<Content> {
    const connectionUrl = this.apiUrl.base + this.apiUrl.content + '/' + id;
    return this.http.get<Content>(connectionUrl).pipe(
      tap(() => ''),
      catchError(this.handleError<Content>('getContent by id: ' + id))
    );
  }

  getChoiceContent(id: string): Observable<ContentChoice> {
    const connectionUrl = this.apiUrl.base + this.apiUrl.content + '/' + id;
    return this.http.get<ContentChoice>(connectionUrl).pipe(
      tap(() => ''),
      catchError(this.handleError<ContentChoice>('getRoom by id: ' + id))
    );
  }

  getContentsByIds(contentIds: string[]): Observable<Content[]> {
    const partitionedIds: string[][] = [];
    for (let i = 0; i < contentIds.length; i += PARTITION_SIZE) {
      partitionedIds.push(contentIds.slice(i, i + PARTITION_SIZE));
    }
    const partitionedContents$: Observable<Content[]>[] = partitionedIds.map(ids => {
      const connectionUrl = this.apiUrl.base + this.apiUrl.content + '/?ids=' + ids;
      return this.http.get<Content[]>(connectionUrl).pipe(
        catchError(this.handleError('getContentsByIds', []))
      );
    });
    return forkJoin(partitionedContents$).pipe(
        map(results => results.reduce((acc: Content[], value: Content[]) => acc.concat(value), []))
    );
  }

  getContentChoiceByIds(ids: string[]): Observable<ContentChoice[]> {
    const connectionUrl = this.apiUrl.base + this.apiUrl.content + '/?ids=' + ids;
    return this.http.get<ContentChoice[]>(connectionUrl).pipe(
      tap(() => ''),
      catchError(this.handleError('getContentsByIds', []))
    );
  }

  addContent(content: Content): Observable<Content> {
    const connectionUrl = this.apiUrl.base + this.apiUrl.content + '/';
    return this.http.post<Content>(connectionUrl, content, httpOptions).pipe(
      tap(() => {
        const event = new ContentCreated(content.format);
        this.eventService.broadcast(event.type, event.payload);
      }),
      catchError(this.handleError<Content>('addContent'))
    );
  }

  updateContent(updatedContent: Content): Observable<Content> {
    const connectionUrl = this.apiUrl.base + this.apiUrl.content + '/' + updatedContent.id;
    return this.http.put(connectionUrl, updatedContent, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<any>('updateContent'))
    );
  }

  patchContent(content: Content, changes: TSMap<string, any>): Observable<Content> {
    const connectionUrl = this.apiUrl.base + this.apiUrl.content + '/' + content.id;
    return this.http.patch(connectionUrl, changes, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<any>('patchContent'))
    );
  }

  changeState(content: Content): Observable<Content> {
    const changes = new TSMap<string, any>();
    changes.set('state', content.state);
    return this.patchContent(content, changes).pipe();
  }

  updateChoiceContent(updatedContent: ContentChoice): Observable<ContentChoice> {
    const connectionUrl = this.apiUrl.base + this.apiUrl.content + '/' + updatedContent.id;
    return this.http.put(connectionUrl, updatedContent, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<any>('updateContentChoice'))
    );
  }

  deleteContent(contentId: string): Observable<Content> {
    const connectionUrl = this.apiUrl.base + this.apiUrl.content + '/' + contentId;
    return this.http.delete<Content>(connectionUrl, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<Content>('deleteContent'))
    );
  }

  deleteAnswers(contentId: string): Observable<Content> {
    const connectionUrl = this.apiUrl.base + this.apiUrl.content + '/' + contentId + this.apiUrl.answer;
    return this.http.delete<Content>(connectionUrl, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<Content>('deleteAnswers'))
    );
  }

  getAnswer(contentId: string): Observable<AnswerStatistics> {
    const connectionUrl = this.apiUrl.base + this.apiUrl.content + '/' + contentId + '/stats';
    return this.http.get<AnswerStatistics>(connectionUrl).pipe(
      tap(() => ''),
      catchError(this.handleError<AnswerStatistics>(`getRoom shortId=${contentId}`))
    );
  }

  findContentsWithoutGroup(roomId: string): Observable<Content[]> {
    const connectionUrl = this.apiUrl.base + this.apiUrl.content + this.apiUrl.find;
    return this.http.post<Content[]>(connectionUrl, {
      properties: {},
      externalFilters: { notInContentGroupOfRoomId: roomId }
    }).pipe(
      tap(() => ''),
      catchError(this.handleError<Content[]>(`findContentsWithoutGroup roomId=${roomId}`))
    );
  }

  getSupportedContents(contents: Content[]) {
    return contents.filter(content => Object.values(ContentType).indexOf(content.format) > -1);
  }
}
