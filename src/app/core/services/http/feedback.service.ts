import { Injectable, inject } from '@angular/core';
import { AbstractHttpService } from './abstract-http.service';
import { HttpHeaders } from '@angular/common/http';
import { Observable, Subject, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Message } from '@stomp/stompjs';
import { WsFeedbackService } from '@app/core/services/websockets/ws-feedback.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable()
export class FeedbackService extends AbstractHttpService<number[]> {
  protected wsFeedbackService = inject(WsFeedbackService);

  private messageEvent$ = new Subject<Message>();
  sub?: Subscription;

  constructor() {
    super('/survey');
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
