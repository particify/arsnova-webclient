import { Injectable } from '@angular/core';
import { TextAnswer } from '../../models/text-answer';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
import { ChoiceAnswer } from '../../models/choice-answer';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../util/notification.service';
import { EventService } from '../util/event.service';
import { Answer } from '@arsnova/app/models/answer';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class ContentAnswerService extends BaseHttpService {

  serviceApiUrl = {
    text: '/text',
    choice: '/choice'
  };

  constructor(private http: HttpClient,
              protected eventService: EventService,
              protected translateService: TranslateService,
              protected notificationService: NotificationService) {
    super('/answer', eventService, translateService, notificationService);
  }

  getAnswers(roomId: string, contentId: string): Observable<TextAnswer[]> {
    const url = this.buildUri(this.apiUrl.find, roomId);
    return this.http.post<TextAnswer[]>(url, {
      properties: { contentId: contentId },
      externalFilters: {}
    }, httpOptions).pipe(
      catchError(this.handleError('getAnswers', []))
    );
  }

  getAnswersByUserIdContentIds(roomId: string, userId: string, contentIds: string[]): Observable<Answer[]> {
    const url = this.buildUri(this.apiUrl.find, roomId);
    return this.http.post<Answer[]>(url, {
      properties: { creatorId: userId },
      externalFilters: {
        contentIds: contentIds
      }
    }, httpOptions).pipe(
      catchError(this.handleError<Answer[]>('getAnswersByUserIdContentIds'))
    );
  }

  getChoiceAnswerByContentIdUserIdCurrentRound(roomId: string, contentId: string, userId: string): Observable<ChoiceAnswer> {
    const url = this.buildUri(this.apiUrl.find, roomId);
    return this.http.post<ChoiceAnswer[]>(url, {
      properties: {
        contentId: contentId,
        creatorId: userId
      },
      externalFilters: {}
    }, httpOptions).pipe(
      map(list => list[0]),
      catchError(this.handleError<ChoiceAnswer>('getChoiceAnswerByContentIdUserIdCurrentRound'))
    );
  }

  getTextAnswerByContentIdUserIdCurrentRound(roomId: string, contentId: string, userId: string): Observable<TextAnswer> {
    const url = this.buildUri(this.apiUrl.find, roomId);
    return this.http.post<TextAnswer[]>(url, {
      properties: {
        contentId: contentId,
        creatorId: userId
      },
      externalFilters: {}
    }, httpOptions).pipe(
      map(list => list[0]),
      catchError(this.handleError<TextAnswer>('getTextAnswerByContentIdUserIdCurrentRound'))
    );
  }

  addAnswerText(roomId: string, answerText: TextAnswer): Observable<TextAnswer> {
    const url = this.buildUri('/', roomId);
    return this.http.post<TextAnswer>(url, answerText, httpOptions).pipe(
      catchError(this.handleError<TextAnswer>('addTextAnswer'))
    );
  }

  addAnswerChoice(roomId: string, answerChoice: ChoiceAnswer): Observable<ChoiceAnswer> {
    const url = this.buildUri('/', roomId);
    return this.http.post<ChoiceAnswer>(url, answerChoice, httpOptions).pipe(
      catchError(this.handleError<ChoiceAnswer>('addChoiceAnswer'))
    );
  }

  getAnswerText(roomId: string, id: string): Observable<TextAnswer> {
    const url = this.buildUri(`${this.serviceApiUrl.text}/${id}`, roomId);
    return this.http.get<TextAnswer>(url).pipe(
      catchError(this.handleError<TextAnswer>(`getAnswerText id=${id}`))
    );
  }

  getAnswerChoice(roomId: string, id: string): Observable<ChoiceAnswer> {
    const url = this.buildUri(`${this.serviceApiUrl.choice}/${id}`, roomId);
    return this.http.get<ChoiceAnswer>(url).pipe(
      catchError(this.handleError<ChoiceAnswer>(`getChoiceAnswer id=${id}`))
    );
  }

  updateAnswerText(roomId: string, updatedAnswerText: TextAnswer): Observable<TextAnswer> {
    const connectionUrl = this.buildUri(`${this.serviceApiUrl.text}/${updatedAnswerText.id}`, roomId);
    return this.http.put(connectionUrl, updatedAnswerText, httpOptions).pipe(
      catchError(this.handleError<any>('updateTextAnswer'))
    );
  }

  updateAnswerChoice(roomId: string, updatedAnswerChoice: ChoiceAnswer): Observable<ChoiceAnswer> {
    const connectionUrl = this.buildUri(`${this.serviceApiUrl.choice}/${updatedAnswerChoice.id}`, roomId);
    return this.http.put(connectionUrl, updatedAnswerChoice, httpOptions).pipe(
      catchError(this.handleError<any>('updateChoiceAnswer'))
    );
  }

  deleteAnswerText(roomId: string, id: string): Observable<TextAnswer> {
    const url = this.buildUri(`/${id}`, roomId);
    return this.http.delete<TextAnswer>(url, httpOptions).pipe(
      catchError(this.handleError<TextAnswer>('deleteTextAnswer'))
    );
  }

  deleteAnswerChoice(roomId: string, id: string): Observable<ChoiceAnswer> {
    const url = this.buildUri(`/${id}`, roomId);
    return this.http.delete<ChoiceAnswer>(url, httpOptions).pipe(
      catchError(this.handleError<ChoiceAnswer>('deleteChoiceAnswer'))
    );
  }
}
