import { Injectable, inject } from '@angular/core';
import { AbstractHttpService } from './abstract-http.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventService } from '@app/core/services/util/event.service';
import { TranslocoService } from '@jsverse/transloco';
import { NotificationService } from '@app/core/services/util/notification.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Message } from '@stomp/stompjs';
import { WsFeedbackService } from '@app/core/services/websockets/ws-feedback.service';
import { Room } from '@app/core/models/room';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable()
export class FeedbackService extends AbstractHttpService<number[]> {
  private http: HttpClient;
  protected eventService: EventService;
  protected translateService: TranslocoService;
  protected notificationService: NotificationService;
  protected wsFeedbackService = inject(WsFeedbackService);

  private messageEvent$ = new Subject<Message>();
  sub?: Subscription;

  constructor() {
    const http = inject(HttpClient);
    const eventService = inject(EventService);
    const translateService = inject(TranslocoService);
    const notificationService = inject(NotificationService);

    super('/survey', http, eventService, translateService, notificationService);

    this.http = http;
    this.eventService = eventService;
    this.translateService = translateService;
    this.notificationService = notificationService;
  }

  startSub(roomId: string) {
    if (!this.sub) {
      this.sub = this.wsFeedbackService
        .getFeedbackStream(roomId)
        .subscribe((message: Message) => {
          this.emitMessage(message);
        });
    }
  }

  unsubscribe() {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = undefined;
    }
  }

  get(roomId: string): Observable<number[]> {
    const connectionUrl = this.buildUri('', roomId);
    return this.http
      .get<number[]>(connectionUrl, httpOptions)
      .pipe(catchError(this.handleError<number[]>('get survey')));
  }

  getType(room: Room): LiveFeedbackType {
    if (room.extensions?.feedback && room.extensions.feedback['type']) {
      return room.extensions.feedback['type'];
    } else {
      return LiveFeedbackType.FEEDBACK;
    }
  }

  emitMessage(message: Message) {
    this.messageEvent$.next(message);
  }

  getMessages(): Subject<Message> {
    return this.messageEvent$;
  }

  getAnswerSum(data: number[]): number {
    return data.reduce(
      (accumulator, currentValue) => accumulator + currentValue
    );
  }

  getBarData(data: number[], sum: number): number[] {
    return data.map((d) => (d / sum) * 100);
  }
}
