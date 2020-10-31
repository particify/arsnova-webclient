import { Injectable } from '@angular/core';
import { TextAnswer } from '../../models/text-answer';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
import { ChoiceAnswer } from '../../models/choice-answer';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../util/notification.service';
import { Answer } from '@arsnova/app/models/answer';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class ContentAnswerService extends BaseHttpService {
  private apiUrl = {
    base: '/api',
    answer: '/answer',
    text: '/text',
    choice: '/choice',
    find: '/find'
  };

  constructor(private http: HttpClient,
              protected translateService: TranslateService,
              protected notificationService: NotificationService) {
    super(translateService, notificationService);
  }

  getAnswers(contentId: string): Observable<TextAnswer[]> {
    const url = this.apiUrl.base + this.apiUrl.answer + this.apiUrl.find;
    return this.http.post<TextAnswer[]>(url, {
      properties: { contentId: contentId },
      externalFilters: {}
    }, httpOptions).pipe(
      catchError(this.handleError('getAnswers', []))
    );
  }

  getAnswersByUserIdContentIds(roomId: string, userId: string, contentIds: string[]): Observable<Answer[]> {
    const url = this.apiUrl.base + this.apiUrl.answer + this.apiUrl.find;
    return this.http.post<Answer[]>(url, {
      properties: { creatorId: userId },
      externalFilters: {
        contentIds: contentIds
      }
    }, httpOptions).pipe(
      catchError(this.handleError<Answer[]>('getAnswersByUserIdContentIds'))
    );
  }

  getChoiceAnswerByContentIdUserIdCurrentRound(contentId: string, userId: string): Observable<ChoiceAnswer> {
    const url = this.apiUrl.base + this.apiUrl.answer + this.apiUrl.find;
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

  getTextAnswerByContentIdUserIdCurrentRound(contentId: string, userId: string): Observable<TextAnswer> {
    const url = this.apiUrl.base + this.apiUrl.answer + this.apiUrl.find;
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

  addAnswerText(answerText: TextAnswer): Observable<TextAnswer> {
    const url = this.apiUrl.base + this.apiUrl.answer + '/';
    return this.http.post<TextAnswer>(url, answerText, httpOptions).pipe(
      catchError(this.handleError<TextAnswer>('addTextAnswer'))
    );
  }

  addAnswerChoice(answerChoice: ChoiceAnswer): Observable<ChoiceAnswer> {
    const url = this.apiUrl.base + this.apiUrl.answer + '/';
    return this.http.post<ChoiceAnswer>(url, answerChoice, httpOptions).pipe(
      catchError(this.handleError<ChoiceAnswer>('addChoiceAnswer'))
    );
  }

  getAnswerText(id: string): Observable<TextAnswer> {
    const url = `${this.apiUrl.base + this.apiUrl.answer + this.apiUrl.text}/${id}`;
    return this.http.get<TextAnswer>(url).pipe(
      catchError(this.handleError<TextAnswer>(`getAnswerText id=${id}`))
    );
  }

  getAnswerChoice(id: string): Observable<ChoiceAnswer> {
    const url = `${this.apiUrl.base + this.apiUrl.answer + this.apiUrl.choice}/${id}`;
    return this.http.get<ChoiceAnswer>(url).pipe(
      catchError(this.handleError<ChoiceAnswer>(`getChoiceAnswer id=${id}`))
    );
  }

  updateAnswerText(updatedAnswerText: TextAnswer): Observable<TextAnswer> {
    const connectionUrl = `${this.apiUrl.base + this.apiUrl.answer + this.apiUrl.text}/${updatedAnswerText.id}`;
    return this.http.put(connectionUrl, updatedAnswerText, httpOptions).pipe(
      tap(() => ''),
      catchError(this.handleError<any>('updateTextAnswer'))
    );
  }

  updateAnswerChoice(updatedAnswerChoice: ChoiceAnswer): Observable<ChoiceAnswer> {
    const connectionUrl = `${this.apiUrl.base + this.apiUrl.answer + this.apiUrl.choice}/${updatedAnswerChoice.id}`;
    return this.http.put(connectionUrl, updatedAnswerChoice, httpOptions).pipe(
      tap(() => ''),
      catchError(this.handleError<any>('updateChoiceAnswer'))
    );
  }

  deleteAnswerText(id: string): Observable<TextAnswer> {
    const url = `${this.apiUrl.base + this.apiUrl.answer}/${id}`;
    return this.http.delete<TextAnswer>(url, httpOptions).pipe(
      tap(() => ''),
      catchError(this.handleError<TextAnswer>('deleteTextAnswer'))
    );
  }

  deleteAnswerChoice(id: string): Observable<ChoiceAnswer> {
    const url = `${this.apiUrl.base + this.apiUrl.answer}/${id}`;
    return this.http.delete<ChoiceAnswer>(url, httpOptions).pipe(
      tap(() => ''),
      catchError(this.handleError<ChoiceAnswer>('deleteChoiceAnswer'))
    );
  }
}
