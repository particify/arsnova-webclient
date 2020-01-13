import { Injectable } from '@angular/core';
import { WsConnectorService } from '../../services/websockets/ws-connector.service';
import { CreateFeedback } from '../../models/messages/create-feedback';
import { GetFeedback } from '../../models/messages/get-feedback';
import { GetFeedbackStatus } from '../../models/messages/get-feedback-status';
import { StartFeedback } from '../../models/messages/start-feedback';
import { StopFeedback } from '../../models/messages/stop-feedback';
import { Observable } from 'rxjs';
import { IMessage } from '@stomp/stompjs';

@Injectable({
  providedIn: 'root'
})
export class WsFeedbackService {
  constructor(private wsConnector: WsConnectorService) {
  }

  send(userId: string, feedback: number, roomId: string) {
    const createFeedback = new CreateFeedback(userId, feedback);
    this.wsConnector.send(`/backend/queue/${roomId}.feedback.command`, JSON.stringify(createFeedback));
  }

  get(roomId: string) {
    const getFeedback = new GetFeedback();

    this.wsConnector.send(`/backend/queue/${roomId}.feedback.query`, JSON.stringify(getFeedback));
  }

  getStatus(roomId: string) {
    const msg = new GetFeedbackStatus();
    this.wsConnector.send(`/backend/queue/${roomId}.feedback.command.status`, JSON.stringify(msg));
  }

  start(roomId: string) {
    const msg = new StartFeedback();
    this.wsConnector.send(`/backend/queue/${roomId}.feedback.command.start`, JSON.stringify(msg));
  }

  stop(roomId: string) {
    const msg = new StopFeedback();
    this.wsConnector.send(`/backend/queue/${roomId}.feedback.command.stop`, JSON.stringify(msg));
  }

  getFeedbackStream(roomId: string): Observable<IMessage> {
    return this.wsConnector.getWatcher(`/topic/${roomId}.feedback.stream`);
  }
}
