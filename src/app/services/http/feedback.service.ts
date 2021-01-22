import { EventEmitter, Injectable } from '@angular/core';
import { BaseHttpService } from './base-http.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventService } from '../util/event.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../util/notification.service';
import { Observable, Subscription } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Message } from '@stomp/stompjs';
import { WsFeedbackService } from '../../services/websockets/ws-feedback.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class FeedbackService extends BaseHttpService {

  public messageEvent = new EventEmitter<Message>();
  sub: Subscription;

  serviceApiUrl = {
    survey: '/survey'
  };

  constructor(
      private http: HttpClient,
      protected eventService: EventService,
      protected translateService: TranslateService,
      protected notificationService: NotificationService,
      protected wsFeedbackService: WsFeedbackService
  ) {
    super(eventService, translateService, notificationService);
  }

  startSub(roomId: string) {
    if (!this.sub) {
      this.sub = this.wsFeedbackService.getFeedbackStream(roomId).subscribe((message: Message) => {
        this.emitMessage(message);
      });
    }
  }

  unsubscribe() {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = null;
    }
  }

  get(roomId: string): Observable<number[]> {
    const connectionUrl = `${this.getBaseUrl(roomId) + this.serviceApiUrl.survey}`;
    return this.http.get<number[]>(connectionUrl, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<number[]>('get survey'))
    );
  }

  emitMessage(message) {
    this.messageEvent.emit(message);
  }
}
