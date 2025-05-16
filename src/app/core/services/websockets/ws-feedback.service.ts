import { Injectable, inject } from '@angular/core';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';
import { CreateFeedback } from '@app/core/models/messages/create-feedback';
import { ResetFeedback } from '@app/core/models/messages/reset-feedback';
import { Observable } from 'rxjs';
import { IMessage } from '@stomp/stompjs';

@Injectable({
  providedIn: 'root',
})
export class WsFeedbackService {
  private wsConnector = inject(WsConnectorService);

  send(userId: string, feedback: number, roomId: string) {
    const createFeedback = new CreateFeedback(roomId, userId, feedback);
    this.wsConnector.send(
      `/queue/feedback.command`,
      JSON.stringify(createFeedback)
    );
  }

  reset(roomId: string) {
    const getFeedback = new ResetFeedback(roomId);

    this.wsConnector.send(
      `/queue/feedback.command.reset`,
      JSON.stringify(getFeedback)
    );
  }

  getFeedbackStream(roomId: string): Observable<IMessage> {
    return this.wsConnector.getWatcher(`/topic/${roomId}.feedback.stream`);
  }
}
