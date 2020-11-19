import { Injectable } from '@angular/core';
import { WsConnectorService } from '../../services/websockets/ws-connector.service';
import { CreateFeedback } from '../../models/messages/create-feedback';
import { ResetFeedback } from '../../models/messages/reset-feedback';
import { Observable } from 'rxjs';
import { IMessage } from '@stomp/stompjs';

@Injectable({
  providedIn: 'root'
})
export class WsFeedbackService {
  constructor(private wsConnector: WsConnectorService) {
  }

  send(userId: string, feedback: number, roomId: string) {
    const createFeedback = new CreateFeedback(roomId, userId, feedback);
    this.wsConnector.send(`/queue/feedback.command`, JSON.stringify(createFeedback));
  }

  reset(roomId: string) {
    const getFeedback = new ResetFeedback(roomId);

    this.wsConnector.send(`/queue/feedback.command.reset`, JSON.stringify(getFeedback));
  }

  getFeedbackStream(roomId: string): Observable<IMessage> {
    return this.wsConnector.getWatcher(`/topic/${roomId}.feedback.stream`);
  }
}
