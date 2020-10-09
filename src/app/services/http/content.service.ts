import { Injectable } from '@angular/core';
import { Content } from '../../models/content';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
import { AnswerStatistics } from '../../models/answer-statistics';
import { ContentChoice } from '../../models/content-choice';
import { TSMap } from 'typescript-map';
import { WsConnectorService } from '../websockets/ws-connector.service';
import { IMessage } from '@stomp/stompjs';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../util/notification.service';
import { ContentType } from '@arsnova/app/models/content-type.enum';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class ContentService extends BaseHttpService {

  serviceApiUrl = {
    content: '/content',
    answer: '/answer'
  };

  constructor(private http: HttpClient,
              private ws: WsConnectorService,
              protected translateService: TranslateService,
              protected notificationService: NotificationService) {
    super(translateService, notificationService);
  }

  getAnswersChangedStream(roomId: string, contentId: string): Observable<IMessage> {
    return this.ws.getWatcher(`/topic/${roomId}.content-${contentId}.answers-changed.stream`);
  }

  getContents(roomId: string): Observable<Content[]> {
    const connectionUrl = this.getBaseUrl(roomId) + this.serviceApiUrl.content + this.apiUrl.find;
    return this.http.post<Content[]>(connectionUrl, {
      properties: { roomId: roomId },
      externalFilters: {}
    }, httpOptions).pipe(
      catchError(this.handleError('getContents', []))
    );
  }

  getContent(roomId: string, contentId: string): Observable<Content> {
    const connectionUrl = this.getBaseUrl(roomId) + this.serviceApiUrl.content + '/' + contentId;
    return this.http.get<Content>(connectionUrl).pipe(
      tap(() => ''),
      catchError(this.handleError<Content>('getContent by id: ' + contentId))
    );
  }

  getChoiceContent(roomId: string, contentId: string): Observable<ContentChoice> {
    const connectionUrl = this.getBaseUrl(roomId) + this.serviceApiUrl.content + '/' + contentId;
    return this.http.get<ContentChoice>(connectionUrl).pipe(
      tap(() => ''),
      catchError(this.handleError<ContentChoice>('getRoom by id: ' + contentId))
    );
  }

  getContentsByIds(roomId: string, contentIds: string[]): Observable<Content[]> {
    const connectionUrl = this.getBaseUrl(roomId) + this.serviceApiUrl.content + '/?ids=' + contentIds;
    return this.http.get<Content[]>(connectionUrl).pipe(
      tap(() => ''),
      catchError(this.handleError('getContentsByIds', []))
    );
  }

  getContentChoiceByIds(roomId: string, contentIds: string[]): Observable<ContentChoice[]> {
    const connectionUrl = this.getBaseUrl(roomId) + this.serviceApiUrl.content + '/?ids=' + contentIds;
    return this.http.get<ContentChoice[]>(connectionUrl).pipe(
      tap(() => ''),
      catchError(this.handleError('getContentsByIds', []))
    );
  }

  addContent(content: Content): Observable<Content> {
    const connectionUrl = this.getBaseUrl(content.roomId) + this.serviceApiUrl.content + '/';
    return this.http.post<Content>(connectionUrl,
      content,
      httpOptions).pipe(
      catchError(this.handleError<Content>('addContent'))
    );
  }

  updateContent(updatedContent: Content): Observable<Content> {
    const connectionUrl = this.getBaseUrl(updatedContent.roomId) + this.serviceApiUrl.content + '/' + updatedContent.id;
    return this.http.put(connectionUrl, updatedContent, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<any>('updateContent'))
    );
  }

  patchContent(content: Content, changes: TSMap<string, any>): Observable<Content> {
    const connectionUrl = this.getBaseUrl(content.roomId) + this.serviceApiUrl.content + '/' + content.id;
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
    const connectionUrl = this.getBaseUrl(updatedContent.roomId) + this.serviceApiUrl.content + '/' + updatedContent.id;
    return this.http.put(connectionUrl, updatedContent, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<any>('updateContentChoice'))
    );
  }

  deleteContent(roomId: string, contentId: string): Observable<Content> {
    const connectionUrl = this.getBaseUrl(roomId) + this.serviceApiUrl.content + '/' + contentId;
    return this.http.delete<Content>(connectionUrl, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<Content>('deleteContent'))
    );
  }

  deleteAnswers(roomId: string, contentId: string): Observable<Content> {
    const connectionUrl = this.getBaseUrl(roomId) + this.serviceApiUrl.content + '/' + contentId + this.serviceApiUrl.answer;
    return this.http.delete<Content>(connectionUrl, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<Content>('deleteAnswers'))
    );
  }

  getAnswer(roomId: string, contentId: string): Observable<AnswerStatistics> {
    const connectionUrl = this.getBaseUrl(roomId) + this.serviceApiUrl.content + '/' + contentId + '/stats';
    return this.http.get<AnswerStatistics>(connectionUrl).pipe(
      tap(() => ''),
      catchError(this.handleError<AnswerStatistics>(`getRoom shortId=${contentId}`))
    );
  }

  findContentsWithoutGroup(roomId: string): Observable<Content[]> {
    const connectionUrl = this.getBaseUrl(roomId) + this.serviceApiUrl.content + this.apiUrl.find;
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
