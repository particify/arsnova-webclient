import { Injectable } from '@angular/core';
import { TextAnswer } from '../../models/text-answer';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
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
    content: '/content',
    answer: '/answer',
    text: '/text',
    choice: '/choice'
  };

  constructor(private http: HttpClient,
              protected eventService: EventService,
              protected translateService: TranslateService,
              protected notificationService: NotificationService) {
    super(eventService, translateService, notificationService);
  }

  getAnswers(roomId: string, contentId: string): Observable<TextAnswer[]> {
    const url = this.getBaseUrl(roomId) + this.serviceApiUrl.answer + this.apiUrl.find;
    return this.http.post<TextAnswer[]>(url, {
      properties: { contentId: contentId },
      externalFilters: {}
    }, httpOptions).pipe(
      catchError(this.handleError('getAnswers', []))
    );
  }

  getAnswersByUserIdContentIds(roomId: string, userId: string, contentIds: string[]): Observable<Answer[]> {
    const url = this.getBaseUrl(roomId) + this.serviceApiUrl.answer + this.apiUrl.find;
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
    const url = this.getBaseUrl(roomId) + this.serviceApiUrl.answer + this.apiUrl.find;
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
    const url = this.getBaseUrl(roomId) + this.serviceApiUrl.answer + this.apiUrl.find;
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
    const url = this.getBaseUrl(roomId) + this.serviceApiUrl.answer + '/';
    return this.http.post<TextAnswer>(url, answerText, httpOptions).pipe(
      catchError(this.handleError<TextAnswer>('addTextAnswer'))
    );
  }

  addAnswerChoice(roomId: string, answerChoice: ChoiceAnswer): Observable<ChoiceAnswer> {
    const url = this.getBaseUrl(roomId) + this.serviceApiUrl.answer + '/';
    return this.http.post<ChoiceAnswer>(url, answerChoice, httpOptions).pipe(
      catchError(this.handleError<ChoiceAnswer>('addChoiceAnswer'))
    );
  }

  getAnswerText(roomId: string, id: string): Observable<TextAnswer> {
    const url = `${this.getBaseUrl(roomId) + this.serviceApiUrl.answer + this.serviceApiUrl.text}/${id}`;
    return this.http.get<TextAnswer>(url).pipe(
      catchError(this.handleError<TextAnswer>(`getAnswerText id=${id}`))
    );
  }

  getAnswerChoice(roomId: string, id: string): Observable<ChoiceAnswer> {
    const url = `${this.getBaseUrl(roomId) + this.serviceApiUrl.answer + this.serviceApiUrl.choice}/${id}`;
    return this.http.get<ChoiceAnswer>(url).pipe(
      catchError(this.handleError<ChoiceAnswer>(`getChoiceAnswer id=${id}`))
    );
  }

  updateAnswerText(roomId: string, updatedAnswerText: TextAnswer): Observable<TextAnswer> {
    const connectionUrl = `${this.getBaseUrl(roomId) + this.serviceApiUrl.answer + this.serviceApiUrl.text}/${updatedAnswerText.id}`;
    return this.http.put(connectionUrl, updatedAnswerText, httpOptions).pipe(
      tap(() => ''),
      catchError(this.handleError<any>('updateTextAnswer'))
    );
  }

  updateAnswerChoice(roomId: string, updatedAnswerChoice: ChoiceAnswer): Observable<ChoiceAnswer> {
    const connectionUrl = `${this.getBaseUrl(roomId) + this.serviceApiUrl.answer + this.serviceApiUrl.choice}/${updatedAnswerChoice.id}`;
    return this.http.put(connectionUrl, updatedAnswerChoice, httpOptions).pipe(
      tap(() => ''),
      catchError(this.handleError<any>('updateChoiceAnswer'))
    );
  }

  deleteAnswerText(roomId: string, id: string): Observable<TextAnswer> {
    const url = `${this.getBaseUrl(roomId) + this.serviceApiUrl.answer}/${id}`;
    return this.http.delete<TextAnswer>(url, httpOptions).pipe(
      tap(() => ''),
      catchError(this.handleError<TextAnswer>('deleteTextAnswer'))
    );
  }

  deleteAnswerChoice(roomId: string, id: string): Observable<ChoiceAnswer> {
    const url = `${this.getBaseUrl(roomId) + this.serviceApiUrl.answer}/${id}`;
    return this.http.delete<ChoiceAnswer>(url, httpOptions).pipe(
      tap(() => ''),
      catchError(this.handleError<ChoiceAnswer>('deleteChoiceAnswer'))
    );
  }
}
